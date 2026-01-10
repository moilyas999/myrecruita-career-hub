import { useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, TrendingUp, Users, Briefcase, FileText, Star, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { useMultiTableRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface Stats {
  cvSubmissions: number;
  jobApplications: number;
  careerPartnerRequests: number;
  talentRequests: number;
  visibleTalentProfiles: number;
  totalJobs: number;
}

interface DailyData {
  date: string;
  cvs: number;
  applications: number;
}

type TimeRange = 'last7days' | 'thisWeek' | 'thisMonth' | 'last30days' | 'thisYear' | 'custom';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(262, 83%, 58%)', 'hsl(45, 93%, 47%)', 'hsl(0, 72%, 51%)', 'hsl(189, 94%, 43%)'];

export default function StatsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('last30days');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  // Real-time subscription for stats updates
  useMultiTableRealtimeSubscription(
    ['cv_submissions', 'job_applications', 'career_partner_requests', 'talent_requests', 'jobs', 'talent_profiles'],
    [queryKeys.statsDashboard],
    { showToasts: false } // Don't show toasts for stats updates
  );

  const getDateRange = useCallback(() => {
    const now = new Date();
    
    switch (timeRange) {
      case 'last7days':
        return { start: subDays(now, 7), end: now };
      case 'thisWeek':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last30days':
        return { start: subDays(now, 30), end: now };
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return { 
          start: customStartDate || subDays(now, 7), 
          end: customEndDate || now 
        };
      default:
        return { start: subDays(now, 30), end: now };
    }
  }, [timeRange, customStartDate, customEndDate]);

  const getPreviousDateRange = useCallback(() => {
    const { start, end } = getDateRange();
    const duration = end.getTime() - start.getTime();
    return {
      start: new Date(start.getTime() - duration),
      end: start
    };
  }, [getDateRange]);

  const fetchStats = useCallback(async () => {
    const { start, end } = getDateRange();
    const { start: prevStart, end: prevEnd } = getPreviousDateRange();
    const startDate = start.toISOString();
    const endDate = end.toISOString();
    const prevStartDate = prevStart.toISOString();
    const prevEndDate = prevEnd.toISOString();

    // Fetch current period stats
    const [
      { count: cvCount },
      { count: jobAppCount },
      { count: careerCount },
      { count: talentReqCount },
      { count: visibleTalentCount },
      { count: totalJobsCount },
      // Previous period
      { count: prevCvCount },
      { count: prevJobAppCount },
      // Daily data for chart
      { data: cvDailyData },
      { data: appDailyData }
    ] = await Promise.all([
      supabase.from('cv_submissions').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('job_applications').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('career_partner_requests').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('talent_requests').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('talent_profiles').select('*', { count: 'exact', head: true }).eq('is_visible', true),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      // Previous period for comparison
      supabase.from('cv_submissions').select('*', { count: 'exact', head: true }).gte('created_at', prevStartDate).lte('created_at', prevEndDate),
      supabase.from('job_applications').select('*', { count: 'exact', head: true }).gte('created_at', prevStartDate).lte('created_at', prevEndDate),
      // Fetch daily data for charts
      supabase.from('cv_submissions').select('created_at').gte('created_at', startDate).lte('created_at', endDate),
      supabase.from('job_applications').select('created_at').gte('created_at', startDate).lte('created_at', endDate)
    ]);

    const stats: Stats = {
      cvSubmissions: cvCount || 0,
      jobApplications: jobAppCount || 0,
      careerPartnerRequests: careerCount || 0,
      talentRequests: talentReqCount || 0,
      visibleTalentProfiles: visibleTalentCount || 0,
      totalJobs: totalJobsCount || 0,
    };

    const previousStats: Stats = {
      cvSubmissions: prevCvCount || 0,
      jobApplications: prevJobAppCount || 0,
      careerPartnerRequests: 0,
      talentRequests: 0,
      visibleTalentProfiles: 0,
      totalJobs: 0,
    };

    // Process daily data for charts
    const days = eachDayOfInterval({ start, end });
    const dailyData: DailyData[] = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const cvs = (cvDailyData || []).filter((cv: any) => 
        format(new Date(cv.created_at), 'yyyy-MM-dd') === dayStr
      ).length;
      const applications = (appDailyData || []).filter((app: any) => 
        format(new Date(app.created_at), 'yyyy-MM-dd') === dayStr
      ).length;
      
      return {
        date: format(day, 'MMM dd'),
        cvs,
        applications
      };
    });
    
    return { stats, previousStats, dailyData };
  }, [getDateRange, getPreviousDateRange]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [queryKeys.statsDashboard, timeRange, customStartDate?.toISOString(), customEndDate?.toISOString()],
    queryFn: fetchStats,
    staleTime: 30000, // 30 seconds - shorter for real-time updates
    retry: 2,
  });

  const stats = data?.stats || {
    cvSubmissions: 0,
    jobApplications: 0,
    careerPartnerRequests: 0,
    talentRequests: 0,
    visibleTalentProfiles: 0,
    totalJobs: 0,
  };
  const previousStats = data?.previousStats || null;
  const dailyData = data?.dailyData || [];

  const getTimeRangeLabel = useMemo(() => {
    const { start, end } = getDateRange();
    
    switch (timeRange) {
      case 'last7days':
        return 'Last 7 Days';
      case 'thisWeek':
        return 'This Week';
      case 'thisMonth':
        return 'This Month';
      case 'last30days':
        return 'Last 30 Days';
      case 'thisYear':
        return 'This Year';
      case 'custom':
        return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
      default:
        return 'Last 30 Days';
    }
  }, [timeRange, getDateRange]);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const statCards = [
    {
      title: 'CV Submissions',
      value: stats.cvSubmissions,
      previousValue: previousStats?.cvSubmissions || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Job Applications',
      value: stats.jobApplications,
      previousValue: previousStats?.jobApplications || 0,
      icon: Briefcase,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Career Requests',
      value: stats.careerPartnerRequests,
      icon: Users,
      color: 'text-violet-600',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Talent Requests',
      value: stats.talentRequests,
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const pieData = useMemo(() => [
    { name: 'CVs', value: stats.cvSubmissions },
    { name: 'Applications', value: stats.jobApplications },
    { name: 'Career Requests', value: stats.careerPartnerRequests },
    { name: 'Talent Requests', value: stats.talentRequests },
  ].filter(d => d.value > 0), [stats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-medium mb-2">Failed to load analytics</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <div className="flex gap-2 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal",
                      !customStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "PPP") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal",
                      !customEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "PPP") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Badge variant="outline" className="text-sm">
            {getTimeRangeLabel}
          </Badge>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          const change = stat.previousValue !== undefined ? calculateChange(stat.value, stat.previousValue) : null;
          const isPositive = change !== null && change >= 0;
          
          return (
            <Card key={stat.title} className="relative overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2.5 rounded-xl", stat.bgColor)}>
                    <IconComponent className={cn("h-5 w-5", stat.color)} />
                  </div>
                  {change !== null && stat.previousValue !== undefined && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                      isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    )}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(change).toFixed(0)}%
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Trends */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Submission Trends
            </CardTitle>
            <CardDescription>CVs and applications over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCvs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cvs" 
                    stroke="hsl(217, 91%, 60%)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCvs)"
                    name="CVs"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorApps)"
                    name="Applications"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Submission Distribution</CardTitle>
            <CardDescription>Breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data for selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Jobs</CardTitle>
            <CardDescription>Currently open positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.totalJobs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Visible Talent</CardTitle>
            <CardDescription>Profiles available to employers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.visibleTalentProfiles}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
