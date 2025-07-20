import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, TrendingUp, Users, Briefcase, FileText, Star } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Stats {
  cvSubmissions: number;
  jobApplications: number;
  careerPartnerRequests: number;
  talentRequests: number;
  visibleTalentProfiles: number;
  totalJobs: number;
}

type TimeRange = 'last7days' | 'thisWeek' | 'thisMonth' | 'last30days' | 'thisYear' | 'custom';

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats>({
    cvSubmissions: 0,
    jobApplications: 0,
    careerPartnerRequests: 0,
    talentRequests: 0,
    visibleTalentProfiles: 0,
    totalJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('last7days');
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
        return { start: subDays(now, 7), end: now };
    }
  };

  const fetchStats = async () => {
    try {
      const { start, end } = getDateRange();
      const startDate = start.toISOString();
      const endDate = end.toISOString();

      // Fetch CV submissions
      const { count: cvCount, error: cvError } = await supabase
        .from('cv_submissions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (cvError) throw cvError;

      // Fetch job applications
      const { count: jobAppCount, error: jobAppError } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (jobAppError) throw jobAppError;

      // Fetch career partner requests
      const { count: careerCount, error: careerError } = await supabase
        .from('career_partner_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (careerError) throw careerError;

      // Fetch talent requests
      const { count: talentReqCount, error: talentReqError } = await supabase
        .from('talent_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (talentReqError) throw talentReqError;

      // Fetch visible talent profiles (total count, not date filtered)
      const { count: visibleTalentCount, error: visibleTalentError } = await supabase
        .from('talent_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_visible', true);

      if (visibleTalentError) throw visibleTalentError;

      // Fetch total active jobs (total count, not date filtered)
      const { count: totalJobsCount, error: totalJobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (totalJobsError) throw totalJobsError;

      setStats({
        cvSubmissions: cvCount || 0,
        jobApplications: jobAppCount || 0,
        careerPartnerRequests: careerCount || 0,
        talentRequests: talentReqCount || 0,
        visibleTalentProfiles: visibleTalentCount || 0,
        totalJobs: totalJobsCount || 0,
      });
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
        return 'Last 7 Days';
    }
  };

  const statCards = [
    {
      title: 'CV Submissions',
      value: stats.cvSubmissions,
      icon: FileText,
      description: 'CV submissions received',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Job Applications',
      value: stats.jobApplications,
      icon: Briefcase,
      description: 'Job applications received',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Career Partner Requests',
      value: stats.careerPartnerRequests,
      icon: Users,
      description: 'Career partnership inquiries',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Talent Requests',
      value: stats.talentRequests,
      icon: Star,
      description: 'Talent profile inquiries',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Visible Talent Profiles',
      value: stats.visibleTalentProfiles,
      icon: Users,
      description: 'Active talent profiles',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      isTotal: true,
    },
    {
      title: 'Active Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      description: 'Currently active job listings',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      isTotal: true,
    },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Statistics Dashboard</h2>
        <p className="text-muted-foreground">View key metrics and insights</p>
      </div>

      {/* Time Range Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <label className="text-sm font-medium">Time Range:</label>
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
        </div>

        {timeRange === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !customStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStartDate ? format(customStartDate, "PPP") : "Start date"}
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

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !customEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customEndDate ? format(customEndDate, "PPP") : "End date"}
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

        <div className="text-sm text-muted-foreground">
          Showing data for: {getTimeRangeLabel()}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <IconComponent className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                  {stat.isTotal && ' (Total)'}
                  {!stat.isTotal && ` (${getTimeRangeLabel()})`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Summary
          </CardTitle>
          <CardDescription>Overview for {getTimeRangeLabel()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Total Submissions: </p>
              <p className="text-2xl font-bold text-primary">
                {stats.cvSubmissions + stats.jobApplications + stats.careerPartnerRequests + stats.talentRequests}
              </p>
            </div>
            <div>
              <p className="font-medium">Platform Activity:</p>
              <p className="text-muted-foreground">
                {stats.totalJobs} active jobs, {stats.visibleTalentProfiles} talent profiles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}