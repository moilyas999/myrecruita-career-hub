import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import type { 
  JobApplication, 
  CVSubmission, 
  CareerPartnerRequest, 
  TalentRequest, 
  EmployerJobSubmission, 
  ContactSubmission 
} from '../types';

// Fetch functions
const fetchJobApplications = async (): Promise<JobApplication[]> => {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`*, jobs (title, reference_id)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchCVSubmissions = async (): Promise<CVSubmission[]> => {
  const { data, error } = await supabase
    .from('cv_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchCareerPartnerRequests = async (): Promise<CareerPartnerRequest[]> => {
  const { data, error } = await supabase
    .from('career_partner_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchTalentRequests = async (): Promise<TalentRequest[]> => {
  const { data, error } = await supabase
    .from('talent_requests')
    .select(`*, talent_profiles (reference_id, role)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchEmployerJobSubmissions = async (): Promise<EmployerJobSubmission[]> => {
  const { data, error } = await supabase
    .from('employer_job_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchContactSubmissions = async (): Promise<ContactSubmission[]> => {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

interface UseSubmissionsDataOptions {
  isFullAdmin: boolean;
}

export function useSubmissionsData({ isFullAdmin }: UseSubmissionsDataOptions) {
  // Job Applications
  const jobApplicationsQuery = useQuery({
    queryKey: queryKeys.jobApplications,
    queryFn: fetchJobApplications,
    enabled: isFullAdmin,
  });

  // CV Submissions
  const cvSubmissionsQuery = useQuery({
    queryKey: queryKeys.cvSubmissions,
    queryFn: fetchCVSubmissions,
  });

  // Career Partner Requests
  const careerRequestsQuery = useQuery({
    queryKey: queryKeys.careerPartnerRequests,
    queryFn: fetchCareerPartnerRequests,
    enabled: isFullAdmin,
  });

  // Talent Requests
  const talentRequestsQuery = useQuery({
    queryKey: queryKeys.talentRequests,
    queryFn: fetchTalentRequests,
    enabled: isFullAdmin,
  });

  // Employer Job Submissions
  const employerJobsQuery = useQuery({
    queryKey: queryKeys.employerJobSubmissions,
    queryFn: fetchEmployerJobSubmissions,
    enabled: isFullAdmin,
  });

  // Contact Submissions
  const contactSubmissionsQuery = useQuery({
    queryKey: queryKeys.contactSubmissions,
    queryFn: fetchContactSubmissions,
    enabled: isFullAdmin,
  });

  // Real-time subscriptions
  useRealtimeSubscription({
    table: 'job_applications',
    queryKeys: [queryKeys.jobApplications, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New job application: ${data.name}`,
    },
  });

  useRealtimeSubscription({
    table: 'cv_submissions',
    queryKeys: [queryKeys.cvSubmissions, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New CV submission: ${data.name}`,
      delete: () => 'CV submission deleted',
    },
  });

  useRealtimeSubscription({
    table: 'career_partner_requests',
    queryKeys: [queryKeys.careerPartnerRequests, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New career partner request: ${data.name}`,
    },
  });

  useRealtimeSubscription({
    table: 'talent_requests',
    queryKeys: [queryKeys.talentRequests, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New talent request from ${data.company_name}`,
    },
  });

  useRealtimeSubscription({
    table: 'employer_job_submissions',
    queryKeys: [queryKeys.employerJobSubmissions, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New employer job submission: ${data.job_title}`,
    },
  });

  useRealtimeSubscription({
    table: 'contact_submissions',
    queryKeys: [queryKeys.contactSubmissions, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New contact form submission: ${data.name}`,
    },
  });

  // Computed states
  const isInitialLoading = cvSubmissionsQuery.isLoading || 
    (isFullAdmin && (
      jobApplicationsQuery.isLoading || 
      careerRequestsQuery.isLoading || 
      talentRequestsQuery.isLoading || 
      employerJobsQuery.isLoading || 
      contactSubmissionsQuery.isLoading
    ));

  const hasError = cvSubmissionsQuery.isError || 
    (isFullAdmin && (
      jobApplicationsQuery.isError || 
      careerRequestsQuery.isError || 
      talentRequestsQuery.isError || 
      employerJobsQuery.isError || 
      contactSubmissionsQuery.isError
    ));

  return {
    // Data
    jobApplications: jobApplicationsQuery.data || [],
    cvSubmissions: cvSubmissionsQuery.data || [],
    careerRequests: careerRequestsQuery.data || [],
    talentRequests: talentRequestsQuery.data || [],
    employerJobSubmissions: employerJobsQuery.data || [],
    contactSubmissions: contactSubmissionsQuery.data || [],
    
    // Loading states
    loadingJobs: jobApplicationsQuery.isLoading,
    loadingCVs: cvSubmissionsQuery.isLoading,
    loadingCareer: careerRequestsQuery.isLoading,
    loadingTalent: talentRequestsQuery.isLoading,
    loadingEmployer: employerJobsQuery.isLoading,
    loadingContact: contactSubmissionsQuery.isLoading,
    isInitialLoading,
    
    // Error states
    hasError,
    
    // Refetch functions
    refetchAll: () => {
      cvSubmissionsQuery.refetch();
      if (isFullAdmin) {
        jobApplicationsQuery.refetch();
        careerRequestsQuery.refetch();
        talentRequestsQuery.refetch();
        employerJobsQuery.refetch();
        contactSubmissionsQuery.refetch();
      }
    },
  };
}
