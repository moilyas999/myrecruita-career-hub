import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  User, 
  FileText, 
  Briefcase, 
  LogOut, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  cv_file_url: string | null;
  avatar_url: string | null;
}

interface JobApplication {
  id: string;
  job_id: string | null;
  created_at: string;
  name: string;
  jobs?: {
    title: string;
    reference_id: string;
  } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);

  useSEO({
    title: 'Dashboard | MyRecruita',
    description: 'Manage your job applications, profile, and CV on MyRecruita.',
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Check if user is admin - redirect them to admin dashboard
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (adminProfile) {
        navigate('/admin');
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        // Check if profile is incomplete (new LinkedIn user without phone)
        if (profileData && !profileData.phone) {
          navigate('/complete-profile');
          return;
        }
        setProfile(profileData);
      }

      // Fetch recent applications
      const { data: appData, error: appError } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          created_at,
          name,
          jobs (
            title,
            reference_id
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (appError) {
        console.error('Error fetching applications:', appError);
      } else {
        setApplications(appData || []);
        setApplicationCount(appData?.length || 0);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  const profileCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.full_name) score += 25;
    if (profile.email) score += 25;
    if (profile.phone) score += 25;
    if (profile.cv_file_url) score += 25;
    return score;
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your job applications and profile
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{applicationCount}</span>
                <Briefcase className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profile Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{profileCompleteness()}%</span>
                <User className="h-8 w-8 text-accent" />
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all"
                  style={{ width: `${profileCompleteness()}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                CV Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {profile?.cv_file_url ? (
                  <>
                    <span className="text-lg font-medium text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Uploaded
                    </span>
                    <FileText className="h-8 w-8 text-accent" />
                  </>
                ) : (
                  <>
                    <span className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Not uploaded
                    </span>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="hover:border-accent/50 transition-colors">
            <Link to="/dashboard/profile">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <User className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">My Profile</CardTitle>
                      <CardDescription>Update your details and CV</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:border-accent/50 transition-colors">
            <Link to="/dashboard/applications">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Briefcase className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">My Applications</CardTitle>
                      <CardDescription>Track your job applications</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link to="/dashboard/applications">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
                <Link to="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {app.jobs?.title || 'Job Application'}
                      </p>
                      {app.jobs?.reference_id && (
                        <p className="text-sm text-muted-foreground">
                          Ref: {app.jobs.reference_id}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browse Jobs CTA */}
        <Card className="mt-8 bg-primary text-primary-foreground">
          <CardContent className="py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to find your next opportunity?</h3>
                <p className="text-primary-foreground/80">
                  Browse our latest job listings and find your perfect match.
                </p>
              </div>
              <Link to="/jobs">
                <Button variant="secondary" size="lg">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
