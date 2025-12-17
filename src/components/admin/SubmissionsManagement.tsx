import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, FileText, User, Briefcase, Download, ExternalLink, RefreshCw, Plus, Upload, List, MapPin, Building, Trash2, Zap, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import CVManualEntry from './CVManualEntry';
import CVBulkImport from './CVBulkImport';
import CVScoreBadge, { CVScoreBreakdown } from './CVScoreBadge';

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

export default function SubmissionsManagement() {
  const { adminRole } = useAuth();
  const isFullAdmin = adminRole === 'admin';
  const isCvUploader = adminRole === 'cv_uploader';

  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [cvSubmissions, setCvSubmissions] = useState<CVSubmission[]>([]);
  const [careerRequests, setCareerRequests] = useState<CareerPartnerRequest[]>([]);
  const [talentRequests, setTalentRequests] = useState<TalentRequest[]>([]);
  const [employerJobSubmissions, setEmployerJobSubmissions] = useState<any[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cvSubTab, setCvSubTab] = useState('all-cvs');
  const [isRescoring, setIsRescoring] = useState(false);
  const [rescoreProgress, setRescoreProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  const fetchAllSubmissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching submissions...');
      
      // Fetch job applications
      const { data: jobApps, error: jobError } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (title, reference_id)
        `)
        .order('created_at', { ascending: false });

      if (jobError) {
        console.error('Job applications error:', jobError);
        throw jobError;
      }

      // Fetch CV submissions
      const { data: cvSubs, error: cvError } = await supabase
        .from('cv_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (cvError) {
        console.error('CV submissions error:', cvError);
        throw cvError;
      }

      // Fetch career partner requests
      const { data: careerReqs, error: careerError } = await supabase
        .from('career_partner_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (careerError) {
        console.error('Career requests error:', careerError);
        throw careerError;
      }

      // Fetch talent requests
      const { data: talentReqs, error: talentError } = await supabase
        .from('talent_requests')
        .select(`
          *,
          talent_profiles (reference_id, role)
        `)
        .order('created_at', { ascending: false });

      if (talentError) {
        console.error('Talent requests error:', talentError);
        throw talentError;
      }

      // Fetch employer job submissions
      const { data: employerJobs, error: employerError } = await supabase
        .from('employer_job_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (employerError) {
        console.error('Employer job submissions error:', employerError);
        throw employerError;
      }

      // Fetch contact submissions
      const { data: contactSubs, error: contactError } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactError) {
        console.error('Contact submissions error:', contactError);
        throw contactError;
      }

      console.log('Fetched data:', {
        jobApplications: jobApps?.length || 0,
        cvSubmissions: cvSubs?.length || 0,
        careerRequests: careerReqs?.length || 0,
        talentRequests: talentReqs?.length || 0,
        employerJobSubmissions: employerJobs?.length || 0,
        contactSubmissions: contactSubs?.length || 0
      });

      setJobApplications(jobApps || []);
      setCvSubmissions(cvSubs || []);
      setCareerRequests(careerReqs || []);
      setTalentRequests(talentReqs || []);
      setEmployerJobSubmissions(employerJobs || []);
      setContactSubmissions(contactSubs || []);
    } catch (error: any) {
      console.error('Failed to fetch submissions:', error);
      toast.error('Failed to fetch submissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async (cvUrl: string, applicantName: string) => {
    try {
      if (cvUrl.includes('cv-uploads/')) {
        // Extract the file path from the URL
        const filePath = cvUrl.split('/cv-uploads/')[1];
        
        // Create a signed URL for download
        const { data, error } = await supabase.storage
          .from('cv-uploads')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) {
          toast.error('Failed to generate download link');
          return;
        }

        // Open the signed URL in a new tab
        window.open(data.signedUrl, '_blank');
      } else {
        // For external URLs, open directly
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

    try {
      const { error } = await supabase
        .from('cv_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCvSubmissions(prev => prev.filter(cv => cv.id !== id));
      toast.success('CV submission deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete CV submission: ' + error.message);
    }
  };

  const handleRescoreAllCVs = async () => {
    const unscoredCVs = cvSubmissions.filter(cv => 
      (cv.cv_score === null || cv.cv_score === undefined) && cv.cv_file_url
    );

    if (unscoredCVs.length === 0) {
      toast.info('All CVs with files already have scores');
      return;
    }

    if (!confirm(`This will re-score ${unscoredCVs.length} CVs without scores. This may take a few minutes. Continue?`)) {
      return;
    }

    setIsRescoring(true);
    setRescoreProgress({ current: 0, total: unscoredCVs.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < unscoredCVs.length; i++) {
      const cv = unscoredCVs[i];
      setRescoreProgress({ current: i + 1, total: unscoredCVs.length });

      try {
        // Extract file path from URL
        let filePath = cv.cv_file_url;
        if (filePath.includes('cv-uploads/')) {
          filePath = filePath.split('/cv-uploads/')[1];
        }

        // Call the parse-cv edge function
        const { data, error } = await supabase.functions.invoke('parse-cv', {
          body: { 
            filePath: filePath,
            fileName: cv.name + '.pdf'
          }
        });

        if (error) throw error;
        if (!data || !data.data) throw new Error('No extraction data returned');

        const extracted = data.data;

        // Update the CV submission with the score
        const { error: updateError } = await supabase
          .from('cv_submissions')
          .update({
            cv_score: extracted.cv_score || null,
            cv_score_breakdown: extracted.cv_score_breakdown || null,
            scored_at: new Date().toISOString(),
            // Also update other AI-extracted fields if they're empty
            ...(extracted.job_title && !cv.job_title ? { job_title: extracted.job_title } : {}),
            ...(extracted.sector && !cv.sector ? { sector: extracted.sector } : {}),
            ...(extracted.location && !cv.location ? { location: extracted.location } : {}),
            ...(extracted.skills && { skills: extracted.skills }),
            ...(extracted.experience_summary && { experience_summary: extracted.experience_summary }),
            ...(extracted.education_level && { education_level: extracted.education_level }),
            ...(extracted.seniority_level && { seniority_level: extracted.seniority_level }),
            ...(extracted.years_experience && { years_experience: extracted.years_experience }),
            ...(extracted.ai_profile && { ai_profile: extracted.ai_profile }),
          })
          .eq('id', cv.id);

        if (updateError) throw updateError;

        successCount++;
        console.log(`Scored CV ${i + 1}/${unscoredCVs.length}: ${cv.name} - Score: ${extracted.cv_score}`);
      } catch (error: any) {
        console.error(`Failed to score CV for ${cv.name}:`, error);
        failCount++;
      }
    }

    setIsRescoring(false);
    setRescoreProgress({ current: 0, total: 0 });
    
    // Refresh the data
    await fetchAllSubmissions();
    
    if (failCount === 0) {
      toast.success(`Successfully scored ${successCount} CVs`);
    } else {
      toast.warning(`Scored ${successCount} CVs, ${failCount} failed`);
    }
  };

  const exportAllEmails = () => {
    const allEmails: Array<{
      email: string;
      name: string;
      source: string;
      date: string;
    }> = [];

    // Collect from all sources
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

    // De-duplicate by email (keep first occurrence)
    const uniqueEmails = Array.from(
      new Map(allEmails.map(e => [e.email.toLowerCase(), e])).values()
    );

    // Generate CSV
    const csvContent = [
      ['Email', 'Name', 'Source', 'Submission Date'].join(','),
      ...uniqueEmails.map(e => 
        [`"${e.email}"`, `"${e.name.replace(/"/g, '""')}"`, `"${e.source}"`, `"${new Date(e.date).toLocaleDateString()}"`].join(',')
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myrecruita-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${uniqueEmails.length} unique emails`);
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
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
          <Button onClick={fetchAllSubmissions} variant="outline" size="sm">
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all-cvs" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">My CVs</span>
                <span className="sm:hidden">CVs</span>
              </TabsTrigger>
              <TabsTrigger value="add-single" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Single</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
              <TabsTrigger value="bulk-import" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Import</span>
                <span className="sm:hidden">Bulk</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-cvs" className="space-y-4">
              {cvSubmissions.length === 0 ? (
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
              <CVManualEntry onSuccess={fetchAllSubmissions} />
            </TabsContent>

            <TabsContent value="bulk-import">
              <CVBulkImport onSuccess={fetchAllSubmissions} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Full admin sees all tabs
        <Tabs defaultValue="job-applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-1">
            <TabsTrigger value="job-applications" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Job Applications</span>
              <span className="sm:hidden">Jobs</span>
              <span className="ml-1">({jobApplications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="cv-submissions" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">CV Submissions</span>
              <span className="sm:hidden">CVs</span>
              <span className="ml-1">({cvSubmissions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="career-requests" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Career Requests</span>
              <span className="sm:hidden">Career</span>
              <span className="ml-1">({careerRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="talent-requests" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Talent Requests</span>
              <span className="sm:hidden">Talent</span>
              <span className="ml-1">({talentRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="employer-jobs" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Employer Posts</span>
              <span className="sm:hidden">Employer</span>
              <span className="ml-1">({employerJobSubmissions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="contact-submissions" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Contact Forms</span>
              <span className="sm:hidden">Contact</span>
              <span className="ml-1">({contactSubmissions.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job-applications" className="space-y-4">
            {jobApplications.length === 0 ? (
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
                      {app.jobs.reference_id}
                    </Badge>
                  </div>
                  <CardDescription className="break-words">
                    Applied for: {app.jobs.title}
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all-cvs" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">All CVs</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="add-single" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Single</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
              <TabsTrigger value="bulk-import" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Import</span>
                <span className="sm:hidden">Bulk</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-cvs" className="space-y-4">
              {cvSubmissions.length === 0 ? (
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
              <CVManualEntry onSuccess={fetchAllSubmissions} />
            </TabsContent>

            <TabsContent value="bulk-import">
              <CVBulkImport onSuccess={fetchAllSubmissions} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="career-requests" className="space-y-4">
          {careerRequests.length === 0 ? (
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
          {talentRequests.length === 0 ? (
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
                      {request.talent_profiles.reference_id}
                    </Badge>
                  </div>
                  <CardDescription className="break-words">
                    Interested in: {request.talent_profiles.role}
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
          {employerJobSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No employer job submissions yet.
              </CardContent>
            </Card>
          ) : (
            employerJobSubmissions.map((submission: any) => (
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
                          onClick={() => handleDownloadCV(submission.job_spec_file_url, `${submission.company_name}-${submission.job_title}`)}
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
          {contactSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No contact form submissions yet.
              </CardContent>
            </Card>
          ) : (
            contactSubmissions.map((submission: any) => (
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