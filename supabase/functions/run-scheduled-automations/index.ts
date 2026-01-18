/**
 * Edge Function: run-scheduled-automations
 * 
 * Runs scheduled automation checks for time-based triggers.
 * Should be called via Supabase Cron (every 15 minutes recommended).
 * 
 * Handles:
 * - time_based triggers (daily, weekly, monthly)
 * - inactivity triggers (candidates/jobs inactive for X days)
 * - job_ageing triggers (jobs open for X days)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  is_active: boolean;
  priority: number;
  last_triggered_at: string | null;
}

// Check if a time-based rule should run now
function shouldRunTimeBased(rule: AutomationRule): boolean {
  const config = rule.trigger_config;
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentDay = now.getUTCDay(); // 0 = Sunday
  const currentDate = now.getUTCDate(); // 1-31

  const targetHour = (config.hour as number) ?? 9; // Default 9 AM
  const schedule = config.schedule as string;

  // Check if we're within the right hour (with 15-min buffer for cron timing)
  if (Math.abs(currentHour - targetHour) > 0) {
    return false;
  }

  // Check if already triggered today
  if (rule.last_triggered_at) {
    const lastTriggered = new Date(rule.last_triggered_at);
    const sameDay = lastTriggered.toDateString() === now.toDateString();
    if (sameDay) {
      return false;
    }
  }

  switch (schedule) {
    case 'daily':
      return true;
    
    case 'weekly':
      const targetDayOfWeek = (config.day_of_week as number) ?? 1; // Default Monday
      return currentDay === targetDayOfWeek;
    
    case 'monthly':
      const targetDayOfMonth = (config.day_of_month as number) ?? 1; // Default 1st
      return currentDate === targetDayOfMonth;
    
    default:
      return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    console.log('Running scheduled automation checks...');

    const results = {
      time_based: { checked: 0, triggered: 0 },
      inactivity: { checked: 0, triggered: 0 },
      job_ageing: { checked: 0, triggered: 0 },
    };

    // ========================================
    // 1. Process time_based triggers
    // ========================================
    const { data: timeBasedRules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', 'time_based')
      .eq('is_active', true);

    if (timeBasedRules) {
      results.time_based.checked = timeBasedRules.length;
      
      for (const rule of timeBasedRules) {
        if (shouldRunTimeBased(rule)) {
          console.log(`Triggering time_based rule: ${rule.name}`);
          
          // Call evaluate-automation-rules to execute the action
          const response = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/evaluate-automation-rules`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              },
              body: JSON.stringify({
                trigger_type: 'time_based',
                context: {
                  scheduled_time: new Date().toISOString(),
                  schedule: rule.trigger_config.schedule,
                },
              }),
            }
          );

          if (response.ok) {
            results.time_based.triggered++;
          } else {
            console.error(`Failed to trigger rule ${rule.name}:`, await response.text());
          }
        }
      }
    }

    // ========================================
    // 2. Process inactivity triggers
    // ========================================
    const { data: inactivityRules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', 'inactivity')
      .eq('is_active', true);

    if (inactivityRules) {
      results.inactivity.checked = inactivityRules.length;

      for (const rule of inactivityRules) {
        const config = rule.trigger_config;
        const entityType = config.entity_type as string;
        const daysThreshold = (config.days_threshold as number) || 30;
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

        let inactiveEntities: { id: string }[] = [];

        if (entityType === 'cv') {
          // Find CVs with no activity for X days
          const { data } = await supabase
            .from('cv_submissions')
            .select('id')
            .lt('updated_at', thresholdDate.toISOString())
            .is('processed_at', null)
            .limit(50);
          
          inactiveEntities = data || [];
        } else if (entityType === 'pipeline') {
          // Find pipeline entries with no updates for X days
          const { data } = await supabase
            .from('candidate_pipeline')
            .select('id, cv_submission_id, job_id')
            .lt('updated_at', thresholdDate.toISOString())
            .not('stage', 'in', '("placed","rejected","withdrawn")')
            .limit(50);
          
          inactiveEntities = data || [];
        }

        // Trigger for each inactive entity (batched)
        if (inactiveEntities.length > 0) {
          console.log(`Found ${inactiveEntities.length} inactive ${entityType}s for rule: ${rule.name}`);
          
          for (const entity of inactiveEntities.slice(0, 10)) { // Limit to 10 per run
            await fetch(
              `${Deno.env.get('SUPABASE_URL')}/functions/v1/evaluate-automation-rules`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                },
                body: JSON.stringify({
                  trigger_type: 'inactivity',
                  context: {
                    entity_type: entityType,
                    [`${entityType}_id`]: entity.id,
                    days_inactive: daysThreshold,
                    ...entity,
                  },
                }),
              }
            );
            results.inactivity.triggered++;
          }
        }
      }
    }

    // ========================================
    // 3. Process job_ageing triggers
    // ========================================
    const { data: jobAgeingRules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', 'job_ageing')
      .eq('is_active', true);

    if (jobAgeingRules) {
      results.job_ageing.checked = jobAgeingRules.length;

      for (const rule of jobAgeingRules) {
        const config = rule.trigger_config;
        const daysThreshold = (config.days_threshold as number) || 30;
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

        // Find jobs open for more than X days
        const { data: ageingJobs } = await supabase
          .from('jobs')
          .select('id, title, reference_id, sector, priority, assigned_to')
          .eq('status', 'open')
          .lt('created_at', thresholdDate.toISOString())
          .limit(50);

        if (ageingJobs && ageingJobs.length > 0) {
          console.log(`Found ${ageingJobs.length} ageing jobs for rule: ${rule.name}`);

          // Apply priority filter if specified
          let filteredJobs = ageingJobs;
          if (config.priority && Array.isArray(config.priority)) {
            filteredJobs = ageingJobs.filter(j => config.priority.includes(j.priority));
          }

          for (const job of filteredJobs.slice(0, 10)) { // Limit to 10 per run
            await fetch(
              `${Deno.env.get('SUPABASE_URL')}/functions/v1/evaluate-automation-rules`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                },
                body: JSON.stringify({
                  trigger_type: 'job_ageing',
                  context: {
                    job_id: job.id,
                    job_title: job.title,
                    reference_id: job.reference_id,
                    sector: job.sector,
                    priority: job.priority,
                    assigned_to: job.assigned_to,
                    days_open: daysThreshold,
                  },
                }),
              }
            );
            results.job_ageing.triggered++;
          }
        }
      }
    }

    console.log('Scheduled automation run complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scheduled automation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
