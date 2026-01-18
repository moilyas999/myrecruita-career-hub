import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { logActivity } from '@/services/activityLogger';
import type { Placement, CreatePlacementData, PlacementStatus } from '@/types/pipeline';
import { addDays, format } from 'date-fns';

/**
 * Fetch a placement by pipeline ID
 */
export function usePlacement(pipelineId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, 'placement', pipelineId],
    queryFn: async (): Promise<Placement | null> => {
      if (!pipelineId) return null;

      const { data, error } = await supabase
        .from('placements')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .maybeSingle();

      if (error) throw error;
      return data as Placement | null;
    },
    enabled: !!pipelineId,
  });
}

/**
 * Fetch all placements with filters
 */
export function usePlacements(filters?: {
  status?: PlacementStatus;
  placedBy?: string;
  startDateFrom?: string;
  startDateTo?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, 'placements', filters],
    queryFn: async () => {
      let query = supabase
        .from('placements')
        .select(`
          *,
          pipeline:candidate_pipeline(
            id,
            job:jobs(id, title, reference_id),
            cv_submission:cv_submissions(id, name, email)
          )
        `)
        .order('start_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.placedBy) {
        query = query.eq('placed_by', filters.placedBy);
      }
      if (filters?.startDateFrom) {
        query = query.gte('start_date', filters.startDateFrom);
      }
      if (filters?.startDateTo) {
        query = query.lte('start_date', filters.startDateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Create a new placement
 */
export function useCreatePlacement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreatePlacementData) => {
      // Calculate guarantee expiry date
      const startDate = new Date(data.start_date);
      const guaranteeDays = data.guarantee_period_days || 90;
      const guaranteeExpires = format(addDays(startDate, guaranteeDays), 'yyyy-MM-dd');

      const placementData = {
        pipeline_id: data.pipeline_id,
        start_date: data.start_date,
        job_type: data.job_type,
        candidate_name: data.candidate_name || null,
        job_title: data.job_title || null,
        company_name: data.company_name || null,
        salary: data.salary || null,
        day_rate: data.day_rate || null,
        fee_percentage: data.fee_percentage || null,
        fee_value: data.fee_value || null,
        invoice_date: data.invoice_date || data.start_date, // Default to start date
        guarantee_period_days: guaranteeDays,
        guarantee_expires_at: guaranteeExpires,
        placed_by: data.placed_by || user?.id || null,
        sourced_by: data.sourced_by || null,
        split_with: data.split_with || null,
        split_percentage: data.split_percentage || 100,
        notes: data.notes || null,
        created_by: user?.id || null,
        status: 'confirmed' as PlacementStatus,
      };

      const { data: placement, error } = await supabase
        .from('placements')
        .insert(placementData)
        .select()
        .single();

      if (error) throw error;

      // Log activity on the pipeline
      await supabase.from('pipeline_activity').insert({
        pipeline_id: data.pipeline_id,
        action: 'placement_created',
        note: `Placement created: Start ${data.start_date}, Fee £${data.fee_value || 'TBC'}`,
        created_by: user?.id,
      });

      return placement;
    },
    onSuccess: (placement) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Placement created successfully');
      logActivity({
        action: 'placement_created',
        resourceType: 'placement',
        resourceId: placement.id,
        details: {
          fee_value: placement.fee_value,
          start_date: placement.start_date,
        },
      });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('A placement already exists for this pipeline entry');
      } else {
        toast.error('Failed to create placement: ' + error.message);
      }
    },
  });
}

/**
 * Update a placement
 */
export function useUpdatePlacement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Placement> }) => {
      // If guarantee period changed, recalculate expiry
      if (data.guarantee_period_days && data.start_date) {
        const startDate = new Date(data.start_date);
        data.guarantee_expires_at = format(
          addDays(startDate, data.guarantee_period_days),
          'yyyy-MM-dd'
        );
      }

      const { data: updated, error } = await supabase
        .from('placements')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (placement) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Placement updated');
      logActivity({
        action: 'placement_updated',
        resourceType: 'placement',
        resourceId: placement.id,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update placement: ' + error.message);
    },
  });
}

/**
 * Mark invoice as raised
 */
export function useMarkInvoiceRaised() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, invoiceNumber }: { id: string; invoiceNumber?: string }) => {
      const { data, error } = await supabase
        .from('placements')
        .update({
          invoice_raised: true,
          invoice_raised_at: new Date().toISOString(),
          invoice_number: invoiceNumber || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Invoice marked as raised');
    },
    onError: (error: Error) => {
      toast.error('Failed to update invoice status: ' + error.message);
    },
  });
}

/**
 * Mark invoice as paid
 */
export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('placements')
        .update({
          invoice_paid: true,
          invoice_paid_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Invoice marked as paid');
    },
    onError: (error: Error) => {
      toast.error('Failed to update payment status: ' + error.message);
    },
  });
}

/**
 * Trigger rebate
 */
export function useTriggerRebate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
      amount,
      percentage,
    }: {
      id: string;
      reason: string;
      amount?: number;
      percentage?: number;
    }) => {
      const { data, error } = await supabase
        .from('placements')
        .update({
          rebate_triggered: true,
          rebate_trigger_date: new Date().toISOString().split('T')[0],
          rebate_reason: reason,
          rebate_amount: amount || null,
          rebate_percentage: percentage || null,
          status: 'rebate' as PlacementStatus,
          status_changed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (placement) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Rebate triggered');
      logActivity({
        action: 'placement_rebate_triggered',
        resourceType: 'placement',
        resourceId: placement.id,
        details: { reason: placement.rebate_reason },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to trigger rebate: ' + error.message);
    },
  });
}

/**
 * Update placement status
 */
export function useUpdatePlacementStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PlacementStatus }) => {
      const { data, error } = await supabase
        .from('placements')
        .update({
          status,
          status_changed_at: new Date().toISOString(),
          actual_start_date: status === 'started' ? new Date().toISOString().split('T')[0] : undefined,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Placement status updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });
}

/**
 * Get placement statistics
 */
export function usePlacementStats(period?: { from: string; to: string }) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, 'placement-stats', period],
    queryFn: async () => {
      let query = supabase.from('placements').select('*');

      if (period?.from) {
        query = query.gte('start_date', period.from);
      }
      if (period?.to) {
        query = query.lte('start_date', period.to);
      }

      const { data, error } = await query;
      if (error) throw error;

      const placements = data || [];
      
      return {
        total: placements.length,
        confirmed: placements.filter(p => p.status === 'confirmed').length,
        started: placements.filter(p => p.status === 'started').length,
        completed: placements.filter(p => p.status === 'completed').length,
        rebates: placements.filter(p => p.rebate_triggered).length,
        totalFeeValue: placements.reduce((sum, p) => sum + (p.fee_value || 0), 0),
        invoicedValue: placements.filter(p => p.invoice_raised).reduce((sum, p) => sum + (p.fee_value || 0), 0),
        paidValue: placements.filter(p => p.invoice_paid).reduce((sum, p) => sum + (p.fee_value || 0), 0),
      };
    },
  });
}
