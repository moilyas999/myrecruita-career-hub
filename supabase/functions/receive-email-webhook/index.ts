import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

// Resend inbound email webhook payload structure
interface ResendInboundPayload {
  type: "email.received";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    text: string;
    html: string;
    reply_to?: string;
    attachments?: Array<{
      filename: string;
      content_type: string;
      content: string;
    }>;
  };
}

interface RelevanceCheckResult {
  is_relevant: boolean;
  email_type: string;
  reason: string;
}

// Parse email address from "Name <email@domain.com>" format
function parseEmailAddress(emailString: string): { name: string | null; email: string } {
  const match = emailString.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: null, email: emailString.trim() };
}

// Clean email body: remove signatures, disclaimers, and quoted text
function cleanEmailBody(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // Remove common email signatures
  const signaturePatterns = [
    /^--\s*$/m,
    /^Sent from my/m,
    /^Kind regards,/m,
    /^Best regards,/m,
    /^Regards,/m,
    /^Thanks,/m,
    /^Thank you,/m,
    /^Cheers,/m,
  ];

  for (const pattern of signaturePatterns) {
    const match = cleaned.search(pattern);
    if (match > 0) {
      cleaned = cleaned.substring(0, match).trim();
    }
  }

  // Remove quoted replies (lines starting with >)
  cleaned = cleaned.replace(/^>.*$/gm, "").trim();

  // Remove "On X wrote:" patterns for forwarded/replied emails
  cleaned = cleaned.replace(/On .+ wrote:[\s\S]*$/m, "").trim();

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  return cleaned;
}

// Stage 1: Quick AI check to filter irrelevant emails
async function checkEmailRelevance(
  subject: string,
  body: string,
  apiKey: string
): Promise<RelevanceCheckResult> {
  const prompt = `You are an email classifier for a recruitment agency. Analyze this email and determine if it's about a job/position status update (e.g., position filled, job expired, role closed, hiring paused, role on hold, no longer recruiting).

Subject: ${subject || "(no subject)"}
Body: ${body.substring(0, 1500)}

Classify this email into one of these categories:
- job_status_update: Email is about a job status change (filled, closed, paused, expired, on hold, no longer hiring)
- general_inquiry: General questions about services, candidates, or recruitment
- spam: Unsolicited marketing, scams, or irrelevant content
- out_of_office: Auto-reply out of office messages
- marketing: Newsletters, promotions, or service advertisements
- unrelated: Invoice, receipt, meeting request, or other unrelated business email

Respond with ONLY valid JSON (no markdown, no code blocks):
{"is_relevant": boolean, "email_type": "category_name", "reason": "brief explanation"}

is_relevant should be true ONLY for job_status_update emails.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error("Relevance check API error:", response.status, await response.text());
      // On API failure, assume relevant to avoid missing important emails
      return { is_relevant: true, email_type: "unknown", reason: "API check failed, processing as relevant" };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response - handle potential markdown code blocks
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\s*\n?/g, "").replace(/```\s*$/g, "").trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    return {
      is_relevant: Boolean(parsed.is_relevant),
      email_type: parsed.email_type || "unknown",
      reason: parsed.reason || "No reason provided",
    };
  } catch (error) {
    console.error("Relevance check parsing error:", error);
    // On parse failure, assume relevant to be safe
    return { is_relevant: true, email_type: "unknown", reason: "Parse error, processing as relevant" };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

  // Create service role client for database operations
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Parse the webhook payload
    const payload: ResendInboundPayload = await req.json();
    console.log("Received Resend inbound webhook:", JSON.stringify(payload, null, 2));

    // Validate payload type
    if (payload.type !== "email.received") {
      console.log("Ignoring non-email webhook type:", payload.type);
      return new Response(
        JSON.stringify({ success: true, message: "Ignored non-email event" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: emailData } = payload;
    const { name: fromName, email: fromEmail } = parseEmailAddress(emailData.from);
    const toEmail = emailData.to?.[0] || "unknown";
    const messageId = emailData.email_id;

    // Check for duplicate message (idempotency)
    const { data: existingLog } = await supabase
      .from("email_ingestion_log")
      .select("id")
      .eq("message_id", messageId)
      .single();

    if (existingLog) {
      console.log("Duplicate message ID, skipping:", messageId);
      return new Response(
        JSON.stringify({ success: true, message: "Duplicate email, already processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean the email body first (needed for both filtering and processing)
    const cleanedBody = cleanEmailBody(emailData.text || "");

    // Insert into email ingestion log
    const { data: logEntry, error: logError } = await supabase
      .from("email_ingestion_log")
      .insert({
        message_id: messageId,
        from_email: fromEmail,
        from_name: fromName,
        to_email: toEmail,
        subject: emailData.subject,
        received_at: payload.created_at || new Date().toISOString(),
        status: "processing",
      })
      .select()
      .single();

    if (logError) {
      console.error("Failed to log email ingestion:", logError);
      // Continue processing even if logging fails
    }

    // Check for empty/short emails first
    if (!cleanedBody || cleanedBody.length < 10) {
      console.log("Email body too short or empty, skipping AI processing");
      
      if (logEntry) {
        await supabase
          .from("email_ingestion_log")
          .update({
            status: "failed",
            error_message: "Email body too short or empty",
            email_type: "unrelated",
            is_relevant: false,
            filter_reason: "Email body too short or empty to analyze",
            processed_at: new Date().toISOString(),
          })
          .eq("id", logEntry.id);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Email body too short, skipped" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============== STAGE 1: RELEVANCE FILTER ==============
    console.log("Stage 1: Checking email relevance...");
    const relevanceCheck = await checkEmailRelevance(
      emailData.subject || "",
      cleanedBody,
      lovableApiKey
    );

    console.log("Relevance check result:", relevanceCheck);

    // If not relevant, filter it out
    if (!relevanceCheck.is_relevant) {
      console.log("Email filtered as irrelevant:", {
        messageId,
        type: relevanceCheck.email_type,
        reason: relevanceCheck.reason,
      });

      if (logEntry) {
        await supabase
          .from("email_ingestion_log")
          .update({
            status: "filtered",
            email_type: relevanceCheck.email_type,
            is_relevant: false,
            filter_reason: relevanceCheck.reason,
            processed_at: new Date().toISOString(),
          })
          .eq("id", logEntry.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          filtered: true,
          email_type: relevanceCheck.email_type,
          reason: relevanceCheck.reason,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update log to show it passed relevance check
    if (logEntry) {
      await supabase
        .from("email_ingestion_log")
        .update({
          email_type: relevanceCheck.email_type,
          is_relevant: true,
          filter_reason: relevanceCheck.reason,
        })
        .eq("id", logEntry.id);
    }

    // ============== STAGE 2: JOB MATCHING ==============
    console.log("Stage 2: Processing for job matching...");

    // Call process-job-email edge function internally
    const processResponse = await fetch(`${supabaseUrl}/functions/v1/process-job-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "x-internal-call": "true",
      },
      body: JSON.stringify({
        from: emailData.from,
        subject: emailData.subject,
        body: cleanedBody,
        source: "webhook",
        email_message_id: messageId,
      }),
    });

    const processResult = await processResponse.json();

    if (!processResponse.ok) {
      console.error("process-job-email failed:", processResult);
      
      // Update log status
      if (logEntry) {
        await supabase
          .from("email_ingestion_log")
          .update({
            status: "failed",
            error_message: processResult.error || "Processing failed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", logEntry.id);
      }

      return new Response(
        JSON.stringify({ success: false, error: processResult.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update log with success and link to job status update
    if (logEntry) {
      await supabase
        .from("email_ingestion_log")
        .update({
          status: "processed",
          job_status_update_id: processResult.update?.id || null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", logEntry.id);
    }

    console.log("Email processed successfully:", {
      messageId,
      jobStatusUpdateId: processResult.update?.id,
      matchedJob: processResult.analysis?.matched_job?.title,
      confidence: processResult.analysis?.confidence,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email processed successfully",
        updateId: processResult.update?.id,
        analysis: processResult.analysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing inbound email webhook:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
