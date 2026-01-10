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
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function AdminSidebar({ isFullAdmin, isCvUploader }: AdminSidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const getNavGroups = (): NavGroup[] => {
    if (isCvUploader) {
      return [
        {
          label: 'CV Management',
          items: [
            { title: 'All CVs', href: '/admin?tab=submissions', icon: FileText },
            { title: 'Add CV', href: '/admin?tab=add-cv', icon: Upload },
            { title: 'Bulk Import', href: '/admin?tab=bulk-import', icon: FolderOpen },
          ],
        },
      ];
    }

    return [
      {
        label: 'Overview',
        items: [
          { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
          { title: 'Analytics', href: '/admin?tab=stats', icon: BarChart3 },
        ],
      },
      {
        label: 'Talent Pool',
        items: [
          { title: 'CV Database', href: '/admin?tab=submissions', icon: FileText },
          { title: 'Featured Talent', href: '/admin?tab=talent', icon: Star },
        ],
      },
      {
        label: 'Jobs',
        items: [
          { title: 'All Jobs', href: '/admin?tab=jobs', icon: Briefcase },
        ],
      },
      {
        label: 'Submissions',
        items: [
          { title: 'Job Applications', href: '/admin?tab=applications', icon: Users },
          { title: 'Career Partner', href: '/admin?tab=career', icon: MessageSquare },
          { title: 'Talent Requests', href: '/admin?tab=talent-requests', icon: Star },
          { title: 'Employer Jobs', href: '/admin?tab=employer-jobs', icon: Building },
          { title: 'Contact Forms', href: '/admin?tab=contact', icon: Mail },
        ],
      },
      {
        label: 'Administration',
        items: [
          { title: 'Staff Accounts', href: '/admin?tab=admins', icon: UserPlus },
          { title: 'Settings', href: '/admin?tab=settings', icon: Settings },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

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
                        >
                          <Icon className={cn(
                            'w-4 h-4 shrink-0',
                            active ? 'text-primary' : 'text-muted-foreground'
                          )} />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 truncate">{item.title}</span>
                              {item.badge && (
                                <Badge variant={item.badgeVariant || 'secondary'} className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                              {active && (
                                <ChevronRight className="w-3 h-3 text-primary" />
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
