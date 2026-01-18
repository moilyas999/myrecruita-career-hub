/**
 * Jobs Tab Component
 * Displays jobs linked to this client with metrics
 */
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface JobsTabProps {
  clientId: string;
}

interface ClientJob {
  id: string;
  title: string;
  reference_id: string;
  status: string;
  priority: string | null;
  job_type_category: string | null;
  salary: string | null;
  location: string;
  sector: string;
  created_at: string;
  target_fill_date: string | null;
  placed_at: string | null;
  cvs_submitted_count: number;
  interviews_scheduled_count: number;
  offers_made_count: number;
  revenue_forecast: number | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/30',
  filled: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  on_hold: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  closed: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-600',
  high: 'bg-orange-500/10 text-orange-600',
  medium: 'bg-amber-500/10 text-amber-600',
  low: 'bg-muted text-muted-foreground',
};

export default function JobsTab({ clientId }: JobsTabProps) {
  const navigate = useNavigate();
  
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['client-jobs', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClientJob[];
    },
    enabled: !!clientId,
  });

  // Calculate summary metrics
  const metrics = {
    total: jobs?.length || 0,
    active: jobs?.filter(j => j.status === 'active').length || 0,
    filled: jobs?.filter(j => j.status === 'filled').length || 0,
    totalCVs: jobs?.reduce((sum, j) => sum + (j.cvs_submitted_count || 0), 0) || 0,
    projectedRevenue: jobs
      ?.filter(j => j.status === 'active')
      .reduce((sum, j) => sum + (j.revenue_forecast || 0), 0) || 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{metrics.total}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.active}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.filled}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Filled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{metrics.totalCVs}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">CVs Submitted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.projectedRevenue)}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Projected Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      {!jobs || jobs.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No jobs yet</h3>
            <p className="text-muted-foreground mb-4">
              No jobs have been linked to this client
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onClick={() => navigate(`/admin?tab=jobs`)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface JobCardProps {
  job: ClientJob;
  onClick: () => void;
}

function JobCard({ job, onClick }: JobCardProps) {
  const daysOpen = differenceInDays(new Date(), new Date(job.created_at));
  const statusColor = STATUS_COLORS[job.status] || STATUS_COLORS.draft;
  const priorityColor = job.priority ? PRIORITY_COLORS[job.priority] : '';

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{job.title}</span>
              <Badge variant="outline" className="text-xs font-mono">
                {job.reference_id}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.sector}</span>
              {job.salary && (
                <>
                  <span>•</span>
                  <span>{job.salary}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {job.priority && (
              <Badge className={`text-xs capitalize ${priorityColor}`}>
                {job.priority}
              </Badge>
            )}
            <Badge className={`text-xs capitalize ${statusColor}`}>
              {job.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-4 gap-4 pt-3 border-t text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={daysOpen > 30 ? 'text-amber-600' : ''}>
              {daysOpen} days open
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{job.cvs_submitted_count || 0} CVs submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span>{job.interviews_scheduled_count || 0} interviews</span>
          </div>
          {job.revenue_forecast && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span>{new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: 'GBP',
                minimumFractionDigits: 0,
              }).format(job.revenue_forecast)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
