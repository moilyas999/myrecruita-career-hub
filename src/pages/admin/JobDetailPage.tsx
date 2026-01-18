import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useJob, useDeleteJob } from '@/hooks/useJobs';
import { usePipelineByJob } from '@/hooks/usePipeline';
import { usePermissions } from '@/hooks/usePermissions';
import { JobFormDialog, JobHeader, JobMetricsCard } from '@/components/admin/jobs';
import { AccessDenied } from '@/components/admin/shared';
import { PRIORITY_CONFIG, JOB_TYPE_CONFIG, AGEING_CONFIG } from '@/types/job';
import type { Job, JobStatus, JobPriority, JobTypeCategory } from '@/types/job';

// Status badge configuration
const STATUS_CONFIG: Record<JobStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  on_hold: { label: 'On Hold', variant: 'outline' },
  filled: { label: 'Filled', variant: 'secondary' },
  closed: { label: 'Closed', variant: 'destructive' },
};

function getAgeingStatus(createdAt: string): { status: string; days: number } {
  const days = differenceInDays(new Date(), new Date(createdAt));
  if (days <= 7) return { status: 'new', days };
  if (days <= 14) return { status: 'normal', days };
  if (days <= 30) return { status: 'ageing', days };
  return { status: 'stale', days };
}

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Permission checks
  const canView = hasPermission('jobs.view');
  const canEdit = hasPermission('jobs.update');
  const canDelete = hasPermission('jobs.delete');

  // Data hooks
  const { data: job, isLoading, error, refetch } = useJob(jobId || '');
  const { data: pipeline = [] } = usePipelineByJob(jobId || '');
  const deleteJob = useDeleteJob();

  // Calculate metrics
  const pipelineByStage = pipeline.reduce((acc, p) => {
    acc[p.stage] = (acc[p.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDelete = async () => {
    if (!job || !canDelete) return;
    if (!confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) return;
    
    try {
      await deleteJob.mutateAsync({ id: job.id, title: job.title });
      toast.success('Job deleted successfully');
      navigate('/admin?tab=jobs');
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Loading state
  if (permissionsLoading || isLoading) {
    return (
      <AdminLayout title="Loading..." description="Please wait">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  // Permission check
  if (!canView) {
    return (
      <AdminLayout title="Access Denied" description="">
        <AccessDenied message="You do not have permission to view job details." />
      </AdminLayout>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <AdminLayout title="Job Not Found" description="">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Job not found</h3>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'The job you are looking for does not exist or has been deleted.'}
          </p>
          <Button onClick={() => navigate('/admin?tab=jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const ageing = getAgeingStatus(job.created_at);
  const ageingConfig = AGEING_CONFIG[ageing.status];
  const statusConfig = STATUS_CONFIG[job.status as JobStatus] || STATUS_CONFIG.active;
  const priorityConfig = job.priority ? PRIORITY_CONFIG[job.priority as JobPriority] : null;
  const jobTypeConfig = job.job_type_category ? JOB_TYPE_CONFIG[job.job_type_category as JobTypeCategory] : null;

  return (
    <AdminLayout
      title={job.title}
      description={`${job.reference_id} • ${job.location}`}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin?tab=jobs')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                  {priorityConfig && (
                    <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} border-0`}>
                      {priorityConfig.label}
                    </Badge>
                  )}
                  {jobTypeConfig && (
                    <Badge variant="outline">
                      {jobTypeConfig.label}
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex flex-wrap items-center gap-4 text-base">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.reference_id}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(job.created_at), 'dd MMM yyyy')}
                  </span>
                </CardDescription>
              </div>

              <div className="flex gap-2">
                {canEdit && (
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteJob.isPending}
                  >
                    {deleteJob.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Client Info */}
          {job.client && (
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Client:</span>
                <Link
                  to={`/admin/client/${job.client.id}`}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {job.client.company_name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                {job.hiring_manager && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Hiring Manager:</span>
                    <span>{job.hiring_manager.name}</span>
                  </>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <JobMetricsCard
            title="Days Open"
            value={ageing.days}
            description={ageingConfig.label}
            icon={<Clock className="h-5 w-5" />}
          />
          <JobMetricsCard
            title="CVs Submitted"
            value={job.cvs_submitted_count || 0}
            icon={<FileText className="h-5 w-5" />}
          />
          <JobMetricsCard
            title="Interviews"
            value={job.interviews_scheduled_count || 0}
            icon={<Users className="h-5 w-5" />}
          />
          <JobMetricsCard
            title="Revenue Forecast"
            value={job.revenue_forecast ? `£${job.revenue_forecast.toLocaleString()}` : '-'}
            description={job.fee_percentage ? `${job.fee_percentage}% fee` : undefined}
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">
              Candidates ({pipeline.length})
            </TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                      {job.description}
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                      {job.requirements}
                    </div>
                  </CardContent>
                </Card>

                {/* Benefits */}
                {job.benefits && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                        {job.benefits}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Key Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job.salary && (
                      <div>
                        <p className="text-sm text-muted-foreground">Salary</p>
                        <p className="font-medium">{job.salary}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Sector</p>
                      <p className="font-medium">{job.sector}</p>
                    </div>
                    {job.target_fill_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Target Fill Date</p>
                        <p className="font-medium">
                          {format(new Date(job.target_fill_date), 'dd MMM yyyy')}
                        </p>
                      </div>
                    )}
                    {job.target_start_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Target Start Date</p>
                        <p className="font-medium">
                          {format(new Date(job.target_start_date), 'dd MMM yyyy')}
                        </p>
                      </div>
                    )}
                    {job.exclusivity_expires_at && (
                      <div>
                        <p className="text-sm text-muted-foreground">Exclusivity Expires</p>
                        <p className="font-medium">
                          {format(new Date(job.exclusivity_expires_at), 'dd MMM yyyy')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pipeline Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pipeline Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(pipelineByStage).length > 0 ? (
                      Object.entries(pipelineByStage).map(([stage, count]) => (
                        <div key={stage} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{stage.replace('_', ' ')}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No candidates in pipeline</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Candidates in Pipeline</CardTitle>
                <CardDescription>
                  All candidates being considered for this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pipeline.length > 0 ? (
                  <div className="space-y-4">
                    {pipeline.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {p.cv_submission?.name || 'Unknown Candidate'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {p.cv_submission?.job_title || 'No title'}
                            {p.cv_submission?.location && ` • ${p.cv_submission.location}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="capitalize">
                            {p.stage.replace('_', ' ')}
                          </Badge>
                          {p.cv_submission && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link to={`/admin/candidate/${p.cv_submission_id}`}>
                                View Profile
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No candidates in the pipeline yet</p>
                    <p className="text-sm">
                      Use the CV Matching tool to find suitable candidates
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pipeline View</CardTitle>
                    <CardDescription>
                      Track candidate progress through stages for this job
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => navigate(`/admin?tab=pipeline&jobId=${job.id}`)}
                  >
                    Open Full Pipeline
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pipeline.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(pipelineByStage)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([stage, count]) => (
                        <Card key={stage} className="text-center">
                          <CardContent className="p-4">
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {stage.replace('_', ' ')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No candidates in the pipeline yet</p>
                    <p className="text-sm mt-2">
                      Add candidates from the CV database to start tracking them
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <JobFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        job={job}
        onSuccess={() => {
          refetch();
        }}
      />
    </AdminLayout>
  );
}
