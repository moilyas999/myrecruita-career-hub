import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useRecruiterPerformance, usePipelineMetrics, useConversionFunnel } from '@/hooks/useReports';
import { AccessDenied } from '@/components/admin/shared/AccessDenied';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import { exportRecruiterPerformance } from '@/lib/exportUtils';
import { toast } from 'sonner';
import type { PerformanceReportFilters } from '@/types/report';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(value);

export default function PerformanceDashboard() {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [filters] = useState<PerformanceReportFilters>({});

  const { data: recruiters, isLoading: recruitersLoading, refetch: refetchRecruiters } = useRecruiterPerformance(filters);
  const { data: pipelineMetrics, isLoading: pipelineLoading, refetch: refetchPipeline } = usePipelineMetrics();
  const { data: funnel, isLoading: funnelLoading, refetch: refetchFunnel } = useConversionFunnel(filters);

  const canExport = hasPermission('reports.export');

  const handleRefresh = () => {
    refetchRecruiters();
    refetchPipeline();
    refetchFunnel();
  };

  const handleExport = () => {
    if (recruiters && recruiters.length > 0) {
      try {
        exportRecruiterPerformance(recruiters);
        toast.success('Performance report exported successfully');
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export report');
      }
    } else {
      toast.error('No data to export');
    }
  };

  if (!permissionsLoading && !hasPermission('reports.view')) {
    return <AccessDenied message="You don't have permission to view performance reports." requiredPermission="reports.view" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Reports</h2>
          <p className="text-muted-foreground">Track team performance, pipeline health, and conversion metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Recruiter Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Recruiter Performance</CardTitle>
          <CardDescription>Ranked by revenue generated</CardDescription>
        </CardHeader>
        <CardContent>
          {recruitersLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : (
            <div className="space-y-4">
              {(recruiters || []).slice(0, 5).map((r, idx) => (
                <div key={r.userId} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <span className="text-lg font-bold text-muted-foreground w-6">#{idx + 1}</span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={r.avatarUrl || undefined} />
                    <AvatarFallback>{r.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{r.displayName}</p>
                    <p className="text-sm text-muted-foreground">{r.placementsMade} placements • {r.cvsAdded} CVs added</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(r.revenueGenerated)}</p>
                    <Badge variant="secondary" className="text-xs">{r.conversionRate.toFixed(1)}% conv.</Badge>
                  </div>
                </div>
              ))}
              {(!recruiters || recruiters.length === 0) && (
                <p className="text-center text-muted-foreground py-8">No recruiter data available</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription>Current candidates in each stage</CardDescription>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineMetrics} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="stageLabel" tick={{ fontSize: 12 }} width={75} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Drop-off rates through the pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="space-y-3">
                {(funnel || []).map((step, idx) => (
                  <div key={step.stage} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{step.label}</span>
                      <span className="font-medium">{step.count} ({step.percentage.toFixed(0)}%)</span>
                    </div>
                    <Progress value={step.percentage} className="h-2" />
                    {idx > 0 && step.dropoffRate > 0 && (
                      <p className="text-xs text-red-500">↓ {step.dropoffRate.toFixed(1)}% drop-off</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
