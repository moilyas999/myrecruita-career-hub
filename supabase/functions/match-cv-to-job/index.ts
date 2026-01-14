import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { runFullMatchingPipeline, type PipelineResult } from "../_shared/matching-pipeline.ts";
import { type CandidateProfile, type MatchWeights, DEFAULT_WEIGHTS } from "../_shared/matching-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchFilters {
  location?: string;
  sector?: string;
  minExperience?: number;
  maxResults?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin } = await supabase.rpc("is_admin", { user_id: user.id });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { jobDescription, filters = {}, weights } = await req.json() as {
      jobDescription: string;
      filters?: MatchFilters;
      weights?: Partial<MatchWeights>;
    };

    if (!jobDescription || jobDescription.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Job description must be at least 50 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build query for candidates with AI profiles
    let query = supabase
      .from("cv_submissions")
      .select(`id, name, email, job_title, sector, location, years_experience, skills, cv_score, cv_file_url, ai_profile, seniority_level, education_level`)
      .not("ai_profile", "is", null);

    if (filters.location && filters.location !== "all") {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (filters.sector && filters.sector !== "all") {
      query = query.ilike("sector", `%${filters.sector}%`);
    }
    if (filters.minExperience && filters.minExperience > 0) {
      query = query.gte("years_experience", filters.minExperience);
    }

    const maxCandidates = Math.min(filters.maxResults || 25, 50);
    query = query.order("cv_score", { ascending: false, nullsFirst: false }).limit(200);

    const { data: candidates, error: queryError } = await query;

    if (queryError) {
      console.error("Database query error:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch candidates" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: "No candidates found matching your filters." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run the two-stage matching pipeline
    const mergedWeights: MatchWeights = { ...DEFAULT_WEIGHTS, ...weights };
    const pipelineResult: PipelineResult = await runFullMatchingPipeline(
      candidates as CandidateProfile[],
      jobDescription.trim(),
      mergedWeights,
      maxCandidates,
      LOVABLE_API_KEY
    );

    // Save match history
    const { data: historyRecord } = await supabase.from("cv_match_history").insert({
      job_description: jobDescription.trim(),
      parsed_requirements: pipelineResult.parsedRequirements,
      weights_used: mergedWeights,
      filters_applied: filters,
      total_candidates_evaluated: pipelineResult.stats.totalCandidates,
      algo_prescreened_count: pipelineResult.stats.preScreenedCount,
      ai_analyzed_count: pipelineResult.stats.aiAnalyzedCount,
      processing_time_ms: pipelineResult.stats.processingTimeMs,
      matched_by: user.id,
    }).select("id").maybeSingle();

    // Save individual match results
    if (historyRecord && pipelineResult.matches.length > 0) {
      await supabase.from("cv_match_results").insert(
        pipelineResult.matches.map(m => ({
          match_history_id: historyRecord.id,
          cv_id: m.cv_id,
          algorithmic_score: m.algorithmic_score,
          ai_score: m.ai_score,
          final_score: m.final_score,
          skills_matched: m.skills_matched,
          skills_missing: m.skills_missing,
          skills_partial: m.skills_partial,
          strengths: m.strengths,
          fit_concerns: m.fit_concerns,
          interview_questions: m.interview_questions,
          ai_explanation: m.explanation,
          overqualification_risk: m.overqualification_risk,
          career_trajectory_fit: m.career_trajectory_fit,
          salary_expectation_fit: m.salary_expectation_fit,
        }))
      );
    }

    return new Response(
      JSON.stringify({
        matches: pipelineResult.matches,
        total_evaluated: pipelineResult.stats.totalCandidates,
        pre_screened: pipelineResult.stats.preScreenedCount,
        ai_analyzed: pipelineResult.stats.aiAnalyzedCount,
        processing_time_ms: pipelineResult.stats.processingTimeMs,
        filters_applied: filters,
        match_history_id: historyRecord?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    if (error instanceof Response) return error;
    const status = (error as any)?.status;
    if (status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (status === 402) {
      return new Response(JSON.stringify({ error: "AI usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
