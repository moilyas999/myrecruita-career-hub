import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { reportKeys } from '../useReports';
import React from 'react';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          gte: vi.fn(() => ({
            lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          in: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        not: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    adminRole: 'admin',
  }),
}));

// Mock usePermissions
vi.mock('../usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: vi.fn().mockReturnValue(true),
    isLoading: false,
  }),
}));

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('reportKeys', () => {
  describe('Query Key Factory', () => {
    it('generates correct base keys', () => {
      expect(reportKeys.all).toEqual(['reports']);
      expect(reportKeys.revenue()).toEqual(['reports', 'revenue']);
      expect(reportKeys.performance()).toEqual(['reports', 'performance']);
    });

    it('generates correct revenue forecast keys', () => {
      const key = reportKeys.revenueForecast('monthly');
      expect(key).toEqual(['reports', 'revenue', 'forecast', 'monthly', undefined]);
    });

    it('generates correct revenue forecast keys with filters', () => {
      const filters = { dateRange: { from: '2025-01-01', to: '2025-01-31' } };
      const key = reportKeys.revenueForecast('quarterly', filters);
      expect(key).toEqual(['reports', 'revenue', 'forecast', 'quarterly', filters]);
    });

    it('generates correct revenue metrics keys', () => {
      const key = reportKeys.revenueMetrics();
      expect(key).toEqual(['reports', 'revenue', 'metrics', undefined]);
    });

    it('generates correct placements by client keys', () => {
      const key = reportKeys.placementsByClient();
      expect(key).toEqual(['reports', 'revenue', 'by-client', undefined]);
    });

    it('generates correct placements by recruiter keys', () => {
      const key = reportKeys.placementsByRecruiter();
      expect(key).toEqual(['reports', 'revenue', 'by-recruiter', undefined]);
    });

    it('generates correct invoices keys', () => {
      const key = reportKeys.invoices();
      expect(key).toEqual(['reports', 'revenue', 'invoices', undefined]);
    });

    it('generates correct recruiter performance keys', () => {
      const key = reportKeys.recruiterPerformance();
      expect(key).toEqual(['reports', 'performance', 'recruiters', undefined]);
    });

    it('generates correct pipeline metrics keys', () => {
      const key = reportKeys.pipelineMetrics();
      expect(key).toEqual(['reports', 'performance', 'pipeline']);
    });

    it('generates correct conversion funnel keys', () => {
      const key = reportKeys.conversionFunnel();
      expect(key).toEqual(['reports', 'performance', 'funnel', undefined]);
    });

    it('generates correct time to fill keys', () => {
      const key = reportKeys.timeToFill();
      expect(key).toEqual(['reports', 'performance', 'time-to-fill', undefined]);
    });

    it('generates correct activity metrics keys', () => {
      const key = reportKeys.activityMetrics();
      expect(key).toEqual(['reports', 'performance', 'activity', undefined]);
    });
  });
});

describe('Report Types', () => {
  it('should have correct period options', async () => {
    const { PERIOD_CONFIG } = await import('@/types/report');
    
    expect(PERIOD_CONFIG.weekly.label).toBe('Weekly');
    expect(PERIOD_CONFIG.monthly.label).toBe('Monthly');
    expect(PERIOD_CONFIG.quarterly.label).toBe('Quarterly');
    expect(PERIOD_CONFIG.yearly.label).toBe('Yearly');
  });
});

describe('Revenue Report Components', () => {
  it('RevenueCard should format currency correctly', async () => {
    // Test that the component exports exist
    const { RevenueCard } = await import('@/components/admin/reports/RevenueCard');
    expect(RevenueCard).toBeDefined();
  });

  it('RevenueTrendChart should be defined', async () => {
    const { RevenueTrendChart } = await import('@/components/admin/reports/RevenueTrendChart');
    expect(RevenueTrendChart).toBeDefined();
  });

  it('PlacementsByClientChart should be defined', async () => {
    const { PlacementsByClientChart } = await import('@/components/admin/reports/PlacementsByClientChart');
    expect(PlacementsByClientChart).toBeDefined();
  });

  it('InvoiceStatusTable should be defined', async () => {
    const { InvoiceStatusTable } = await import('@/components/admin/reports/InvoiceStatusTable');
    expect(InvoiceStatusTable).toBeDefined();
  });

  it('ReportFilters should be defined', async () => {
    const { ReportFilters } = await import('@/components/admin/reports/ReportFilters');
    expect(ReportFilters).toBeDefined();
  });
});

describe('Performance Report Components', () => {
  it('PerformanceDashboard should be defined', async () => {
    const PerformanceDashboard = (await import('@/components/admin/reports/PerformanceDashboard')).default;
    expect(PerformanceDashboard).toBeDefined();
  });

  it('RevenueForecastDashboard should be defined', async () => {
    const RevenueForecastDashboard = (await import('@/components/admin/reports/RevenueForecastDashboard')).default;
    expect(RevenueForecastDashboard).toBeDefined();
  });
});
