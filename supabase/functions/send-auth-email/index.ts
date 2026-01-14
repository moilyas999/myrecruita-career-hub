import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: "magic_link" | "otp" | "password_reset" | "signup_confirmation";
  redirectUrl: string;
}

const getEmailTemplate = (type: string, data: { code?: string; link?: string; email: string }) => {
  const baseStyle = `
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f1f5f9; padding: 40px 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px 40px; }
    .code-box { background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e293b; font-family: 'Courier New', monospace; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%); color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { padding: 24px; text-align: center; color: #64748b; font-size: 13px; background: #f8fafc; }
    p { color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 16px; }
    .small { font-size: 13px; color: #94a3b8; }
  `;

  if (type === "magic_link" || type === "otp") {
    return {
      subject: "Sign in to MyRecruita",
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyle}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Sign In to MyRecruita</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Use the code below to sign in to your MyRecruita account:</p>
              <div class="code-box">
                <span class="code">${data.code || "------"}</span>
              </div>
              ${data.link ? `
                <p style="text-align: center;">Or click the button below:</p>
                <p style="text-align: center; margin: 24px 0;">
                  <a href="${data.link}" class="btn">Sign In to MyRecruita</a>
                </p>
              ` : ''}
              <p class="small">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MyRecruita - Your Career Partner</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  if (type === "password_reset") {
    return {
      subject: "Reset your MyRecruita password",
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyle}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center; margin: 32px 0;">
                <a href="${data.link}" class="btn">Reset Password</a>
              </p>
              <p class="small">This link expires in 1 hour. If you didn't request this, you can safely ignore this email - your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MyRecruita - Your Career Partner</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  if (type === "signup_confirmation") {
    return {
      subject: "Confirm your MyRecruita account",
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyle}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to MyRecruita!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thanks for signing up! Please confirm your email address by clicking the button below:</p>
              <p style="text-align: center; margin: 32px 0;">
                <a href="${data.link}" class="btn">Confirm Email</a>
              </p>
              <p class="small">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MyRecruita - Your Career Partner</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  throw new Error(`Unknown email type: ${type}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, redirectUrl }: AuthEmailRequest = await req.json();

    // Validate email
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate type
    const validTypes = ["magic_link", "otp", "password_reset", "signup_confirmation"];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid email type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate redirectUrl - required for all types
    if (!redirectUrl) {
      return new Response(
        JSON.stringify({ error: "redirectUrl is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    let code: string | undefined;
    let link: string | undefined;

    if (type === "magic_link" || type === "otp") {
      // Generate OTP and use Supabase to create the magic link
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: email,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("Error generating magic link:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Extract OTP from Supabase response - this is the ONLY valid OTP
      code = data.properties?.email_otp;
      link = data.properties?.action_link;

      if (!code) {
        console.error("No OTP generated by Supabase for:", email);
        return new Response(
          JSON.stringify({ error: "Failed to generate verification code" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      console.log("Generated auth link for:", email, "OTP generated:", !!code);
    } else if (type === "password_reset") {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: email,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("Error generating password reset link:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      link = data.properties?.action_link;
      
      if (!link) {
        console.error("No reset link generated for:", email);
        return new Response(
          JSON.stringify({ error: "Failed to generate password reset link" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      console.log("Generated password reset link for:", email);
    } else if (type === "signup_confirmation") {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "signup",
        email: email,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("Error generating signup confirmation link:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      link = data.properties?.action_link;
      
      if (!link) {
        console.error("No confirmation link generated for:", email);
        return new Response(
          JSON.stringify({ error: "Failed to generate confirmation link" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      console.log("Generated signup confirmation for:", email);
    }

    const template = getEmailTemplate(type, { code, link, email });

    const emailResponse = await resend.emails.send({
      from: "MyRecruita <no-reply@myrecruita.com>",
      to: [email],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully via Resend:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        ...(type === "otp" || type === "magic_link" ? { otpGenerated: true } : {})
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);