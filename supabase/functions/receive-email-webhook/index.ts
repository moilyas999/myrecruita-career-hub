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

    // Clean the email body
    const cleanedBody = cleanEmailBody(emailData.text || "");

    if (!cleanedBody || cleanedBody.length < 10) {
      console.log("Email body too short or empty, skipping AI processing");
      
      // Update log status
      if (logEntry) {
        await supabase
          .from("email_ingestion_log")
          .update({
            status: "failed",
            error_message: "Email body too short or empty",
            processed_at: new Date().toISOString(),
          })
          .eq("id", logEntry.id);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Email body too short, skipped" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
