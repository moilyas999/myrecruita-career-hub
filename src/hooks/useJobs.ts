// Comprehensive hooks for Job Management module
// Following React Query best practices with optimistic updates and proper caching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { logActivity } from '@/services/activityLogger';
import type {
  Job,
  JobWithDetails,
  JobMetrics,
  JobFilters,
  CreateJobInput,
  UpdateJobInput,
  RoleAgeingData,
  JobPipelineCandidate,
} from '@/types/job';

// Query key factory for proper cache management
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), filters] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  metrics: () => [...jobKeys.all, 'metrics'] as const,
  roleAgeing: () => [...jobKeys.all, 'role-ageing'] as const,
  pipeline: (jobId: string) => [...jobKeys.all, 'pipeline', jobId] as const,
  submissions: (jobId: string) => [...jobKeys.all, 'submissions', jobId] as const,
  activity: (jobId: string) => [...jobKeys.all, 'activity', jobId] as const,
  byClient: (clientId: string) => [...jobKeys.all, 'by-client', clientId] as const,
};

/**
 * Fetch jobs list with optional filtering
 */
export function useJobs(filters: JobFilters = {}) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('jobs.view');

  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: async (): Promise<Job[]> => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          client:clients(id, company_name, industry, status),
          hiring_manager:client_contacts(id, name, email, phone, job_title)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }

      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }

      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,reference_id.ilike.%${filters.search}%`);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from.toISOString())
          .lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as Job[];
    },
    enabled: canView,
  });
}

/**
 * Fetch single job with full details
 */
export function useJob(jobId: string) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('jobs.view');

  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: async (): Promise<JobWithDetails | null> => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(id, company_name, industry, status),
          hiring_manager:client_contacts(id, name, email, phone, job_title)
        `)
        .eq('id', jobId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Get pipeline counts
      const { count: pipelineCount } = await supabase
        .from('candidate_pipeline')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', jobId);

      // Active pipeline = stages before placed/rejected/withdrawn
      const activeStages = ['sourced', 'contacted', 'qualified', 'submitted', 'interview_1', 'interview_2', 'final_interview', 'offer', 'accepted'];
      const { count: activePipelineCount } = await supabase
        .from('candidate_pipeline')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', jobId)
        .in('stage', activeStages);

      return {
        ...(data as unknown as Job),
        pipeline_count: pipelineCount || 0,
        active_pipeline_count: activePipelineCount || 0,
      };
    },
    enabled: canView && !!jobId,
  });
}

/**
 * Fetch aggregated job metrics for dashboard
 */
export function useJobMetrics() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('jobs.view');

  return useQuery({
    queryKey: jobKeys.metrics(),
    queryFn: async (): Promise<JobMetrics> => {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('status, revenue_forecast, time_to_fill_actual_days, cvs_submitted_count, interviews_scheduled_count, offers_made_count');

      if (error) throw error;

      const metrics: JobMetrics = {
        totalJobs: jobs?.length || 0,
        activeJobs: 0,
        filledJobs: 0,
        onHoldJobs: 0,
        closedJobs: 0,
        avgTimeToFill: 0,
        totalCVsSubmitted: 0,
        totalInterviews: 0,
        totalOffers: 0,
        conversionRate: 0,
        projectedRevenue: 0,
        confirmedRevenue: 0,
      };

      if (!jobs) return metrics;

      let totalTimeToFill = 0;
      let filledCount = 0;

      jobs.forEach((job) => {
        switch (job.status) {
          case 'active':
            metrics.activeJobs++;
            metrics.projectedRevenue += job.revenue_forecast || 0;
            break;
          case 'filled':
            metrics.filledJobs++;
            metrics.confirmedRevenue += job.revenue_forecast || 0;
            if (job.time_to_fill_actual_days) {
              totalTimeToFill += job.time_to_fill_actual_days;
              filledCount++;
            }
            break;
          case 'on_hold':
            metrics.onHoldJobs++;
            break;
          case 'closed':
            metrics.closedJobs++;
            break;
        }

        metrics.totalCVsSubmitted += job.cvs_submitted_count || 0;
        metrics.totalInterviews += job.interviews_scheduled_count || 0;
        metrics.totalOffers += job.offers_made_count || 0;
      });

      metrics.avgTimeToFill = filledCount > 0 ? Math.round(totalTimeToFill / filledCount) : 0;
      metrics.conversionRate = metrics.totalCVsSubmitted > 0
        ? Math.round((metrics.filledJobs / metrics.totalCVsSubmitted) * 100)
        : 0;

      return metrics;
    },
    enabled: canView,
    staleTime: 30000,
  });
}

/**
 * Fetch role ageing data for dashboard
 */
export function useRoleAgeing() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('jobs.view');

  return useQuery({
    queryKey: jobKeys.roleAgeing(),
    queryFn: async (): Promise<RoleAgeingData[]> => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          reference_id,
          client_id,
          priority,
          cvs_submitted_count,
          created_at,
          client:clients(company_name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((job) => {
        const createdAt = job.created_at;
        const daysOpen = Math.floor(
          (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        let ageingStatus: 'new' | 'normal' | 'ageing' | 'stale';
        if (daysOpen <= 7) ageingStatus = 'new';
        else if (daysOpen <= 14) ageingStatus = 'normal';
        else if (daysOpen <= 30) ageingStatus = 'ageing';
        else ageingStatus = 'stale';

        const client = job.client as { company_name: string } | null;

        return {
          id: job.id,
          title: job.title,
          reference_id: job.reference_id,
          client_id: job.client_id,
          client_name: client?.company_name,
          days_open: daysOpen,
          ageing_status: ageingStatus,
          priority: job.priority as RoleAgeingData['priority'],
          cvs_submitted_count: job.cvs_submitted_count || 0,
        };
      });
    },
    enabled: canView,
  });
}

/**
 * Fetch pipeline candidates for a job
 * Uses correct cv_submissions columns: name, job_title, cv_score
 */
export function useJobPipeline(jobId: string) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('pipeline.view');

  return useQuery({
    queryKey: jobKeys.pipeline(jobId),
    queryFn: async (): Promise<JobPipelineCandidate[]> => {
      const { data, error } = await supabase
        .from('candidate_pipeline')
        .select(`
          id,
          job_id,
          cv_submission_id,
          stage,
          priority,
          assigned_to,
          notes,
          created_at,
          updated_at,
          candidate:cv_submissions(
            id,
            name,
            email,
            job_title,
            location,
            cv_score
          )
        `)
        .eq('job_id', jobId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item) => ({
        id: item.id,
        job_id: item.job_id,
        cv_submission_id: item.cv_submission_id,
        stage: item.stage,
        priority: item.priority,
        assigned_to: item.assigned_to,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        candidate: item.candidate as JobPipelineCandidate['candidate'],
      }));
    },
    enabled: canView && !!jobId,
  });
}

/**
 * Fetch jobs for a specific client
 */
export function useClientJobs(clientId: string) {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('jobs.view');

  return useQuery({
    queryKey: jobKeys.byClient(clientId),
    queryFn: async (): Promise<Job[]> => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          hiring_manager:client_contacts(id, name, email, job_title)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Job[];
    },
    enabled: canView && !!clientId,
  });
}

/**
 * Create a new job
 */
export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateJobInput) => {
      if (!hasPermission('jobs.create')) {
        throw new Error('Permission denied: jobs.create required');
      }

      const referenceId = `JOB-${Date.now().toString(36).toUpperCase()}`;

      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          ...input,
          reference_id: referenceId,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });

      if (user?.id) {
        await logActivity({
          action: 'job_created',
          resourceType: 'job',
          resourceId: data.id,
          details: { title: data.title },
        });
      }

      toast({
        title: 'Job created',
        description: `${data.title} has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating job',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update an existing job
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateJobInput) => {
      if (!hasPermission('jobs.update')) {
        throw new Error('Permission denied: jobs.update required');
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });

      if (user?.id) {
        await logActivity({
          action: 'job_updated',
          resourceType: 'job',
          resourceId: data.id,
          details: { title: data.title },
        });
      }

      toast({
        title: 'Job updated',
        description: 'Changes have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating job',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a job
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (job: { id: string; title: string }) => {
      if (!hasPermission('jobs.delete')) {
        throw new Error('Permission denied: jobs.delete required');
      }

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id);

      if (error) throw error;
      return job;
    },
    onSuccess: async (job) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });

      if (user?.id) {
        await logActivity({
          action: 'job_deleted',
          resourceType: 'job',
          resourceId: job.id,
          details: { title: job.title },
        });
      }

      toast({
        title: 'Job deleted',
        description: `${job.title} has been deleted.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting job',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update job status
 */
export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status, title }: { id: string; status: string; title: string }) => {
      if (!hasPermission('jobs.update')) {
        throw new Error('Permission denied: jobs.update required');
      }

      const updateData: Record<string, unknown> = { status };

      if (status === 'filled') {
        updateData.placed_at = new Date().toISOString();
      } else if (status === 'closed') {
        updateData.closed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, previousTitle: title };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });

      if (user?.id) {
        await logActivity({
          action: 'job_status_changed',
          resourceType: 'job',
          resourceId: data.id,
          details: { title: data.previousTitle, newStatus: data.status },
        });
      }

      toast({
        title: 'Status updated',
        description: `Job status changed to ${data.status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Calculate revenue forecast for a job
 */
export function calculateRevenueForecast(
  salary: string | null,
  feePercentage: number | null
): number {
  if (!salary || !feePercentage) return 0;

  const numericSalary = parseFloat(salary.replace(/[^0-9.]/g, ''));
  if (isNaN(numericSalary)) return 0;

  return Math.round(numericSalary * (feePercentage / 100));
}
