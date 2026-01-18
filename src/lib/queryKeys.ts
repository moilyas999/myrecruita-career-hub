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
  
  // Job-specific keys
  jobDetail: (id: string) => ['job', id] as const,
  jobMetrics: ['job-metrics'] as const,
  jobDashboard: ['job-dashboard'] as const,
  jobSubmissions: (jobId: string) => ['job-submissions', jobId] as const,
  jobPipeline: (jobId: string) => ['job-pipeline', jobId] as const,
  roleAgeing: ['role-ageing'] as const,
  rejectionStats: ['rejection-stats'] as const,
  revenueForeCast: ['revenue-forecast'] as const,
  timeToFillTrends: ['time-to-fill-trends'] as const,
  
  // Clients
  clients: ['clients'] as const,
  clientDetail: (id: string) => ['client', id] as const,
  clientContacts: (clientId: string) => ['client-contacts', clientId] as const,
  clientTerms: (clientId: string) => ['client-terms', clientId] as const,
  clientInteractions: (clientId: string) => ['client-interactions', clientId] as const,
  clientJobs: (clientId: string) => ['client-jobs', clientId] as const,
  
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
  
  // Automation (Phase 4)
  automationRules: ['automation-rules'] as const,
  automationTasks: ['automation-tasks'] as const,
  automationRuleDetail: (id: string) => ['automation-rules', 'detail', id] as const,
  automationTaskDetail: (id: string) => ['automation-tasks', 'detail', id] as const,
  automationTaskStats: ['automation-tasks', 'stats'] as const,
  automationRuleStats: ['automation-rules', 'stats'] as const,
  myTasks: ['automation-tasks', 'mine'] as const,
  
  // Reports (Phase 5)
  revenueReport: ['revenue-report'] as const,
  recruiterPerformance: ['recruiter-performance'] as const,
  conversionFunnel: ['conversion-funnel'] as const,
  revenueForecast: ['revenue-forecast'] as const,
  revenueMetrics: ['revenue-metrics'] as const,
  placementsByClient: ['placements-by-client'] as const,
  placementsByRecruiter: ['placements-by-recruiter'] as const,
  invoices: ['invoices'] as const,
  pipelineMetrics: ['pipeline-metrics'] as const,
  timeToFill: ['time-to-fill'] as const,
  activityMetrics: ['activity-metrics'] as const,
  
  // Calendar (Phase 6)
  calendarEvents: ['calendar-events'] as const,
  calendarEventDetail: (id: string) => ['calendar-events', id] as const,
  myCalendarEvents: ['calendar-events', 'mine'] as const,
  upcomingInterviews: ['calendar-events', 'upcoming-interviews'] as const,
  upcomingEvents: (days: number) => ['calendar-events', 'upcoming', days] as const,
  eventsByDate: (date: string) => ['calendar-events', 'date', date] as const,
  eventsByJob: (jobId: string) => ['calendar-events', 'job', jobId] as const,
  eventsByCandidate: (candidateId: string) => ['calendar-events', 'candidate', candidateId] as const,
  availability: ['availability'] as const,
  myAvailability: ['availability', 'mine'] as const,
  userAvailability: (userId: string) => ['availability', userId] as const,
  calendarConnections: ['calendar-connections'] as const,
  myCalendarConnection: ['calendar-connections', 'mine'] as const,
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

// Job-related tables for real-time subscriptions
export const jobTables = [
  'jobs',
  'candidate_pipeline',
  'job_submissions',
] as const;

// Client-related tables for real-time subscriptions
export const clientTables = [
  'clients',
  'client_contacts',
  'client_terms',
  'client_interactions',
] as const;

// Calendar-related tables for real-time subscriptions
export const calendarTables = [
  'calendar_events',
  'availability_slots',
  'calendar_connections',
] as const;
