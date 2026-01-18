import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Kanban, Plus, Upload, List, Activity, Zap, Loader2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SubmissionCard } from '../shared/SubmissionCard';
import { SubmissionsSkeleton } from '../shared/SubmissionsSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { AIProfilePreview } from './AIProfilePreview';
import CVScoreBadge from '../CVScoreBadge';
import CVManualEntry from '../CVManualEntry';
import CVBulkImport from '../CVBulkImport';
import CVUploaderActivityLog from '../CVUploaderActivityLog';
import { usePermissions } from '@/hooks/usePermissions';
import type { CVSubmission, CVForPipeline } from './types';

interface CVSubmissionsListProps {
  submissions: CVSubmission[];
  isLoading: boolean;
  isFullAdmin: boolean;
  isCvUploader: boolean;
  isRescoring: boolean;
  rescoreProgress: { current: number; total: number };
  onDeleteCV: (id: string, name: string) => void;
  isDeleting: boolean;
  onAddToPipeline: (cv: CVForPipeline) => void;
  onRescoreAll: () => void;
  onSuccess: () => void;
}

export function CVSubmissionsList({
  submissions,
  isLoading,
  isFullAdmin,
  isCvUploader,
  isRescoring,
  rescoreProgress,
  onDeleteCV,
  isDeleting,
  onAddToPipeline,
  onRescoreAll,
  onSuccess,
}: CVSubmissionsListProps) {
  const [cvSubTab, setCvSubTab] = useState('all-cvs');
  const { hasPermission } = usePermissions();

  const unscoredCount = submissions.filter(cv => 
    (cv.cv_score === null || cv.cv_score === undefined) && cv.cv_file_url
  ).length;

  const handleAddToPipeline = (cv: CVSubmission) => {
    onAddToPipeline({ 
      id: cv.id, 
      name: cv.name, 
      email: cv.email,
      job_title: cv.job_title 
    });
  };

  const renderCVActions = (submission: CVSubmission) => (
    <>
      {isFullAdmin && submission.cv_score !== null && submission.cv_score !== undefined && (
        <CVScoreBadge 
          score={submission.cv_score} 
          breakdown={submission.cv_score_breakdown}
          size="sm"
        />
      )}
      {submission.source && (
        <Badge variant={submission.source === 'website' ? 'default' : submission.source === 'admin_manual' ? 'secondary' : 'outline'}>
          {submission.source === 'website' ? 'Website' : submission.source === 'admin_manual' ? 'Manual' : 'Bulk'}
        </Badge>
      )}
      {submission.sector && (
        <Badge variant="outline">{submission.sector}</Badge>
      )}
      {hasPermission('cv.view') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              aria-label={`View full profile for ${submission.name}`}
            >
              <Link to={`/admin/candidate/${submission.id}`}>
                <User className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>View Full Profile</TooltipContent>
        </Tooltip>
      )}
      {isFullAdmin && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteCV(submission.id, submission.name)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={isDeleting}
              aria-label={`Delete CV for ${submission.name}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete CV</TooltipContent>
        </Tooltip>
      )}
      {hasPermission('pipeline.create') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAddToPipeline(submission)}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              aria-label={`Add ${submission.name} to pipeline`}
            >
              <Kanban className="w-4 h-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add to Pipeline</TooltipContent>
        </Tooltip>
      )}
    </>
  );

  const renderCVList = () => {
    if (isLoading) {
      return <SubmissionsSkeleton />;
    }

    if (submissions.length === 0) {
      return (
        <EmptyState
          icon={FileText}
          description={isCvUploader 
            ? "No CV submissions found. Add some CVs to get started."
            : "No CV submissions yet."
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        {submissions.map((submission) => (
          <SubmissionCard
            key={submission.id}
            title={submission.name}
            titleIcon={<FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />}
            subtitle={
              submission.job_title 
                ? `${submission.job_title}${submission.location ? ` • ${submission.location}` : ''}`
                : undefined
            }
            contactInfo={{
              email: submission.email,
              phone: submission.phone,
              location: isCvUploader ? submission.location : undefined,
            }}
            createdAt={submission.created_at}
            message={submission.message}
            cvFileUrl={submission.cv_file_url}
            cvDownloadName={submission.name}
            actions={renderCVActions(submission)}
          >
            {/* AI Profile Preview */}
            {submission.ai_profile && (
              <AIProfilePreview 
                aiProfile={submission.ai_profile} 
                cvScore={submission.cv_score}
              />
            )}
            {submission.admin_notes && (
              <div className="pt-2 border-t border-dashed">
                <p className="text-sm text-muted-foreground mb-2">Admin Notes:</p>
                <p className="text-sm break-words bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md border border-dashed border-yellow-200 dark:border-yellow-800">
                  {submission.admin_notes}
                </p>
              </div>
            )}
          </SubmissionCard>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* CV Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
        <div>
          <h3 className="font-semibold text-lg">CV Database</h3>
          <p className="text-sm text-muted-foreground">
            {submissions.length} CVs {isCvUploader ? 'visible (your submissions from last 3 days)' : 'in database'}
            {!isCvUploader && unscoredCount > 0 && (
              <span className="text-amber-600 ml-2">
                ({unscoredCount} unscored)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isCvUploader && (
            isRescoring ? (
              <div className="flex items-center gap-3 px-4 py-2 bg-background rounded-md border">
                <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Scoring {rescoreProgress.current}/{rescoreProgress.total}
                  </span>
                  <Progress 
                    value={(rescoreProgress.current / rescoreProgress.total) * 100} 
                    className="w-32 h-2"
                    aria-label="Scoring progress"
                  />
                </div>
              </div>
            ) : (
              <Button 
                onClick={onRescoreAll}
                variant="outline"
                className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                disabled={unscoredCount === 0}
                aria-label={`Re-score ${unscoredCount} CVs`}
              >
                <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
                Re-score CVs
              </Button>
            )
          )}
          <Button 
            onClick={() => setCvSubTab('add-single')}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add CV
          </Button>
          <Button 
            onClick={() => setCvSubTab('bulk-import')}
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            Bulk Import
          </Button>
        </div>
      </div>

      <Tabs value={cvSubTab} onValueChange={setCvSubTab} className="space-y-4">
        <TabsList className={`w-full flex flex-wrap ${isCvUploader ? 'sm:grid sm:grid-cols-3' : 'sm:grid sm:grid-cols-4'} gap-1 h-auto p-1.5`}>
          <TabsTrigger value="all-cvs" className="flex items-center gap-1.5 px-2 sm:px-3">
            <List className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{isCvUploader ? 'My CVs' : 'All CVs'}</span>
            <span className="sm:hidden">{isCvUploader ? 'CVs' : 'All'}</span>
          </TabsTrigger>
          <TabsTrigger value="add-single" className="flex items-center gap-1.5 px-2 sm:px-3">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add Single</span>
            <span className="sm:hidden">Add</span>
          </TabsTrigger>
          <TabsTrigger value="bulk-import" className="flex items-center gap-1.5 px-2 sm:px-3">
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Bulk Import</span>
            <span className="sm:hidden">Bulk</span>
          </TabsTrigger>
          {!isCvUploader && (
            <TabsTrigger value="activity-log" className="flex items-center gap-1.5 px-2 sm:px-3">
              <Activity className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Activity Log</span>
              <span className="sm:hidden">Log</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all-cvs" className="space-y-4">
          {renderCVList()}
        </TabsContent>

        <TabsContent value="add-single">
          <CVManualEntry onSuccess={onSuccess} />
        </TabsContent>

        <TabsContent value="bulk-import">
          <CVBulkImport onSuccess={onSuccess} />
        </TabsContent>

        {!isCvUploader && (
          <TabsContent value="activity-log">
            <CVUploaderActivityLog />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
