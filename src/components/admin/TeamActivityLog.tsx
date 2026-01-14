/**
 * Team Activity Log Component
 * 
 * Admin-only component to view all staff activity across the platform.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  RefreshCw, 
  FileText, 
  Briefcase, 
  Users, 
  User,
  Edit,
  Trash2,
  Upload,
  Download,
  Plus,
  Eye,
  Shield,
  GitBranch,
  ArrowRight,
  MessageSquare,
  XCircle,
  LogIn,
  LogOut,
  Star,
  Filter,
  DownloadCloud,
  Clock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getTeamActivity, ACTION_LABELS, ActivityAction, ResourceType, ActivityLogEntry } from '@/services/activityLogger';
import { formatDistanceToNow, format, subDays, startOfDay, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  role: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  cv_created: Plus,
  cv_updated: Edit,
  cv_deleted: Trash2,
  cv_exported: Download,
  cv_bulk_imported: Upload,
  cv_matched: GitBranch,
  cv_scored: Star,
  job_created: Plus,
  job_updated: Edit,
  job_deleted: Trash2,
  job_status_changed: ArrowRight,
  job_assigned: Users,
  talent_created: Plus,
  talent_updated: Edit,
  talent_deleted: Trash2,
  talent_visibility_changed: Eye,
  blog_created: Plus,
  blog_updated: Edit,
  blog_published: Eye,
  blog_unpublished: Eye,
  blog_deleted: Trash2,
  staff_created: Plus,
  staff_updated: Edit,
  staff_deleted: Trash2,
  permissions_changed: Shield,
  pipeline_candidate_added: GitBranch,
  pipeline_stage_changed: ArrowRight,
  pipeline_note_added: MessageSquare,
  pipeline_candidate_removed: XCircle,
  submission_deleted: Trash2,
  submission_exported: Download,
  login: LogIn,
  logout: LogOut,
};

const RESOURCE_COLORS: Record<string, string> = {
  cv: 'text-blue-600 bg-blue-500/10',
  job: 'text-emerald-600 bg-emerald-500/10',
  talent: 'text-violet-600 bg-violet-500/10',
  blog: 'text-amber-600 bg-amber-500/10',
  staff: 'text-rose-600 bg-rose-500/10',
  pipeline: 'text-cyan-600 bg-cyan-500/10',
  submission: 'text-orange-600 bg-orange-500/10',
  settings: 'text-gray-600 bg-gray-500/10',
  auth: 'text-indigo-600 bg-indigo-500/10',
};

const DATE_RANGES = [
  { value: '1', label: 'Last 24 hours' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const RESOURCE_TYPES: { value: ResourceType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Resources' },
  { value: 'cv', label: 'CVs' },
  { value: 'job', label: 'Jobs' },
  { value: 'talent', label: 'Talent' },
  { value: 'blog', label: 'Blog' },
  { value: 'staff', label: 'Staff' },
  { value: 'pipeline', label: 'Pipeline' },
];

function groupActivitiesByDay(activities: ActivityLogEntry[]): Map<string, ActivityLogEntry[]> {
  const grouped = new Map<string, ActivityLogEntry[]>();
  
  for (const activity of activities) {
    const date = startOfDay(new Date(activity.created_at)).toISOString();
    const existing = grouped.get(date) || [];
    grouped.set(date, [...existing, activity]);
  }
  
  return grouped;
}

function getDayLabel(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMMM d, yyyy');
}

export default function TeamActivityLog() {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');

  // Fetch admin profiles for the filter
  const { data: adminProfiles = [] } = useQuery({
    queryKey: ['admin-profiles-for-filter'],
    queryFn: async (): Promise<AdminProfile[]> => {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('id, user_id, email, display_name, role')
        .order('email');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch team activity
  const startDate = subDays(new Date(), parseInt(dateRange)).toISOString();
  
  const { data: activities = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['team-activity', selectedUser, selectedResource, dateRange],
    queryFn: () => getTeamActivity({
      limit: 200,
      userId: selectedUser === 'all' ? undefined : selectedUser,
      resourceType: selectedResource === 'all' ? undefined : selectedResource as ResourceType,
      startDate,
    }),
    staleTime: 30000,
  });

  const groupedActivities = groupActivitiesByDay(activities);

  // Calculate stats by user
  const userStats = activities.reduce((acc, activity) => {
    const userId = activity.user_id;
    acc[userId] = (acc[userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = () => {
    if (activities.length === 0) {
      toast.error('No activity to export');
      return;
    }

    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Details'].join(','),
      ...activities.map(a => [
        format(new Date(a.created_at), 'yyyy-MM-dd HH:mm:ss'),
        a.user_email,
        a.action,
        a.resource_type,
        a.resource_id || '',
        JSON.stringify(a.details || {}).replace(/,/g, ';'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `team-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast.success('Activity log exported');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Activity</h2>
          <p className="text-muted-foreground">Monitor all staff actions across the platform</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={activities.length === 0}
          >
            <DownloadCloud className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {adminProfiles.map((admin) => (
              <SelectItem key={admin.user_id} value={admin.user_id}>
                {admin.display_name || admin.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedResource} onValueChange={setSelectedResource}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Resources" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* User Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(userStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([userId, count]) => {
            const profile = adminProfiles.find(p => p.user_id === userId);
            return (
              <Card key={userId}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm">
                        {profile?.display_name || profile?.email?.split('@')[0] || 'Unknown'}
                      </p>
                      <p className="text-lg font-bold">{count} actions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Timeline
            <Badge variant="secondary" className="ml-2">
              {activities.length} actions
            </Badge>
          </CardTitle>
          <CardDescription>
            All staff actions in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No activity found for the selected filters</p>
              <p className="text-sm">Try adjusting your filters or date range</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(groupedActivities.entries()).map(([date, dayActivities]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {getDayLabel(date)}
                    <Badge variant="outline" className="ml-2">
                      {dayActivities.length} actions
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    {dayActivities.map((activity) => {
                      const ActionIcon = ACTION_ICONS[activity.action] || Activity;
                      const colorClass = RESOURCE_COLORS[activity.resource_type] || 'text-gray-600 bg-gray-500/10';
                      const profile = adminProfiles.find(p => p.user_id === activity.user_id);
                      
                      return (
                        <div 
                          key={activity.id}
                          className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                        >
                          <div className={cn('p-2 rounded-full shrink-0', colorClass)}>
                            <ActionIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">
                                {profile?.display_name || activity.user_email?.split('@')[0]}
                              </span>
                              <span className="text-muted-foreground">
                                {ACTION_LABELS[activity.action as ActivityAction] || activity.action}
                              </span>
                            </div>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground truncate mt-0.5">
                                {typeof activity.details === 'object' && activity.details !== null
                                  ? (activity.details as Record<string, unknown>).name as string || 
                                    (activity.details as Record<string, unknown>).title as string ||
                                    (activity.details as Record<string, unknown>).email as string ||
                                    ''
                                  : ''}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {activity.resource_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(activity.created_at), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
