import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { logActivity } from '@/services/activityLogger';
import type {
  CandidatePipeline,
  PipelineActivity,
  PipelineEntryWithDetails,
  AddToPipelineData,
  UpdatePipelineStageData,
  UpdatePipelineNotesData,
  AssignPipelineData,
  PipelineStage,
  PipelineFilters,
} from '@/types/pipeline';

// Fetch pipeline entries for a specific job
export function usePipelineByJob(jobId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, 'job', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('candidate_pipeline')
        .select(`
          *,
          cv_submission:cv_submissions(
            id, name, email, phone, job_title, cv_score, cv_file_url, location, years_experience
          )
        `)
        .eq('job_id', jobId)
        .order('priority', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as unknown as PipelineEntryWithDetails[];
    },
    enabled: !!jobId,
  });
}

// Fetch all pipeline entries with filters
export function usePipeline(filters?: PipelineFilters) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, filters],
    queryFn: async () => {
      let query = supabase
        .from('candidate_pipeline')
        .select(`
          *,
          cv_submission:cv_submissions(
            id, name, email, phone, job_title, cv_score, cv_file_url, location, years_experience
          ),
          job:jobs(
            id, title, reference_id, location, sector
          )
        `)
        .order('updated_at', { ascending: false });

      if (filters?.jobId) {
        query = query.eq('job_id', filters.jobId);
      }
      if (filters?.stage) {
        query = query.eq('stage', filters.stage);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let results = data as unknown as PipelineEntryWithDetails[];
      
      // Client-side search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(entry => 
          entry.cv_submission?.name?.toLowerCase().includes(searchLower) ||
          entry.cv_submission?.email?.toLowerCase().includes(searchLower) ||
          entry.cv_submission?.job_title?.toLowerCase().includes(searchLower) ||
          entry.job?.title?.toLowerCase().includes(searchLower) ||
          entry.job?.reference_id?.toLowerCase().includes(searchLower)
        );
      }
      
      return results;
    },
  });
}

// Fetch pipeline activity for an entry
export function usePipelineActivity(pipelineId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.pipelineActivity, pipelineId],
    queryFn: async () => {
      if (!pipelineId) return [];
      
      const { data, error } = await supabase
        .from('pipeline_activity')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PipelineActivity[];
    },
    enabled: !!pipelineId,
  });
}

// Check if a CV is already in a job's pipeline
export function useCheckPipelineExists(cvSubmissionId: string | null, jobId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, 'exists', cvSubmissionId, jobId],
    queryFn: async () => {
      if (!cvSubmissionId || !jobId) return null;
      
      const { data, error } = await supabase
        .from('candidate_pipeline')
        .select('id, stage')
        .eq('cv_submission_id', cvSubmissionId)
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!cvSubmissionId && !!jobId,
  });
}

// Add candidate to pipeline
export function useAddToPipeline() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: AddToPipelineData) => {
      // Insert pipeline entry
      const { data: pipelineEntry, error } = await supabase
        .from('candidate_pipeline')
        .insert({
          cv_submission_id: data.cv_submission_id,
          job_id: data.job_id,
          stage: data.stage || 'sourced',
          notes: data.notes || null,
          priority: data.priority || 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('pipeline_activity').insert({
        pipeline_id: pipelineEntry.id,
        action: 'created',
        to_stage: data.stage || 'sourced',
        note: data.notes || null,
        created_by: user?.id,
      });

      return pipelineEntry;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Candidate added to pipeline');
      logActivity({
        action: 'pipeline_candidate_added',
        resourceType: 'pipeline',
        resourceId: entry.id,
        details: { job_id: entry.job_id, cv_submission_id: entry.cv_submission_id, stage: entry.stage },
      });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('This candidate is already in the pipeline for this job');
      } else {
        toast.error('Failed to add to pipeline: ' + error.message);
      }
    },
  });
}

// Update pipeline stage
export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdatePipelineStageData) => {
      // Get current stage first
      const { data: current, error: fetchError } = await supabase
        .from('candidate_pipeline')
        .select('stage')
        .eq('id', data.id)
        .single();

      if (fetchError) throw fetchError;

      // Update stage
      const updateData: Partial<CandidatePipeline> = { stage: data.stage };
      if (data.rejection_reason && data.stage === 'rejected') {
        updateData.rejection_reason = data.rejection_reason;
      }

      const { data: updated, error } = await supabase
        .from('candidate_pipeline')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('pipeline_activity').insert({
        pipeline_id: data.id,
        action: data.stage === 'rejected' ? 'rejected' : data.stage === 'withdrawn' ? 'withdrawn' : 'stage_change',
        from_stage: current.stage,
        to_stage: data.stage,
        note: data.note || data.rejection_reason || null,
        created_by: user?.id,
      });

      return updated;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipelineActivity });
      toast.success('Stage updated');
      logActivity({
        action: 'pipeline_stage_changed',
        resourceType: 'pipeline',
        resourceId: entry.id,
        details: { stage: entry.stage },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update stage: ' + error.message);
    },
  });
}

// Update pipeline notes
export function useUpdatePipelineNotes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdatePipelineNotesData) => {
      const { data: updated, error } = await supabase
        .from('candidate_pipeline')
        .update({ notes: data.notes })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('pipeline_activity').insert({
        pipeline_id: data.id,
        action: 'note_added',
        note: data.notes,
        created_by: user?.id,
      });

      return updated;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipelineActivity });
      toast.success('Notes updated');
      logActivity({
        action: 'pipeline_note_added',
        resourceType: 'pipeline',
        resourceId: entry.id,
        details: { notes: entry.notes?.substring(0, 100) },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update notes: ' + error.message);
    },
  });
}

// Assign pipeline entry to user
export function useAssignPipeline() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: AssignPipelineData) => {
      const { data: updated, error } = await supabase
        .from('candidate_pipeline')
        .update({ assigned_to: data.assigned_to })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('pipeline_activity').insert({
        pipeline_id: data.id,
        action: 'assigned',
        note: data.assigned_to ? `Assigned to user` : 'Unassigned',
        created_by: user?.id,
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipelineActivity });
      toast.success('Assignment updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update assignment: ' + error.message);
    },
  });
}

// Delete pipeline entry
export function useDeletePipelineEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('candidate_pipeline')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Removed from pipeline');
      logActivity({
        action: 'pipeline_candidate_removed',
        resourceType: 'pipeline',
        resourceId: id,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to remove: ' + error.message);
    },
  });
}

// Update priority
export function useUpdatePipelinePriority() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: number }) => {
      const { data: updated, error } = await supabase
        .from('candidate_pipeline')
        .update({ priority })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('pipeline_activity').insert({
        pipeline_id: id,
        action: 'priority_changed',
        note: `Priority set to ${priority}`,
        created_by: user?.id,
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Priority updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update priority: ' + error.message);
    },
  });
}
