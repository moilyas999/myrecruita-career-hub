import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, LayoutGrid, List, RefreshCw, Users, UserPlus, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { usePipeline, useUpdatePipelineStage, useDeletePipelineEntry } from '@/hooks/usePipeline';
import { usePermissions } from '@/hooks/usePermissions';
import PipelineColumn from './pipeline/PipelineColumn';
import PipelineDetailSheet from './pipeline/PipelineDetailSheet';
import CandidateSearchDialog from './pipeline/CandidateSearchDialog';
import AddToPipelineDialog from './pipeline/AddToPipelineDialog';
import {
  STAGE_CONFIG,
  ACTIVE_STAGES,
  TERMINAL_STAGES,
  type PipelineStage,
  type PipelineEntryWithDetails,
  type PipelineFilters,
} from '@/types/pipeline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function CandidatePipeline() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read jobId from URL params for deep linking from JobDetailPage
  const urlJobId = searchParams.get('jobId');
  
  const [filters, setFilters] = useState<PipelineFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>(urlJobId || 'all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedEntry, setSelectedEntry] = useState<PipelineEntryWithDetails | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  
  // Sync URL param changes to state
  useEffect(() => {
    if (urlJobId && urlJobId !== selectedJob) {
      setSelectedJob(urlJobId);
    }
  }, [urlJobId]);
  
  // Update URL when job filter changes (for shareable links)
  const handleJobFilterChange = useCallback((value: string) => {
    setSelectedJob(value);
    if (value === 'all') {
      searchParams.delete('jobId');
    } else {
      searchParams.set('jobId', value);
    }
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);
  const [dragTargetStage, setDragTargetStage] = useState<PipelineStage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  
  // New state for candidate search and add dialogs
  const [candidateSearchOpen, setCandidateSearchOpen] = useState(false);
  const [addToPipelineOpen, setAddToPipelineOpen] = useState(false);
  const [selectedCVForPipeline, setSelectedCVForPipeline] = useState<{
    id: string;
    name: string;
    email: string;
    job_title?: string | null;
  } | null>(null);

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('pipeline.create');
  const canUpdate = hasPermission('pipeline.update');
  const canDelete = hasPermission('pipeline.delete');

  // Fetch pipeline data
  const pipelineFilters = useMemo(() => ({
    ...filters,
    jobId: selectedJob !== 'all' ? selectedJob : undefined,
    search: searchQuery || undefined,
  }), [filters, selectedJob, searchQuery]);

  const { data: pipelineData, isLoading, refetch } = usePipeline(pipelineFilters);

  // Fetch jobs for filter dropdown
  const { data: jobs } = useQuery({
    queryKey: [...queryKeys.jobs, 'active-for-pipeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, reference_id')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStage = useUpdatePipelineStage();
  const deleteEntry = useDeletePipelineEntry();

  // Group entries by stage
  const entriesByStage = useMemo(() => {
    const grouped: Record<PipelineStage, PipelineEntryWithDetails[]> = {} as any;
    
    // Initialize all stages with empty arrays
    [...ACTIVE_STAGES, ...TERMINAL_STAGES].forEach(stage => {
      grouped[stage] = [];
    });

    // Group entries
    pipelineData?.forEach(entry => {
      if (grouped[entry.stage]) {
        grouped[entry.stage].push(entry);
      }
    });

    // Sort by priority within each stage
    Object.keys(grouped).forEach(stage => {
      grouped[stage as PipelineStage].sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
    });

    return grouped;
  }, [pipelineData]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: pipelineData?.length || 0,
    active: pipelineData?.filter(e => ACTIVE_STAGES.includes(e.stage as any)).length || 0,
    placed: pipelineData?.filter(e => e.stage === 'placed').length || 0,
  }), [pipelineData]);

  // Handlers
  const handleStageChange = useCallback(async (id: string, newStage: PipelineStage) => {
    if (!canUpdate) return;
    await updateStage.mutateAsync({ id, stage: newStage });
  }, [canUpdate, updateStage]);

  const handleViewDetails = useCallback((entry: PipelineEntryWithDetails) => {
    setSelectedEntry(entry);
    setDetailSheetOpen(true);
  }, []);

  const handleViewCV = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const handleRemove = useCallback((id: string) => {
    if (!canDelete) return;
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  }, [canDelete]);

  const confirmDelete = async () => {
    if (entryToDelete) {
      await deleteEntry.mutateAsync(entryToDelete);
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    setDragTargetStage(stage);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    setDragTargetStage(null);
    
    const pipelineId = e.dataTransfer.getData('pipelineId');
    if (pipelineId && canUpdate) {
      await handleStageChange(pipelineId, stage);
    }
  }, [canUpdate, handleStageChange]);

  // Handle candidate selection from search dialog
  const handleCandidateSelected = useCallback((candidate: {
    id: string;
    name: string;
    email: string;
    job_title?: string | null;
  }) => {
    setSelectedCVForPipeline({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      job_title: candidate.job_title,
    });
    setCandidateSearchOpen(false);
    setAddToPipelineOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Candidate Pipeline</h2>
          <p className="text-muted-foreground">
            Track candidates through the recruitment process
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button onClick={() => setCandidateSearchOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Candidate</span>
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="rounded-none"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.placed}</p>
                <p className="text-sm text-muted-foreground">Placed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedJob} onValueChange={handleJobFilterChange}>
              <SelectTrigger className="w-full sm:w-64">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs?.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.reference_id} - {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ACTIVE_STAGES.map((stage) => (
            <div key={stage} className="min-w-[280px]">
              <Skeleton className="h-12 rounded-t-lg" />
              <Skeleton className="h-96 rounded-b-lg mt-1" />
            </div>
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <>
          {/* Empty state overlay for Kanban when no candidates */}
          {pipelineData?.length === 0 && (
            <Card className="mb-4 border-dashed bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Get Started with Your Pipeline</h3>
                      <p className="text-sm text-muted-foreground">
                        Add candidates from your CV database to begin tracking their journey.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canCreate && (
                      <Button onClick={() => setCandidateSearchOpen(true)} className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add Candidate
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/admin?tab=submissions')}
                      className="gap-2"
                    >
                      <Database className="w-4 h-4" />
                      Browse CVs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 min-h-[500px]">
              {ACTIVE_STAGES.map((stage) => (
                <PipelineColumn
                  key={stage}
                  stageConfig={STAGE_CONFIG[stage]}
                  entries={entriesByStage[stage] || []}
                  onStageChange={handleStageChange}
                  onViewDetails={handleViewDetails}
                  onViewCV={handleViewCV}
                  onRemove={handleRemove}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragTarget={dragTargetStage === stage}
                />
              ))}
              
              {/* Terminal stages in a collapsed view */}
              <div className="min-w-[280px] space-y-4">
                {TERMINAL_STAGES.map((stage) => (
                  <Card key={stage} className="border-dashed">
                    <CardHeader className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${STAGE_CONFIG[stage].color.replace('border-', 'bg-')}`} />
                          <CardTitle className="text-sm font-medium">
                            {STAGE_CONFIG[stage].label}
                          </CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {entriesByStage[stage]?.length || 0}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </>
      ) : (
        // List view - simplified table
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {pipelineData?.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleViewDetails(entry)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{entry.cv_submission?.name}</p>
                      <p className="text-sm text-muted-foreground">{entry.cv_submission?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">{entry.job?.title}</p>
                      <p className="text-xs text-muted-foreground">{entry.job?.reference_id}</p>
                    </div>
                    <Badge className={`${STAGE_CONFIG[entry.stage].bgColor} ${STAGE_CONFIG[entry.stage].textColor}`}>
                      {STAGE_CONFIG[entry.stage].label}
                    </Badge>
                  </div>
                </div>
              ))}
              {pipelineData?.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No candidates in pipeline</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start building your recruitment pipeline by adding candidates from your CV database.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {canCreate && (
                      <Button onClick={() => setCandidateSearchOpen(true)} className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add Candidate
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/admin?tab=submissions')}
                      className="gap-2"
                    >
                      <Database className="w-4 h-4" />
                      Browse CV Database
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet */}
      <PipelineDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        entry={selectedEntry}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Pipeline?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the candidate from this job's pipeline. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Candidate Search Dialog */}
      <CandidateSearchDialog
        open={candidateSearchOpen}
        onOpenChange={setCandidateSearchOpen}
        onSelectCandidate={handleCandidateSelected}
      />

      {/* Add to Pipeline Dialog */}
      <AddToPipelineDialog
        open={addToPipelineOpen}
        onOpenChange={setAddToPipelineOpen}
        cvSubmission={selectedCVForPipeline}
      />
    </div>
  );
}
