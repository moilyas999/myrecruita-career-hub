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
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%); padding: 24px; border-radius: 8px 8px 0 0;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
                    </div>
                    <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 8px 8px;">
                      <p style="color: #334155; font-size: 16px; line-height: 1.6;">${message}</p>
                      ${link ? `
                        <a href="https://myrecruita.com${link}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
                          View Details
                        </a>
                      ` : ''}
                    </div>
                    <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 12px;">
                      <p>You received this email because you enabled notifications in MyRecruita.</p>
                    </div>
                  </div>
                `,
              }),
            });

            if (!response.ok) {
              console.error('Email send failed:', await response.text());
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
