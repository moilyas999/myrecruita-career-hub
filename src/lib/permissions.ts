// Permission types matching the database enum
export type PermissionType =
  // CV Management
  | 'cv.view' | 'cv.create' | 'cv.update' | 'cv.delete' | 'cv.export'
  // Job Management
  | 'jobs.view' | 'jobs.create' | 'jobs.update' | 'jobs.delete'
  // Applications
  | 'applications.view' | 'applications.manage'
  // Talent Profiles
  | 'talent.view' | 'talent.create' | 'talent.update' | 'talent.delete'
  // Submissions
  | 'submissions.view' | 'submissions.delete'
  // Blog
  | 'blog.view' | 'blog.create' | 'blog.update' | 'blog.delete'
  // Analytics
  | 'analytics.view'
  // Staff Management
  | 'staff.view' | 'staff.create' | 'staff.update' | 'staff.delete'
  // Settings
  | 'settings.view' | 'settings.update'
  // Notifications
  | 'notifications.manage';

// Staff role types
export type StaffRole = 
  | 'admin' 
  | 'recruiter' 
  | 'account_manager' 
  | 'marketing' 
  | 'cv_uploader' 
  | 'viewer';

// Role configuration with metadata
export interface RoleConfig {
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultPermissions: PermissionType[];
}

// All possible permissions grouped by category
export const PERMISSION_CATEGORIES = {
  cv: {
    label: 'CV Management',
    permissions: ['cv.view', 'cv.create', 'cv.update', 'cv.delete', 'cv.export'] as PermissionType[],
  },
  jobs: {
    label: 'Job Management',
    permissions: ['jobs.view', 'jobs.create', 'jobs.update', 'jobs.delete'] as PermissionType[],
  },
  applications: {
    label: 'Applications',
    permissions: ['applications.view', 'applications.manage'] as PermissionType[],
  },
  talent: {
    label: 'Talent Profiles',
    permissions: ['talent.view', 'talent.create', 'talent.update', 'talent.delete'] as PermissionType[],
  },
  submissions: {
    label: 'Submissions',
    permissions: ['submissions.view', 'submissions.delete'] as PermissionType[],
  },
  blog: {
    label: 'Blog',
    permissions: ['blog.view', 'blog.create', 'blog.update', 'blog.delete'] as PermissionType[],
  },
  analytics: {
    label: 'Analytics',
    permissions: ['analytics.view'] as PermissionType[],
  },
  staff: {
    label: 'Staff Management',
    permissions: ['staff.view', 'staff.create', 'staff.update', 'staff.delete'] as PermissionType[],
  },
  settings: {
    label: 'Settings',
    permissions: ['settings.view', 'settings.update'] as PermissionType[],
  },
  notifications: {
    label: 'Notifications',
    permissions: ['notifications.manage'] as PermissionType[],
  },
} as const;

// Permission labels for display
export const PERMISSION_LABELS: Record<PermissionType, string> = {
  'cv.view': 'View CVs',
  'cv.create': 'Create CVs',
  'cv.update': 'Update CVs',
  'cv.delete': 'Delete CVs',
  'cv.export': 'Export CVs',
  'jobs.view': 'View Jobs',
  'jobs.create': 'Create Jobs',
  'jobs.update': 'Update Jobs',
  'jobs.delete': 'Delete Jobs',
  'applications.view': 'View Applications',
  'applications.manage': 'Manage Applications',
  'talent.view': 'View Talent',
  'talent.create': 'Create Talent',
  'talent.update': 'Update Talent',
  'talent.delete': 'Delete Talent',
  'submissions.view': 'View Submissions',
  'submissions.delete': 'Delete Submissions',
  'blog.view': 'View Blog',
  'blog.create': 'Create Blog Posts',
  'blog.update': 'Update Blog Posts',
  'blog.delete': 'Delete Blog Posts',
  'analytics.view': 'View Analytics',
  'staff.view': 'View Staff',
  'staff.create': 'Create Staff',
  'staff.update': 'Update Staff',
  'staff.delete': 'Delete Staff',
  'settings.view': 'View Settings',
  'settings.update': 'Update Settings',
  'notifications.manage': 'Manage Notifications',
};

// Role configurations
export const ROLE_CONFIG: Record<StaffRole, RoleConfig> = {
  admin: {
    label: 'Administrator',
    description: 'Full access to all features and settings',
    icon: 'Shield',
    color: 'bg-primary text-primary-foreground',
    defaultPermissions: Object.values(PERMISSION_CATEGORIES).flatMap(c => c.permissions),
  },
  recruiter: {
    label: 'Recruiter',
    description: 'Manage CVs, jobs, applications, and talent profiles',
    icon: 'UserCheck',
    color: 'bg-blue-500 text-white',
    defaultPermissions: [
      'cv.view', 'cv.create', 'cv.update', 'cv.delete', 'cv.export',
      'jobs.view', 'jobs.create', 'jobs.update', 'jobs.delete',
      'applications.view', 'applications.manage',
      'talent.view', 'talent.create', 'talent.update', 'talent.delete',
      'analytics.view',
    ],
  },
  account_manager: {
    label: 'Account Manager',
    description: 'View employer submissions, talent requests, and contact forms',
    icon: 'Building',
    color: 'bg-emerald-500 text-white',
    defaultPermissions: [
      'jobs.view',
      'applications.view',
      'talent.view',
      'submissions.view',
      'analytics.view',
    ],
  },
  marketing: {
    label: 'Marketing',
    description: 'Manage blog posts and view analytics',
    icon: 'Megaphone',
    color: 'bg-purple-500 text-white',
    defaultPermissions: [
      'jobs.view',
      'talent.view',
      'blog.view', 'blog.create', 'blog.update', 'blog.delete',
      'analytics.view',
    ],
  },
  cv_uploader: {
    label: 'CV Uploader',
    description: 'Upload CVs only - can view own submissions from last 3 days',
    icon: 'Upload',
    color: 'bg-amber-500 text-white',
    defaultPermissions: ['cv.create'],
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to CVs, jobs, and talent profiles',
    icon: 'Eye',
    color: 'bg-slate-500 text-white',
    defaultPermissions: ['cv.view', 'jobs.view', 'talent.view'],
  },
};

// Notification event types
export type NotificationEventType =
  | 'cv_submission'
  | 'job_application'
  | 'contact_submission'
  | 'career_partner_request'
  | 'employer_job_submission'
  | 'talent_request'
  | 'staff_added'
  | 'permission_changed'
  | 'blog_published'
  | 'system_updates'
  | 'weekly_digest';

// Notification event configuration - Single source of truth
export interface NotificationEventConfig {
  id: NotificationEventType;
  label: string;
  description: string;
  icon: string;
  defaultForRoles: StaffRole[];
  channels: ('push' | 'email' | 'in_app')[];
}

export const NOTIFICATION_EVENT_CONFIG: NotificationEventConfig[] = [
  {
    id: 'cv_submission',
    label: 'New CV Submission',
    description: 'When a new CV is submitted',
    icon: 'FileText',
    defaultForRoles: ['admin', 'recruiter', 'cv_uploader'],
    channels: ['push', 'email', 'in_app'],
  },
  {
    id: 'job_application',
    label: 'New Job Application',
    description: 'When someone applies for a job',
    icon: 'Briefcase',
    defaultForRoles: ['admin', 'recruiter'],
    channels: ['push', 'email', 'in_app'],
  },
  {
    id: 'contact_submission',
    label: 'Contact Form Submission',
    description: 'When a contact form is submitted',
    icon: 'MessageSquare',
    defaultForRoles: ['admin', 'account_manager'],
    channels: ['push', 'email', 'in_app'],
  },
  {
    id: 'career_partner_request',
    label: 'Career Partner Request',
    description: 'When someone requests career partnership',
    icon: 'Users',
    defaultForRoles: ['admin', 'account_manager'],
    channels: ['push', 'email', 'in_app'],
  },
  {
    id: 'employer_job_submission',
    label: 'Employer Job Submission',
    description: 'When an employer submits a job posting',
    icon: 'Building',
    defaultForRoles: ['admin', 'account_manager', 'recruiter'],
    channels: ['push', 'email', 'in_app'],
  },
  {
    id: 'talent_request',
    label: 'Talent Profile Request',
    description: 'When someone inquires about a talent profile',
    icon: 'Star',
    defaultForRoles: ['admin', 'account_manager', 'recruiter'],
    channels: ['push', 'email', 'in_app'],
  },
  {
    id: 'staff_added',
    label: 'New Staff Member Added',
    description: 'When a new staff member is added',
    icon: 'UserPlus',
    defaultForRoles: ['admin'],
    channels: ['push', 'in_app'],
  },
  {
    id: 'permission_changed',
    label: 'Permission Changed',
    description: 'When your permissions are changed',
    icon: 'Shield',
    defaultForRoles: ['admin', 'recruiter', 'account_manager', 'marketing', 'cv_uploader', 'viewer'],
    channels: ['push', 'email', 'in_app'],
  },
  {
    id: 'blog_published',
    label: 'New Blog Post Published',
    description: 'When a new blog post is published',
    icon: 'BookOpen',
    defaultForRoles: ['admin', 'marketing'],
    channels: ['push', 'in_app'],
  },
  {
    id: 'system_updates',
    label: 'System Updates',
    description: 'Important system updates and announcements',
    icon: 'Settings',
    defaultForRoles: ['admin', 'recruiter', 'account_manager', 'marketing', 'cv_uploader', 'viewer'],
    channels: ['push', 'email', 'in_app'],
  },
  {
    id: 'weekly_digest',
    label: 'Weekly Digest',
    description: 'Weekly summary of activity',
    icon: 'Calendar',
    defaultForRoles: ['admin', 'recruiter', 'account_manager'],
    channels: ['email'],
  },
];

// Notification event labels (derived from config)
export const NOTIFICATION_EVENT_LABELS: Record<NotificationEventType, string> = 
  NOTIFICATION_EVENT_CONFIG.reduce((acc, event) => {
    acc[event.id] = event.label;
    return acc;
  }, {} as Record<NotificationEventType, string>);

// Role-based notification defaults
export const ROLE_NOTIFICATION_DEFAULTS: Record<StaffRole, NotificationEventType[]> = {
  admin: NOTIFICATION_EVENT_CONFIG.map(e => e.id),
  recruiter: NOTIFICATION_EVENT_CONFIG.filter(e => 
    e.defaultForRoles.includes('recruiter')
  ).map(e => e.id),
  account_manager: NOTIFICATION_EVENT_CONFIG.filter(e => 
    e.defaultForRoles.includes('account_manager')
  ).map(e => e.id),
  marketing: NOTIFICATION_EVENT_CONFIG.filter(e => 
    e.defaultForRoles.includes('marketing')
  ).map(e => e.id),
  cv_uploader: NOTIFICATION_EVENT_CONFIG.filter(e => 
    e.defaultForRoles.includes('cv_uploader')
  ).map(e => e.id),
  viewer: NOTIFICATION_EVENT_CONFIG.filter(e => 
    e.defaultForRoles.includes('viewer')
  ).map(e => e.id),
};

// Default notification preferences (for backwards compatibility)
export const DEFAULT_EVENT_PREFERENCES: Record<NotificationEventType, boolean> = 
  NOTIFICATION_EVENT_CONFIG.reduce((acc, event) => {
    acc[event.id] = true; // All enabled by default for admin
    return acc;
  }, {} as Record<NotificationEventType, boolean>);

// Generate role-based event preferences
export function generateEventPreferencesForRole(role: StaffRole): Record<NotificationEventType, boolean> {
  const enabledEvents = ROLE_NOTIFICATION_DEFAULTS[role];
  return NOTIFICATION_EVENT_CONFIG.reduce((acc, event) => {
    acc[event.id] = enabledEvents.includes(event.id);
    return acc;
  }, {} as Record<NotificationEventType, boolean>);
}

// Get all permissions as a flat array
export const ALL_PERMISSIONS = Object.values(PERMISSION_CATEGORIES).flatMap(c => c.permissions);
