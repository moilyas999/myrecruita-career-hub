import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, RefreshCw, Search, Filter, X, AlertCircle, LayoutGrid, List, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useJobs, useDeleteJob } from '@/hooks/useJobs';
import { useClients } from '@/hooks/useClients';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { usePermissions } from '@/hooks/usePermissions';
import { queryKeys } from '@/lib/queryKeys';
import { JobCard, JobFormDialog, JobFilters as JobFiltersComponent, JobMetricsDashboard } from '@/components/admin/jobs';
import { AccessDenied } from '@/components/admin/shared';
import type { Job, JobFilters as JobFiltersType, JobStatus, JobPriority } from '@/types/job';

// View mode types
type ViewMode = 'grid' | 'list' | 'metrics';

export default function JobsManagement() {
  const navigate = useNavigate();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  
  // Permission checks
  const canView = hasPermission('jobs.view');
  const canCreate = hasPermission('jobs.create');
  const canEdit = hasPermission('jobs.update');
  const canDelete = hasPermission('jobs.delete');

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState<JobFiltersType>({
    status: undefined,
    clientId: undefined,
    priority: undefined,
    search: undefined,
  });

  // Data hooks
  const { data: jobs = [], isLoading, refetch, isFetching, error } = useJobs(filters);
  const { data: clients = [] } = useClients();
  const deleteJob = useDeleteJob();

  // Real-time subscription for live updates
  useRealtimeSubscription({
    table: 'jobs',
    queryKeys: [queryKeys.jobs, queryKeys.jobMetrics, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New job created: ${data.title}`,
      update: (data) => `Job updated: ${data.title}`,
      delete: () => 'Job deleted',
    },
  });

  // Filter change handlers
  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }));
  };

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      clientId: undefined,
      priority: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters = filters.status?.length || filters.clientId || filters.priority?.length || filters.search;

  // Job actions
  const handleEdit = (job: Job) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit jobs');
      return;
    }
    setEditingJob(job);
    setIsDialogOpen(true);
  };

  const handleDelete = async (job: Job) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete jobs');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${job.title}"?`)) return;
    try {
      await deleteJob.mutateAsync({ id: job.id, title: job.title });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleViewJob = (job: Job) => {
    navigate(`/admin/job/${job.id}`);
  };

  const handleCreateNew = () => {
    setEditingJob(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingJob(null);
    }
  };

  // Loading and permission states
  if (permissionsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!canView) {
    return <AccessDenied message="You do not have permission to view jobs." />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Failed to load jobs</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Jobs Management</h2>
          <p className="text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-md border border-input overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none border-x border-input"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'metrics' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('metrics')}
              className="rounded-none"
              aria-label="Metrics view"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {canCreate && (
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Dashboard View */}
      {viewMode === 'metrics' && <JobMetricsDashboard />}

      {/* Grid/List Views */}
      {viewMode !== 'metrics' && (
        <>
          {/* Filters */}
          <JobFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            clients={clients}
          />

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.search && (
                <Badge variant="secondary">
                  Search: {filters.search}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: undefined }))}
                    className="ml-1 hover:text-destructive"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status?.map(s => (
                <Badge key={s} variant="secondary">
                  Status: {s}
                  <button
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      status: prev.status?.filter(x => x !== s),
                    }))}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${s} status filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.clientId && (
                <Badge variant="secondary">
                  Client: {clients.find(c => c.id === filters.clientId)?.company_name || 'Unknown'}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, clientId: undefined }))}
                    className="ml-1 hover:text-destructive"
                    aria-label="Remove client filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.priority?.map(p => (
                <Badge key={p} variant="secondary">
                  Priority: {p}
                  <button
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      priority: prev.priority?.filter(x => x !== p),
                    }))}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${p} priority filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && jobs.length === 0 && (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to find what you\'re looking for.'
                    : 'Get started by creating your first job posting.'}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  canCreate && (
                    <Button onClick={handleCreateNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Job
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {/* Jobs Grid/List */}
          {!isLoading && jobs.length > 0 && (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={handleViewJob}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  compact={viewMode === 'list'}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Job Form Dialog */}
      <JobFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        job={editingJob}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
