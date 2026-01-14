// Centralized query key definitions for React Query
// This ensures consistent cache invalidation across all components

export const queryKeys = {
  // Dashboard
  dashboardOverview: ['dashboard-overview'] as const,
  statsDashboard: ['stats-dashboard'] as const,
  
  // Submissions
  cvSubmissions: ['cv-submissions'] as const,
  jobApplications: ['job-applications'] as const,
  careerPartnerRequests: ['career-partner-requests'] as const,
  talentRequests: ['talent-requests'] as const,
  employerJobSubmissions: ['employer-job-submissions'] as const,
  contactSubmissions: ['contact-submissions'] as const,
  
  // Management
  jobs: ['jobs'] as const,
  talentProfiles: ['talent-profiles'] as const,
  blogPosts: ['blog-posts'] as const,
  blogCategories: ['blog-categories'] as const,
  
  // Admin
  adminProfiles: ['admin-profiles'] as const,
  activityLog: ['activity-log'] as const,
  
  // Permissions & Notifications
  staffPermissions: ['staff-permissions'] as const,
  notifications: ['notifications'] as const,
  notificationPreferences: ['notification-preferences'] as const,
  
  // Job Status Tracking
  jobStatusUpdates: ['job-status-updates'] as const,
  emailIngestionLog: ['email-ingestion-log'] as const,
  emailIngestionStats: ['email-ingestion-stats'] as const,
  
  // Pipeline
  candidatePipeline: ['candidate-pipeline'] as const,
  pipelineActivity: ['pipeline-activity'] as const,
  
  // Staff Activity & Work
  userActivity: ['user-activity'] as const,
  teamActivity: ['team-activity'] as const,
  myWork: ['my-work'] as const,
  userActivityStats: ['user-activity-stats'] as const,
} as const;

// Helper to get all submission-related keys for bulk invalidation
export const submissionQueryKeys = [
  queryKeys.cvSubmissions,
  queryKeys.jobApplications,
  queryKeys.careerPartnerRequests,
  queryKeys.talentRequests,
  queryKeys.employerJobSubmissions,
  queryKeys.contactSubmissions,
];

// Tables that should trigger dashboard refresh when changed
export const dashboardTables = [
  'cv_submissions',
  'job_applications',
  'jobs',
  'talent_profiles',
] as const;
