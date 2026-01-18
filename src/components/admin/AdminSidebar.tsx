import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Star,
  UserPlus,
  Settings,
  BarChart3,
  Upload,
  FolderOpen,
  Mail,
  Building,
  Building2,
  MessageSquare,
  Bell,
  Lock,
  Target,
  RefreshCw,
  Kanban,
  ClipboardList,
  Activity,
  TrendingUp,
  Zap,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionType } from '@/lib/permissions';

interface AdminSidebarProps {
  isFullAdmin: boolean;
  isCvUploader: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  permission?: PermissionType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function AdminSidebar({ isFullAdmin, isCvUploader }: AdminSidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();

  const getNavGroups = (): NavGroup[] => {
    if (isCvUploader) {
      return [
        {
          label: 'CV Management',
          items: [
            { title: 'All CVs', href: '/admin?tab=submissions', icon: FileText, permission: 'cv.view' },
            { title: 'Add CV', href: '/admin?tab=add-cv', icon: Upload, permission: 'cv.create' },
            { title: 'Bulk Import', href: '/admin?tab=bulk-import', icon: FolderOpen, permission: 'cv.create' },
          ],
        },
      ];
    }

    return [
      {
        label: 'Overview',
        items: [
          { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
          { title: 'My Work', href: '/admin?tab=my-work', icon: ClipboardList },
          { title: 'My Activity', href: '/admin?tab=my-activity', icon: Activity },
          { title: 'Team Activity', href: '/admin?tab=team-activity', icon: Users, permission: 'staff.view' },
          { title: 'Analytics', href: '/admin?tab=stats', icon: BarChart3, permission: 'analytics.view' },
        ],
      },
      {
        label: 'CRM',
        items: [
          { title: 'Clients', href: '/admin?tab=clients', icon: Building2, permission: 'clients.view' },
        ],
      },
      {
        label: 'Talent Pool',
        items: [
          { title: 'CV Database', href: '/admin?tab=submissions', icon: FileText, permission: 'cv.view' },
          { title: 'Candidate Pipeline', href: '/admin?tab=pipeline', icon: Kanban, permission: 'pipeline.view' },
          { title: 'AI CV Matching', href: '/admin?tab=cv-match', icon: Target, permission: 'cv.view', badge: 'AI', badgeVariant: 'default' },
          { title: 'Featured Talent', href: '/admin?tab=talent', icon: Star, permission: 'talent.view' },
        ],
      },
      {
        label: 'Jobs',
        items: [
          { title: 'All Jobs', href: '/admin?tab=jobs', icon: Briefcase, permission: 'jobs.view' },
          { title: 'Job Dashboard', href: '/admin?tab=job-dashboard', icon: BarChart3, permission: 'jobs.view' },
          { title: 'Status Updates', href: '/admin?tab=job-status', icon: RefreshCw, permission: 'jobs.update', badge: 'AI', badgeVariant: 'default' },
        ],
      },
      {
        label: 'Submissions',
        items: [
          { title: 'Job Applications', href: '/admin?tab=applications', icon: Users, permission: 'applications.view' },
          { title: 'Career Partner', href: '/admin?tab=career', icon: MessageSquare, permission: 'submissions.view' },
          { title: 'Talent Requests', href: '/admin?tab=talent-requests', icon: Star, permission: 'submissions.view' },
          { title: 'Employer Jobs', href: '/admin?tab=employer-jobs', icon: Building, permission: 'submissions.view' },
          { title: 'Contact Forms', href: '/admin?tab=contact', icon: Mail, permission: 'submissions.view' },
        ],
      },
      {
        label: 'Automation',
        items: [
          { title: 'Tasks', href: '/admin?tab=tasks', icon: CheckSquare, permission: 'automation.view' },
          { title: 'Rules', href: '/admin?tab=automation-rules', icon: Zap, permission: 'automation.manage' },
        ],
      },
      {
        label: 'Reports',
        items: [
          { title: 'Revenue Forecast', href: '/admin?tab=revenue', icon: TrendingUp, permission: 'reports.view' },
          { title: 'Performance', href: '/admin?tab=performance', icon: BarChart3, permission: 'reports.view' },
        ],
      },
      {
        label: 'Content',
        items: [
          { title: 'Blog Posts', href: '/admin?tab=blog', icon: FileText, permission: 'blog.view' },
        ],
      },
      {
        label: 'Administration',
        items: [
          { title: 'Staff Accounts', href: '/admin?tab=admins', icon: UserPlus, permission: 'staff.view' },
          { title: 'Permissions', href: '/admin?tab=permissions', icon: Lock, permission: 'staff.update' },
          { title: 'Notifications', href: '/admin?tab=notification-settings', icon: Bell },
          { title: 'User Notifications', href: '/admin?tab=user-notifications', icon: Users, permission: 'notifications.manage' },
          { title: 'Settings', href: '/admin?tab=settings', icon: Settings, permission: 'settings.view' },
        ],
      },
    ];
  };

  // Filter items based on permissions
  const filterItemsByPermission = (items: NavItem[]): NavItem[] => {
    if (isFullAdmin) return items; // Full admins see everything
    return items.filter(item => !item.permission || hasPermission(item.permission));
  };

  const navGroups = getNavGroups().map(group => ({
    ...group,
    items: filterItemsByPermission(group.items),
  })).filter(group => group.items.length > 0);

  const isActive = (href: string) => {
    const url = new URL(href, window.location.origin);
    const tab = url.searchParams.get('tab');
    const currentTab = new URLSearchParams(location.search).get('tab');
    
    if (!tab && !currentTab && href === '/admin') {
      return true;
    }
    return tab === currentTab;
  };

  return (
    <Sidebar 
      className="border-r border-border/50 bg-card"
      collapsible="icon"
      aria-label="Admin navigation"
    >
      <SidebarHeader className="border-b border-border/50 p-4">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">MR</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">MyRecruita</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-2 mb-1">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={isCollapsed ? item.title : undefined}
                      >
                        <Link
                          to={item.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                            'hover:bg-accent/50',
                            active && 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          <Icon 
                            className={cn(
                              'w-4 h-4 shrink-0',
                              active ? 'text-primary' : 'text-muted-foreground'
                            )} 
                            aria-hidden="true"
                          />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 truncate">{item.title}</span>
                              {item.badge && (
                                <Badge variant={item.badgeVariant || 'secondary'} className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground text-center">
            <span className="opacity-60">Powered by</span>
            <br />
            <span className="font-medium">MyRecruita</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
