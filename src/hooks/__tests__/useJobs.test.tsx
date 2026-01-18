import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock modules before importing hooks
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token', user: { id: 'user-123' } } },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }),
    },
  },
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: vi.fn(() => ({
    hasPermission: vi.fn(() => true),
    permissions: ['jobs.view', 'jobs.create', 'jobs.update', 'jobs.delete', 'pipeline.view'],
    isLoading: false,
  })),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-123', email: 'test@example.com' },
    adminRole: 'admin',
    isLoading: false,
  })),
}));

vi.mock('@/services/activityLogger', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { logActivity } from '@/services/activityLogger';
import {
  useJobs,
  useJob,
  useJobMetrics,
  useRoleAgeing,
  useJobPipeline,
  useClientJobs,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useUpdateJobStatus,
  jobKeys,
} from '../useJobs';

// Test data fixtures
const mockJobs = [
  {
    id: 'job-1',
    reference_id: 'JOB-ABC123',
    title: 'Senior Developer',
    location: 'London',
    sector: 'IT',
    description: 'Great opportunity',
    requirements: 'React, TypeScript',
    status: 'active',
    priority: 'high',
    client_id: 'client-1',
    revenue_forecast: 10000,
    cvs_submitted_count: 5,
    interviews_scheduled_count: 2,
    offers_made_count: 1,
    time_to_fill_actual_days: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    client: { id: 'client-1', company_name: 'TechCorp', industry: 'Technology', status: 'active' },
    hiring_manager: { id: 'contact-1', name: 'John Doe', email: 'john@techcorp.com', phone: '123456', job_title: 'HR Manager' },
  },
  {
    id: 'job-2',
    reference_id: 'JOB-DEF456',
    title: 'Finance Manager',
    location: 'Manchester',
    sector: 'Finance',
    description: 'Finance role',
    requirements: 'ACA/ACCA',
    status: 'filled',
    priority: 'medium',
    client_id: 'client-2',
    revenue_forecast: 15000,
    cvs_submitted_count: 10,
    interviews_scheduled_count: 4,
    offers_made_count: 1,
    time_to_fill_actual_days: 25,
    created_at: '2024-12-15T00:00:00Z',
    updated_at: '2025-01-05T00:00:00Z',
    client: { id: 'client-2', company_name: 'FinanceHouse', industry: 'Finance', status: 'active' },
    hiring_manager: null,
  },
  {
    id: 'job-3',
    reference_id: 'JOB-GHI789',
    title: 'HR Director',
    location: 'Birmingham',
    sector: 'HR',
    description: 'HR leadership',
    requirements: 'CIPD',
    status: 'on_hold',
    priority: 'low',
    client_id: null,
    revenue_forecast: 20000,
    cvs_submitted_count: 3,
    interviews_scheduled_count: 1,
    offers_made_count: 0,
    time_to_fill_actual_days: null,
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-01-08T00:00:00Z',
    client: null,
    hiring_manager: null,
  },
];

const mockPipelineCandidates = [
  {
    id: 'pipeline-1',
    job_id: 'job-1',
    cv_submission_id: 'cv-1',
    stage: 'interview_1',
    priority: 1,
    assigned_to: 'user-123',
    notes: 'Good candidate',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    candidate: {
      id: 'cv-1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      job_title: 'Developer',
      location: 'London',
      cv_score: 85,
    },
  },
];

// Wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Helper to create mock query chain
function createMockQueryChain(result: { data: unknown; error: unknown; count?: number }) {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
}

describe('useJobs Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Query Key Factory', () => {
    it('generates correct keys for different query types', () => {
      expect(jobKeys.all).toEqual(['jobs']);
      expect(jobKeys.lists()).toEqual(['jobs', 'list']);
      expect(jobKeys.list({ status: ['active'] })).toEqual(['jobs', 'list', { status: ['active'] }]);
      expect(jobKeys.details()).toEqual(['jobs', 'detail']);
      expect(jobKeys.detail('job-123')).toEqual(['jobs', 'detail', 'job-123']);
      expect(jobKeys.metrics()).toEqual(['jobs', 'metrics']);
      expect(jobKeys.roleAgeing()).toEqual(['jobs', 'role-ageing']);
      expect(jobKeys.pipeline('job-123')).toEqual(['jobs', 'pipeline', 'job-123']);
      expect(jobKeys.byClient('client-123')).toEqual(['jobs', 'by-client', 'client-123']);
    });
  });

  describe('useJobs', () => {
    it('fetches jobs without filters', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockJobs, error: null }),
        }),
      } as any);

      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(3);
      expect(result.current.data?.[0].title).toBe('Senior Developer');
    });

    it('applies status filter correctly', async () => {
      const selectMock = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockJobs.filter((j) => j.status === 'active'),
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any);

      const { result } = renderHook(
        () => useJobs({ status: ['active'] }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('applies search filter correctly', async () => {
      const orderMock = vi.fn().mockReturnValue({
        or: vi.fn().mockResolvedValue({
          data: mockJobs.filter((j) => j.title.includes('Developer')),
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ order: orderMock }),
      } as any);

      const { result } = renderHook(
        () => useJobs({ search: 'Developer' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('is disabled when user lacks jobs.view permission', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(false),
        permissions: [],
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });

      // Query should be disabled and not fetch
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('handles API errors gracefully', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.view'],
        isLoading: false,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error', code: '500' },
          }),
        }),
      } as any);

      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useJob', () => {
    it('fetches single job with details', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.view'],
        isLoading: false,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: mockJobs[0],
              error: null,
            }),
            select: vi.fn().mockResolvedValue({ count: 5, error: null }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useJob('job-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('returns null for non-existent job', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.view'],
        isLoading: false,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useJob('non-existent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('is disabled without jobId', () => {
      const { result } = renderHook(() => useJob(''), { wrapper: createWrapper() });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useJobMetrics', () => {
    it('calculates metrics correctly', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.view'],
        isLoading: false,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockJobs.map((j) => ({
            status: j.status,
            revenue_forecast: j.revenue_forecast,
            time_to_fill_actual_days: j.time_to_fill_actual_days,
            cvs_submitted_count: j.cvs_submitted_count,
            interviews_scheduled_count: j.interviews_scheduled_count,
            offers_made_count: j.offers_made_count,
          })),
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useJobMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const metrics = result.current.data;
      expect(metrics).toBeDefined();
      expect(metrics?.totalJobs).toBe(3);
      expect(metrics?.activeJobs).toBe(1);
      expect(metrics?.filledJobs).toBe(1);
      expect(metrics?.onHoldJobs).toBe(1);
      expect(metrics?.totalCVsSubmitted).toBe(18); // 5 + 10 + 3
      expect(metrics?.totalInterviews).toBe(7); // 2 + 4 + 1
      expect(metrics?.avgTimeToFill).toBe(25); // Only job-2 has time_to_fill
      expect(metrics?.projectedRevenue).toBe(10000); // Only active job revenue
      expect(metrics?.confirmedRevenue).toBe(15000); // Only filled job revenue
    });

    it('returns zero metrics when no jobs', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.view'],
        isLoading: false,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      const { result } = renderHook(() => useJobMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.totalJobs).toBe(0);
      expect(result.current.data?.conversionRate).toBe(0);
    });
  });

  describe('useRoleAgeing', () => {
    it('calculates days open and ageing status correctly', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.view'],
        isLoading: false,
      } as any);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
      const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

      const roleAgeingJobs = [
        {
          id: 'job-new',
          title: 'New Role',
          reference_id: 'JOB-NEW',
          client_id: null,
          priority: 'high',
          cvs_submitted_count: 2,
          created_at: sevenDaysAgo.toISOString(),
          client: null,
        },
        {
          id: 'job-ageing',
          title: 'Ageing Role',
          reference_id: 'JOB-AGE',
          client_id: 'client-1',
          priority: 'medium',
          cvs_submitted_count: 5,
          created_at: twentyDaysAgo.toISOString(),
          client: { company_name: 'TestCorp' },
        },
        {
          id: 'job-stale',
          title: 'Stale Role',
          reference_id: 'JOB-STALE',
          client_id: null,
          priority: 'low',
          cvs_submitted_count: 1,
          created_at: fortyDaysAgo.toISOString(),
          client: null,
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: roleAgeingJobs,
              error: null,
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useRoleAgeing(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const data = result.current.data;
      expect(data).toHaveLength(3);

      // Check ageing statuses
      const newJob = data?.find((j) => j.id === 'job-new');
      const ageingJob = data?.find((j) => j.id === 'job-ageing');
      const staleJob = data?.find((j) => j.id === 'job-stale');

      expect(newJob?.ageing_status).toBe('new');
      expect(ageingJob?.ageing_status).toBe('ageing');
      expect(staleJob?.ageing_status).toBe('stale');

      // Check client name mapping
      expect(ageingJob?.client_name).toBe('TestCorp');
      expect(staleJob?.client_name).toBeUndefined();
    });
  });

  describe('useJobPipeline', () => {
    it('fetches pipeline candidates for a job', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['pipeline.view'],
        isLoading: false,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPipelineCandidates,
              error: null,
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useJobPipeline('job-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].candidate?.name).toBe('Alice Smith');
    });

    it('requires pipeline.view permission', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(false),
        permissions: [],
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useJobPipeline('job-1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useClientJobs', () => {
    it('fetches jobs for a specific client', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.view'],
        isLoading: false,
      } as any);

      const clientJobs = mockJobs.filter((j) => j.client_id === 'client-1');

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: clientJobs,
              error: null,
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useClientJobs('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].client_id).toBe('client-1');
    });
  });

  describe('useCreateJob', () => {
    it('creates job and logs activity on success', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.create'],
        isLoading: false,
      } as any);

      const newJob = {
        id: 'job-new',
        title: 'New Test Job',
        location: 'Remote',
        sector: 'IT',
        description: 'Test description',
        requirements: 'Test requirements',
        status: 'active',
        reference_id: 'JOB-NEW123',
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: newJob, error: null }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useCreateJob(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        title: 'New Test Job',
        location: 'Remote',
        sector: 'IT',
        description: 'Test description',
        requirements: 'Test requirements',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'job_created',
          resourceType: 'job',
          resourceId: 'job-new',
        })
      );
    });

    it('throws error when lacking permission', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(false),
        permissions: [],
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useCreateJob(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          title: 'Test Job',
          location: 'London',
          sector: 'IT',
          description: 'Desc',
          requirements: 'Reqs',
        })
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('useUpdateJob', () => {
    it('updates job and logs activity on success', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.update'],
        isLoading: false,
      } as any);

      const updatedJob = { ...mockJobs[0], title: 'Updated Title' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedJob, error: null }),
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useUpdateJob(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        id: 'job-1',
        title: 'Updated Title',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'job_updated',
          resourceType: 'job',
          resourceId: 'job-1',
        })
      );
    });
  });

  describe('useDeleteJob', () => {
    it('deletes job and logs activity', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.delete'],
        isLoading: false,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const { result } = renderHook(() => useDeleteJob(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ id: 'job-1', title: 'Test Job' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'job_deleted',
          resourceType: 'job',
          resourceId: 'job-1',
        })
      );
    });

    it('rejects deletion without permission', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(false),
        permissions: [],
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useDeleteJob(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ id: 'job-1', title: 'Test Job' })
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('useUpdateJobStatus', () => {
    it('updates job status with timestamp', async () => {
      vi.mocked(usePermissions).mockReturnValue({
        hasPermission: vi.fn().mockReturnValue(true),
        permissions: ['jobs.update'],
        isLoading: false,
      } as any);

      const updatedJob = { ...mockJobs[0], status: 'filled' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedJob, error: null }),
            }),
          }),
        }),
      } as any);

      const { result } = renderHook(() => useUpdateJobStatus(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        id: 'job-1',
        status: 'filled',
        title: 'Senior Developer',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'job_status_changed',
          details: expect.objectContaining({
            new_status: 'filled',
          }),
        })
      );
    });
  });
});
