import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  useRevenueForecast, 
  useRevenueMetrics, 
  usePlacementsByClient,
  useInvoices,
} from '@/hooks/useReports';
import { RevenueCard } from './RevenueCard';
import { RevenueTrendChart } from './RevenueTrendChart';
import { PlacementsByClientChart } from './PlacementsByClientChart';
import { InvoiceStatusTable } from './InvoiceStatusTable';
import { ReportFilters } from './ReportFilters';
import { AccessDenied } from '@/components/admin/shared/AccessDenied';
import { DollarSign, TrendingUp, FileText, CreditCard, Clock, Target } from 'lucide-react';
import type { ReportPeriod, ReportDateRange, RevenueReportFilters } from '@/types/report';

export default function RevenueForecastDashboard() {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [dateRange, setDateRange] = useState<ReportDateRange | undefined>();
  
  const filters: RevenueReportFilters = { dateRange };

  const { data: forecastData, isLoading: forecastLoading, refetch: refetchForecast } = useRevenueForecast(period, filters);
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useRevenueMetrics(filters);
  const { data: clientData, isLoading: clientLoading, refetch: refetchClients } = usePlacementsByClient(filters);
  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices(filters);

  const handleRefresh = () => {
    refetchForecast();
    refetchMetrics();
    refetchClients();
    refetchInvoices();
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Exporting report...');
  };

  // Permission check
  if (!permissionsLoading && !hasPermission('reports.view')) {
    return (
      <AccessDenied
        message="You don't have permission to view revenue reports."
        requiredPermission="reports.view"
      />
    );
  }

  const canExport = hasPermission('reports.export');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Revenue Forecast</h2>
        <p className="text-muted-foreground">
          Track placement revenue, invoicing, and financial projections
        </p>
      </div>

      <ReportFilters
        period={period}
        onPeriodChange={setPeriod}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        onExport={canExport ? handleExport : undefined}
        showExport={canExport}
      />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <RevenueCard
          title="Confirmed Revenue"
          value={metrics?.totalConfirmed || 0}
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <RevenueCard
          title="Pending Revenue"
          value={metrics?.totalPending || 0}
          icon={<Clock className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <RevenueCard
          title="Projected Total"
          value={metrics?.totalProjected || 0}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <RevenueCard
          title="Invoiced"
          value={metrics?.invoicedValue || 0}
          icon={<FileText className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <RevenueCard
          title="Paid"
          value={metrics?.paidValue || 0}
          icon={<CreditCard className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
        <RevenueCard
          title="Conversion Rate"
          value={metrics?.conversionRate || 0}
          format="percentage"
          icon={<Target className="h-4 w-4" />}
          isLoading={metricsLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueTrendChart 
          data={forecastData || []} 
          isLoading={forecastLoading} 
        />
        <PlacementsByClientChart 
          data={clientData || []} 
          isLoading={clientLoading} 
        />
      </div>

      {/* Invoice Table */}
      <InvoiceStatusTable 
        data={invoices || []} 
        isLoading={invoicesLoading} 
      />
    </div>
  );
}
