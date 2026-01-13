import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailInput {
  from?: string;
  subject?: string;
  body: string;
}

interface Job {
  id: string;
  reference_id: string;
  title: string;
  location: string;
  sector: string;
  status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user and check permission
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check jobs.update permission
    const { data: hasPermission } = await supabase.rpc('has_permission', {
      _user_id: user.id,
      _permission: 'jobs.update'
    });

    // Also check if user is full admin
    const { data: isFullAdmin } = await supabase.rpc('is_full_admin', {
      user_id: user.id
    });

    if (!hasPermission && !isFullAdmin) {
      return new Response(
        JSON.stringify({ error: "Permission denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { from, subject, body } = await req.json() as EmailInput;
    
    if (!body || body.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Email body is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch active/paused jobs for matching context
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, reference_id, title, location, sector, status')
      .in('status', ['active', 'paused']);

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build job list for AI context
    const jobList = (jobs as Job[]).map(j => 
      `- ${j.reference_id}: "${j.title}" in ${j.location} (${j.sector}) [${j.status}]`
    ).join('\n');

    // Call Lovable AI Gateway
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an AI assistant that helps recruitment agencies track job status updates from emails.

Your task is to analyze an email and determine:
1. Which job (if any) the email is referring to
2. What status change is being indicated (expired, filled, paused, or none)
3. How confident you are in this match

Available jobs to match against:
${jobList || 'No active jobs found'}

Status definitions:
- "expired": The client/company is no longer looking to fill this position, role closed
- "filled": The position has been filled (hired someone)
- "paused": Temporarily on hold, may resume later
- "none": No clear status change indicated

Use the submit_job_status_update function to provide your analysis. Always call this function with your findings.`;

    const userMessage = `Analyze this email and identify any job status updates:

${from ? `From: ${from}` : ''}
${subject ? `Subject: ${subject}` : ''}

Email Body:
${body}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_job_status_update",
            description: "Submit the job status update analysis results",
            parameters: {
              type: "object",
              properties: {
                reference_id: {
                  type: "string",
                  description: "The job reference ID (e.g., MR-2025-001) if identified, or null if not found"
                },
                title_match: {
                  type: "string",
                  description: "The job title mentioned or inferred from the email"
                },
                company_hint: {
                  type: "string",
                  description: "Company name if mentioned in the email"
                },
                suggested_status: {
                  type: "string",
                  enum: ["expired", "filled", "paused", "none"],
                  description: "The suggested new status for the job"
                },
                confidence: {
                  type: "integer",
                  minimum: 0,
                  maximum: 100,
                  description: "Confidence score 0-100 for the match"
                },
                reasoning: {
                  type: "string",
                  description: "Brief explanation of why this job was matched and what status was determined"
                }
              },
              required: ["suggested_status", "confidence", "reasoning"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "submit_job_status_update" } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    console.log("AI Response:", JSON.stringify(aiData, null, 2));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "submit_job_status_update") {
      return new Response(
        JSON.stringify({ error: "AI did not provide structured response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    
    // Try to match to a specific job
    let matchedJob: Job | null = null;
    
    if (analysis.reference_id && jobs) {
      matchedJob = (jobs as Job[]).find(j => 
        j.reference_id.toLowerCase() === analysis.reference_id.toLowerCase()
      ) || null;
    }
    
    // If no reference match, try title match
    if (!matchedJob && analysis.title_match && jobs) {
      const titleLower = analysis.title_match.toLowerCase();
      matchedJob = (jobs as Job[]).find(j => 
        j.title.toLowerCase().includes(titleLower) ||
        titleLower.includes(j.title.toLowerCase())
      ) || null;
    }

    // Insert into review queue
    const insertData = {
      email_from: from || null,
      email_subject: subject || null,
      email_body: body,
      job_id: matchedJob?.id || null,
      job_reference: matchedJob?.reference_id || analysis.reference_id || null,
      job_title: matchedJob?.title || analysis.title_match || null,
      suggested_status: analysis.suggested_status === 'none' ? 'expired' : analysis.suggested_status,
      confidence_score: analysis.confidence,
      ai_reasoning: analysis.reasoning,
      status: 'pending',
      created_by: user.id
    };

    // Use service role client for insert to bypass RLS issues
    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: insertedUpdate, error: insertError } = await supabaseServiceRole
      .from('job_status_updates')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save update to review queue" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        update: insertedUpdate,
        analysis: {
          ...analysis,
          matched_job: matchedJob ? {
            id: matchedJob.id,
            reference_id: matchedJob.reference_id,
            title: matchedJob.title,
            location: matchedJob.location,
            sector: matchedJob.sector,
            current_status: matchedJob.status
          } : null
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing job email:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
