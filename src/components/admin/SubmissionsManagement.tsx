import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, FileText, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface JobApplication {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  const fetchAllSubmissions = async () => {
    try {
      // Fetch job applications
      const { data: jobApps, error: jobError } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (title, reference_id)
        `)
        .order('created_at', { ascending: false });

      if (jobError) throw jobError;

      // Fetch CV submissions
      const { data: cvSubs, error: cvError } = await supabase
        .from('cv_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (cvError) throw cvError;

      // Fetch career partner requests
      const { data: careerReqs, error: careerError } = await supabase
        .from('career_partner_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (careerError) throw careerError;

      // Fetch talent requests
      const { data: talentReqs, error: talentError } = await supabase
        .from('talent_requests')
        .select(`
          *,
          talent_profiles (reference_id, role)
        `)
        .order('created_at', { ascending: false });

      if (talentError) throw talentError;

      setJobApplications(jobApps || []);
      setCvSubmissions(cvSubs || []);
      setCareerRequests(careerReqs || []);
      setTalentRequests(talentReqs || []);
    } catch (error: any) {
      toast.error('Failed to fetch submissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Submissions Management</h2>
        <p className="text-muted-foreground">View and manage all form submissions</p>
      </div>

      <Tabs defaultValue="job-applications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="job-applications">
            Job Applications ({jobApplications.length})
          </TabsTrigger>
          <TabsTrigger value="cv-submissions">
            CV Submissions ({cvSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="career-requests">
            Career Requests ({careerRequests.length})
          </TabsTrigger>
          <TabsTrigger value="talent-requests">
            Talent Requests ({talentRequests.length})
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    {app.name}
                    <Badge variant="secondary">{app.jobs.reference_id}</Badge>
                  </CardTitle>
                  <CardDescription>Applied for: {app.jobs.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${app.email}`} className="text-primary hover:underline">
                      {app.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${app.phone}`} className="text-primary hover:underline">
                      {app.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(app.created_at).toLocaleString()}
                  </div>
                  {app.message && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">Message:</p>
                      <p className="text-sm mt-1">{app.message}</p>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {submission.name}
                  </CardTitle>
                  <CardDescription>CV Submission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${submission.email}`} className="text-primary hover:underline">
                      {submission.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${submission.phone}`} className="text-primary hover:underline">
                      {submission.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(submission.created_at).toLocaleString()}
                  </div>
                  {submission.cv_file_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4" />
                      <a href={submission.cv_file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View CV File
                      </a>
                    </div>
                  )}
                  {submission.message && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">Message:</p>
                      <p className="text-sm mt-1">{submission.message}</p>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {request.name}
                    <Badge variant="outline">{request.service_type}</Badge>
                  </CardTitle>
                  <CardDescription>Career Partner Request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                      {request.email}
                    </a>
                  </div>
                  {request.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${request.phone}`} className="text-primary hover:underline">
                        {request.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(request.created_at).toLocaleString()}
                  </div>
                  {request.message && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">Message:</p>
                      <p className="text-sm mt-1">{request.message}</p>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    {request.contact_name} ({request.company_name})
                    <Badge variant="secondary">{request.talent_profiles.reference_id}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Interested in: {request.talent_profiles.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                      {request.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(request.created_at).toLocaleString()}
                  </div>
                  {request.message && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">Message:</p>
                      <p className="text-sm mt-1">{request.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}