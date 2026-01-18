import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockSupabaseClient } from '@/test/mocks/supabase';
import type { ReactNode } from 'react';

// Mock dependencies
const mockHasPermission = vi.fn();
const mockUser = { id: 'user-123', email: 'test@example.com' };

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: mockHasPermission,
    loading: false,
    role: 'admin',
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

vi.mock('@/services/activityLogger', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  automationKeys,
  useAutomationRules,
  useAutomationRule,
  useRuleStats,
  useCreateRule,
  useUpdateRule,
  useToggleRule,
  useDeleteRule,
  useTasks,
  useMyTasks,
  useTask,
  useTaskStats,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
  useUpdateTaskStatus,
  useDeleteTask,
  useBulkUpdateTasks,
} from '@/hooks/useAutomation';
import { logActivity } from '@/services/activityLogger';
import { toast } from 'sonner';

// Test data
const mockRule = {
  id: 'rule-1',
  name: 'Test Rule',
  description: 'Test description',
  trigger_type: 'cv_submitted',
  trigger_config: {},
  action_type: 'create_task',
  action_config: {},
  is_active: true,
  priority: 10,
  created_by: 'user-123',
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  last_triggered_at: null,
  trigger_count: 0,
};

const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test description',
  task_type: 'follow_up',
  priority: 'high',
  status: 'pending',
  due_date: '2025-01-20T10:00:00Z',
  assigned_to: 'user-123',
  related_cv_id: null,
  related_job_id: 'job-1',
  related_pipeline_id: null,
  related_client_id: null,
  metadata: {},
  completed_at: null,
  completed_by: null,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
};

// Helper to create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  mockHasPermission.mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

// ============================================
// Query Key Factory Tests
// ============================================

describe('automationKeys', () => {
  describe('rules', () => {
    it('generates correct base key for all rules', () => {
      expect(automationKeys.rules.all).toEqual(['automation-rules']);
    });

    it('generates correct lists key', () => {
      expect(automationKeys.rules.lists()).toEqual(['automation-rules', 'list']);
    });

    it('generates correct list key with filters', () => {
      const filters = { is_active: true, search: 'test' };
      expect(automationKeys.rules.list(filters)).toEqual([
        'automation-rules',
        'list',
        filters,
      ]);
    });

    it('generates correct detail key', () => {
      expect(automationKeys.rules.detail('rule-1')).toEqual([
        'automation-rules',
        'detail',
        'rule-1',
      ]);
    });

    it('generates correct stats key', () => {
      expect(automationKeys.rules.stats()).toEqual(['automation-rules', 'stats']);
    });
  });

  describe('tasks', () => {
    it('generates correct base key for all tasks', () => {
      expect(automationKeys.tasks.all).toEqual(['automation-tasks']);
    });

    it('generates correct lists key', () => {
      expect(automationKeys.tasks.lists()).toEqual(['automation-tasks', 'list']);
    });

    it('generates correct list key with filters', () => {
      const filters = { status: ['pending' as const], priority: ['high' as const] };
      expect(automationKeys.tasks.list(filters)).toEqual([
        'automation-tasks',
        'list',
        filters,
      ]);
    });

    it('generates correct mine key for user tasks', () => {
      expect(automationKeys.tasks.mine()).toEqual(['automation-tasks', 'mine']);
    });

    it('generates correct detail key', () => {
      expect(automationKeys.tasks.detail('task-1')).toEqual([
        'automation-tasks',
        'detail',
        'task-1',
      ]);
    });

    it('generates correct stats key', () => {
      expect(automationKeys.tasks.stats()).toEqual(['automation-tasks', 'stats']);
    });
  });
});

// ============================================
// Automation Rules Query Hooks Tests
// ============================================

describe('useAutomationRules', () => {
  it('fetches rules when user has permission', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({ data: [mockRule], error: null }),
    });

    const { result } = renderHook(() => useAutomationRules(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Test Rule');
  });

  it('returns empty when user lacks permission', async () => {
    mockHasPermission.mockReturnValue(false);

    const { result } = renderHook(() => useAutomationRules(), {
      wrapper: createWrapper(),
    });

    // Query should be disabled
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('applies filters correctly', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockIn = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
      order: mockOrder,
      in: mockIn,
      eq: mockEq,
      or: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const filters = {
      trigger_type: ['cv_submitted' as const],
      is_active: true,
      search: 'test',
    };

    renderHook(() => useAutomationRules(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockIn).toHaveBeenCalled();
    });
  });
});

describe('useAutomationRule', () => {
  it('fetches single rule by ID', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockRule, error: null }),
    });

    const { result } = renderHook(() => useAutomationRule('rule-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('rule-1');
  });

  it('returns null for non-existent rule', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      }),
    });

    const { result } = renderHook(() => useAutomationRule('non-existent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('disabled when no ID provided', () => {
    const { result } = renderHook(() => useAutomationRule(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useRuleStats', () => {
  it('calculates rule statistics correctly', async () => {
    const rules = [
      { is_active: true, trigger_count: 5, last_triggered_at: new Date().toISOString() },
      { is_active: true, trigger_count: 3, last_triggered_at: null },
      { is_active: false, trigger_count: 2, last_triggered_at: null },
    ];

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: rules, error: null }),
    });

    const { result } = renderHook(() => useRuleStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(3);
    expect(result.current.data?.active).toBe(2);
    expect(result.current.data?.inactive).toBe(1);
    expect(result.current.data?.total_triggers).toBe(10);
  });
});

// ============================================
// Automation Rules Mutation Hooks Tests
// ============================================

describe('useCreateRule', () => {
  it('creates rule and logs activity', async () => {
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockRule, error: null }),
    });

    const { result } = renderHook(() => useCreateRule(), {
      wrapper: createWrapper(),
    });

    const input = {
      name: 'New Rule',
      trigger_type: 'cv_submitted' as const,
      trigger_config: {},
      action_type: 'create_task' as const,
      action_config: {},
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'automation_rule_created',
        resourceType: 'automation_rule',
      })
    );
    expect(toast.success).toHaveBeenCalledWith('Automation rule created');
  });

  it('throws error when permission denied', async () => {
    mockHasPermission.mockReturnValue(false);

    const { result } = renderHook(() => useCreateRule(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: 'New Rule',
      trigger_type: 'cv_submitted' as const,
      trigger_config: {},
      action_type: 'create_task' as const,
      action_config: {},
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Permission denied');
  });
});

describe('useUpdateRule', () => {
  it('updates rule and invalidates cache', async () => {
    const updatedRule = { ...mockRule, name: 'Updated Rule' };
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updatedRule, error: null }),
    });

    const { result } = renderHook(() => useUpdateRule(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'rule-1', name: 'Updated Rule' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'automation_rule_updated',
        resourceId: 'rule-1',
      })
    );
  });
});

describe('useToggleRule', () => {
  it('toggles rule active status', async () => {
    const toggledRule = { ...mockRule, is_active: false };
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: toggledRule, error: null }),
    });

    const { result } = renderHook(() => useToggleRule(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'rule-1', is_active: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'automation_rule_deactivated',
      })
    );
    expect(toast.success).toHaveBeenCalledWith('Rule deactivated');
  });

  it('logs activation when toggling on', async () => {
    const toggledRule = { ...mockRule, is_active: true };
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: toggledRule, error: null }),
    });

    const { result } = renderHook(() => useToggleRule(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'rule-1', is_active: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'automation_rule_activated',
      })
    );
  });
});

describe('useDeleteRule', () => {
  it('deletes rule and logs activity', async () => {
    mockSupabaseClient.from.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const { result } = renderHook(() => useDeleteRule(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('rule-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'automation_rule_deleted',
        resourceType: 'automation_rule',
        resourceId: 'rule-1',
      })
    );
    expect(toast.success).toHaveBeenCalledWith('Automation rule deleted');
  });

  it('throws error when permission denied', async () => {
    mockHasPermission.mockReturnValue(false);

    const { result } = renderHook(() => useDeleteRule(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('rule-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Permission denied');
  });
});

// ============================================
// Automation Tasks Query Hooks Tests
// ============================================

describe('useTasks', () => {
  it('fetches tasks with joined data', async () => {
    const taskWithJoins = {
      ...mockTask,
      rule: { id: 'rule-1', name: 'Test Rule' },
      job: { id: 'job-1', title: 'Test Job', reference_id: 'JOB-001' },
      cv: null,
      client: null,
      pipeline: null,
    };

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ data: [taskWithJoins], error: null }),
    });

    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].title).toBe('Test Task');
  });

  it('applies status and priority filters', async () => {
    const mockIn = vi.fn().mockReturnThis();
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: mockIn,
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const filters = {
      status: ['pending' as const, 'in_progress' as const],
      priority: ['high' as const],
    };

    renderHook(() => useTasks(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockIn).toHaveBeenCalled();
    });
  });
});

describe('useMyTasks', () => {
  it('fetches tasks assigned to current user', async () => {
    const myTask = { ...mockTask, assigned_to: 'user-123' };
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [myTask], error: null }),
    });

    const { result } = renderHook(() => useMyTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].assigned_to).toBe('user-123');
  });

  it('excludes completed and cancelled tasks', async () => {
    const mockNeq = vi.fn().mockReturnThis();
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: mockNeq,
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    renderHook(() => useMyTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockNeq).toHaveBeenCalledWith('status', 'completed');
      expect(mockNeq).toHaveBeenCalledWith('status', 'cancelled');
    });
  });
});

describe('useTask', () => {
  it('fetches single task with all relations', async () => {
    const taskWithRelations = {
      ...mockTask,
      rule: { id: 'rule-1', name: 'Test Rule' },
      cv: null,
      job: { id: 'job-1', title: 'Test Job', reference_id: 'JOB-001' },
      client: null,
      pipeline: null,
    };

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: taskWithRelations, error: null }),
    });

    const { result } = renderHook(() => useTask('task-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('task-1');
  });

  it('returns null for non-existent task', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      }),
    });

    const { result } = renderHook(() => useTask('non-existent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useTaskStats', () => {
  it('calculates task statistics correctly', async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasks = [
      { status: 'pending', due_date: yesterday.toISOString() }, // overdue
      { status: 'pending', due_date: now.toISOString() }, // due today
      { status: 'pending', due_date: tomorrow.toISOString() }, // due this week
      { status: 'in_progress', due_date: null },
      { status: 'completed', due_date: null },
      { status: 'cancelled', due_date: null },
    ];

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: tasks, error: null }),
    });

    const { result } = renderHook(() => useTaskStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(6);
    expect(result.current.data?.pending).toBe(3);
    expect(result.current.data?.in_progress).toBe(1);
    expect(result.current.data?.completed).toBe(1);
    expect(result.current.data?.cancelled).toBe(1);
    expect(result.current.data?.overdue).toBe(1);
  });
});

// ============================================
// Automation Tasks Mutation Hooks Tests
// ============================================

describe('useCreateTask', () => {
  it('creates task and logs activity', async () => {
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
    });

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    const input = {
      title: 'New Task',
      task_type: 'follow_up' as const,
      priority: 'high' as const,
      assigned_to: 'user-123',
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'task_created',
        resourceType: 'automation_task',
      })
    );
    expect(toast.success).toHaveBeenCalledWith('Task created');
  });

  it('throws error when permission denied', async () => {
    mockHasPermission.mockReturnValue(false);

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: 'New Task',
      task_type: 'follow_up' as const,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Permission denied');
  });
});

describe('useUpdateTask', () => {
  it('updates task and logs activity', async () => {
    const updatedTask = { ...mockTask, title: 'Updated Task' };
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updatedTask, error: null }),
    });

    const { result } = renderHook(() => useUpdateTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'task-1', title: 'Updated Task' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'task_updated',
        resourceId: 'task-1',
      })
    );
    expect(toast.success).toHaveBeenCalledWith('Task updated');
  });
});

describe('useCompleteTask', () => {
  it('marks task as completed with timestamp', async () => {
    const completedTask = {
      ...mockTask,
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: 'user-123',
    };

    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: completedTask, error: null }),
    });

    const { result } = renderHook(() => useCompleteTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('task-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'task_completed',
      })
    );
    expect(toast.success).toHaveBeenCalledWith('Task completed');
  });
});

describe('useUpdateTaskStatus', () => {
  it('updates task status for Kanban drag-drop', async () => {
    const updatedTask = { ...mockTask, status: 'in_progress' };
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updatedTask, error: null }),
    });

    const { result } = renderHook(() => useUpdateTaskStatus(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'task-1', status: 'in_progress' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'task_status_changed',
        details: { new_status: 'in_progress' },
      })
    );
  });

  it('sets completion fields when status is completed', async () => {
    const completedTask = {
      ...mockTask,
      status: 'completed',
      completed_at: expect.any(String),
      completed_by: 'user-123',
    };

    const mockUpdate = vi.fn().mockReturnThis();
    mockSupabaseClient.from.mockReturnValue({
      update: mockUpdate,
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: completedTask, error: null }),
    });

    const { result } = renderHook(() => useUpdateTaskStatus(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'task-1', status: 'completed' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
        completed_at: expect.any(String),
        completed_by: 'user-123',
      })
    );
  });
});

describe('useDeleteTask', () => {
  it('deletes task and logs activity', async () => {
    mockSupabaseClient.from.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('task-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'task_deleted',
        resourceType: 'automation_task',
        resourceId: 'task-1',
      })
    );
    expect(toast.success).toHaveBeenCalledWith('Task deleted');
  });

  it('throws error when permission denied', async () => {
    mockHasPermission.mockReturnValue(false);

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('task-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Permission denied');
  });
});

describe('useBulkUpdateTasks', () => {
  it('updates multiple tasks and logs activity', async () => {
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const { result } = renderHook(() => useBulkUpdateTasks(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      ids: ['task-1', 'task-2', 'task-3'],
      updates: { status: 'completed' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'tasks_bulk_updated',
        resourceId: 'task-1,task-2,task-3',
        details: {
          count: 3,
          updates: { status: 'completed' },
        },
      })
    );
    expect(toast.success).toHaveBeenCalledWith('Updated 3 tasks');
  });

  it('throws error when permission denied', async () => {
    mockHasPermission.mockReturnValue(false);

    const { result } = renderHook(() => useBulkUpdateTasks(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      ids: ['task-1'],
      updates: { status: 'completed' },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Permission denied');
  });
});
