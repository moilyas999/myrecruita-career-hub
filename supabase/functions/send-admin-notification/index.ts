import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'cv_submission' | 'job_application' | 'contact_submission' | 'career_partner_request' | 'employer_job_submission' | 'talent_request';
  data: any;
}

// Professional email template wrapper
const emailWrapper = (content: string, badgeText: string, badgeColor: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyRecruita Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
              <img src="https://myrecruita.com/lovable-uploads/4eb1ab2b-840d-4af3-b4bf-c47f13a76a4f.png" alt="MyRecruita" style="height: 48px; margin-bottom: 16px;" />
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Notification</h1>
            </td>
          </tr>
          
          <!-- Content Card -->
          <tr>
            <td style="background: white; padding: 0; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <!-- Badge -->
              <div style="padding: 24px 40px 0;">
                <span style="display: inline-block; background: ${badgeColor}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${badgeText}
                </span>
              </div>
              
              <!-- Main Content -->
              <div style="padding: 24px 40px 32px;">
                ${content}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">MyRecruita Admin Notifications</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">You're receiving this because you're configured as an admin recipient.</p>
              <div style="margin-top: 16px;">
                <a href="https://myrecruita.com" style="color: #0ea5e9; text-decoration: none; font-size: 13px;">Visit MyRecruita</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Info row component
const infoRow = (label: string, value: string) => `
  <tr>
    <td style="padding: 12px 16px; background: #f8fafc; border-radius: 8px; width: 140px; vertical-align: top;">
      <span style="color: #64748b; font-size: 13px; font-weight: 500;">${label}</span>
    </td>
    <td style="padding: 12px 16px; background: #f8fafc; border-radius: 8px; vertical-align: top;">
      <span style="color: #1e293b; font-size: 14px; font-weight: 600;">${value}</span>
    </td>
  </tr>
  <tr><td colspan="2" style="height: 8px;"></td></tr>
`;

// Message box component
const messageBox = (message: string, title: string = "Message") => `
  <div style="margin-top: 24px;">
    <p style="color: #64748b; font-size: 13px; font-weight: 500; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">${title}</p>
    <div style="background: #f8fafc; border-left: 4px solid #0ea5e9; padding: 16px 20px; border-radius: 0 8px 8px 0;">
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
    </div>
  </div>
`;

// CTA button component
const ctaButton = (text: string, link: string) => `
  <div style="margin-top: 32px; text-align: center;">
    <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%); color: white; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);">
      ${text}
    </a>
  </div>
`;

// Attachment notice component
const attachmentNotice = (filename: string) => `
  <div style="margin-top: 20px; padding: 12px 16px; background: #ecfdf5; border-radius: 8px; display: flex; align-items: center;">
    <span style="color: #059669; font-size: 13px;">📎 <strong>Attachment:</strong> ${filename}</span>
  </div>
`;

// Format timestamp
const formatTimestamp = () => {
  const now = new Date();
  return now.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

const getEmailContent = (type: string, data: any, hasAttachment: boolean = false) => {
  const timestamp = formatTimestamp();
  const name = data.name || data.contact_name || 'Unknown';
  
  switch (type) {
    case 'cv_submission': {
      const subject = `New CV: ${name}${data.job_title ? ` - ${data.job_title}` : ''}`;
      const content = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${infoRow('Name', name)}
          ${infoRow('Email', data.email)}
          ${infoRow('Phone', data.phone || 'Not provided')}
          ${infoRow('Submitted', timestamp)}
        </table>
        ${data.message ? messageBox(data.message) : ''}
        ${hasAttachment ? attachmentNotice(`CV_${name.replace(/\s+/g, '_')}.pdf`) : ''}
        ${ctaButton('View in Dashboard', 'https://myrecruita.com/admin?tab=cv')}
      `;
      return { subject, html: emailWrapper(content, '📄 CV Submission', '#10b981') };
    }
    
    case 'job_application': {
      const jobTitle = data.job_title || 'Position';
      const jobRef = data.job_reference || data.job_id || 'N/A';
      const subject = `Application: ${name} for ${jobTitle}${jobRef !== 'N/A' ? ` (${jobRef})` : ''}`;
      const content = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${infoRow('Applicant', name)}
          ${infoRow('Email', data.email)}
          ${infoRow('Phone', data.phone || 'Not provided')}
          ${infoRow('Job Title', jobTitle)}
          ${infoRow('Reference', jobRef)}
          ${infoRow('Applied', timestamp)}
        </table>
        ${data.message ? messageBox(data.message, 'Cover Letter / Message') : ''}
        ${hasAttachment ? attachmentNotice(`CV_${name.replace(/\s+/g, '_')}.pdf`) : ''}
        ${ctaButton('View Application', 'https://myrecruita.com/admin?tab=submissions')}
      `;
      return { subject, html: emailWrapper(content, '💼 Job Application', '#3b82f6') };
    }
    
    case 'contact_submission': {
      const shortSubject = data.subject?.length > 40 ? data.subject.substring(0, 40) + '...' : data.subject;
      const subject = `Contact: ${name} - ${shortSubject || 'New Inquiry'}`;
      const content = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${infoRow('Name', name)}
          ${infoRow('Email', data.email)}
          ${infoRow('Phone', data.phone || 'Not provided')}
          ${infoRow('Company', data.company || 'Not provided')}
          ${infoRow('Inquiry Type', data.inquiry_type || 'General')}
          ${infoRow('Received', timestamp)}
        </table>
        <div style="margin-top: 24px;">
          <p style="color: #64748b; font-size: 13px; font-weight: 500; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
          <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${data.subject || 'No subject'}</p>
        </div>
        ${data.message ? messageBox(data.message) : ''}
        ${ctaButton('View Contact', 'https://myrecruita.com/admin?tab=submissions')}
      `;
      return { subject, html: emailWrapper(content, '📧 Contact Form', '#8b5cf6') };
    }
    
    case 'career_partner_request': {
      const subject = `Career Request: ${name} - ${data.service_type || 'Service Request'}`;
      const content = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${infoRow('Name', name)}
          ${infoRow('Email', data.email)}
          ${infoRow('Phone', data.phone || 'Not provided')}
          ${infoRow('Service Type', data.service_type || 'Not specified')}
          ${infoRow('Requested', timestamp)}
        </table>
        ${data.message ? messageBox(data.message) : ''}
        ${ctaButton('View Request', 'https://myrecruita.com/admin?tab=submissions')}
      `;
      return { subject, html: emailWrapper(content, '🤝 Career Partner', '#f59e0b') };
    }
    
    case 'employer_job_submission': {
      const subject = `New Job Posting: ${data.company_name || 'Company'} - ${data.job_title || 'Position'}`;
      const content = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${infoRow('Company', data.company_name || 'Not provided')}
          ${infoRow('Contact', data.contact_name || 'Not provided')}
          ${infoRow('Email', data.email)}
          ${infoRow('Phone', data.phone || 'Not provided')}
          ${infoRow('Job Title', data.job_title || 'Not provided')}
          ${infoRow('Sector', data.sector || 'Not provided')}
          ${infoRow('Location', data.location || 'Not provided')}
          ${infoRow('Submitted', timestamp)}
        </table>
        ${data.job_description ? messageBox(data.job_description, 'Job Description') : ''}
        ${hasAttachment ? attachmentNotice(`JobSpec_${(data.company_name || 'Company').replace(/\s+/g, '_')}.pdf`) : ''}
        ${ctaButton('View Job Posting', 'https://myrecruita.com/admin?tab=submissions')}
      `;
      return { subject, html: emailWrapper(content, '🏢 Employer Job', '#14b8a6') };
    }
    
    case 'talent_request': {
      const subject = `Talent Request: ${data.company_name || 'Company'} - Profile ${data.talent_id || 'N/A'}`;
      const content = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${infoRow('Company', data.company_name || 'Not provided')}
          ${infoRow('Contact', data.contact_name || 'Not provided')}
          ${infoRow('Email', data.email)}
          ${infoRow('Talent ID', data.talent_id || 'Not specified')}
          ${infoRow('Requested', timestamp)}
        </table>
        ${data.message ? messageBox(data.message) : ''}
        ${ctaButton('View Request', 'https://myrecruita.com/admin?tab=talent')}
      `;
      return { subject, html: emailWrapper(content, '👥 Talent Request', '#ec4899') };
    }
    
    default: {
      const subject = `New Submission - MyRecruita`;
      const content = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${infoRow('Type', type)}
          ${infoRow('Received', timestamp)}
        </table>
        <div style="margin-top: 24px;">
          <p style="color: #64748b; font-size: 13px; font-weight: 500; margin: 0 0 8px;">DATA</p>
          <pre style="background: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 12px; color: #334155;">${JSON.stringify(data, null, 2)}</pre>
        </div>
        ${ctaButton('View in Dashboard', 'https://myrecruita.com/admin')}
      `;
      return { subject, html: emailWrapper(content, '📝 Submission', '#64748b') };
    }
  }
};

// Fetch file and convert to base64 for email attachment
const fetchFileAsBase64 = async (fileUrl: string): Promise<{ content: string; filename: string } | null> => {
  try {
    console.log('Fetching file for attachment:', fileUrl);
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch file:', response.status, response.statusText);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 using Deno's built-in encoder
    const base64 = btoa(String.fromCharCode(...uint8Array));
    
    // Extract filename from URL
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1] || 'attachment';
    
    console.log('File fetched successfully, size:', uint8Array.length, 'bytes');
    
    return { content: base64, filename };
  } catch (error) {
    console.error('Error fetching file for attachment:', error);
    return null;
  }
};

const getNotificationEmails = async (): Promise<string[]> => {
  const defaultEmails = ['zuhair@myrecruita.com'];
  
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'notification_emails')
      .single();

    if (error) {
      console.error('Error fetching notification emails:', error);
      return defaultEmails;
    }

    if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
      console.log('Using notification emails from settings:', data.value);
      return data.value;
    }

    return defaultEmails;
  } catch (error) {
    console.error('Error in getNotificationEmails:', error);
    return defaultEmails;
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

    // Prepare attachments for types that include files
    const attachments: Array<{ filename: string; content: string }> = [];
    let hasAttachment = false;

    // Handle CV file attachments
    if ((type === 'cv_submission' || type === 'job_application') && data.cv_file_url) {
      const cvFile = await fetchFileAsBase64(data.cv_file_url);
      if (cvFile) {
        const name = data.name || 'Candidate';
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
        attachments.push({
          filename: `CV_${cleanName}.pdf`,
          content: cvFile.content,
        });
        hasAttachment = true;
        console.log('CV attachment prepared:', `CV_${cleanName}.pdf`);
      }
    }

    // Handle job spec file attachments
    if (type === 'employer_job_submission' && data.job_spec_file_url) {
      const jobSpecFile = await fetchFileAsBase64(data.job_spec_file_url);
      if (jobSpecFile) {
        const company = data.company_name || 'Company';
        const cleanCompany = company.replace(/[^a-zA-Z0-9]/g, '_');
        attachments.push({
          filename: `JobSpec_${cleanCompany}.pdf`,
          content: jobSpecFile.content,
        });
        hasAttachment = true;
        console.log('Job spec attachment prepared:', `JobSpec_${cleanCompany}.pdf`);
      }
    }

    const emailContent = getEmailContent(type, data, hasAttachment);
    
    // Fetch notification emails from database
    const notificationEmails = await getNotificationEmails();
    console.log('Sending to:', notificationEmails);

    // Build email options
    const emailOptions: any = {
      from: "MyRecruita <onboarding@resend.dev>",
      to: notificationEmails,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    // Add attachments if any
    if (attachments.length > 0) {
      emailOptions.attachments = attachments;
      console.log(`Sending email with ${attachments.length} attachment(s)`);
    }

    const emailResponse = await resend.emails.send(emailOptions);

    console.log("Admin notification response:", emailResponse);

    // Check if Resend returned an error
    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      attachmentsIncluded: attachments.length 
    }), {
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
