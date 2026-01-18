import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, differenceInDays, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import type {
  RevenueForecastData,
  RevenueMetrics,
  PlacementByClient,
  PlacementByRecruiter,
  InvoiceItem,
  RecruiterPerformance,
  PipelineMetrics,
  ConversionFunnelStep,
  TimeToFillData,
  ActivityMetrics,
  ReportDateRange,
  RevenueReportFilters,
  PerformanceReportFilters,
  ReportPeriod,
} from '@/types/report';
import { STAGE_CONFIG, type PipelineStage } from '@/types/pipeline';

// ============================================================================
// Query Key Factory
// ============================================================================

export const reportKeys = {
  all: ['reports'] as const,
  revenue: () => [...reportKeys.all, 'revenue'] as const,
  revenueForecast: (period: ReportPeriod, filters?: RevenueReportFilters) => 
    [...reportKeys.revenue(), 'forecast', period, filters] as const,
  revenueMetrics: (filters?: RevenueReportFilters) => 
    [...reportKeys.revenue(), 'metrics', filters] as const,
  placementsByClient: (filters?: RevenueReportFilters) => 
    [...reportKeys.revenue(), 'by-client', filters] as const,
  placementsByRecruiter: (filters?: RevenueReportFilters) => 
    [...reportKeys.revenue(), 'by-recruiter', filters] as const,
  invoices: (filters?: RevenueReportFilters) => 
    [...reportKeys.revenue(), 'invoices', filters] as const,
  performance: () => [...reportKeys.all, 'performance'] as const,
  recruiterPerformance: (filters?: PerformanceReportFilters) => 
    [...reportKeys.performance(), 'recruiters', filters] as const,
  pipelineMetrics: () => [...reportKeys.performance(), 'pipeline'] as const,
  conversionFunnel: (filters?: PerformanceReportFilters) => 
    [...reportKeys.performance(), 'funnel', filters] as const,
  timeToFill: (filters?: PerformanceReportFilters) => 
    [...reportKeys.performance(), 'time-to-fill', filters] as const,
  activityMetrics: (filters?: PerformanceReportFilters) => 
    [...reportKeys.performance(), 'activity', filters] as const,
};

// ============================================================================
// Revenue Forecast Hooks
// ============================================================================

/**
 * Get revenue forecast data grouped by period
 */
export function useRevenueForecast(period: ReportPeriod = 'monthly', filters?: RevenueReportFilters) {
  return useQuery({
    queryKey: reportKeys.revenueForecast(period, filters),
    queryFn: async (): Promise<RevenueForecastData[]> => {
      const now = new Date();
      const months = period === 'yearly' ? 24 : period === 'quarterly' ? 12 : 6;
      
      let query = supabase
        .from('placements')
        .select('*')
        .gte('start_date', format(subMonths(now, months), 'yyyy-MM-dd'))
        .order('start_date', { ascending: true });

      if (filters?.clientId) {
        // Join through pipeline to get client
        query = supabase
          .from('placements')
          .select(`
            *,
            pipeline:candidate_pipeline(
              job:jobs(client_id)
            )
          `)
          .gte('start_date', format(subMonths(now, months), 'yyyy-MM-dd'))
          .order('start_date', { ascending: true });
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by period
      const grouped = new Map<string, RevenueForecastData>();
      
      for (const placement of data || []) {
        const date = parseISO(placement.start_date);
        let periodKey: string;
        let periodLabel: string;

        switch (period) {
          case 'weekly':
            periodKey = format(startOfWeek(date), 'yyyy-ww');
            periodLabel = `Week ${format(date, 'wo')}`;
            break;
          case 'quarterly':
            periodKey = format(startOfQuarter(date), 'yyyy-QQ');
            periodLabel = format(date, "'Q'Q yyyy");
            break;
          case 'yearly':
            periodKey = format(date, 'yyyy');
            periodLabel = format(date, 'yyyy');
            break;
          default:
            periodKey = format(date, 'yyyy-MM');
            periodLabel = format(date, 'MMM yyyy');
        }

        const existing = grouped.get(periodKey) || {
          period: periodKey,
          periodLabel,
          confirmed: 0,
          pending: 0,
          projected: 0,
          placementsCount: 0,
        };

        const feeValue = placement.fee_value || 0;

        if (placement.status === 'confirmed' || placement.status === 'started' || placement.status === 'completed') {
          existing.confirmed += feeValue;
        } else if (placement.status === 'pending') {
          existing.pending += feeValue;
        }
        
        existing.projected = existing.confirmed + existing.pending;
        existing.placementsCount += 1;

        grouped.set(periodKey, existing);
      }

      return Array.from(grouped.values()).sort((a, b) => a.period.localeCompare(b.period));
    },
  });
}

/**
 * Get overall revenue metrics
 */
export function useRevenueMetrics(filters?: RevenueReportFilters) {
  return useQuery({
    queryKey: reportKeys.revenueMetrics(filters),
    queryFn: async (): Promise<RevenueMetrics> => {
      let query = supabase.from('placements').select('*');

      if (filters?.dateRange?.from) {
        query = query.gte('start_date', filters.dateRange.from);
      }
      if (filters?.dateRange?.to) {
        query = query.lte('start_date', filters.dateRange.to);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const placements = data || [];
      const confirmed = placements.filter(p => 
        p.status === 'confirmed' || p.status === 'started' || p.status === 'completed'
      );
      const pending = placements.filter(p => p.status === 'pending');

      const totalConfirmed = confirmed.reduce((sum, p) => sum + (p.fee_value || 0), 0);
      const totalPending = pending.reduce((sum, p) => sum + (p.fee_value || 0), 0);
      const invoicedValue = placements.filter(p => p.invoice_raised).reduce((sum, p) => sum + (p.fee_value || 0), 0);
      const paidValue = placements.filter(p => p.invoice_paid).reduce((sum, p) => sum + (p.fee_value || 0), 0);

      // Calculate conversion rate from pipeline
      const { count: totalPipelineCount } = await supabase
        .from('candidate_pipeline')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'placed');

      const { count: sourcedCount } = await supabase
        .from('candidate_pipeline')
        .select('*', { count: 'exact', head: true });

      const conversionRate = sourcedCount ? ((totalPipelineCount || 0) / sourcedCount) * 100 : 0;

      return {
        totalConfirmed,
        totalPending,
        totalProjected: totalConfirmed + totalPending,
        placementsCount: placements.length,
        avgFee: placements.length > 0 
          ? placements.reduce((sum, p) => sum + (p.fee_value || 0), 0) / placements.length 
          : 0,
        conversionRate,
        invoicedValue,
        paidValue,
        outstandingValue: invoicedValue - paidValue,
      };
    },
  });
}

/**
 * Get placements grouped by client
 */
export function usePlacementsByClient(filters?: RevenueReportFilters) {
  return useQuery({
    queryKey: reportKeys.placementsByClient(filters),
    queryFn: async (): Promise<PlacementByClient[]> => {
      const { data, error } = await supabase
        .from('placements')
        .select(`
          *,
          pipeline:candidate_pipeline(
            job:jobs(
              client:clients(id, company_name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by client
      const clientMap = new Map<string, PlacementByClient>();

      for (const placement of data || []) {
        const client = (placement as any).pipeline?.job?.client;
        if (!client) continue;

        const existing = clientMap.get(client.id) || {
          clientId: client.id,
          clientName: client.company_name || 'Unknown Client',
          placementsCount: 0,
          totalRevenue: 0,
          avgFee: 0,
        };

        existing.placementsCount += 1;
        existing.totalRevenue += placement.fee_value || 0;
        existing.avgFee = existing.totalRevenue / existing.placementsCount;

        clientMap.set(client.id, existing);
      }

      return Array.from(clientMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
    },
  });
}

/**
 * Get placements grouped by recruiter
 */
export function usePlacementsByRecruiter(filters?: RevenueReportFilters) {
  return useQuery({
    queryKey: reportKeys.placementsByRecruiter(filters),
    queryFn: async (): Promise<PlacementByRecruiter[]> => {
      const { data, error } = await supabase
        .from('placements')
        .select(`
          *,
          recruiter:admin_profiles!placements_placed_by_fkey(user_id, display_name, email)
        `)
        .not('placed_by', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by recruiter
      const recruiterMap = new Map<string, PlacementByRecruiter>();

      for (const placement of data || []) {
        const recruiter = (placement as any).recruiter;
        if (!recruiter) continue;

        const existing = recruiterMap.get(recruiter.user_id) || {
          userId: recruiter.user_id,
          displayName: recruiter.display_name || 'Unknown',
          email: recruiter.email || '',
          placementsCount: 0,
          totalRevenue: 0,
          avgFee: 0,
        };

        existing.placementsCount += 1;
        existing.totalRevenue += placement.fee_value || 0;
        existing.avgFee = existing.totalRevenue / existing.placementsCount;

        recruiterMap.set(recruiter.user_id, existing);
      }

      return Array.from(recruiterMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
    },
  });
}

/**
 * Get invoice list
 */
export function useInvoices(filters?: RevenueReportFilters) {
  return useQuery({
    queryKey: reportKeys.invoices(filters),
    queryFn: async (): Promise<InvoiceItem[]> => {
      let query = supabase
        .from('placements')
        .select('*')
        .order('start_date', { ascending: false });

      if (filters?.dateRange?.from) {
        query = query.gte('start_date', filters.dateRange.from);
      }
      if (filters?.dateRange?.to) {
        query = query.lte('start_date', filters.dateRange.to);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(p => ({
        id: p.id,
        pipelineId: p.pipeline_id,
        candidateName: p.candidate_name,
        jobTitle: p.job_title,
        companyName: p.company_name,
        feeValue: p.fee_value,
        invoiceNumber: p.invoice_number,
        invoiceDate: p.invoice_date,
        invoiceRaised: p.invoice_raised,
        invoicePaid: p.invoice_paid,
        status: p.status as InvoiceItem['status'],
        startDate: p.start_date,
      }));
    },
  });
}

// ============================================================================
// Performance Report Hooks
// ============================================================================

/**
 * Get recruiter performance metrics
 */
export function useRecruiterPerformance(filters?: PerformanceReportFilters) {
  return useQuery({
    queryKey: reportKeys.recruiterPerformance(filters),
    queryFn: async (): Promise<RecruiterPerformance[]> => {
      // Get all admin profiles
      const { data: admins, error: adminError } = await supabase
        .from('admin_profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('role', ['admin', 'recruiter']);

      if (adminError) throw adminError;

      const performances: RecruiterPerformance[] = [];

      for (const admin of admins || []) {
        // Use RPC-style calls or simple count queries to avoid deep type instantiation
        // @ts-expect-error - Supabase types too deeply nested causing TS2589
        const { count: cvsAdded } = await supabase
          .from('cv_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', admin.user_id);

        const { data: placements } = await supabase
          .from('placements')
          .select('fee_value, start_date, created_at')
          .eq('placed_by', admin.user_id);

        const { count: interviewsScheduled } = await supabase
          .from('candidate_pipeline')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', admin.user_id)
          .in('stage', ['interview_1', 'interview_2', 'final_interview']);

        const { count: activityCount } = await supabase
          .from('admin_audit_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', admin.user_id);

        // Calculate avg time to fill (days from pipeline creation to placement)
        let avgTimeToFill: number | null = null;
        if (placements && placements.length > 0) {
          const timesToFill = placements
            .map(p => {
              if (p.start_date && p.created_at) {
                return differenceInDays(parseISO(p.start_date), parseISO(p.created_at));
              }
              return null;
            })
            .filter((t): t is number => t !== null);
          
          if (timesToFill.length > 0) {
            avgTimeToFill = timesToFill.reduce((a, b) => a + b, 0) / timesToFill.length;
          }
        }

        const revenueGenerated = placements?.reduce((sum, p) => sum + (p.fee_value || 0), 0) || 0;
        const conversionRate = cvsAdded ? ((placements?.length || 0) / cvsAdded) * 100 : 0;

        performances.push({
          userId: admin.user_id,
          displayName: admin.display_name || 'Unknown',
          email: admin.email || '',
          avatarUrl: admin.avatar_url,
          cvsAdded: cvsAdded || 0,
          interviewsScheduled: interviewsScheduled || 0,
          placementsMade: placements?.length || 0,
          revenueGenerated,
          avgTimeToFill,
          conversionRate,
          activityCount: activityCount || 0,
        });
      }

      return performances.sort((a, b) => b.revenueGenerated - a.revenueGenerated);
    },
  });
}

/**
 * Get pipeline metrics by stage
 */
export function usePipelineMetrics() {
  return useQuery({
    queryKey: reportKeys.pipelineMetrics(),
    queryFn: async (): Promise<PipelineMetrics[]> => {
      const stages = Object.keys(STAGE_CONFIG) as PipelineStage[];
      const metrics: PipelineMetrics[] = [];

      for (const stage of stages) {
        const { count } = await supabase
          .from('candidate_pipeline')
          .select('*', { count: 'exact', head: true })
          .eq('stage', stage);

        // Get next stage count for conversion rate
        const stageOrder = STAGE_CONFIG[stage].order;
        const nextStage = stages.find(s => STAGE_CONFIG[s].order === stageOrder + 1);
        
        let conversionRate = 0;
        if (nextStage && count) {
          const { count: nextCount } = await supabase
            .from('candidate_pipeline')
            .select('*', { count: 'exact', head: true })
            .eq('stage', nextStage);
          conversionRate = nextCount ? (nextCount / count) * 100 : 0;
        }

        metrics.push({
          stage,
          stageLabel: STAGE_CONFIG[stage].label,
          count: count || 0,
          avgDaysInStage: null, // Would need stage history to calculate
          conversionRate,
        });
      }

      return metrics;
    },
  });
}

/**
 * Get conversion funnel data
 */
export function useConversionFunnel(filters?: PerformanceReportFilters) {
  return useQuery({
    queryKey: reportKeys.conversionFunnel(filters),
    queryFn: async (): Promise<ConversionFunnelStep[]> => {
      const funnelStages: PipelineStage[] = [
        'sourced', 'contacted', 'qualified', 'submitted', 
        'interview_1', 'offer', 'placed'
      ];

      const steps: ConversionFunnelStep[] = [];
      let previousCount = 0;

      for (let i = 0; i < funnelStages.length; i++) {
        const stage = funnelStages[i];
        const { count } = await supabase
          .from('candidate_pipeline')
          .select('*', { count: 'exact', head: true })
          .eq('stage', stage);

        const currentCount = count || 0;
        const percentage = previousCount > 0 ? (currentCount / previousCount) * 100 : 100;
        const dropoffRate = previousCount > 0 ? ((previousCount - currentCount) / previousCount) * 100 : 0;

        steps.push({
          stage,
          label: STAGE_CONFIG[stage].label,
          count: currentCount,
          percentage: i === 0 ? 100 : percentage,
          dropoffRate: i === 0 ? 0 : dropoffRate,
        });

        previousCount = currentCount;
      }

      return steps;
    },
  });
}

/**
 * Get time to fill metrics by sector
 */
export function useTimeToFillMetrics(filters?: PerformanceReportFilters) {
  return useQuery({
    queryKey: reportKeys.timeToFill(filters),
    queryFn: async (): Promise<TimeToFillData[]> => {
      const { data, error } = await supabase
        .from('candidate_pipeline')
        .select(`
          created_at,
          job:jobs(sector)
        `)
        .eq('stage', 'placed');

      if (error) throw error;

      // Group by sector
      const sectorMap = new Map<string, { times: number[]; count: number }>();

      for (const entry of data || []) {
        const sector = (entry as any).job?.sector || 'Other';
        const existing = sectorMap.get(sector) || { times: [], count: 0 };
        
        // Estimate time to fill (would need actual placement date)
        existing.times.push(30); // Placeholder
        existing.count += 1;

        sectorMap.set(sector, existing);
      }

      return Array.from(sectorMap.entries()).map(([sector, data]) => ({
        sector,
        avgDays: data.times.reduce((a, b) => a + b, 0) / data.times.length,
        minDays: Math.min(...data.times),
        maxDays: Math.max(...data.times),
        count: data.count,
      }));
    },
  });
}

/**
 * Get activity metrics over time
 */
export function useActivityMetrics(filters?: PerformanceReportFilters) {
  return useQuery({
    queryKey: reportKeys.activityMetrics(filters),
    queryFn: async (): Promise<ActivityMetrics[]> => {
      const now = new Date();
      const thirtyDaysAgo = subMonths(now, 1);

      // Get CVs added per day
      const { data: cvs } = await supabase
        .from('cv_submissions')
        .select('created_at')
        .gte('created_at', format(thirtyDaysAgo, 'yyyy-MM-dd'));

      // Get jobs created per day
      const { data: jobs } = await supabase
        .from('jobs')
        .select('created_at')
        .gte('created_at', format(thirtyDaysAgo, 'yyyy-MM-dd'));

      // Get pipeline updates per day
      const { data: pipeline } = await supabase
        .from('pipeline_activity')
        .select('created_at')
        .gte('created_at', format(thirtyDaysAgo, 'yyyy-MM-dd'));

      // Get placements per day
      const { data: placements } = await supabase
        .from('placements')
        .select('created_at')
        .gte('created_at', format(thirtyDaysAgo, 'yyyy-MM-dd'));

      // Group by day
      const dayMap = new Map<string, ActivityMetrics>();

      const addToDay = (date: string, field: 'cvsAdded' | 'jobsCreated' | 'pipelineUpdates' | 'placements') => {
        const day = format(parseISO(date), 'yyyy-MM-dd');
        const existing = dayMap.get(day) || {
          date: day,
          cvsAdded: 0,
          jobsCreated: 0,
          pipelineUpdates: 0,
          placements: 0,
          total: 0,
        };
        existing[field] += 1;
        existing.total += 1;
        dayMap.set(day, existing);
      };

      cvs?.forEach(cv => addToDay(cv.created_at, 'cvsAdded'));
      jobs?.forEach(job => addToDay(job.created_at, 'jobsCreated'));
      pipeline?.forEach(p => addToDay(p.created_at, 'pipelineUpdates'));
      placements?.forEach(p => addToDay(p.created_at, 'placements'));

      return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    },
  });
}
