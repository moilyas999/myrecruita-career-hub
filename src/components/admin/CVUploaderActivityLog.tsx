import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Activity, RefreshCw, Upload, Brain, Database, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  details: {
    file_count?: number;
    file_names?: string[];
    success_count?: number;
    failed_count?: number;
    [key: string]: any;
  } | null;
  created_at: string;
}

export default function CVUploaderActivityLog() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('cv_upload_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setActivities(data as ActivityLogEntry[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchActivities();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('activity-log-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cv_upload_activity_log'
        },
        (payload) => {
          setActivities(prev => [payload.new as ActivityLogEntry, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'files_uploaded':
        return <Upload className="w-4 h-4 text-blue-500" />;
      case 'cv_parsed':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'cvs_imported':
        return <Database className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'files_uploaded':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Upload</Badge>;
      case 'cv_parsed':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Parse</Badge>;
      case 'cvs_imported':
        return <Badge className="bg-green-100 text-green-700">Import</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const formatDetails = (action: string, details: ActivityLogEntry['details']) => {
    if (!details) return '-';

    switch (action) {
      case 'files_uploaded':
        return `${details.file_count} file(s): ${details.file_names?.slice(0, 2).join(', ')}${(details.file_names?.length || 0) > 2 ? '...' : ''}`;
      case 'cv_parsed':
        return `${details.file_count} CV(s) parsed`;
      case 'cvs_imported':
        return `${details.success_count} imported, ${details.failed_count} failed`;
      default:
        return JSON.stringify(details).slice(0, 50);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            CV Uploader Activity Log
          </CardTitle>
          <CardDescription>
            Track all CV upload, parsing, and import activities by staff members
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchActivities} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity logged yet</p>
            <p className="text-sm">Activity will appear here when CV uploaders use the Smart CV Parser</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        {getActionIcon(activity.action)}
                        <span title={format(new Date(activity.created_at), 'PPpp')}>
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {activity.user_email}
                    </TableCell>
                    <TableCell>
                      {getActionBadge(activity.action)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                      {formatDetails(activity.action, activity.details)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
