import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Briefcase,
  CheckCircle,
  Clock,
  PoundSterling,
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useJobMetrics, useRoleAgeing } from '@/hooks/useJobs';
import { usePermissions } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/admin/shared';
import JobMetricsCard from './JobMetricsCard';
import RoleAgeingTable from './RoleAgeingTable';

// Chart colors using CSS variable references
const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function JobMetricsDashboard() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('jobs.view');

  const { data: metrics, isLoading: metricsLoading } = useJobMetrics();
  const { data: roleAgeingData = [], isLoading: ageingLoading } = useRoleAgeing();

  if (!canView) {
    return <AccessDenied message="You don't have permission to view job analytics." />;
  }

  // Pipeline conversion data for pie chart
  const pipelineData = [
    { name: 'CVs Submitted', value: metrics?.totalCVsSubmitted || 0, color: CHART_COLORS[0] },
    { name: 'Interviews', value: metrics?.totalInterviews || 0, color: CHART_COLORS[1] },
    { name: 'Offers', value: metrics?.totalOffers || 0, color: CHART_COLORS[2] },
    { name: 'Filled', value: metrics?.filledJobs || 0, color: CHART_COLORS[3] },
  ];

  // Job status distribution
  const statusData = [
    { name: 'Active', value: metrics?.activeJobs || 0 },
    { name: 'Filled', value: metrics?.filledJobs || 0 },
    { name: 'On Hold', value: metrics?.onHoldJobs || 0 },
    { name: 'Closed', value: metrics?.closedJobs || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Job Dashboard</h2>
          <p className="text-muted-foreground">
            Analytics and metrics for all job postings
          </p>
        </div>
        <Button asChild>
          <Link to="/admin?tab=jobs">
            View All Jobs
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <JobMetricsCard
          title="Active Jobs"
          value={metrics?.activeJobs || 0}
          description="Currently recruiting"
          icon={<Briefcase className="h-5 w-5" />}
          isLoading={metricsLoading}
        />
        <JobMetricsCard
          title="Filled This Month"
          value={metrics?.filledJobs || 0}
          description="Successful placements"
          icon={<CheckCircle className="h-5 w-5" />}
          isLoading={metricsLoading}
        />
        <JobMetricsCard
          title="Avg. Time to Fill"
          value={`${metrics?.avgTimeToFill || 0}d`}
          description="Average days to placement"
          icon={<Clock className="h-5 w-5" />}
          isLoading={metricsLoading}
        />
        <JobMetricsCard
          title="Projected Revenue"
          value={`£${((metrics?.projectedRevenue || 0) / 1000).toFixed(0)}k`}
          description="From active jobs"
          icon={<PoundSterling className="h-5 w-5" />}
          isLoading={metricsLoading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <JobMetricsCard
          title="CVs Submitted"
          value={metrics?.totalCVsSubmitted || 0}
          icon={<FileText className="h-5 w-5" />}
          isLoading={metricsLoading}
        />
        <JobMetricsCard
          title="Interviews Scheduled"
          value={metrics?.totalInterviews || 0}
          icon={<Users className="h-5 w-5" />}
          isLoading={metricsLoading}
        />
        <JobMetricsCard
          title="Conversion Rate"
          value={`${metrics?.conversionRate || 0}%`}
          description="CVs to placement"
          icon={<TrendingUp className="h-5 w-5" />}
          isLoading={metricsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
            <CardDescription>Breakdown of jobs by status</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Conversion</CardTitle>
            <CardDescription>Candidates through the pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pipelineData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Ageing Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Role Ageing</CardTitle>
            <CardDescription>
              Active jobs sorted by days open - monitor stale roles
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin?tab=jobs">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <RoleAgeingTable
            data={roleAgeingData}
            isLoading={ageingLoading}
            limit={10}
          />
        </CardContent>
      </Card>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Projected vs confirmed revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                  <div>
                    <p className="text-sm text-muted-foreground">Projected Revenue</p>
                    <p className="text-2xl font-bold">
                      £{(metrics?.projectedRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/10">
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmed Revenue</p>
                    <p className="text-2xl font-bold">
                      £{(metrics?.confirmedRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key recruitment metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Jobs</span>
                <span className="font-medium">{metrics?.totalJobs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fill Rate</span>
                <span className="font-medium">
                  {metrics?.totalJobs
                    ? Math.round(
                        ((metrics.filledJobs || 0) / metrics.totalJobs) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg CVs per Job</span>
                <span className="font-medium">
                  {metrics?.activeJobs
                    ? Math.round(
                        (metrics.totalCVsSubmitted || 0) / metrics.activeJobs
                      )
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Interview Rate</span>
                <span className="font-medium">
                  {metrics?.totalCVsSubmitted
                    ? Math.round(
                        ((metrics.totalInterviews || 0) /
                          metrics.totalCVsSubmitted) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
