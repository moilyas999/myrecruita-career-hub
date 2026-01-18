import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { logActivity } from '@/services/activityLogger';
import type { InterviewScorecard, CreateScorecardData, PipelineStage } from '@/types/pipeline';

/**
 * Fetch scorecards for a pipeline entry
 */
export function useScorecards(pipelineId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, 'scorecards', pipelineId],
    queryFn: async (): Promise<InterviewScorecard[]> => {
      if (!pipelineId) return [];

      const { data, error } = await supabase
        .from('interview_scorecards')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as InterviewScorecard[];
    },
    enabled: !!pipelineId,
  });
}

/**
 * Fetch a single scorecard by ID
 */
export function useScorecard(scorecardId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, 'scorecard', scorecardId],
    queryFn: async (): Promise<InterviewScorecard | null> => {
      if (!scorecardId) return null;

      const { data, error } = await supabase
        .from('interview_scorecards')
        .select('*')
        .eq('id', scorecardId)
        .single();

      if (error) throw error;
      return data as InterviewScorecard;
    },
    enabled: !!scorecardId,
  });
}

/**
 * Check if a scorecard exists for a specific stage
 */
export function useScorecardExists(pipelineId: string | null, stage: PipelineStage | null) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, 'scorecard-exists', pipelineId, stage],
    queryFn: async (): Promise<boolean> => {
      if (!pipelineId || !stage) return false;

      const { count, error } = await supabase
        .from('interview_scorecards')
        .select('id', { count: 'exact', head: true })
        .eq('pipeline_id', pipelineId)
        .eq('stage', stage);

      if (error) throw error;
      return (count || 0) > 0;
    },
    enabled: !!pipelineId && !!stage,
  });
}

/**
 * Create a new scorecard
 */
export function useCreateScorecard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateScorecardData) => {
      const scorecardData = {
        ...data,
        created_by: user?.id || null,
      };

      const { data: scorecard, error } = await supabase
        .from('interview_scorecards')
        .insert(scorecardData)
        .select()
        .single();

      if (error) throw error;

      // Log activity on the pipeline
      await supabase.from('pipeline_activity').insert({
        pipeline_id: data.pipeline_id,
        action: 'scorecard_added',
        note: `Scorecard added for ${data.stage}: ${data.recommendation || 'No recommendation yet'}`,
        created_by: user?.id,
      });

      return scorecard;
    },
    onSuccess: (scorecard) => {
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.candidatePipeline, 'scorecards', scorecard.pipeline_id] 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.pipelineActivity });
      toast.success('Scorecard saved');
      logActivity({
        action: 'scorecard_created',
        resourceType: 'interview_scorecard',
        resourceId: scorecard.id,
        details: { stage: scorecard.stage, recommendation: scorecard.recommendation },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to save scorecard: ' + error.message);
    },
  });
}

/**
 * Update an existing scorecard
 */
export function useUpdateScorecard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateScorecardData> }) => {
      const { data: scorecard, error } = await supabase
        .from('interview_scorecards')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return scorecard;
    },
    onSuccess: (scorecard) => {
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.candidatePipeline, 'scorecards', scorecard.pipeline_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.candidatePipeline, 'scorecard', scorecard.id] 
      });
      toast.success('Scorecard updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update scorecard: ' + error.message);
    },
  });
}

/**
 * Delete a scorecard
 */
export function useDeleteScorecard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pipelineId }: { id: string; pipelineId: string }) => {
      const { error } = await supabase
        .from('interview_scorecards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, pipelineId };
    },
    onSuccess: ({ pipelineId }) => {
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.candidatePipeline, 'scorecards', pipelineId] 
      });
      toast.success('Scorecard deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete scorecard: ' + error.message);
    },
  });
}

/**
 * Get average scores across all scorecards for a pipeline entry
 */
export function useScorecardSummary(pipelineId: string | null) {
  const { data: scorecards } = useScorecards(pipelineId);

  if (!scorecards || scorecards.length === 0) {
    return null;
  }

  const calculateAverage = (field: keyof InterviewScorecard) => {
    const values = scorecards
      .map(s => s[field] as number | null)
      .filter((v): v is number => v !== null);
    
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  return {
    count: scorecards.length,
    averages: {
      technical_skills: calculateAverage('technical_skills'),
      communication: calculateAverage('communication'),
      cultural_fit: calculateAverage('cultural_fit'),
      motivation: calculateAverage('motivation'),
      experience_relevance: calculateAverage('experience_relevance'),
      overall_impression: calculateAverage('overall_impression'),
    },
    recommendations: scorecards
      .map(s => s.recommendation)
      .filter((r): r is NonNullable<typeof r> => r !== null),
    latestScorecard: scorecards[scorecards.length - 1],
  };
}
