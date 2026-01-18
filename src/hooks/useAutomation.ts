// Phase 4: Automation System Hooks
// Comprehensive hooks for automation rules and tasks management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { logActivity } from '@/services/activityLogger';
import { toast } from 'sonner';
import type {
  AutomationRule,
  AutomationTask,
  CreateAutomationRuleInput,
  UpdateAutomationRuleInput,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  RuleFilters,
  TaskStats,
  RuleStats,
  TaskStatus,
  TaskPriority,
} from '@/types/automation';
import type { Json } from '@/integrations/supabase/types';

// ============================================
// Query Key Factory
// ============================================

export const automationKeys = {
  // Rules
  rules: {
    all: ['automation-rules'] as const,
    lists: () => [...automationKeys.rules.all, 'list'] as const,
    list: (filters: RuleFilters) => [...automationKeys.rules.lists(), filters] as const,
    details: () => [...automationKeys.rules.all, 'detail'] as const,
    detail: (id: string) => [...automationKeys.rules.details(), id] as const,
    stats: () => [...automationKeys.rules.all, 'stats'] as const,
  },
  // Tasks
  tasks: {
    all: ['automation-tasks'] as const,
    lists: () => [...automationKeys.tasks.all, 'list'] as const,
    list: (filters: TaskFilters) => [...automationKeys.tasks.lists(), filters] as const,
    mine: () => [...automationKeys.tasks.all, 'mine'] as const,
    details: () => [...automationKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...automationKeys.tasks.details(), id] as const,
    stats: () => [...automationKeys.tasks.all, 'stats'] as const,
  },
} as const;

// ============================================
// Automation Rules Hooks
// ============================================

/**
 * Fetch automation rules with optional filters
 */
export function useAutomationRules(filters: RuleFilters = {}) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('automation.view');

  return useQuery({
    queryKey: automationKeys.rules.list(filters),
    queryFn: async (): Promise<AutomationRule[]> => {
      let query = supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters.trigger_type?.length) {
        query = query.in('trigger_type', filters.trigger_type);
      }
      if (filters.action_type?.length) {
        query = query.in('action_type', filters.action_type);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as AutomationRule[];
    },
    enabled: canView,
  });
}

/**
 * Fetch a single automation rule by ID
 */
export function useAutomationRule(id: string) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('automation.view');

  return useQuery({
    queryKey: automationKeys.rules.detail(id),
    queryFn: async (): Promise<AutomationRule | null> => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as AutomationRule;
    },
    enabled: canView && !!id,
  });
}

/**
 * Get automation rule statistics
 */
export function useRuleStats() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('automation.view');

  return useQuery({
    queryKey: automationKeys.rules.stats(),
    queryFn: async (): Promise<RuleStats> => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('is_active, trigger_count, last_triggered_at');

      if (error) throw error;

      const rules = data || [];
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      return {
        total: rules.length,
        active: rules.filter(r => r.is_active).length,
        inactive: rules.filter(r => !r.is_active).length,
        total_triggers: rules.reduce((sum, r) => sum + (r.trigger_count || 0), 0),
        last_24h_triggers: rules.filter(
          r => r.last_triggered_at && new Date(r.last_triggered_at) >= last24h
        ).length,
      };
    },
    enabled: canView,
  });
}

/**
 * Create a new automation rule
 */
export function useCreateRule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('automation.manage');

  return useMutation({
    mutationFn: async (input: CreateAutomationRuleInput): Promise<AutomationRule> => {
      if (!canManage) throw new Error('Permission denied');

      const insertData = {
        name: input.name,
        description: input.description,
        trigger_type: input.trigger_type,
        trigger_config: input.trigger_config as Json,
        action_type: input.action_type,
        action_config: input.action_config as Json,
        is_active: input.is_active ?? true,
        priority: input.priority ?? 0,
        created_by: user?.id,
      };

      const { data, error } = await supabase
        .from('automation_rules')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: 'automation_rule_created',
        resourceType: 'automation_rule',
        resourceId: data.id,
        details: {
          name: input.name,
          trigger_type: input.trigger_type,
          action_type: input.action_type,
        },
      });

      return data as AutomationRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.rules.all });
      toast.success('Automation rule created');
    },
    onError: (error: Error) => {
      toast.error('Failed to create rule', { description: error.message });
    },
  });
}

/**
 * Update an automation rule
 */
export function useUpdateRule() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('automation.manage');

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateAutomationRuleInput): Promise<AutomationRule> => {
      if (!canManage) throw new Error('Permission denied');

      // Convert to database-compatible types
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.trigger_config) {
        updateData.trigger_config = updates.trigger_config as Json;
      }
      if (updates.action_config) {
        updateData.action_config = updates.action_config as Json;
      }

      const { data, error } = await supabase
        .from('automation_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: 'automation_rule_updated',
        resourceType: 'automation_rule',
        resourceId: id,
        details: updates,
      });

      return data as AutomationRule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.rules.all });
      queryClient.setQueryData(automationKeys.rules.detail(data.id), data);
      toast.success('Automation rule updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update rule', { description: error.message });
    },
  });
}

/**
 * Toggle rule active/inactive status
 */
export function useToggleRule() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('automation.manage');

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }): Promise<AutomationRule> => {
      if (!canManage) throw new Error('Permission denied');

      const { data, error } = await supabase
        .from('automation_rules')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: is_active ? 'automation_rule_activated' : 'automation_rule_deactivated',
        resourceType: 'automation_rule',
        resourceId: id,
      });

      return data as AutomationRule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.rules.all });
      toast.success(data.is_active ? 'Rule activated' : 'Rule deactivated');
    },
    onError: (error: Error) => {
      toast.error('Failed to toggle rule', { description: error.message });
    },
  });
}

/**
 * Delete an automation rule
 */
export function useDeleteRule() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('automation.manage');

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!canManage) throw new Error('Permission denied');

      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        action: 'automation_rule_deleted',
        resourceType: 'automation_rule',
        resourceId: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.rules.all });
      toast.success('Automation rule deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete rule', { description: error.message });
    },
  });
}

// ============================================
// Automation Tasks Hooks
// ============================================

/**
 * Fetch tasks with optional filters
 */
export function useTasks(filters: TaskFilters = {}) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('automation.view');

  return useQuery({
    queryKey: automationKeys.tasks.list(filters),
    queryFn: async (): Promise<AutomationTask[]> => {
      let query = supabase
        .from('automation_tasks')
        .select(`
          *,
          rule:automation_rules(id, name),
          cv:cv_submissions(id, name, email),
          job:jobs(id, title, reference_id),
          client:clients(id, company_name),
          pipeline:candidate_pipeline(id, stage)
        `)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters.task_type?.length) {
        query = query.in('task_type', filters.task_type);
      }
      if (filters.due_before) {
        query = query.lte('due_date', filters.due_before);
      }
      if (filters.due_after) {
        query = query.gte('due_date', filters.due_after);
      }
      if (filters.related_job_id) {
        query = query.eq('related_job_id', filters.related_job_id);
      }
      if (filters.related_cv_id) {
        query = query.eq('related_cv_id', filters.related_cv_id);
      }
      if (filters.related_client_id) {
        query = query.eq('related_client_id', filters.related_client_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as AutomationTask[];
    },
    enabled: canView,
  });
}

/**
 * Fetch current user's assigned tasks
 */
export function useMyTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: automationKeys.tasks.mine(),
    queryFn: async (): Promise<AutomationTask[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('automation_tasks')
        .select(`
          *,
          rule:automation_rules(id, name),
          cv:cv_submissions(id, name, email),
          job:jobs(id, title, reference_id),
          client:clients(id, company_name)
        `)
        .eq('assigned_to', user.id)
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });

      if (error) throw error;

      return (data || []) as AutomationTask[];
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetch a single task by ID
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: automationKeys.tasks.detail(id),
    queryFn: async (): Promise<AutomationTask | null> => {
      const { data, error } = await supabase
        .from('automation_tasks')
        .select(`
          *,
          rule:automation_rules(id, name),
          cv:cv_submissions(id, name, email),
          job:jobs(id, title, reference_id),
          client:clients(id, company_name),
          pipeline:candidate_pipeline(id, stage)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as AutomationTask;
    },
    enabled: !!id,
  });
}

/**
 * Get task statistics for dashboard
 */
export function useTaskStats() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canViewAll = hasPermission('automation.view');

  return useQuery({
    queryKey: automationKeys.tasks.stats(),
    queryFn: async (): Promise<TaskStats> => {
      // If can view all, get all tasks; otherwise get only assigned
      let query = supabase
        .from('automation_tasks')
        .select('status, due_date');

      if (!canViewAll && user?.id) {
        query = query.eq('assigned_to', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const tasks = data || [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);

      const pending = tasks.filter(t => t.status === 'pending');
      const overdue = pending.filter(t => t.due_date && new Date(t.due_date) < now);
      const dueToday = pending.filter(t => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        return due >= today && due < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      });
      const dueThisWeek = pending.filter(t => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        return due >= today && due <= endOfWeek;
      });

      return {
        total: tasks.length,
        pending: pending.length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length,
        overdue: overdue.length,
        due_today: dueToday.length,
        due_this_week: dueThisWeek.length,
      };
    },
    enabled: !!user?.id,
  });
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('automation.manage');

  return useMutation({
    mutationFn: async (input: CreateTaskInput): Promise<AutomationTask> => {
      if (!canManage) throw new Error('Permission denied');

      const insertData = {
        title: input.title,
        description: input.description,
        task_type: input.task_type,
        priority: input.priority || 'medium',
        due_date: input.due_date,
        assigned_to: input.assigned_to,
        related_cv_id: input.related_cv_id,
        related_job_id: input.related_job_id,
        related_pipeline_id: input.related_pipeline_id,
        related_client_id: input.related_client_id,
        metadata: (input.metadata || {}) as Json,
      };

      const { data, error } = await supabase
        .from('automation_tasks')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: 'task_created',
        resourceType: 'automation_task',
        resourceId: data.id,
        details: {
          title: input.title,
          task_type: input.task_type,
          assigned_to: input.assigned_to,
        },
      });

      return data as AutomationTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.tasks.all });
      toast.success('Task created');
    },
    onError: (error: Error) => {
      toast.error('Failed to create task', { description: error.message });
    },
  });
}

/**
 * Update a task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTaskInput): Promise<AutomationTask> => {
      // Convert to database-compatible types
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.metadata) {
        updateData.metadata = updates.metadata as Json;
      }

      const { data, error } = await supabase
        .from('automation_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: 'task_updated',
        resourceType: 'automation_task',
        resourceId: id,
        details: updates,
      });

      return data as AutomationTask;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.tasks.all });
      queryClient.setQueryData(automationKeys.tasks.detail(data.id), data);
      toast.success('Task updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update task', { description: error.message });
    },
  });
}

/**
 * Complete a task
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<AutomationTask> => {
      const { data, error } = await supabase
        .from('automation_tasks')
        .update({
          status: 'completed' as TaskStatus,
          completed_at: new Date().toISOString(),
          completed_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: 'task_completed',
        resourceType: 'automation_task',
        resourceId: id,
      });

      return data as AutomationTask;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.tasks.all });
      queryClient.setQueryData(automationKeys.tasks.detail(data.id), data);
      toast.success('Task completed');
    },
    onError: (error: Error) => {
      toast.error('Failed to complete task', { description: error.message });
    },
  });
}

/**
 * Update task status (for Kanban drag-drop)
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }): Promise<AutomationTask> => {
      const updates: Record<string, unknown> = { status };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.completed_by = user?.id;
      }

      const { data, error } = await supabase
        .from('automation_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: 'task_status_changed',
        resourceType: 'automation_task',
        resourceId: id,
        details: { new_status: status },
      });

      return data as AutomationTask;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.tasks.all });
      queryClient.setQueryData(automationKeys.tasks.detail(data.id), data);
    },
    onError: (error: Error) => {
      toast.error('Failed to update task status', { description: error.message });
    },
  });
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('automation.manage');

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!canManage) throw new Error('Permission denied');

      const { error } = await supabase
        .from('automation_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        action: 'task_deleted',
        resourceType: 'automation_task',
        resourceId: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.tasks.all });
      toast.success('Task deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete task', { description: error.message });
    },
  });
}

/**
 * Bulk update task status
 */
export function useBulkUpdateTasks() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('automation.manage');

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: { status?: TaskStatus; priority?: TaskPriority; assigned_to?: string } }): Promise<void> => {
      if (!canManage) throw new Error('Permission denied');

      const { error } = await supabase
        .from('automation_tasks')
        .update(updates)
        .in('id', ids);

      if (error) throw error;

      await logActivity({
        action: 'tasks_bulk_updated',
        resourceType: 'automation_task',
        resourceId: ids.join(','),
        details: {
          count: ids.length,
          updates,
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.tasks.all });
      toast.success(`Updated ${variables.ids.length} tasks`);
    },
    onError: (error: Error) => {
      toast.error('Failed to update tasks', { description: error.message });
    },
  });
}
