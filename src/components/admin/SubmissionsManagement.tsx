import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import AddToPipelineDialog from './pipeline/AddToPipelineDialog';

// Import modular submission components
import {
  useSubmissionsData,
  useSubmissionsActions,
  JobApplicationsList,
  CVSubmissionsList,
  CareerRequestsList,
  TalentRequestsList,
  EmployerJobsList,
  ContactSubmissionsList,
  CVForPipeline,
} from './submissions';

export default function SubmissionsManagement() {
  const { adminRole } = useAuth();
  const isFullAdmin = adminRole === 'admin';
  const isCvUploader = adminRole === 'cv_uploader';

  const [isRescoring, setIsRescoring] = useState(false);
  const [rescoreProgress, setRescoreProgress] = useState({ current: 0, total: 0 });
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);
  const [selectedCVForPipeline, setSelectedCVForPipeline] = useState<CVForPipeline | null>(null);

  // Use modular data hook
  const {
    jobApplications,
    cvSubmissions,
    careerRequests,
    talentRequests,
    employerJobSubmissions,
    contactSubmissions,
    loadingJobs,
    loadingCVs,
    loadingCareer,
    loadingTalent,
    loadingEmployer,
    loadingContact,
    hasError,
    refetchAll,
  } = useSubmissionsData({ isFullAdmin });

  // Use modular actions hook
  const {
    deleteCVMutation,
    rescoreCVs,
    exportEmails,
    refreshAll,
    handleCVSuccess,
  } = useSubmissionsActions();

  const handleDeleteCV = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the CV submission for "${name}"? This action cannot be undone.`)) {
      return;
    }
    deleteCVMutation.mutate(id);
  };

  const handleRescoreAllCVs = async () => {
    const unscoredCount = cvSubmissions.filter(cv => 
      (cv.cv_score === null || cv.cv_score === undefined) && cv.cv_file_url
    ).length;

    if (unscoredCount === 0) {
      toast.info('All CVs with files already have scores');
      return;
    }

    if (!confirm(`This will re-score ${unscoredCount} CVs without scores in the background. You can navigate away - scores will appear when ready. Continue?`)) {
      return;
    }

    setIsRescoring(true);

    try {
      const data = await rescoreCVs();
      toast.success(`Started re-scoring ${data.count} CVs in background. Refresh to see updated scores.`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to start background rescoring:', error);
      toast.error('Failed to start re-scoring: ' + errorMessage);
    } finally {
      setIsRescoring(false);
    }
  };

  const handleExportAllEmails = () => {
    exportEmails(
      jobApplications,
      cvSubmissions,
      careerRequests,
      talentRequests,
      employerJobSubmissions,
      contactSubmissions
    );
  };

  const handleAddToPipeline = (cv: CVForPipeline) => {
    setSelectedCVForPipeline(cv);
    setPipelineDialogOpen(true);
  };

  if (hasError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" aria-hidden="true" />
          <p className="text-destructive font-medium mb-2">Failed to load submissions</p>
          <p className="text-sm text-muted-foreground mb-4">There was an error loading the submission data.</p>
          <Button onClick={refreshAll} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isCvUploader ? 'CV Submissions' : 'Submissions Management'}
          </h2>
          <p className="text-muted-foreground">
            {isCvUploader 
              ? 'View and manage your CV submissions from the last 3 days' 
              : 'View and manage all form submissions'}
          </p>
        </div>
        <div className="flex gap-2">
          {isFullAdmin && (
            <Button onClick={handleExportAllEmails} size="sm">
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Export All Emails
            </Button>
          )}
          <Button onClick={refreshAll} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      {isCvUploader ? (
        // CV Uploader only sees CV submissions
        <CVSubmissionsList
          submissions={cvSubmissions}
          isLoading={loadingCVs}
          isFullAdmin={isFullAdmin}
          isCvUploader={isCvUploader}
          isRescoring={isRescoring}
          rescoreProgress={rescoreProgress}
          onDeleteCV={handleDeleteCV}
          isDeleting={deleteCVMutation.isPending}
          onAddToPipeline={handleAddToPipeline}
          onRescoreAll={handleRescoreAllCVs}
          onSuccess={handleCVSuccess}
        />
      ) : (
        // Full admin sees all tabs
        <Tabs defaultValue="job-applications" className="space-y-6">
          <TabsList className="w-full flex flex-wrap gap-1 h-auto p-1.5">
            <TabsTrigger value="job-applications" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Job Applications</span>
              <span className="sm:hidden">Jobs</span>
              <span className="ml-1">({jobApplications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="cv-submissions" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">CV Submissions</span>
              <span className="sm:hidden">CVs</span>
              <span className="ml-1">({cvSubmissions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="career-requests" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Career Requests</span>
              <span className="sm:hidden">Career</span>
              <span className="ml-1">({careerRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="talent-requests" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Talent Requests</span>
              <span className="sm:hidden">Talent</span>
              <span className="ml-1">({talentRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="employer-jobs" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Employer Posts</span>
              <span className="sm:hidden">Employer</span>
              <span className="ml-1">({employerJobSubmissions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="contact-submissions" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Contact Forms</span>
              <span className="sm:hidden">Contact</span>
              <span className="ml-1">({contactSubmissions.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job-applications" className="space-y-4">
            <JobApplicationsList 
              applications={jobApplications} 
              isLoading={loadingJobs} 
            />
          </TabsContent>

          <TabsContent value="cv-submissions" className="space-y-4">
            <CVSubmissionsList
              submissions={cvSubmissions}
              isLoading={loadingCVs}
              isFullAdmin={isFullAdmin}
              isCvUploader={isCvUploader}
              isRescoring={isRescoring}
              rescoreProgress={rescoreProgress}
              onDeleteCV={handleDeleteCV}
              isDeleting={deleteCVMutation.isPending}
              onAddToPipeline={handleAddToPipeline}
              onRescoreAll={handleRescoreAllCVs}
              onSuccess={handleCVSuccess}
            />
          </TabsContent>

          <TabsContent value="career-requests" className="space-y-4">
            <CareerRequestsList 
              requests={careerRequests} 
              isLoading={loadingCareer} 
            />
          </TabsContent>

          <TabsContent value="talent-requests" className="space-y-4">
            <TalentRequestsList 
              requests={talentRequests} 
              isLoading={loadingTalent} 
            />
          </TabsContent>

          <TabsContent value="employer-jobs" className="space-y-4">
            <EmployerJobsList 
              submissions={employerJobSubmissions} 
              isLoading={loadingEmployer} 
            />
          </TabsContent>

          <TabsContent value="contact-submissions" className="space-y-4">
            <ContactSubmissionsList 
              submissions={contactSubmissions} 
              isLoading={loadingContact} 
            />
          </TabsContent>
        </Tabs>
      )}

      <AddToPipelineDialog
        open={pipelineDialogOpen}
        onOpenChange={setPipelineDialogOpen}
        cvSubmission={selectedCVForPipeline}
      />
    </div>
  );
}
