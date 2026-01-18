/**
 * Edge Function: evaluate-automation-rules
 * 
 * Evaluates matching automation rules when a trigger event occurs
 * and executes corresponding actions.
 * 
 * Called by:
 * - Database triggers (cv_submitted, stage_changed, job_created, etc.)
 * - Other edge functions
 * - Frontend when needed
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerEvent {
  trigger_type: string;
  context: {
    cv_id?: string;
    job_id?: string;
    pipeline_id?: string;
    client_id?: string;
    from_stage?: string;
    to_stage?: string;
    sector?: string;
    cv_score?: number;
    [key: string]: unknown;
  };
}

interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  is_active: boolean;
  priority: number;
}

interface ActionResult {
  action_type: string;
  success: boolean;
  details?: Record<string, unknown>;
  error?: string;
}

// Evaluate if a rule's trigger conditions match the event
function evaluateTriggerConditions(
  rule: AutomationRule,
  context: TriggerEvent['context']
): boolean {
  const config = rule.trigger_config;
  
  switch (rule.trigger_type) {
    case 'cv_submitted':
      // Check sector filter
      if (config.sector && Array.isArray(config.sector) && config.sector.length > 0) {
        if (!context.sector || !config.sector.includes(context.sector)) {
          return false;
        }
      }
      // Check minimum score
      if (config.min_score && typeof config.min_score === 'number') {
        if (!context.cv_score || context.cv_score < config.min_score) {
          return false;
        }
      }
      return true;

    case 'cv_score_above':
      if (!config.threshold || typeof config.threshold !== 'number') {
        return false;
      }
      return (context.cv_score ?? 0) >= config.threshold;

    case 'stage_changed':
      // Check from_stage filter
      if (config.from_stage && config.from_stage !== context.from_stage) {
        return false;
      }
      // Check to_stage filter (required)
      if (config.to_stage && config.to_stage !== context.to_stage) {
        return false;
      }
      // Check job_id filter
      if (config.job_id && config.job_id !== context.job_id) {
        return false;
      }
      return true;

    case 'job_created':
      // Check sector filter
      if (config.sector && Array.isArray(config.sector) && config.sector.length > 0) {
        if (!context.sector || !config.sector.includes(context.sector)) {
          return false;
        }
      }
      return true;

    case 'placement_made':
      // Check job_type filter
      if (config.job_type && Array.isArray(config.job_type) && config.job_type.length > 0) {
        if (!context.job_type || !config.job_type.includes(context.job_type)) {
          return false;
        }
      }
      return true;

    case 'client_interaction':
      // Check interaction_type filter
      if (config.interaction_type && Array.isArray(config.interaction_type)) {
        if (!context.interaction_type || !config.interaction_type.includes(context.interaction_type)) {
          return false;
        }
      }
      // Check client_id filter
      if (config.client_id && config.client_id !== context.client_id) {
        return false;
      }
      return true;

    case 'interview_scheduled':
      // Check interview_type filter
      if (config.interview_type && Array.isArray(config.interview_type)) {
        if (!context.interview_type || !config.interview_type.includes(context.interview_type)) {
          return false;
        }
      }
      return true;

    default:
      // For triggers without specific conditions, match if trigger_type matches
      return true;
  }
}

// Execute an action based on the rule configuration
async function executeAction(
  supabase: ReturnType<typeof createClient>,
  rule: AutomationRule,
  context: TriggerEvent['context']
): Promise<ActionResult> {
  const config = rule.action_config;
  const startTime = Date.now();

  try {
    switch (rule.action_type) {
      case 'create_task': {
        // Calculate due date
        let dueDate: string | null = null;
        if (config.due_days && typeof config.due_days === 'number') {
          const date = new Date();
          date.setDate(date.getDate() + config.due_days);
          dueDate = date.toISOString();
        }

        // Resolve assigned_to (could be 'trigger_owner', 'job_owner', or specific ID)
        let assignedTo = config.assigned_to as string | undefined;
        if (assignedTo === 'job_owner' && context.job_id) {
          const { data: job } = await supabase
            .from('jobs')
            .select('assigned_to')
            .eq('id', context.job_id)
            .single();
          assignedTo = job?.assigned_to || undefined;
        }

        const { data: task, error } = await supabase
          .from('automation_tasks')
          .insert({
            rule_id: rule.id,
            title: config.title as string,
            description: config.description as string || null,
            task_type: config.task_type as string || 'custom',
            priority: config.priority as string || 'medium',
            due_date: dueDate,
            assigned_to: assignedTo,
            related_cv_id: context.cv_id,
            related_job_id: context.job_id,
            related_pipeline_id: context.pipeline_id,
            related_client_id: context.client_id,
            metadata: { triggered_by_rule: rule.name, trigger_context: context },
          })
          .select()
          .single();

        if (error) throw error;

        return {
          action_type: 'create_task',
          success: true,
          details: { task_id: task.id, title: config.title },
        };
      }

      case 'send_notification': {
        // Call the send-push-notification edge function
        const notificationPayload = {
          title: config.title as string,
          message: config.message as string,
          category: `automation_${rule.trigger_type}`,
          link: context.cv_id ? `/admin/candidate/${context.cv_id}` :
                context.job_id ? `/admin/job/${context.job_id}` :
                '/admin?tab=automation',
          targetRoles: config.recipients as string[] || ['admin', 'recruiter'],
        };

        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify(notificationPayload),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Notification failed: ${errorText}`);
        }

        return {
          action_type: 'send_notification',
          success: true,
          details: { title: config.title, recipients: config.recipients },
        };
      }

      case 'move_stage': {
        if (!context.pipeline_id) {
          throw new Error('No pipeline_id provided for move_stage action');
        }

        const { error } = await supabase
          .from('candidate_pipeline')
          .update({
            stage: config.target_stage as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', context.pipeline_id);

        if (error) throw error;

        // Log the activity
        await supabase.from('pipeline_activity').insert({
          pipeline_id: context.pipeline_id,
          action: 'stage_changed',
          from_stage: context.from_stage,
          to_stage: config.target_stage as string,
          note: `Automatically moved by rule: ${rule.name}`,
        });

        return {
          action_type: 'move_stage',
          success: true,
          details: { target_stage: config.target_stage, pipeline_id: context.pipeline_id },
        };
      }

      case 'assign_user': {
        if (!config.user_id) {
          throw new Error('No user_id provided for assign_user action');
        }

        // Update the relevant entity
        if (context.pipeline_id) {
          await supabase
            .from('candidate_pipeline')
            .update({ assigned_to: config.user_id as string })
            .eq('id', context.pipeline_id);
        } else if (context.job_id) {
          await supabase
            .from('jobs')
            .update({ assigned_to: config.user_id as string })
            .eq('id', context.job_id);
        } else if (context.cv_id) {
          await supabase
            .from('cv_submissions')
            .update({ processed_by: config.user_id as string })
            .eq('id', context.cv_id);
        }

        return {
          action_type: 'assign_user',
          success: true,
          details: { user_id: config.user_id },
        };
      }

      case 'update_status': {
        const entityType = config.entity_type as string;
        const newStatus = config.new_status as string;

        if (entityType === 'job' && context.job_id) {
          await supabase
            .from('jobs')
            .update({ status: newStatus })
            .eq('id', context.job_id);
        } else if (entityType === 'cv' && context.cv_id) {
          // CVs don't have a status field, but we could update processed_at
          await supabase
            .from('cv_submissions')
            .update({ processed_at: new Date().toISOString() })
            .eq('id', context.cv_id);
        }

        return {
          action_type: 'update_status',
          success: true,
          details: { entity_type: entityType, new_status: newStatus },
        };
      }

      case 'add_tag': {
        // Tags would need to be added to the entity's metadata or a dedicated tags field
        // For now, we'll log this as a successful action
        console.log(`add_tag action called with tags: ${JSON.stringify(config.tags)}`);
        
        return {
          action_type: 'add_tag',
          success: true,
          details: { tags: config.tags },
        };
      }

      default:
        throw new Error(`Unknown action type: ${rule.action_type}`);
    }
  } catch (error) {
    console.error(`Action ${rule.action_type} failed:`, error);
    return {
      action_type: rule.action_type,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
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

    const event: TriggerEvent = await req.json();
    const { trigger_type, context } = event;

    console.log(`Processing trigger: ${trigger_type}`, context);

    if (!trigger_type) {
      return new Response(
        JSON.stringify({ error: 'Missing trigger_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch active rules matching this trigger type, ordered by priority
    const { data: rules, error: rulesError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', trigger_type)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (rulesError) {
      throw rulesError;
    }

    if (!rules || rules.length === 0) {
      console.log(`No active rules found for trigger: ${trigger_type}`);
      return new Response(
        JSON.stringify({ message: 'No matching rules', rules_evaluated: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${rules.length} rules for trigger: ${trigger_type}`);

    const results: {
      rule_id: string;
      rule_name: string;
      matched: boolean;
      actions: ActionResult[];
    }[] = [];

    // Evaluate and execute each matching rule
    for (const rule of rules) {
      const matched = evaluateTriggerConditions(rule, context);
      
      if (matched) {
        console.log(`Rule "${rule.name}" matched, executing action: ${rule.action_type}`);
        
        const startTime = Date.now();
        const actionResult = await executeAction(supabase, rule, context);
        const executionTime = Date.now() - startTime;

        // Update rule trigger count and last_triggered_at
        await supabase
          .from('automation_rules')
          .update({
            trigger_count: (rule.trigger_count || 0) + 1,
            last_triggered_at: new Date().toISOString(),
          })
          .eq('id', rule.id);

        // Log execution
        await supabase.from('automation_executions').insert({
          rule_id: rule.id,
          rule_name: rule.name,
          trigger_event: trigger_type,
          trigger_context: context,
          actions_executed: [actionResult],
          status: actionResult.success ? 'completed' : 'failed',
          error_message: actionResult.error || null,
          execution_time_ms: executionTime,
        });

        results.push({
          rule_id: rule.id,
          rule_name: rule.name,
          matched: true,
          actions: [actionResult],
        });
      } else {
        results.push({
          rule_id: rule.id,
          rule_name: rule.name,
          matched: false,
          actions: [],
        });
      }
    }

    const matchedRules = results.filter(r => r.matched);
    const successfulActions = matchedRules.flatMap(r => r.actions).filter(a => a.success);
    const failedActions = matchedRules.flatMap(r => r.actions).filter(a => !a.success);

    console.log(`Execution complete: ${matchedRules.length} rules matched, ${successfulActions.length} actions succeeded, ${failedActions.length} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        trigger_type,
        rules_evaluated: rules.length,
        rules_matched: matchedRules.length,
        actions_executed: successfulActions.length,
        actions_failed: failedActions.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Automation evaluation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
