import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { mockPipelineData, mockPipelineEntry } from '@/test/mocks/pipelineData';

// Mock dependencies
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-123', email: 'test@example.com' },
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/activityLogger', () => ({
  logActivity: vi.fn(),
}));

import {
  usePipeline,
  usePipelineByJob,
  usePipelineActivity,
  useCheckPipelineExists,
  useAddToPipeline,
  useUpdatePipelineStage,
  useDeletePipelineEntry,
  useUpdatePipelineNotes,
  useAssignPipeline,
} from '../usePipeline';
import { toast } from 'sonner';
import { logActivity } from '@/services/activityLogger';

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

// Helper to setup mock chain
function setupMockChain(finalValue: any) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(finalValue),
    maybeSingle: vi.fn().mockResolvedValue(finalValue),
  };
  
  // For queries that don't call single()
  chain.order.mockResolvedValue(finalValue);
  chain.eq.mockImplementation(() => chain);
  
  return chain;
}

describe('usePipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all pipeline entries', async () => {
    const chain = setupMockChain({ data: mockPipelineData, error: null });
    mockSupabase.from.mockReturnValue(chain);

    const { result } = renderHook(() => usePipeline(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('candidate_pipeline');
    expect(result.current.data).toEqual(mockPipelineData);
  });

  it('filters by jobId when provided', async () => {
    const chain = setupMockChain({ data: [mockPipelineEntry], error: null });
    mockSupabase.from.mockReturnValue(chain);

    renderHook(() => usePipeline({ jobId: 'job-123' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('job_id', 'job-123');
    });
  });

  it('filters by stage when provided', async () => {
    const chain = setupMockChain({ data: [mockPipelineEntry], error: null });
    mockSupabase.from.mockReturnValue(chain);

    renderHook(() => usePipeline({ stage: 'qualified' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('stage', 'qualified');
    });
  });

  it('performs client-side search filtering', async () => {
    const chain = setupMockChain({ data: mockPipelineData, error: null });
    mockSupabase.from.mockReturnValue(chain);

    const { result } = renderHook(() => usePipeline({ search: 'Jane' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should filter to entries containing 'Jane'
    expect(result.current.data?.some(e => e.cv_submission?.name?.includes('Jane'))).toBe(true);
  });
});

describe('usePipelineByJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches pipeline entries for a specific job', async () => {
    const chain = setupMockChain({ data: [mockPipelineEntry], error: null });
    mockSupabase.from.mockReturnValue(chain);

    const { result } = renderHook(() => usePipelineByJob('job-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(chain.eq).toHaveBeenCalledWith('job_id', 'job-123');
  });

  it('returns empty array when jobId is null', async () => {
    const { result } = renderHook(() => usePipelineByJob(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});

describe('useCheckPipelineExists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('checks if candidate exists in pipeline for job', async () => {
    const chain = setupMockChain({ data: { id: 'pipeline-123', stage: 'screening' }, error: null });
    mockSupabase.from.mockReturnValue(chain);

    const { result } = renderHook(() => useCheckPipelineExists('cv-123', 'job-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 'pipeline-123', stage: 'screening' });
  });

  it('returns null when candidate is not in pipeline', async () => {
    const chain = setupMockChain({ data: null, error: null });
    mockSupabase.from.mockReturnValue(chain);

    const { result } = renderHook(() => useCheckPipelineExists('cv-999', 'job-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
  });
});

describe('useAddToPipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts new pipeline entry and logs activity', async () => {
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { ...mockPipelineEntry, id: 'new-pipeline-id' }, 
        error: null 
      }),
    };
    
    const activityChain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'candidate_pipeline') return insertChain;
      if (table === 'pipeline_activity') return activityChain;
      return insertChain;
    });

    const { result } = renderHook(() => useAddToPipeline(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        cv_submission_id: 'cv-123',
        job_id: 'job-123',
        stage: 'sourced',
      });
    });

    expect(insertChain.insert).toHaveBeenCalled();
    expect(activityChain.insert).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Candidate added to pipeline');
    expect(logActivity).toHaveBeenCalled();
  });

  it('handles duplicate key error gracefully', async () => {
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue(new Error('duplicate key value violates unique constraint')),
    };

    mockSupabase.from.mockReturnValue(insertChain);

    const { result } = renderHook(() => useAddToPipeline(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          cv_submission_id: 'cv-123',
          job_id: 'job-123',
        });
      } catch (e) {
        // Expected to throw
      }
    });

    expect(toast.error).toHaveBeenCalledWith('This candidate is already in the pipeline for this job');
  });
});

describe('useUpdatePipelineStage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates stage and logs activity', async () => {
    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { stage: 'sourced' }, error: null }),
    };

    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { ...mockPipelineEntry, stage: 'screening' }, 
        error: null 
      }),
    };

    const activityChain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'pipeline_activity') return activityChain;
      if (table === 'candidate_pipeline') {
        callCount++;
        return callCount === 1 ? selectChain : updateChain;
      }
      return selectChain;
    });

    const { result } = renderHook(() => useUpdatePipelineStage(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: 'pipeline-123',
        stage: 'qualified',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Stage updated');
    expect(activityChain.insert).toHaveBeenCalled();
  });
});

describe('useDeletePipelineEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes pipeline entry and shows toast', async () => {
    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    mockSupabase.from.mockReturnValue(deleteChain);

    const { result } = renderHook(() => useDeletePipelineEntry(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('pipeline-123');
    });

    expect(deleteChain.delete).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Removed from pipeline');
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'pipeline_candidate_removed',
        resourceType: 'pipeline',
        resourceId: 'pipeline-123',
      })
    );
  });

  it('handles deletion error', async () => {
    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'Failed to delete' } }),
    };

    mockSupabase.from.mockReturnValue(deleteChain);

    const { result } = renderHook(() => useDeletePipelineEntry(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync('pipeline-123');
      } catch (e) {
        // Expected
      }
    });

    expect(toast.error).toHaveBeenCalled();
  });
});

describe('usePipelineActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches activity log for pipeline entry', async () => {
    const mockActivity = [
      { id: 'activity-1', action: 'created', pipeline_id: 'pipeline-123' },
    ];

    const chain = setupMockChain({ data: mockActivity, error: null });
    mockSupabase.from.mockReturnValue(chain);

    const { result } = renderHook(() => usePipelineActivity('pipeline-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('pipeline_activity');
    expect(result.current.data).toEqual(mockActivity);
  });

  it('returns empty array when pipelineId is null', async () => {
    const { result } = renderHook(() => usePipelineActivity(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});
