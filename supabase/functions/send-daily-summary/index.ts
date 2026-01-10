import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailySummary {
  cvSubmissions: number;
  jobApplications: number;
  contactSubmissions: number;
  careerPartnerRequests: number;
  employerJobSubmissions: number;
  talentRequests: number;
  newJobs: number;
  blogPosts: number;
  cvUploaderActivity: number;
}

interface SummaryHighlight {
  type: string;
  text: string;
}

// Get today's date in UTC (start of day)
function getTodayStart(): string {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString();
}

// Format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

// Generate push notification body
function generatePushBody(summary: DailySummary): string {
  const parts: string[] = [];
  
  if (summary.cvSubmissions > 0) parts.push(`${summary.cvSubmissions} CVs`);
  if (summary.jobApplications > 0) parts.push(`${summary.jobApplications} applications`);
  if (summary.contactSubmissions > 0) parts.push(`${summary.contactSubmissions} contacts`);
  if (summary.employerJobSubmissions > 0) parts.push(`${summary.employerJobSubmissions} employer jobs`);
  if (summary.talentRequests > 0) parts.push(`${summary.talentRequests} talent requests`);
  if (summary.newJobs > 0) parts.push(`${summary.newJobs} new jobs`);
  
  if (parts.length === 0) {
    return "It was a quiet day with no new submissions.";
  }
  
  return `Today: ${parts.join(', ')}. Tap to view details.`;
}

// Professional email template for daily summary
function generateEmailTemplate(summary: DailySummary, highlights: SummaryHighlight[], date: string): string {
  const totalActivity = Object.values(summary).reduce((a, b) => a + b, 0);
  
  const statsCards = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr>
        <td width="50%" style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #1e40af;">${summary.cvSubmissions}</div>
            <div style="font-size: 13px; color: #3b82f6; font-weight: 500; margin-top: 4px;">New CVs</div>
          </div>
        </td>
        <td width="50%" style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #166534;">${summary.jobApplications}</div>
            <div style="font-size: 13px; color: #22c55e; font-weight: 500; margin-top: 4px;">Applications</div>
          </div>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #92400e;">${summary.contactSubmissions}</div>
            <div style="font-size: 13px; color: #d97706; font-weight: 500; margin-top: 4px;">Contact Forms</div>
          </div>
        </td>
        <td width="50%" style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #7e22ce;">${summary.employerJobSubmissions}</div>
            <div style="font-size: 13px; color: #a855f7; font-weight: 500; margin-top: 4px;">Employer Jobs</div>
          </div>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%); padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #be123c;">${summary.talentRequests}</div>
            <div style="font-size: 13px; color: #f43f5e; font-weight: 500; margin-top: 4px;">Talent Requests</div>
          </div>
        </td>
        <td width="50%" style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #0369a1;">${summary.newJobs}</div>
            <div style="font-size: 13px; color: #0ea5e9; font-weight: 500; margin-top: 4px;">New Jobs Posted</div>
          </div>
        </td>
      </tr>
    </table>
  `;

  const highlightsList = highlights.length > 0 ? `
    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <h3 style="color: #334155; font-size: 16px; font-weight: 600; margin: 0 0 16px;">Today's Highlights</h3>
      <ul style="margin: 0; padding: 0 0 0 20px; color: #475569;">
        ${highlights.slice(0, 5).map(h => `<li style="margin-bottom: 8px; font-size: 14px;">${h.text}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Summary - ${date}</title>
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
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">Daily Summary</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">${date}</p>
            </td>
          </tr>
          
          <!-- Content Card -->
          <tr>
            <td style="background: white; padding: 32px 24px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <!-- Total Activity Banner -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 16px 20px; border-radius: 10px; margin-bottom: 24px; text-align: center; border: 1px solid #e2e8f0;">
                <span style="font-size: 14px; color: #64748b;">Total Activity Today</span>
                <div style="font-size: 36px; font-weight: 700; color: #0f172a; margin-top: 4px;">${totalActivity}</div>
              </div>
              
              <!-- Stats Grid -->
              ${statsCards}
              
              ${highlightsList}
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 28px;">
                <a href="https://myrecruita.com/admin" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%); color: white; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);">
                  View Dashboard
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">MyRecruita Daily Summary</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Sent at the end of each day to keep you informed.</p>
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="https://myrecruita.com/admin?tab=notification-settings" style="color: #0ea5e9; text-decoration: none; font-size: 12px;">Manage notification preferences</a>
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
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const todayStart = getTodayStart();
    const today = new Date();
    const formattedDate = formatDate(today);

    console.log(`Generating daily summary for: ${formattedDate} (from ${todayStart})`);

    // Query all tables for today's activity in parallel
    const [
      cvSubmissions,
      jobApplications,
      contactSubmissions,
      careerPartnerRequests,
      employerJobSubmissions,
      talentRequests,
      newJobs,
      blogPosts,
      cvUploaderActivity,
    ] = await Promise.all([
      supabaseAdmin
        .from('cv_submissions')
        .select('id, name, job_title', { count: 'exact' })
        .gte('created_at', todayStart),
      supabaseAdmin
        .from('job_applications')
        .select('id, name, job_id', { count: 'exact' })
        .gte('created_at', todayStart),
      supabaseAdmin
        .from('contact_submissions')
        .select('id, name, subject', { count: 'exact' })
        .gte('created_at', todayStart),
      supabaseAdmin
        .from('career_partner_requests')
        .select('id, name', { count: 'exact' })
        .gte('created_at', todayStart),
      supabaseAdmin
        .from('employer_job_submissions')
        .select('id, company_name, job_title', { count: 'exact' })
        .gte('created_at', todayStart),
      supabaseAdmin
        .from('talent_requests')
        .select('id, company_name', { count: 'exact' })
        .gte('created_at', todayStart),
      supabaseAdmin
        .from('jobs')
        .select('id, title', { count: 'exact' })
        .gte('created_at', todayStart),
      supabaseAdmin
        .from('blog_posts')
        .select('id, title', { count: 'exact' })
        .gte('created_at', todayStart)
        .eq('is_published', true),
      supabaseAdmin
        .from('cv_upload_activity_log')
        .select('id', { count: 'exact' })
        .gte('created_at', todayStart),
    ]);

    // Build summary object
    const summary: DailySummary = {
      cvSubmissions: cvSubmissions.count ?? 0,
      jobApplications: jobApplications.count ?? 0,
      contactSubmissions: contactSubmissions.count ?? 0,
      careerPartnerRequests: careerPartnerRequests.count ?? 0,
      employerJobSubmissions: employerJobSubmissions.count ?? 0,
      talentRequests: talentRequests.count ?? 0,
      newJobs: newJobs.count ?? 0,
      blogPosts: blogPosts.count ?? 0,
      cvUploaderActivity: cvUploaderActivity.count ?? 0,
    };

    const totalActivity = Object.values(summary).reduce((a, b) => a + b, 0);

    console.log('Daily summary:', summary);
    console.log('Total activity:', totalActivity);

    // Build highlights from actual data
    const highlights: SummaryHighlight[] = [];

    // Add CV submission highlights
    if (cvSubmissions.data && cvSubmissions.data.length > 0) {
      cvSubmissions.data.slice(0, 3).forEach((cv: { name: string; job_title?: string }) => {
        highlights.push({
          type: 'cv',
          text: `New CV: ${cv.name}${cv.job_title ? ` - ${cv.job_title}` : ''}`,
        });
      });
    }

    // Add employer job highlights
    if (employerJobSubmissions.data && employerJobSubmissions.data.length > 0) {
      employerJobSubmissions.data.slice(0, 2).forEach((job: { company_name: string; job_title: string }) => {
        highlights.push({
          type: 'employer_job',
          text: `Employer Job: ${job.job_title} at ${job.company_name}`,
        });
      });
    }

    // Add job application highlights
    if (jobApplications.data && jobApplications.data.length > 0) {
      highlights.push({
        type: 'applications',
        text: `${jobApplications.data.length} new job application${jobApplications.data.length > 1 ? 's' : ''} received`,
      });
    }

    // Add talent request highlights
    if (talentRequests.data && talentRequests.data.length > 0) {
      talentRequests.data.slice(0, 2).forEach((req: { company_name: string }) => {
        highlights.push({
          type: 'talent_request',
          text: `Talent inquiry from ${req.company_name}`,
        });
      });
    }

    // Get all admin users who have daily_summary enabled
    const { data: adminProfiles, error: profilesError } = await supabaseAdmin
      .from('admin_profiles')
      .select('user_id, email');

    if (profilesError) throw profilesError;

    const userIds = adminProfiles?.map(p => p.user_id) || [];

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No admin users found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get notification preferences for these users
    const { data: preferences, error: prefsError } = await supabaseAdmin
      .from('notification_preferences')
      .select('user_id, in_app_enabled, push_enabled, email_enabled, event_preferences')
      .in('user_id', userIds);

    if (prefsError) throw prefsError;

    const prefsMap = new Map(preferences?.map(p => [p.user_id, p]) || []);

    // Filter users who have daily_summary enabled
    const usersToNotify = userIds.filter(userId => {
      const prefs = prefsMap.get(userId);
      if (!prefs) return true; // Default to sending if no preferences set
      
      const eventPrefs = prefs.event_preferences as Record<string, boolean> || {};
      return eventPrefs['daily_summary'] !== false;
    });

    if (usersToNotify.length === 0) {
      console.log('No users have daily_summary enabled');
      return new Response(
        JSON.stringify({ message: 'No users have daily_summary notifications enabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const title = `Daily Summary - ${formattedDate}`;
    const message = totalActivity > 0 
      ? generatePushBody(summary)
      : "It was a quiet day with no new submissions.";

    // Create in-app notifications
    const inAppUsers = usersToNotify.filter(userId => {
      const prefs = prefsMap.get(userId);
      return !prefs || prefs.in_app_enabled !== false;
    });

    const notifications = inAppUsers.map(userId => ({
      user_id: userId,
      title,
      message,
      category: 'daily_summary',
      link: '/admin',
      type: 'info',
      read: false,
    }));

    if (notifications.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('notifications')
        .insert(notifications);
      
      if (insertError) {
        console.error('Error inserting notifications:', insertError);
      } else {
        console.log(`Created ${notifications.length} in-app notifications`);
      }
    }

    // Send push notifications via Progressier
    const progressierApiKey = Deno.env.get('PROGRESSIER_API_KEY');
    const progressierAppId = Deno.env.get('PROGRESSIER_APP_ID');

    if (progressierApiKey && progressierAppId) {
      const pushUsers = usersToNotify.filter(userId => {
        const prefs = prefsMap.get(userId);
        return !prefs || prefs.push_enabled !== false;
      });

      if (pushUsers.length > 0) {
        try {
          const pushPayload = {
            appId: progressierAppId,
            title,
            body: message,
            url: 'https://myrecruita.com/admin',
            icon: 'https://myrecruita.com/favicon.ico',
            badge: 'https://myrecruita.com/favicon.ico',
          };

          const response = await fetch('https://progressier.com/api/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${progressierApiKey}`,
            },
            body: JSON.stringify(pushPayload),
          });

          if (!response.ok) {
            console.error('Progressier push failed:', await response.text());
          } else {
            console.log('Push notification sent successfully');
          }
        } catch (pushError) {
          console.error('Push notification error:', pushError);
        }
      }
    }

    // Send email notifications via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (resendApiKey) {
      const emailUsers = usersToNotify.filter(userId => {
        const prefs = prefsMap.get(userId);
        return prefs && prefs.email_enabled === true;
      });

      if (emailUsers.length > 0) {
        const emails = adminProfiles
          ?.filter(p => emailUsers.includes(p.user_id))
          .map(p => p.email)
          .filter(Boolean) || [];

        if (emails.length > 0) {
          try {
            const emailHtml = generateEmailTemplate(summary, highlights, formattedDate);

            const response = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: 'MyRecruita <notifications@myrecruita.com>',
                to: emails,
                subject: title,
                html: emailHtml,
              }),
            });

            if (!response.ok) {
              console.error('Email send failed:', await response.text());
            } else {
              console.log(`Email sent to ${emails.length} users`);
            }
          } catch (emailError) {
            console.error('Email notification error:', emailError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        totalActivity,
        notificationsCreated: notifications.length,
        usersNotified: usersToNotify.length,
        date: formattedDate,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Daily summary error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
