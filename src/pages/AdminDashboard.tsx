import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Briefcase, FileText, Star, BarChart3, UserPlus, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import JobsManagement from '@/components/admin/JobsManagement';
import SubmissionsManagement from '@/components/admin/SubmissionsManagement';
import TalentManagement from '@/components/admin/TalentManagement';
import StatsDashboard from '@/components/admin/StatsDashboard';
import AdminManagement from '@/components/admin/AdminManagement';
import { BUILD_VERSION, forceRefresh } from '@/lib/version';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminDashboard() {
  const { user, isAdmin, adminRole, loading, isAdminLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const isFullAdmin = adminRole === 'admin';
  const isCvUploader = adminRole === 'cv_uploader';

  useEffect(() => {
    // Only redirect after both loading states are complete
    if (!loading && !isAdminLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, isAdminLoading, navigate]);

  // Show loading while checking auth or admin status
  if (loading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">MyRecruita Admin Dashboard</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-[10px] text-muted-foreground/60 hidden lg:inline font-mono">
                {BUILD_VERSION}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                Welcome, {user.email}
              </span>
              <Button 
                variant="ghost" 
                onClick={forceRefresh} 
                size="sm"
                title="Force refresh to clear cache"
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={signOut} size="sm">
                <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        {isCvUploader && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              <strong>Limited Access:</strong> You can only view CV submissions that you added within the last 3 days. Contact an administrator for full access.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={isCvUploader ? "submissions" : "stats"} className="space-y-4 sm:space-y-6">
          <TabsList className={`grid w-full gap-1 ${isFullAdmin ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-1'}`}>
            {isFullAdmin && (
              <TabsTrigger value="stats" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Statistics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            )}
            {isFullAdmin && (
              <TabsTrigger value="jobs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                Jobs
              </TabsTrigger>
            )}
            <TabsTrigger value="submissions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{isCvUploader ? 'CV Submissions' : 'Submissions'}</span>
              <span className="sm:hidden">{isCvUploader ? 'CVs' : 'Forms'}</span>
            </TabsTrigger>
            {isFullAdmin && (
              <TabsTrigger value="talent" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                Talent
              </TabsTrigger>
            )}
            {isFullAdmin && (
              <TabsTrigger value="admins" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Staff</span>
                <span className="sm:hidden">Staff</span>
              </TabsTrigger>
            )}
          </TabsList>

          {isFullAdmin && (
            <TabsContent value="stats" className="space-y-4 sm:space-y-6">
              <StatsDashboard />
            </TabsContent>
          )}

          {isFullAdmin && (
            <TabsContent value="jobs" className="space-y-4 sm:space-y-6">
              <JobsManagement />
            </TabsContent>
          )}

          <TabsContent value="submissions" className="space-y-4 sm:space-y-6">
            <SubmissionsManagement />
          </TabsContent>

          {isFullAdmin && (
            <TabsContent value="talent" className="space-y-4 sm:space-y-6">
              <TalentManagement />
            </TabsContent>
          )}

          {isFullAdmin && (
            <TabsContent value="admins" className="space-y-4 sm:space-y-6">
              <AdminManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}