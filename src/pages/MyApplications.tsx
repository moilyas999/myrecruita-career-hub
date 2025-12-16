import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Briefcase,
  Clock,
  MapPin,
  ExternalLink,
  FileText
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

interface JobApplication {
  id: string;
  job_id: string | null;
  created_at: string;
  name: string;
  email: string;
  message: string | null;
  cv_file_url: string | null;
  jobs?: {
    id: string;
    title: string;
    reference_id: string;
    location: string;
    sector: string;
    status: string;
  } | null;
}

const MyApplications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useSEO({
    title: 'My Applications | MyRecruita',
    description: 'Track and manage all your job applications on MyRecruita.',
  });

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          created_at,
          name,
          email,
          message,
          cv_file_url,
          jobs (
            id,
            title,
            reference_id,
            location,
            sector,
            status
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
      } else {
        setApplications(data || []);
      }

      setLoading(false);
    };

    fetchApplications();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track all your job applications in one place
          </p>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't applied to any jobs yet. Start exploring opportunities!
                </p>
                <Link to="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {app.jobs?.title || 'Job Application'}
                          </h3>
                          {app.jobs?.reference_id && (
                            <p className="text-sm text-muted-foreground">
                              Ref: {app.jobs.reference_id}
                            </p>
                          )}
                        </div>
                        {app.jobs?.status && (
                          <Badge variant={app.jobs.status === 'active' ? 'default' : 'secondary'}>
                            {app.jobs.status === 'active' ? 'Active' : 'Closed'}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        {app.jobs?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {app.jobs.location}
                          </span>
                        )}
                        {app.jobs?.sector && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {app.jobs.sector}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {app.message && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Your message:</span> {app.message}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {app.cv_file_url && (
                          <a
                            href={app.cv_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              View CV
                            </Button>
                          </a>
                        )}
                        {app.jobs?.id && (
                          <Link to={`/jobs/${app.jobs.reference_id}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Job
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Browse More Jobs CTA */}
        {applications.length > 0 && (
          <Card className="mt-8 bg-primary text-primary-foreground">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Looking for more opportunities?</h3>
                  <p className="text-primary-foreground/80 text-sm">
                    Check out our latest job listings
                  </p>
                </div>
                <Link to="/jobs">
                  <Button variant="secondary">Browse Jobs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
