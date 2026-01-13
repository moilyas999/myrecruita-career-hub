import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

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

interface CVCandidate {
  id: string;
  name: string;
  email: string;
  job_title: string | null;
  sector: string | null;
  location: string | null;
  years_experience: number | null;
  skills: string | null;
  cv_score: number | null;
  cv_file_url: string | null;
  summary_for_matching: string | null;
  hard_skills: string[] | null;
  soft_skills: string[] | null;
}

interface MatchResult {
  cv_id: string;
  match_score: number;
  explanation: string;
  skills_matched: string[];
  skills_missing: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user has permission (is admin with cv.view)
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("is_admin", { user_id: user.id });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { jobDescription, filters = {} } = await req.json() as {
      jobDescription: string;
      filters?: MatchFilters;
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
      .select(`
        id,
        name,
        email,
        job_title,
        sector,
        location,
        years_experience,
        skills,
        cv_score,
        cv_file_url,
        ai_profile
      `)
      .not("ai_profile", "is", null);

    // Apply filters
    if (filters.location && filters.location !== "all") {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (filters.sector && filters.sector !== "all") {
      query = query.ilike("sector", `%${filters.sector}%`);
    }
    if (filters.minExperience && filters.minExperience > 0) {
      query = query.gte("years_experience", filters.minExperience);
    }

    // Limit results for AI processing
    const maxCandidates = Math.min(filters.maxResults || 25, 50);
    query = query.order("cv_score", { ascending: false, nullsFirst: false }).limit(maxCandidates * 2);

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
        JSON.stringify({ 
          matches: [],
          message: "No candidates found matching your filters. Try broadening your search."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare candidate summaries for AI
    const candidateSummaries = candidates.map((c: any) => {
      const aiProfile = c.ai_profile || {};
      return {
        id: c.id,
        name: c.name,
        job_title: c.job_title || "Not specified",
        location: c.location || "Not specified",
        years_experience: c.years_experience || 0,
        sector: c.sector || "Not specified",
        skills: c.skills || "",
        cv_score: c.cv_score,
        summary: aiProfile.summary_for_matching || aiProfile.experience_summary || "",
        hard_skills: aiProfile.hard_skills || [],
        soft_skills: aiProfile.soft_skills || [],
      };
    });

    // Call Lovable AI for matching
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert recruitment AI that matches job descriptions to candidate profiles.
Your task is to analyze the job description and score each candidate on how well they match.

Scoring criteria (0-100):
- Skills alignment (40%): How well do the candidate's skills match the required skills?
- Experience relevance (25%): Is their experience in a similar role/industry?
- Seniority fit (20%): Does their experience level match the job requirements?
- Location compatibility (15%): Can they work in the required location?

Be strict but fair. Only give 80+ scores to truly excellent matches.
Provide a brief, specific explanation for each score.
Identify specific skills that match and specific skills that are missing.`;

    const userPrompt = `## Job Description
${jobDescription}

## Candidates to Evaluate
${candidateSummaries.map((c, i) => `
### Candidate ${i + 1} (ID: ${c.id})
- Name: ${c.name}
- Current Role: ${c.job_title}
- Location: ${c.location}
- Experience: ${c.years_experience} years
- Sector: ${c.sector}
- Skills: ${c.skills}
- Hard Skills: ${c.hard_skills.join(", ") || "Not specified"}
- Soft Skills: ${c.soft_skills.join(", ") || "Not specified"}
- Summary: ${c.summary || "No summary available"}
`).join("\n")}

Evaluate ALL candidates and return structured results.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_match_results",
              description: "Submit the matching results for all candidates",
              parameters: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    description: "Array of match results for each candidate",
                    items: {
                      type: "object",
                      properties: {
                        cv_id: { 
                          type: "string", 
                          description: "The candidate's ID" 
                        },
                        match_score: { 
                          type: "number", 
                          description: "Match score from 0-100" 
                        },
                        explanation: { 
                          type: "string", 
                          description: "Brief explanation (1-2 sentences) of why this score" 
                        },
                        skills_matched: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Skills from the job description that the candidate has" 
                        },
                        skills_missing: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Important skills from job description the candidate lacks" 
                        },
                      },
                      required: ["cv_id", "match_score", "explanation", "skills_matched", "skills_missing"],
                    },
                  },
                },
                required: ["matches"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_match_results" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please contact administrator." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI API error:", status, await aiResponse.text());
      return new Response(
        JSON.stringify({ error: "AI matching service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    
    // Extract tool call results
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "submit_match_results") {
      console.error("Unexpected AI response format:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "Failed to parse AI matching results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let matchResults: { matches: MatchResult[] };
    try {
      matchResults = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool arguments:", e);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI matching results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enrich results with candidate details
    const enrichedMatches = matchResults.matches
      .map((match) => {
        const candidate = candidates.find((c: any) => c.id === match.cv_id);
        if (!candidate) return null;
        
        return {
          ...match,
          candidate: {
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            job_title: candidate.job_title,
            sector: candidate.sector,
            location: candidate.location,
            years_experience: candidate.years_experience,
            cv_score: candidate.cv_score,
            cv_file_url: candidate.cv_file_url,
          },
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, maxCandidates);

    return new Response(
      JSON.stringify({ 
        matches: enrichedMatches,
        total_evaluated: candidates.length,
        filters_applied: filters,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
