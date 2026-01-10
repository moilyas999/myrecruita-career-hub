import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Decode JWT to extract user ID (sub claim)
function decodeJwt(token: string): { sub?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, role } = await req.json()

    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify the caller is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = decodeJwt(token)
    
    if (!decoded?.sub) {
      console.error('Failed to decode JWT')
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user exists using admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(decoded.sub)
    
    if (userError || !userData?.user) {
      console.error('User verification error:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const callerUser = userData.user
    console.log('Verified caller:', callerUser.email)

    // Check if caller is a full admin
    const { data: callerAdmin, error: callerError } = await supabaseAdmin
      .from('admin_profiles')
      .select('role')
      .eq('user_id', callerUser.id)
      .single()

    if (callerError || !callerAdmin || callerAdmin.role !== 'admin') {
      console.error('Caller not admin:', callerError)
      return new Response(
        JSON.stringify({ error: 'Only full admins can create staff accounts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating/promoting admin user:', email, 'with role:', role)

    let userId: string;

    // First check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    if (existingUser) {
      console.log('User already exists:', existingUser.id)
      userId = existingUser.id

      // Check if already a staff member
      const { data: existingAdmin } = await supabaseAdmin
        .from('admin_profiles')
        .select('id, role')
        .eq('user_id', userId)
        .maybeSingle()

      if (existingAdmin) {
        if (existingAdmin.role === role) {
          return new Response(
            JSON.stringify({ success: true, user_id: userId, already_staff: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ error: `This user is already a staff member (${existingAdmin.role})` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Create new user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (userError) {
        console.error('User creation error:', userError)
        return new Response(
          JSON.stringify({ error: userError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('User created:', userData.user.id)
      userId = userData.user.id
    }

    // Insert admin profile with service role (bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .insert({
        user_id: userId,
        email,
        role
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Only delete user if we just created them
      if (!existingUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      return new Response(
        JSON.stringify({ error: 'Failed to create admin profile: ' + profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Admin profile created successfully')

    // Assign role-based permissions
    try {
      const { error: permError } = await supabaseAdmin.rpc('assign_role_permissions', {
        _user_id: userId,
        _role: role
      })
      
      if (permError) {
        console.error('Permission assignment error:', permError)
        // Non-critical, continue
      } else {
        console.log('Role permissions assigned successfully')
      }
    } catch (permErr) {
      console.error('Permission assignment failed:', permErr)
    }

    // Role-based notification defaults
    const roleNotificationDefaults: Record<string, string[]> = {
      admin: ['cv_submission', 'job_application', 'contact_submission', 'career_partner_request', 
              'employer_job_submission', 'talent_request', 'staff_added', 'permission_changed', 
              'blog_published', 'system_updates', 'weekly_digest'],
      recruiter: ['cv_submission', 'job_application', 'employer_job_submission', 'talent_request', 
                  'permission_changed', 'system_updates'],
      account_manager: ['contact_submission', 'career_partner_request', 'employer_job_submission', 
                        'talent_request', 'permission_changed', 'system_updates', 'weekly_digest'],
      marketing: ['blog_published', 'permission_changed', 'system_updates'],
      cv_uploader: ['cv_submission', 'permission_changed', 'system_updates'],
      viewer: ['permission_changed', 'system_updates'],
    };

    // Generate event_preferences based on role
    const enabledEvents = roleNotificationDefaults[role] || roleNotificationDefaults.viewer;
    const allEventTypes = ['cv_submission', 'job_application', 'contact_submission', 
                          'career_partner_request', 'employer_job_submission', 'talent_request',
                          'staff_added', 'permission_changed', 'blog_published', 
                          'system_updates', 'weekly_digest'];
    
    const eventPreferences = allEventTypes.reduce((acc, event) => {
      acc[event] = enabledEvents.includes(event);
      return acc;
    }, {} as Record<string, boolean>);

    // Create notification preferences with role-based defaults
    try {
      const { error: prefError } = await supabaseAdmin
        .from('notification_preferences')
        .insert({
          user_id: userId,
          email_enabled: true,
          push_enabled: true,
          in_app_enabled: true,
          event_preferences: eventPreferences
        })
      
      if (prefError) {
        console.error('Notification preferences error:', prefError)
        // Non-critical, continue
      } else {
        console.log('Notification preferences created')
      }
    } catch (prefErr) {
      console.error('Notification preferences failed:', prefErr)
    }

    // Send notification to admins about new staff
    try {
      // Create in-app notification for all admins
      const { data: admins } = await supabaseAdmin
        .from('admin_profiles')
        .select('user_id')
        .eq('role', 'admin')
        .neq('user_id', userId)
      
      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.user_id,
          title: 'New Staff Member',
          message: `${email} has been added as ${role}`,
          category: 'staff_added',
          type: 'info',
          link: '/admin?tab=admins'
        }))
        
        await supabaseAdmin.from('notifications').insert(notifications)
        console.log('Staff added notifications sent')
      }
    } catch (notifErr) {
      console.error('Notification send failed:', notifErr)
    }

    return new Response(
      JSON.stringify({ success: true, user_id: userId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
