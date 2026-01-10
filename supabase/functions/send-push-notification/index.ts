import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  title: string;
  message: string;
  category: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  targetUserIds?: string[];
  targetRoles?: string[];
  // Rich notification fields
  icon?: string;
  image?: string;
  badge?: string;
}

// Professional email template
const emailTemplate = (title: string, message: string, category: string, link?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">${title}</h1>
            </td>
          </tr>
          
          <!-- Content Card -->
          <tr>
            <td style="background: white; padding: 32px 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <!-- Category Badge -->
              <div style="margin-bottom: 20px;">
                <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${category}
                </span>
              </div>
              
              <!-- Message -->
              <p style="color: #334155; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">${message}</p>
              
              ${link ? `
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 28px;">
                <a href="https://myrecruita.com${link}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%); color: white; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);">
                  View Details
                </a>
              </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">MyRecruita Notifications</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">You received this email because you enabled notifications in MyRecruita.</p>
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="https://myrecruita.com/admin?tab=settings" style="color: #0ea5e9; text-decoration: none; font-size: 12px;">Manage notification preferences</a>
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

    const payload: NotificationPayload = await req.json();
    const { 
      title, 
      message, 
      category, 
      link, 
      type = 'info', 
      targetUserIds, 
      targetRoles,
      icon,
      image,
      badge 
    } = payload;

    if (!title || !message || !category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, message, category' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target users
    let userIds: string[] = [];

    if (targetUserIds && targetUserIds.length > 0) {
      userIds = targetUserIds;
    } else if (targetRoles && targetRoles.length > 0) {
      // Get users with specified roles
      const { data: adminProfiles, error: profilesError } = await supabaseAdmin
        .from('admin_profiles')
        .select('user_id')
        .in('role', targetRoles);
      
      if (profilesError) throw profilesError;
      userIds = adminProfiles?.map(p => p.user_id) || [];
    } else {
      // Get all admin users
      const { data: adminProfiles, error: profilesError } = await supabaseAdmin
        .from('admin_profiles')
        .select('user_id');
      
      if (profilesError) throw profilesError;
      userIds = adminProfiles?.map(p => p.user_id) || [];
    }

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No target users found' }),
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

    // Filter users based on their preferences for this event category
    const usersToNotify = userIds.filter(userId => {
      const prefs = prefsMap.get(userId);
      if (!prefs) return true; // Default to sending if no preferences set
      
      // Check if this event type is enabled
      const eventPrefs = prefs.event_preferences as Record<string, boolean> || {};
      const eventEnabled = eventPrefs[category] !== false; // Default to true
      
      // Check if in-app is enabled
      return eventEnabled && prefs.in_app_enabled !== false;
    });

    // Create in-app notifications
    const notifications = usersToNotify.map(userId => ({
      user_id: userId,
      title,
      message,
      category,
      link,
      type,
      read: false,
    }));

    if (notifications.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('notifications')
        .insert(notifications);
      
      if (insertError) throw insertError;
    }

    // Send push notifications via Progressier (if configured)
    const progressierApiKey = Deno.env.get('PROGRESSIER_API_KEY');
    const progressierAppId = Deno.env.get('PROGRESSIER_APP_ID');
    
    if (progressierApiKey && progressierAppId) {
      const pushUsers = userIds.filter(userId => {
        const prefs = prefsMap.get(userId);
        if (!prefs) return true;
        const eventPrefs = prefs.event_preferences as Record<string, boolean> || {};
        return eventPrefs[category] !== false && prefs.push_enabled !== false;
      });

      if (pushUsers.length > 0) {
        try {
          // Build the notification URL
          const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://myrecruita.com';
          const notificationUrl = link ? `https://myrecruita.com${link}` : undefined;

          // Progressier Push API with rich notification support
          const pushPayload: Record<string, unknown> = {
            appId: progressierAppId,
            title,
            body: message,
            url: notificationUrl,
            icon: icon || 'https://myrecruita.com/favicon.ico',
            badge: badge || 'https://myrecruita.com/favicon.ico',
          };

          // Add image for rich notifications if provided
          if (image) {
            pushPayload.image = image;
          }

          // Target specific roles as segments if configured
          if (targetRoles && targetRoles.length > 0) {
            pushPayload.segments = targetRoles;
          }

          const response = await fetch('https://progressier.com/api/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${progressierApiKey}`,
            },
            body: JSON.stringify(pushPayload),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Progressier push failed:', errorText);
          } else {
            console.log('Push notification sent successfully via Progressier');
          }
        } catch (pushError) {
          console.error('Push notification error:', pushError);
          // Don't fail the whole request if push fails
        }
      }
    } else {
      console.log('Progressier not configured - skipping push notifications');
    }

    // Send email notifications (if Resend is configured)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      const emailUsers = userIds.filter(userId => {
        const prefs = prefsMap.get(userId);
        if (!prefs) return false; // Don't email by default
        const eventPrefs = prefs.event_preferences as Record<string, boolean> || {};
        return eventPrefs[category] !== false && prefs.email_enabled === true;
      });

      // Get email addresses for users who want email notifications
      if (emailUsers.length > 0) {
        const { data: adminProfiles } = await supabaseAdmin
          .from('admin_profiles')
          .select('email')
          .in('user_id', emailUsers);

        const emails = adminProfiles?.map(p => p.email).filter(Boolean) || [];

        if (emails.length > 0) {
          try {
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
                html: emailTemplate(title, message, category, link),
              }),
            });

            if (!response.ok) {
              console.error('Email send failed:', await response.text());
            } else {
              console.log('Email notifications sent successfully');
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
        notificationsCreated: notifications.length,
        targetUsers: usersToNotify.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
