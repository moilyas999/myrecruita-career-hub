import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import DashboardOverview from '@/components/admin/DashboardOverview';
import JobsManagement from '@/components/admin/JobsManagement';
import SubmissionsManagement from '@/components/admin/SubmissionsManagement';
import TalentManagement from '@/components/admin/TalentManagement';
import StatsDashboard from '@/components/admin/StatsDashboard';
import AdminManagement from '@/components/admin/AdminManagement';
import SettingsManagement from '@/components/admin/SettingsManagement';

const TAB_CONFIG: Record<string, { component: React.ComponentType; title: string; description: string; fullAdminOnly?: boolean }> = {
  '': { component: DashboardOverview, title: 'Dashboard', description: 'Overview of your recruitment pipeline' },
  'stats': { component: StatsDashboard, title: 'Analytics', description: 'View detailed statistics and insights', fullAdminOnly: true },
  'jobs': { component: JobsManagement, title: 'Jobs Management', description: 'Manage job postings and listings', fullAdminOnly: true },
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
  'settings': { component: SettingsManagement, title: 'System Settings', description: 'Configure application settings', fullAdminOnly: true },
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
    // Redirect CV uploaders to submissions tab
    const Component = SubmissionsManagement;
    return (
      <AdminLayout 
        title="CV Submissions" 
        description="View and manage your CV submissions"
      >
        <Component />
      </AdminLayout>
    );
  }

  // For CV uploader, show dashboard overview on root
  if (isCvUploader && currentTab === '') {
    return (
      <AdminLayout 
        title="CV Management" 
        description="Upload and manage CV submissions"
      >
        <SubmissionsManagement />
      </AdminLayout>
    );
  }

  const Component = tabConfig.component;

  return (
    <AdminLayout 
      title={tabConfig.title} 
      description={tabConfig.description}
    >
      <Component />
    </AdminLayout>
  );
}
