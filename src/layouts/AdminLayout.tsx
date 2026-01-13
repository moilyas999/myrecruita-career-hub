import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { PushNotificationPrompt } from '@/components/admin/PushNotificationPrompt';
import { supabase } from '@/integrations/supabase/client';
import { useProgressierUpdates, syncUserToProgressier } from '@/hooks/useProgressierUpdates';
import { loadProgressier } from '@/lib/progressier';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user, isAdmin, adminRole, loading, isAdminLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState<{ display_name: string | null; email: string } | null>(null);

  const isFullAdmin = adminRole === 'admin';
  const isCvUploader = adminRole === 'cv_uploader';

  // Enable PWA updates via Progressier - NO auto-reload to preserve upload state
  const { updateAvailable } = useProgressierUpdates({
    autoReloadOnVisibility: false,
    showToast: true,
  });

  useEffect(() => {
    if (!loading && !isAdminLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, isAdminLoading, navigate]);

  // Load Progressier dynamically only for authenticated admin users
  useEffect(() => {
    if (user && isAdmin) {
      loadProgressier();
    }
  }, [user, isAdmin]);

  // Fetch admin profile for push notification sync
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('admin_profiles')
          .select('display_name, email')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setAdminProfile(data);
        }
      }
    };
    
    fetchAdminProfile();
  }, [user]);

  // Sync user data to Progressier for segment targeting on every load
  useEffect(() => {
    if (user && adminRole) {
      syncUserToProgressier({
        userId: user.id,
        email: user.email,
        name: adminProfile?.display_name || undefined,
        role: adminRole,
      });
    }
  }, [user, adminRole, adminProfile]);

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
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
      >
        Skip to content
      </a>
      
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar 
          isFullAdmin={isFullAdmin} 
          isCvUploader={isCvUploader} 
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader 
            user={user} 
            onSignOut={signOut}
            updateAvailable={updateAvailable}
          />
          
          <main id="main-content" className="flex-1 overflow-auto" role="main">
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
      
      {/* Push Notification Prompt */}
      <PushNotificationPrompt
        userId={user?.id}
        userEmail={adminProfile?.email}
        userName={adminProfile?.display_name || undefined}
        userRole={adminRole || undefined}
      />
    </SidebarProvider>
  );
}
