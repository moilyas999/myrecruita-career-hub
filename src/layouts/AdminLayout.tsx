import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user, isAdmin, adminRole, loading, isAdminLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const isFullAdmin = adminRole === 'admin';
  const isCvUploader = adminRole === 'cv_uploader';

  useEffect(() => {
    if (!loading && !isAdminLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, isAdminLoading, navigate]);

  if (loading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar 
          isFullAdmin={isFullAdmin} 
          isCvUploader={isCvUploader} 
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader 
            user={user} 
            onSignOut={signOut}
          />
          
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {isCvUploader && (
                <Alert className="mb-6 border-amber-500/30 bg-amber-500/10">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    <strong>Limited Access:</strong> You can only view CV submissions that you added within the last 3 days.
                  </AlertDescription>
                </Alert>
              )}
              
              {(title || description) && (
                <div className="mb-6">
                  {title && (
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-muted-foreground mt-1">
                      {description}
                    </p>
                  )}
                </div>
              )}
              
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
