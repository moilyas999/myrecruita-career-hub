import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, FileText, User, Briefcase, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [cvSubmissions, setCvSubmissions] = useState<CVSubmission[]>([]);
  const [careerRequests, setCareerRequests] = useState<CareerPartnerRequest[]>([]);
  const [talentRequests, setTalentRequests] = useState<TalentRequest[]>([]);
  const [employerJobSubmissions, setEmployerJobSubmissions] = useState<any[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Submissions Management</h2>
          <p className="text-muted-foreground">View and manage all form submissions</p>
        </div>
        <Button onClick={fetchAllSubmissions} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

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
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="break-words">{submission.name}</span>
                  </CardTitle>
                  <CardDescription>CV Submission</CardDescription>
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
                </CardContent>
              </Card>
            ))
          )}
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
    </div>
  );
}