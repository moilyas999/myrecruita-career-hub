import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Briefcase, FileText, Star, MessageSquare, BarChart3, UserPlus, RefreshCw } from 'lucide-react';
import JobsManagement from '@/components/admin/JobsManagement';
import SubmissionsManagement from '@/components/admin/SubmissionsManagement';
import TalentManagement from '@/components/admin/TalentManagement';
import StatsDashboard from '@/components/admin/StatsDashboard';
import AdminManagement from '@/components/admin/AdminManagement';
import { BUILD_VERSION, forceRefresh } from '@/lib/version';

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <Tabs defaultValue="stats" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1">
            <TabsTrigger value="stats" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Statistics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Submissions</span>
              <span className="sm:hidden">Forms</span>
            </TabsTrigger>
            <TabsTrigger value="talent" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              Talent
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Admins</span>
              <span className="sm:hidden">Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4 sm:space-y-6">
            <StatsDashboard />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4 sm:space-y-6">
            <JobsManagement />
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4 sm:space-y-6">
            <SubmissionsManagement />
          </TabsContent>

          <TabsContent value="talent" className="space-y-4 sm:space-y-6">
            <TalentManagement />
          </TabsContent>

          <TabsContent value="admins" className="space-y-4 sm:space-y-6">
            <AdminManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}