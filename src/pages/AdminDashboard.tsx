import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Briefcase, FileText, Star, MessageSquare } from 'lucide-react';
import JobsManagement from '@/components/admin/JobsManagement';
import SubmissionsManagement from '@/components/admin/SubmissionsManagement';
import TalentManagement from '@/components/admin/TalentManagement';

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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">MyRecruita Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="talent" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Talent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <JobsManagement />
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <SubmissionsManagement />
          </TabsContent>

          <TabsContent value="talent" className="space-y-6">
            <TalentManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}