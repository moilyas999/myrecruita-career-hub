/**
 * Hook for fetching automation execution history
 * Phase 7: Automation Execution Engine
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for automation executions
export interface AutomationExecution {
  id: string;
  rule_id: string | null;
  rule_name: string;
  trigger_event: string;
  trigger_context: Record<string, unknown>;
  actions_executed: ActionExecuted[];
  status: 'pending' | 'completed' | 'failed' | 'partial';
  error_message: string | null;
  execution_time_ms: number | null;
  executed_at: string;
  created_at: string;
}

interface ActionExecuted {
  action_type: string;
  success: boolean;
  details?: Record<string, unknown>;
  error?: string;
}

export interface ExecutionStats {
  total: number;
  completed: number;
  failed: number;
  partial: number;
  last_24h: number;
  avg_execution_time_ms: number | null;
}

// Query key factory
export const executionKeys = {
  all: ['automationExecutions'] as const,
  lists: () => [...executionKeys.all, 'list'] as const,
  list: (filters: ExecutionFilters) => [...executionKeys.lists(), filters] as const,
  stats: () => [...executionKeys.all, 'stats'] as const,
  byRule: (ruleId: string) => [...executionKeys.all, 'byRule', ruleId] as const,
};

export interface ExecutionFilters {
  status?: string[];
  trigger_event?: string[];
  rule_id?: string;
  limit?: number;
}

/**
 * Fetch automation executions with optional filters
 */
export function useAutomationExecutions(filters: ExecutionFilters = {}) {
  return useQuery({
    queryKey: executionKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('automation_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters.limit || 50);

      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.trigger_event && filters.trigger_event.length > 0) {
        query = query.in('trigger_event', filters.trigger_event);
      }

      if (filters.rule_id) {
        query = query.eq('rule_id', filters.rule_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(execution => ({
        ...execution,
        trigger_context: execution.trigger_context as Record<string, unknown>,
        actions_executed: (execution.actions_executed as unknown as ActionExecuted[]) || [],
      })) as AutomationExecution[];
    },
  });
}

/**
 * Fetch execution statistics
 */
export function useExecutionStats() {
  return useQuery({
    queryKey: executionKeys.stats(),
    queryFn: async () => {
      // Get all executions for stats calculation
      const { data: executions, error } = await supabase
        .from('automation_executions')
        .select('status, execution_time_ms, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const stats: ExecutionStats = {
        total: executions?.length || 0,
        completed: executions?.filter(e => e.status === 'completed').length || 0,
        failed: executions?.filter(e => e.status === 'failed').length || 0,
        partial: executions?.filter(e => e.status === 'partial').length || 0,
        last_24h: executions?.filter(e => new Date(e.created_at) > oneDayAgo).length || 0,
        avg_execution_time_ms: null,
      };

      // Calculate average execution time
      const timings = executions
        ?.map(e => e.execution_time_ms)
        .filter((t): t is number => t !== null);
      
      if (timings && timings.length > 0) {
        stats.avg_execution_time_ms = Math.round(
          timings.reduce((a, b) => a + b, 0) / timings.length
        );
      }

      return stats;
    },
  });
}

/**
 * Fetch executions for a specific rule
 */
export function useRuleExecutions(ruleId: string) {
  return useQuery({
    queryKey: executionKeys.byRule(ruleId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_executions')
        .select('*')
        .eq('rule_id', ruleId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(execution => ({
        ...execution,
        trigger_context: execution.trigger_context as Record<string, unknown>,
        actions_executed: (execution.actions_executed as unknown as ActionExecuted[]) || [],
      })) as AutomationExecution[];
    },
    enabled: !!ruleId,
  });
}
