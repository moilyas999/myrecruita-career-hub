import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, TrendingUp, Users, Briefcase, FileText, Star, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

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
  const [stats, setStats] = useState<Stats>({
    cvSubmissions: 0,
    jobApplications: 0,
    careerPartnerRequests: 0,
    talentRequests: 0,
    visibleTalentProfiles: 0,
    totalJobs: 0,
  });
  const [previousStats, setPreviousStats] = useState<Stats | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('last30days');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  useEffect(() => {
    fetchStats();
  }, [timeRange, customStartDate, customEndDate]);

  const getDateRange = () => {
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
  };

  const getPreviousDateRange = () => {
    const { start, end } = getDateRange();
    const duration = end.getTime() - start.getTime();
    return {
      start: new Date(start.getTime() - duration),
      end: start
    };
  };

  const fetchStats = async () => {
    try {
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

      setStats({
        cvSubmissions: cvCount || 0,
        jobApplications: jobAppCount || 0,
        careerPartnerRequests: careerCount || 0,
        talentRequests: talentReqCount || 0,
        visibleTalentProfiles: visibleTalentCount || 0,
        totalJobs: totalJobsCount || 0,
      });

      setPreviousStats({
        cvSubmissions: prevCvCount || 0,
        jobApplications: prevJobAppCount || 0,
        careerPartnerRequests: 0,
        talentRequests: 0,
        visibleTalentProfiles: 0,
        totalJobs: 0,
      });

      // Process daily data for charts
      const days = eachDayOfInterval({ start, end });
      const chartData = days.map(day => {
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
      
      setDailyData(chartData);
    } catch (error: any) {
      toast.error('Failed to fetch statistics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = () => {
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
  };

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

  const pieData = [
    { name: 'CVs', value: stats.cvSubmissions },
    { name: 'Applications', value: stats.jobApplications },
    { name: 'Career Requests', value: stats.careerPartnerRequests },
    { name: 'Talent Requests', value: stats.talentRequests },
  ].filter(d => d.value > 0);

  if (loading) {
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

        <Badge variant="outline" className="text-sm">
          {getTimeRangeLabel()}
        </Badge>
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
            <CardTitle className="text-lg">Distribution</CardTitle>
            <CardDescription>Submission breakdown by type</CardDescription>
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
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-bold text-primary">{stats.totalJobs}</p>
                <p className="text-xs text-muted-foreground mt-1">Currently active listings</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured Talent</p>
                <p className="text-3xl font-bold text-amber-600">{stats.visibleTalentProfiles}</p>
                <p className="text-xs text-muted-foreground mt-1">Visible talent profiles</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
