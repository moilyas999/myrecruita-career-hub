/**
 * My Work Dashboard Component
 * 
 * Shows staff members what work is assigned to them and their recent contributions.
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Briefcase, 
  FileText, 
  Users, 
  GitBranch,
  RefreshCw,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AssignedJob {
  id: string;
  reference_id: string;
  title: string;
  status: string;
  location: string;
  created_at: string;
  pipeline_count?: number;
}

interface RecentCV {
  id: string;
  name: string;
  job_title: string | null;
  cv_score: number | null;
  created_at: string;
}

interface PipelineEntry {
  id: string;
  stage: string;
  created_at: string;
  cv_submissions: {
    name: string;
    job_title: string | null;
  };
  jobs: {
    title: string;
    reference_id: string;
  };
}

async function fetchMyWork(userId: string) {
  // Fetch jobs assigned to user
  const { data: assignedJobs } = await supabase
    .from('jobs')
    .select('id, reference_id, title, status, location, created_at')
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch jobs created by user
  const { data: createdJobs } = await supabase
    .from('jobs')
    .select('id, reference_id, title, status, location, created_at')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch recent CVs added by user
  const { data: recentCVs } = await supabase
    .from('cv_submissions')
    .select('id, name, job_title, cv_score, created_at')
    .eq('added_by', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch pipeline entries where user is assigned
  const { data: pipelineEntries } = await supabase
    .from('candidate_pipeline')
    .select(`
      id, stage, created_at,
      cv_submissions (name, job_title),
      jobs (title, reference_id)
    `)
    .eq('assigned_to', userId)
    .order('updated_at', { ascending: false })
    .limit(10);

  // Get pipeline counts for assigned jobs
  const jobIds = assignedJobs?.map(j => j.id) || [];
  let pipelineCounts: Record<string, number> = {};
  
  if (jobIds.length > 0) {
    const { data: counts } = await supabase
      .from('candidate_pipeline')
      .select('job_id')
      .in('job_id', jobIds);
    
    if (counts) {
      pipelineCounts = counts.reduce((acc, entry) => {
        acc[entry.job_id] = (acc[entry.job_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  // Add pipeline counts to assigned jobs
  const jobsWithCounts = (assignedJobs || []).map(job => ({
    ...job,
    pipeline_count: pipelineCounts[job.id] || 0,
  }));

  return {
    assignedJobs: jobsWithCounts,
    createdJobs: createdJobs || [],
    recentCVs: recentCVs || [],
    pipelineEntries: pipelineEntries || [],
  };
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600',
  paused: 'bg-amber-500/10 text-amber-600',
  filled: 'bg-blue-500/10 text-blue-600',
  expired: 'bg-gray-500/10 text-gray-600',
  archived: 'bg-gray-500/10 text-gray-600',
};

const STAGE_COLORS: Record<string, string> = {
  sourced: 'bg-gray-500/10 text-gray-600',
  screening: 'bg-blue-500/10 text-blue-600',
  interviewing: 'bg-violet-500/10 text-violet-600',
  offer: 'bg-amber-500/10 text-amber-600',
  hired: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-600',
};

export default function MyWorkDashboard() {
  const { user } = useAuth();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['my-work', user?.id],
    queryFn: () => fetchMyWork(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const { assignedJobs = [], createdJobs = [], recentCVs = [], pipelineEntries = [] } = data || {};

  const activeJobsCount = assignedJobs.filter(j => j.status === 'active').length;
  const totalPipelineCandidates = assignedJobs.reduce((sum, j) => sum + (j.pipeline_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Work</h2>
          <p className="text-muted-foreground">Your assigned work and recent contributions</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeJobsCount}</p>
                <p className="text-sm text-muted-foreground">Active Jobs Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <GitBranch className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPipelineCandidates}</p>
                <p className="text-sm text-muted-foreground">Pipeline Candidates</p>
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
                <p className="text-2xl font-bold">{recentCVs.length}</p>
                <p className="text-sm text-muted-foreground">CVs Added Recently</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pipelineEntries.length}</p>
                <p className="text-sm text-muted-foreground">My Pipeline Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs Assigned to Me */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Jobs Assigned to Me
                </CardTitle>
                <CardDescription>Jobs you're responsible for filling</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin?tab=jobs">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assignedJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No jobs assigned to you yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedJobs.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    to={`/admin?tab=pipeline&job=${job.id}`}
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.reference_id} • {job.location}</p>
                      </div>
                      <Badge className={cn("shrink-0", STATUS_COLORS[job.status])}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {job.pipeline_count} candidates
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent CVs I Added */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent CVs I Added
                </CardTitle>
                <CardDescription>CVs you've added to the database</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin?tab=submissions">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentCVs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>You haven't added any CVs yet</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/admin?tab=add-cv">
                    Add your first CV
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCVs.slice(0, 5).map((cv) => (
                  <div
                    key={cv.id}
                    className="p-3 rounded-lg border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{cv.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {cv.job_title || 'No job title'}
                        </p>
                      </div>
                      {cv.cv_score !== null && (
                        <Badge 
                          variant="secondary"
                          className={cn(
                            "shrink-0",
                            cv.cv_score >= 70 ? "bg-emerald-500/10 text-emerald-600" :
                            cv.cv_score >= 50 ? "bg-amber-500/10 text-amber-600" :
                            "bg-red-500/10 text-red-600"
                          )}
                        >
                          {cv.cv_score}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(cv.created_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Pipeline Entries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  My Pipeline Entries
                </CardTitle>
                <CardDescription>Candidates assigned to you in the pipeline</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin?tab=pipeline">View pipeline</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pipelineEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No pipeline entries assigned to you</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pipelineEntries.slice(0, 6).map((entry: PipelineEntry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {entry.cv_submissions?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.jobs?.title || 'Unknown job'}
                        </p>
                      </div>
                      <Badge className={cn("shrink-0", STAGE_COLORS[entry.stage] || 'bg-gray-500/10')}>
                        {entry.stage}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{entry.jobs?.reference_id}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
                    </div>
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
