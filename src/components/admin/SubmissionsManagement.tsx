import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, FileText, User, Briefcase, Download, RefreshCw, Plus, Upload, List, MapPin, Trash2, Zap, Loader2, Activity, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import CVManualEntry from './CVManualEntry';
import CVBulkImport from './CVBulkImport';
import CVScoreBadge from './CVScoreBadge';
import CVUploaderActivityLog from './CVUploaderActivityLog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, submissionQueryKeys } from '@/lib/queryKeys';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Skeleton } from '@/components/ui/skeleton';

interface JobApplication {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  cv_file_url?: string;
  created_at: string;
  jobs: {
    title: string;
    reference_id: string;
  };
}

interface CVSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  cv_file_url: string;
  message: string;
  created_at: string;
  source?: string;
  job_title?: string;
  sector?: string;
  location?: string;
  admin_notes?: string;
  seniority_level?: string;
  cv_score?: number | null;
  cv_score_breakdown?: any;
}

interface CareerPartnerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  message: string;
  created_at: string;
}

interface TalentRequest {
  id: string;
  talent_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  message: string;
  created_at: string;
  talent_profiles: {
    reference_id: string;
    role: string;
  };
}

interface EmployerJobSubmission {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  job_title: string;
  job_description: string;
  sector: string;
  location: string;
  job_spec_file_url?: string;
  created_at: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  inquiry_type: string;
  created_at: string;
}

// Fetch functions
const fetchJobApplications = async (): Promise<JobApplication[]> => {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`*, jobs (title, reference_id)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchCVSubmissions = async (): Promise<CVSubmission[]> => {
  const { data, error } = await supabase
    .from('cv_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchCareerPartnerRequests = async (): Promise<CareerPartnerRequest[]> => {
  const { data, error } = await supabase
    .from('career_partner_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchTalentRequests = async (): Promise<TalentRequest[]> => {
  const { data, error } = await supabase
    .from('talent_requests')
    .select(`*, talent_profiles (reference_id, role)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchEmployerJobSubmissions = async (): Promise<EmployerJobSubmission[]> => {
  const { data, error } = await supabase
    .from('employer_job_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchContactSubmissions = async (): Promise<ContactSubmission[]> => {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Loading skeleton component
function SubmissionsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SubmissionsManagement() {
  const { adminRole } = useAuth();
  const isFullAdmin = adminRole === 'admin';
  const isCvUploader = adminRole === 'cv_uploader';
  const queryClient = useQueryClient();

  const [cvSubTab, setCvSubTab] = useState('all-cvs');
  const [isRescoring, setIsRescoring] = useState(false);
  const [rescoreProgress, setRescoreProgress] = useState({ current: 0, total: 0 });

  // React Query hooks for each submission type
  const { data: jobApplications = [], isLoading: loadingJobs, isError: errorJobs, refetch: refetchJobs } = useQuery({
    queryKey: queryKeys.jobApplications,
    queryFn: fetchJobApplications,
    enabled: isFullAdmin,
  });

  const { data: cvSubmissions = [], isLoading: loadingCVs, isError: errorCVs, refetch: refetchCVs } = useQuery({
    queryKey: queryKeys.cvSubmissions,
    queryFn: fetchCVSubmissions,
  });

  const { data: careerRequests = [], isLoading: loadingCareer, isError: errorCareer, refetch: refetchCareer } = useQuery({
    queryKey: queryKeys.careerPartnerRequests,
    queryFn: fetchCareerPartnerRequests,
    enabled: isFullAdmin,
  });

  const { data: talentRequests = [], isLoading: loadingTalent, isError: errorTalent, refetch: refetchTalent } = useQuery({
    queryKey: queryKeys.talentRequests,
    queryFn: fetchTalentRequests,
    enabled: isFullAdmin,
  });

  const { data: employerJobSubmissions = [], isLoading: loadingEmployer, isError: errorEmployer, refetch: refetchEmployer } = useQuery({
    queryKey: queryKeys.employerJobSubmissions,
    queryFn: fetchEmployerJobSubmissions,
    enabled: isFullAdmin,
  });

  const { data: contactSubmissions = [], isLoading: loadingContact, isError: errorContact, refetch: refetchContact } = useQuery({
    queryKey: queryKeys.contactSubmissions,
    queryFn: fetchContactSubmissions,
    enabled: isFullAdmin,
  });

  // Real-time subscriptions for all submission types
  useRealtimeSubscription({
    table: 'job_applications',
    queryKeys: [queryKeys.jobApplications, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New job application: ${data.name}`,
    },
  });

  useRealtimeSubscription({
    table: 'cv_submissions',
    queryKeys: [queryKeys.cvSubmissions, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New CV submission: ${data.name}`,
      delete: () => 'CV submission deleted',
    },
  });

  useRealtimeSubscription({
    table: 'career_partner_requests',
    queryKeys: [queryKeys.careerPartnerRequests, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New career partner request: ${data.name}`,
    },
  });

  useRealtimeSubscription({
    table: 'talent_requests',
    queryKeys: [queryKeys.talentRequests, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New talent request from ${data.company_name}`,
    },
  });

  useRealtimeSubscription({
    table: 'employer_job_submissions',
    queryKeys: [queryKeys.employerJobSubmissions, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New employer job submission: ${data.job_title}`,
    },
  });

  useRealtimeSubscription({
    table: 'contact_submissions',
    queryKeys: [queryKeys.contactSubmissions, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New contact form submission: ${data.name}`,
    },
  });

  // Delete CV mutation with optimistic update
  const deleteCVMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cv_submissions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cvSubmissions });
      const previousCVs = queryClient.getQueryData<CVSubmission[]>(queryKeys.cvSubmissions);
      queryClient.setQueryData<CVSubmission[]>(queryKeys.cvSubmissions, (old) =>
        old?.filter((cv) => cv.id !== id) || []
      );
      return { previousCVs };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(queryKeys.cvSubmissions, context?.previousCVs);
      toast.error('Failed to delete CV submission');
      console.error('Delete error:', err);
    },
    onSuccess: () => {
      toast.success('CV submission deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
  });

  const handleDownloadCV = async (cvUrl: string, applicantName: string) => {
    try {
      if (cvUrl.includes('cv-uploads/')) {
        const filePath = cvUrl.split('/cv-uploads/')[1];
        const { data, error } = await supabase.storage
          .from('cv-uploads')
          .createSignedUrl(filePath, 3600);
        if (error) {
          toast.error('Failed to generate download link');
          return;
        }
        window.open(data.signedUrl, '_blank');
      } else {
        window.open(cvUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to download CV');
    }
  };

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
      const { data, error } = await supabase.functions.invoke('rescore-cvs');
      if (error) throw error;
      toast.success(`Started re-scoring ${data.count} CVs in background. Refresh to see updated scores.`);
    } catch (error: any) {
      console.error('Failed to start background rescoring:', error);
      toast.error('Failed to start re-scoring: ' + error.message);
    } finally {
      setIsRescoring(false);
    }
  };

  const exportAllEmails = () => {
    const allEmails: Array<{
      email: string;
      name: string;
      source: string;
      date: string;
    }> = [];

    jobApplications.forEach(app => allEmails.push({
      email: app.email,
      name: app.name,
      source: 'Job Application',
      date: app.created_at
    }));

    cvSubmissions.forEach(cv => allEmails.push({
      email: cv.email,
      name: cv.name,
      source: 'CV Submission',
      date: cv.created_at
    }));

    careerRequests.forEach(req => allEmails.push({
      email: req.email,
      name: req.name,
      source: 'Career Partner Request',
      date: req.created_at
    }));

    talentRequests.forEach(req => allEmails.push({
      email: req.email,
      name: req.contact_name,
      source: 'Talent Request',
      date: req.created_at
    }));

    employerJobSubmissions.forEach(sub => allEmails.push({
      email: sub.email,
      name: sub.contact_name,
      source: 'Employer Job Post',
      date: sub.created_at
    }));

    contactSubmissions.forEach(sub => allEmails.push({
      email: sub.email,
      name: sub.name,
      source: 'Contact Form',
      date: sub.created_at
    }));

    const uniqueEmails = Array.from(
      new Map(allEmails.map(e => [e.email.toLowerCase(), e])).values()
    );

    const csvContent = [
      ['Email', 'Name', 'Source', 'Submission Date'].join(','),
      ...uniqueEmails.map(e => 
        [`"${e.email}"`, `"${e.name.replace(/"/g, '""')}"`, `"${e.source}"`, `"${new Date(e.date).toLocaleDateString()}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myrecruita-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${uniqueEmails.length} unique emails`);
  };

  const handleRefreshAll = () => {
    submissionQueryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
  };

  const handleCVSuccess = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
  };

  // Combined loading state for initial load
  const isInitialLoading = loadingCVs || (isFullAdmin && (loadingJobs || loadingCareer || loadingTalent || loadingEmployer || loadingContact));
  
  // Check for any errors
  const hasError = errorCVs || (isFullAdmin && (errorJobs || errorCareer || errorTalent || errorEmployer || errorContact));

  if (hasError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-medium mb-2">Failed to load submissions</p>
          <p className="text-sm text-muted-foreground mb-4">There was an error loading the submission data.</p>
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{isCvUploader ? 'CV Submissions' : 'Submissions Management'}</h2>
          <p className="text-muted-foreground">
            {isCvUploader 
              ? 'View and manage your CV submissions from the last 3 days' 
              : 'View and manage all form submissions'}
          </p>
        </div>
        <div className="flex gap-2">
          {isFullAdmin && (
            <Button onClick={exportAllEmails} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export All Emails
            </Button>
          )}
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {isCvUploader ? (
        // CV Uploader only sees CV submissions
        <div className="space-y-4">
          {/* CV Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
            <div>
              <h3 className="font-semibold text-lg">CV Database</h3>
              <p className="text-sm text-muted-foreground">{cvSubmissions.length} CVs visible (your submissions from last 3 days)</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setCvSubTab('add-single')}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add CV
              </Button>
              <Button 
                onClick={() => setCvSubTab('bulk-import')}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </div>
          </div>

          <Tabs value={cvSubTab} onValueChange={setCvSubTab} className="space-y-4">
            <TabsList className="w-full flex flex-wrap sm:grid sm:grid-cols-3 gap-1 h-auto p-1.5">
              <TabsTrigger value="all-cvs" className="flex items-center gap-1.5 px-2 sm:px-3">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">My CVs</span>
                <span className="sm:hidden">CVs</span>
              </TabsTrigger>
              <TabsTrigger value="add-single" className="flex items-center gap-1.5 px-2 sm:px-3">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Single</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
              <TabsTrigger value="bulk-import" className="flex items-center gap-1.5 px-2 sm:px-3">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Import</span>
                <span className="sm:hidden">Bulk</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-cvs" className="space-y-4">
              {loadingCVs ? (
                <SubmissionsSkeleton />
              ) : cvSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No CV submissions found. Add some CVs to get started.
                  </CardContent>
                </Card>
              ) : (
                cvSubmissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="break-words">{submission.name}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                          {submission.source && (
                            <Badge variant="outline" className="text-xs">
                              {submission.source}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {(submission.job_title || submission.sector) && (
                        <CardDescription className="break-words">
                          {submission.job_title && <span>{submission.job_title}</span>}
                          {submission.job_title && submission.sector && <span> • </span>}
                          {submission.sector && <span>{submission.sector}</span>}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 text-sm">
                          <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Email:</p>
                            <a href={`mailto:${submission.email}`} className="text-primary hover:underline break-all">
                              {submission.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Phone:</p>
                            <a href={`tel:${submission.phone}`} className="text-primary hover:underline break-all">
                              {submission.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      {submission.location && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Location:</p>
                            <p>{submission.location}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Submitted:</p>
                          <p>{new Date(submission.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {submission.cv_file_url && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-1">CV File:</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadCV(submission.cv_file_url, submission.name)}
                              className="h-8"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download CV
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="add-single">
              <CVManualEntry onSuccess={handleCVSuccess} />
            </TabsContent>

            <TabsContent value="bulk-import">
              <CVBulkImport onSuccess={handleCVSuccess} />
            </TabsContent>
          </Tabs>
        </div>
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
            {loadingJobs ? (
              <SubmissionsSkeleton />
            ) : jobApplications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No job applications yet.
                </CardContent>
              </Card>
            ) : (
              jobApplications.map((app) => (
                <Card key={app.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="break-words">{app.name}</span>
                    </CardTitle>
                    <Badge variant="secondary" className="self-start sm:self-auto">
                      {app.jobs?.reference_id || 'N/A'}
                    </Badge>
                  </div>
                  <CardDescription className="break-words">
                    Applied for: {app.jobs?.title || 'Unknown Job'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Email:</p>
                        <a href={`mailto:${app.email}`} className="text-primary hover:underline break-all">
                          {app.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Phone:</p>
                        <a href={`tel:${app.phone}`} className="text-primary hover:underline break-all">
                          {app.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Submitted:</p>
                      <p>{new Date(app.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {app.cv_file_url && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">CV File:</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCV(app.cv_file_url!, app.name)}
                          className="h-8"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download CV
                        </Button>
                      </div>
                    </div>
                  )}
                  {app.message && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Message:</p>
                      <p className="text-sm break-words bg-muted/50 p-3 rounded-md">{app.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="cv-submissions" className="space-y-4">
          {/* Prominent Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
            <div>
              <h3 className="font-semibold text-lg">CV Database</h3>
              <p className="text-sm text-muted-foreground">
                {cvSubmissions.length} CVs in database
                {cvSubmissions.filter(cv => cv.cv_score === null || cv.cv_score === undefined).length > 0 && (
                  <span className="text-amber-600 ml-2">
                    ({cvSubmissions.filter(cv => (cv.cv_score === null || cv.cv_score === undefined) && cv.cv_file_url).length} unscored)
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isRescoring ? (
                <div className="flex items-center gap-3 px-4 py-2 bg-background rounded-md border">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      Scoring {rescoreProgress.current}/{rescoreProgress.total}
                    </span>
                    <Progress 
                      value={(rescoreProgress.current / rescoreProgress.total) * 100} 
                      className="w-32 h-2"
                    />
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleRescoreAllCVs}
                  variant="outline"
                  className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                  disabled={cvSubmissions.filter(cv => (cv.cv_score === null || cv.cv_score === undefined) && cv.cv_file_url).length === 0}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Re-score CVs
                </Button>
              )}
              <Button 
                onClick={() => setCvSubTab('add-single')}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add CV
              </Button>
              <Button 
                onClick={() => setCvSubTab('bulk-import')}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </div>
          </div>

          <Tabs value={cvSubTab} onValueChange={setCvSubTab} className="space-y-4">
            <TabsList className="w-full flex flex-wrap sm:grid sm:grid-cols-4 gap-1 h-auto p-1.5">
              <TabsTrigger value="all-cvs" className="flex items-center gap-1.5 px-2 sm:px-3">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">All CVs</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="add-single" className="flex items-center gap-1.5 px-2 sm:px-3">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Single</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
              <TabsTrigger value="bulk-import" className="flex items-center gap-1.5 px-2 sm:px-3">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Import</span>
                <span className="sm:hidden">Bulk</span>
              </TabsTrigger>
              <TabsTrigger value="activity-log" className="flex items-center gap-1.5 px-2 sm:px-3">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Activity Log</span>
                <span className="sm:hidden">Log</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-cvs" className="space-y-4">
              {loadingCVs ? (
                <SubmissionsSkeleton />
              ) : cvSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No CV submissions yet.
                  </CardContent>
                </Card>
              ) : (
                cvSubmissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="break-words">{submission.name}</span>
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
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
                          {isFullAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCV(submission.id, submission.name)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              disabled={deleteCVMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardDescription className="flex flex-wrap gap-2">
                        {submission.job_title && <span>{submission.job_title}</span>}
                        {submission.location && (
                          <span className="flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3" />
                            {submission.location}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 text-sm">
                          <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Email:</p>
                            <a href={`mailto:${submission.email}`} className="text-primary hover:underline break-all">
                              {submission.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Phone:</p>
                            <a href={`tel:${submission.phone}`} className="text-primary hover:underline break-all">
                              {submission.phone || '-'}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Submitted:</p>
                          <p>{new Date(submission.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {submission.cv_file_url && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-1">CV File:</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadCV(submission.cv_file_url, submission.name)}
                              className="h-8"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download CV
                            </Button>
                          </div>
                        </div>
                      )}
                      {submission.message && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Message:</p>
                          <p className="text-sm break-words bg-muted/50 p-3 rounded-md">{submission.message}</p>
                        </div>
                      )}
                      {submission.admin_notes && (
                        <div className="pt-2 border-t border-dashed">
                          <p className="text-sm text-muted-foreground mb-2">Admin Notes:</p>
                          <p className="text-sm break-words bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md border border-dashed border-yellow-200 dark:border-yellow-800">{submission.admin_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="add-single">
              <CVManualEntry onSuccess={handleCVSuccess} />
            </TabsContent>

            <TabsContent value="bulk-import">
              <CVBulkImport onSuccess={handleCVSuccess} />
            </TabsContent>

            <TabsContent value="activity-log">
              <CVUploaderActivityLog />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="career-requests" className="space-y-4">
          {loadingCareer ? (
            <SubmissionsSkeleton />
          ) : careerRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No career partner requests yet.
              </CardContent>
            </Card>
          ) : (
            careerRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="break-words">{request.name}</span>
                    </CardTitle>
                    <Badge variant="outline" className="self-start sm:self-auto">
                      {request.service_type}
                    </Badge>
                  </div>
                  <CardDescription>Career Partner Request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Email:</p>
                        <a href={`mailto:${request.email}`} className="text-primary hover:underline break-all">
                          {request.email}
                        </a>
                      </div>
                    </div>
                    {request.phone && (
                      <div className="flex items-start gap-2 text-sm">
                        <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Phone:</p>
                          <a href={`tel:${request.phone}`} className="text-primary hover:underline break-all">
                            {request.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Submitted:</p>
                      <p>{new Date(request.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {request.message && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Message:</p>
                      <p className="text-sm break-words bg-muted/50 p-3 rounded-md">{request.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="talent-requests" className="space-y-4">
          {loadingTalent ? (
            <SubmissionsSkeleton />
          ) : talentRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No talent requests yet.
              </CardContent>
            </Card>
          ) : (
            talentRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <div className="break-words">
                        <span className="font-semibold">{request.contact_name}</span>
                        <span className="text-muted-foreground"> ({request.company_name})</span>
                      </div>
                    </CardTitle>
                    <Badge variant="secondary" className="self-start sm:self-auto">
                      {request.talent_profiles?.reference_id || 'N/A'}
                    </Badge>
                  </div>
                  <CardDescription className="break-words">
                    Interested in: {request.talent_profiles?.role || 'Unknown Role'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Email:</p>
                        <a href={`mailto:${request.email}`} className="text-primary hover:underline break-all">
                          {request.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Submitted:</p>
                        <p>{new Date(request.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  {request.message && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Message:</p>
                      <p className="text-sm break-words bg-muted/50 p-3 rounded-md">{request.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="employer-jobs" className="space-y-4">
          {loadingEmployer ? (
            <SubmissionsSkeleton />
          ) : employerJobSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No employer job submissions yet.
              </CardContent>
            </Card>
          ) : (
            employerJobSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="break-words">{submission.job_title}</span>
                    </CardTitle>
                    <Badge variant="outline" className="self-start sm:self-auto">
                      {submission.sector}
                    </Badge>
                  </div>
                  <CardDescription className="break-words">
                    {submission.company_name} - {submission.contact_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Email:</p>
                        <a href={`mailto:${submission.email}`} className="text-primary hover:underline break-all">
                          {submission.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Phone:</p>
                        <a href={`tel:${submission.phone}`} className="text-primary hover:underline break-all">
                          {submission.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Location:</p>
                        <p className="break-words">{submission.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Submitted:</p>
                        <p>{new Date(submission.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  {submission.job_spec_file_url && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Job Specification:</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCV(submission.job_spec_file_url!, `${submission.company_name}-${submission.job_title}`)}
                          className="h-8"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download Spec
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Job Description:</p>
                    <p className="text-sm break-words bg-muted/50 p-3 rounded-md">{submission.job_description}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="contact-submissions" className="space-y-4">
          {loadingContact ? (
            <SubmissionsSkeleton />
          ) : contactSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No contact form submissions yet.
              </CardContent>
            </Card>
          ) : (
            contactSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="break-words">{submission.name}</span>
                    </CardTitle>
                    <Badge variant="outline" className="self-start sm:self-auto">
                      {submission.inquiry_type}
                    </Badge>
                  </div>
                  <CardDescription className="break-words">
                    Subject: {submission.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Email:</p>
                        <a href={`mailto:${submission.email}`} className="text-primary hover:underline break-all">
                          {submission.email}
                        </a>
                      </div>
                    </div>
                    {submission.phone && (
                      <div className="flex items-start gap-2 text-sm">
                        <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Phone:</p>
                          <a href={`tel:${submission.phone}`} className="text-primary hover:underline break-all">
                            {submission.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {submission.company && (
                      <div className="flex items-start gap-2 text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Company:</p>
                          <p className="break-words">{submission.company}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Submitted:</p>
                        <p>{new Date(submission.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Message:</p>
                    <p className="text-sm break-words bg-muted/50 p-3 rounded-md">{submission.message}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
