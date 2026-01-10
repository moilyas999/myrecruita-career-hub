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
  targetUserIds?: string[]; // If empty, sends to all users with notifications enabled
  targetRoles?: string[]; // Send to users with these roles
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
    const { title, message, category, link, type = 'info', targetUserIds, targetRoles } = payload;

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
          // Progressier uses a broadcast-style API
          // For user-specific targeting, you'd need to use their segments feature
          const response = await fetch('https://progressier.com/api/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${progressierApiKey}`,
            },
            body: JSON.stringify({
              appId: progressierAppId,
              title,
              body: message,
              url: link || undefined,
              // Progressier supports segments for targeting
              // segments: ['all'] // or specific user segments
            }),
          });

          if (!response.ok) {
            console.error('Progressier push failed:', await response.text());
          }
        } catch (pushError) {
          console.error('Push notification error:', pushError);
          // Don't fail the whole request if push fails
        }
      }
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
                  <h2>${title}</h2>
                  <p>${message}</p>
                  ${link ? `<p><a href="${link}">View Details</a></p>` : ''}
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
