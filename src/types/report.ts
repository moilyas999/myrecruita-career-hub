// ============================================================================
// Reports Module Type Definitions
// ============================================================================

import type { PlacementStatus, JobType } from './pipeline';

// ============================================================================
// Revenue Forecast Types
// ============================================================================

export interface RevenueForecastData {
  period: string;
  periodLabel: string;
  confirmed: number;
  pending: number;
  projected: number;
  placementsCount: number;
}

export interface RevenueMetrics {
  totalConfirmed: number;
  totalPending: number;
  totalProjected: number;
  placementsCount: number;
  avgFee: number;
  conversionRate: number;
  invoicedValue: number;
  paidValue: number;
  outstandingValue: number;
}

export interface PlacementByClient {
  clientId: string;
  clientName: string;
  placementsCount: number;
  totalRevenue: number;
  avgFee: number;
}

export interface PlacementByRecruiter {
  userId: string;
  displayName: string;
  email: string;
  placementsCount: number;
  totalRevenue: number;
  avgFee: number;
}

export interface InvoiceItem {
  id: string;
  pipelineId: string;
  candidateName: string | null;
  jobTitle: string | null;
  companyName: string | null;
  feeValue: number | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  invoiceRaised: boolean;
  invoicePaid: boolean;
  status: PlacementStatus;
  startDate: string;
}

// ============================================================================
// Performance Report Types
// ============================================================================

export interface RecruiterPerformance {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  cvsAdded: number;
  interviewsScheduled: number;
  placementsMade: number;
  revenueGenerated: number;
  avgTimeToFill: number | null;
  conversionRate: number;
  activityCount: number;
}

export interface PipelineMetrics {
  stage: string;
  stageLabel: string;
  count: number;
  avgDaysInStage: number | null;
  conversionRate: number;
}

export interface ConversionFunnelStep {
  stage: string;
  label: string;
  count: number;
  percentage: number;
  dropoffRate: number;
}

export interface TimeToFillData {
  sector: string;
  avgDays: number;
  minDays: number;
  maxDays: number;
  count: number;
}

export interface ActivityMetrics {
  date: string;
  cvsAdded: number;
  jobsCreated: number;
  pipelineUpdates: number;
  placements: number;
  total: number;
}

// ============================================================================
// Report Filter Types
// ============================================================================

export interface ReportDateRange {
  from: string;
  to: string;
}

export interface RevenueReportFilters {
  dateRange?: ReportDateRange;
  clientId?: string;
  recruiterId?: string;
  status?: PlacementStatus;
  jobType?: JobType;
}

export interface PerformanceReportFilters {
  dateRange?: ReportDateRange;
  recruiterId?: string;
  sector?: string;
}

// ============================================================================
// Period Types
// ============================================================================

export type ReportPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const PERIOD_CONFIG: Record<ReportPeriod, { label: string; format: string }> = {
  weekly: { label: 'Weekly', format: 'wo yyyy' },
  monthly: { label: 'Monthly', format: 'MMM yyyy' },
  quarterly: { label: 'Quarterly', format: "'Q'Q yyyy" },
  yearly: { label: 'Yearly', format: 'yyyy' },
};
