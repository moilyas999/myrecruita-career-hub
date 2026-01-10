import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Plus, 
  Upload,
  ArrowUpRight,
  Clock,
  Zap,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalCVs: number;
  newCVsToday: number;
  activeJobs: number;
  pendingApplications: number;
  talentProfiles: number;
  totalSubmissions: number;
}

interface RecentActivity {
  id: string;
  type: 'cv' | 'application' | 'job' | 'talent';
  title: string;
  subtitle: string;
  timestamp: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCVs: 0,
    newCVsToday: 0,
    activeJobs: 0,
    pendingApplications: 0,
    talentProfiles: 0,
    totalSubmissions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Parallel fetch all counts
      const [
        { count: totalCVs },
        { count: newCVsToday },
        { count: activeJobs },
        { count: pendingApplications },
        { count: talentProfiles },
        { data: recentCVs },
        { data: recentApplications },
      ] = await Promise.all([
        supabase.from('cv_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('cv_submissions').select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }),
        supabase.from('talent_profiles').select('*', { count: 'exact', head: true }).eq('is_visible', true),
        supabase.from('cv_submissions').select('id, name, created_at, job_title').order('created_at', { ascending: false }).limit(3),
        supabase.from('job_applications').select('id, name, created_at, jobs(title)').order('created_at', { ascending: false }).limit(3),
      ]);

      setStats({
        totalCVs: totalCVs || 0,
        newCVsToday: newCVsToday || 0,
        activeJobs: activeJobs || 0,
        pendingApplications: pendingApplications || 0,
        talentProfiles: talentProfiles || 0,
        totalSubmissions: (totalCVs || 0) + (pendingApplications || 0),
      });

      // Combine and sort recent activity
      const activity: RecentActivity[] = [
        ...(recentCVs || []).map((cv: any) => ({
          id: cv.id,
          type: 'cv' as const,
          title: cv.name,
          subtitle: cv.job_title || 'CV Submission',
          timestamp: cv.created_at,
        })),
        ...(recentApplications || []).map((app: any) => ({
          id: app.id,
          type: 'application' as const,
          title: app.name,
          subtitle: app.jobs?.title || 'Job Application',
          timestamp: app.created_at,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      setRecentActivity(activity);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const statCards = [
    {
      title: 'Total CVs',
      value: stats.totalCVs,
      change: stats.newCVsToday > 0 ? `+${stats.newCVsToday} today` : undefined,
      icon: FileText,
      href: '/admin?tab=submissions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: Briefcase,
      href: '/admin?tab=jobs',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Applications',
      value: stats.pendingApplications,
      icon: Users,
      href: '/admin?tab=applications',
      color: 'text-violet-600',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Featured Talent',
      value: stats.talentProfiles,
      icon: Star,
      href: '/admin?tab=talent',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const quickActions = [
    { label: 'Add CV', icon: Plus, href: '/admin?tab=add-cv', variant: 'default' as const },
    { label: 'Bulk Import', icon: Upload, href: '/admin?tab=bulk-import', variant: 'outline' as const },
    { label: 'Post Job', icon: Briefcase, href: '/admin?tab=jobs', variant: 'outline' as const },
  ];

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your recruitment pipeline.
          </p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => (
            <Button key={action.label} variant={action.variant} size="sm" asChild>
              <Link to={action.href}>
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={cn('p-2.5 rounded-xl', stat.bgColor)}>
                      <Icon className={cn('w-5 h-5', stat.color)} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      {stat.change && (
                        <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 border-0">
                          {stat.change}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription>Latest submissions and applications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin?tab=submissions">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                      activity.type === 'cv' ? 'bg-blue-500/10' : 'bg-violet-500/10'
                    )}>
                      {activity.type === 'cv' ? (
                        <FileText className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Users className="w-5 h-5 text-violet-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Submissions</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">{stats.totalSubmissions}</p>
              <p className="text-xs text-muted-foreground mt-1">CVs + Applications</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">New CVs Today</span>
                <Badge variant="secondary">{stats.newCVsToday}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Active Jobs</span>
                <Badge variant="secondary">{stats.activeJobs}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Featured Talent</span>
                <Badge variant="secondary">{stats.talentProfiles}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
