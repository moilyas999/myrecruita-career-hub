import { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';

// Lazy load all admin components for code splitting
const DashboardOverview = lazy(() => import('@/components/admin/DashboardOverview'));
const CVMatchingTool = lazy(() => import('@/components/admin/CVMatchingTool'));
const JobsManagement = lazy(() => import('@/components/admin/JobsManagement'));
const JobStatusTracker = lazy(() => import('@/components/admin/JobStatusTracker'));
const JobMetricsDashboard = lazy(() => import('@/components/admin/jobs/JobMetricsDashboard'));
const SubmissionsManagement = lazy(() => import('@/components/admin/SubmissionsManagement'));
const TalentManagement = lazy(() => import('@/components/admin/TalentManagement'));
const StatsDashboard = lazy(() => import('@/components/admin/StatsDashboard'));
const AdminManagement = lazy(() => import('@/components/admin/AdminManagement'));
const SettingsManagement = lazy(() => import('@/components/admin/SettingsManagement'));
const BlogManagement = lazy(() => import('@/components/admin/BlogManagement'));
const PermissionsManagement = lazy(() => import('@/components/admin/PermissionsManagement'));
const NotificationSettings = lazy(() => import('@/components/admin/NotificationSettings'));
const UserNotificationManagement = lazy(() => import('@/components/admin/UserNotificationManagement'));
const CandidatePipeline = lazy(() => import('@/components/admin/CandidatePipeline'));
const MyWorkDashboard = lazy(() => import('@/components/admin/MyWorkDashboard'));
const MyActivityLog = lazy(() => import('@/components/admin/MyActivityLog'));
const TeamActivityLog = lazy(() => import('@/components/admin/TeamActivityLog'));
const ClientsManagement = lazy(() => import('@/components/admin/clients/ClientsManagement'));

// Loading fallback component
function TabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

interface TabConfig {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  title: string;
  description: string;
  fullAdminOnly?: boolean;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  '': { component: DashboardOverview, title: 'Dashboard', description: 'Overview of your recruitment pipeline' },
  'my-work': { component: MyWorkDashboard, title: 'My Work', description: 'Your assigned work and contributions' },
  'my-activity': { component: MyActivityLog, title: 'My Activity', description: 'Track your recent actions' },
  'team-activity': { component: TeamActivityLog, title: 'Team Activity', description: 'Monitor all staff actions', fullAdminOnly: true },
  'stats': { component: StatsDashboard, title: 'Analytics', description: 'View detailed statistics and insights', fullAdminOnly: true },
  'cv-match': { component: CVMatchingTool, title: 'AI CV Matching', description: 'Find best candidates for a job description', fullAdminOnly: true },
  'clients': { component: ClientsManagement, title: 'Client CRM', description: 'Manage client relationships and terms' },
  'jobs': { component: JobsManagement, title: 'Jobs Management', description: 'Manage job postings and listings', fullAdminOnly: true },
  'job-dashboard': { component: JobMetricsDashboard, title: 'Job Dashboard', description: 'Job analytics and metrics overview', fullAdminOnly: true },
  'job-status': { component: JobStatusTracker, title: 'Job Status Updates', description: 'Process emails and update job statuses with AI', fullAdminOnly: true },
  'submissions': { component: SubmissionsManagement, title: 'CV Database', description: 'Manage CV submissions and candidates' },
  'add-cv': { component: SubmissionsManagement, title: 'Add CV', description: 'Add a new CV to the database' },
  'bulk-import': { component: SubmissionsManagement, title: 'Bulk Import', description: 'Import multiple CVs at once' },
  'applications': { component: SubmissionsManagement, title: 'Job Applications', description: 'Review job applications', fullAdminOnly: true },
  'career': { component: SubmissionsManagement, title: 'Career Partner Requests', description: 'Manage career partner inquiries', fullAdminOnly: true },
  'talent-requests': { component: SubmissionsManagement, title: 'Talent Requests', description: 'View talent profile inquiries', fullAdminOnly: true },
  'employer-jobs': { component: SubmissionsManagement, title: 'Employer Job Posts', description: 'Review employer-submitted jobs', fullAdminOnly: true },
  'contact': { component: SubmissionsManagement, title: 'Contact Forms', description: 'Manage contact form submissions', fullAdminOnly: true },
  'talent': { component: TalentManagement, title: 'Featured Talent', description: 'Manage featured talent profiles', fullAdminOnly: true },
  'admins': { component: AdminManagement, title: 'Staff Management', description: 'Manage staff accounts and permissions', fullAdminOnly: true },
  'permissions': { component: PermissionsManagement, title: 'Permissions', description: 'Manage staff permissions', fullAdminOnly: true },
  'notification-settings': { component: NotificationSettings, title: 'Notification Settings', description: 'Configure your notification preferences' },
  'user-notifications': { component: UserNotificationManagement, title: 'User Notifications', description: 'Manage notification preferences for all staff', fullAdminOnly: true },
  'settings': { component: SettingsManagement, title: 'System Settings', description: 'Configure application settings', fullAdminOnly: true },
  'blog': { component: BlogManagement, title: 'Blog Management', description: 'Manage blog posts and content', fullAdminOnly: true },
  'pipeline': { component: CandidatePipeline, title: 'Candidate Pipeline', description: 'Track candidates through the recruitment process' },
};

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const { adminRole } = useAuth();
  const currentTab = searchParams.get('tab') || '';
  
  const isFullAdmin = adminRole === 'admin';
  const isCvUploader = adminRole === 'cv_uploader';

  // Get the configuration for the current tab
  const tabConfig = TAB_CONFIG[currentTab] || TAB_CONFIG[''];
  
  // Check access for CV uploader
  if (isCvUploader && tabConfig.fullAdminOnly) {
    return (
      <AdminLayout 
        title="CV Submissions" 
        description="View and manage your CV submissions"
      >
        <AdminErrorBoundary fallbackTitle="Failed to load CV Submissions">
          <Suspense fallback={<TabSkeleton />}>
            <SubmissionsManagement />
          </Suspense>
        </AdminErrorBoundary>
      </AdminLayout>
    );
  }

  // CV uploaders see a simplified dashboard on root
  if (isCvUploader && currentTab === '') {
    return (
      <AdminLayout 
        title="CV Management" 
        description="Upload and manage CV submissions"
      >
        <AdminErrorBoundary fallbackTitle="Failed to load Dashboard">
          <Suspense fallback={<TabSkeleton />}>
            <DashboardOverview />
          </Suspense>
        </AdminErrorBoundary>
      </AdminLayout>
    );
  }

  const Component = tabConfig.component;

  return (
    <AdminLayout 
      title={tabConfig.title} 
      description={tabConfig.description}
    >
      <AdminErrorBoundary fallbackTitle={`Failed to load ${tabConfig.title}`}>
        <Suspense fallback={<TabSkeleton />}>
          <Component />
        </Suspense>
      </AdminErrorBoundary>
    </AdminLayout>
  );
}
