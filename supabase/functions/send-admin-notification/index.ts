import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'cv_submission' | 'job_application' | 'contact_submission' | 'career_partner_request' | 'employer_job_submission' | 'talent_request';
  data: any;
}

const getEmailContent = (type: string, data: any) => {
  const baseInfo = `
    <p><strong>Name:</strong> ${data.name || data.contact_name || 'N/A'}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
  `;

  switch (type) {
    case 'cv_submission':
      return {
        subject: 'New CV Submission - MyRecruita',
        html: `
          <h2>🎯 New CV Submission</h2>
          ${baseInfo}
          <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
          <p><strong>CV File:</strong> ${data.cv_file_url ? 'Yes' : 'No'}</p>
        `
      };
    
    case 'job_application':
      return {
        subject: 'New Job Application - MyRecruita',
        html: `
          <h2>💼 New Job Application</h2>
          ${baseInfo}
          <p><strong>Job ID:</strong> ${data.job_id}</p>
          <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
          <p><strong>CV File:</strong> ${data.cv_file_url ? 'Yes' : 'No'}</p>
        `
      };
    
    case 'contact_submission':
      return {
        subject: 'New Contact Submission - MyRecruita',
        html: `
          <h2>📧 New Contact Submission</h2>
          ${baseInfo}
          <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Inquiry Type:</strong> ${data.inquiry_type}</p>
          <p><strong>Message:</strong> ${data.message}</p>
        `
      };
    
    case 'career_partner_request':
      return {
        subject: 'New Career Partner Request - MyRecruita',
        html: `
          <h2>🤝 New Career Partner Request</h2>
          ${baseInfo}
          <p><strong>Service Type:</strong> ${data.service_type}</p>
          <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
        `
      };
    
    case 'employer_job_submission':
      return {
        subject: 'New Employer Job Submission - MyRecruita',
        html: `
          <h2>🏢 New Employer Job Submission</h2>
          <p><strong>Contact Name:</strong> ${data.contact_name}</p>
          <p><strong>Company:</strong> ${data.company_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Job Title:</strong> ${data.job_title}</p>
          <p><strong>Sector:</strong> ${data.sector}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Job Description:</strong> ${data.job_description}</p>
          <p><strong>Job Spec File:</strong> ${data.job_spec_file_url ? 'Yes' : 'No'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `
      };
    
    case 'talent_request':
      return {
        subject: 'New Talent Request - MyRecruita',
        html: `
          <h2>👥 New Talent Request</h2>
          <p><strong>Company:</strong> ${data.company_name}</p>
          <p><strong>Contact Name:</strong> ${data.contact_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Talent ID:</strong> ${data.talent_id || 'N/A'}</p>
          <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `
      };
    
    default:
      return {
        subject: 'New Submission - MyRecruita',
        html: `
          <h2>📝 New Submission</h2>
          ${baseInfo}
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Data:</strong> ${JSON.stringify(data, null, 2)}</p>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotificationRequest = await req.json();
    
    console.log(`Processing ${type} notification:`, data);

    const emailContent = getEmailContent(type, data);

    const emailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["zuhair@myrecruita.com"],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Admin notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending admin notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);