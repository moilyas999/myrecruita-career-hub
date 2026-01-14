/**
 * My Activity Log Component
 * 
 * Personal activity log for staff members to see their own actions.
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { queryKeys } from '@/lib/queryKeys';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserActivity, ACTION_LABELS, ActivityAction, ActivityLogEntry } from '@/services/activityLogger';
import { formatDistanceToNow, format, isToday, isYesterday, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

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

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  cv: FileText,
  job: Briefcase,
  talent: User,
  blog: FileText,
  staff: Users,
  pipeline: GitBranch,
  submission: FileText,
  settings: Shield,
  auth: Shield,
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

export default function MyActivityLog() {
  const { user } = useAuth();

  const { data: activities = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: [...queryKeys.userActivity, user?.id],
    queryFn: () => getUserActivity(user?.id || '', 100),
    enabled: !!user?.id,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const groupedActivities = groupActivitiesByDay(activities);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
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
          <h2 className="text-2xl font-bold">My Activity</h2>
          <p className="text-muted-foreground">Track your recent actions and contributions</p>
        </div>
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

      {/* Activity Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activities.length}</p>
                <p className="text-sm text-muted-foreground">Total Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {activities.filter(a => isToday(new Date(a.created_at))).length}
                </p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.resource_type === 'cv').length}
                </p>
                <p className="text-sm text-muted-foreground">CV Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
          <CardDescription>
            Your recent actions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No activity recorded yet</p>
              <p className="text-sm">Your actions will appear here as you work</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(groupedActivities.entries()).map(([date, dayActivities]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    {getDayLabel(date)}
                  </h3>
                  <div className="space-y-3">
                    {dayActivities.map((activity) => {
                      const ActionIcon = ACTION_ICONS[activity.action] || Activity;
                      const ResourceIcon = RESOURCE_ICONS[activity.resource_type] || FileText;
                      const colorClass = RESOURCE_COLORS[activity.resource_type] || 'text-gray-600 bg-gray-500/10';
                      
                      return (
                        <div 
                          key={activity.id}
                          className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className={cn('p-2 rounded-full shrink-0', colorClass)}>
                            <ActionIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">
                              {ACTION_LABELS[activity.action as ActivityAction] || activity.action}
                            </p>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground truncate">
                                {typeof activity.details === 'object' && activity.details !== null
                                  ? (activity.details as Record<string, unknown>).name as string || 
                                    (activity.details as Record<string, unknown>).title as string ||
                                    JSON.stringify(activity.details).substring(0, 50)
                                  : String(activity.details)}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                <ResourceIcon className="w-3 h-3 mr-1" />
                                {activity.resource_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
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
