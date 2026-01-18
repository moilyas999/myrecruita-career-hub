import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { logActivity } from '@/services/activityLogger';
import type { CandidateProfile, UpdateCandidateProfileData, Qualification, EmploymentEntry } from '@/types/candidate';
import type { AIProfile, CVScoreBreakdown } from '@/types/cv';

/**
 * Fetch a single candidate's full profile by ID
 */
export function useCandidateProfile(candidateId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.cvSubmissions, 'profile', candidateId],
    queryFn: async (): Promise<CandidateProfile | null> => {
      if (!candidateId) return null;

      const { data, error } = await supabase
        .from('cv_submissions')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Map database row to CandidateProfile type
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        cv_file_url: data.cv_file_url,
        source: data.source,
        created_at: data.created_at,
        job_title: data.job_title,
        sector: data.sector,
        location: data.location,
        years_experience: data.years_experience,
        seniority_level: data.seniority_level,
        skills: data.skills,
        experience_summary: data.experience_summary,
        education_level: data.education_level,
        ai_profile: data.ai_profile as unknown as AIProfile | null,
        cv_score: data.cv_score,
        cv_score_breakdown: data.cv_score_breakdown as unknown as CVScoreBreakdown | null,
        qualifications: (data.qualifications as unknown as Qualification[]) || [],
        professional_memberships: data.professional_memberships || [],
        current_salary: data.current_salary,
        salary_expectation: data.salary_expectation,
        notice_period: data.notice_period,
        available_from: data.available_from,
        right_to_work: data.right_to_work as CandidateProfile['right_to_work'],
        visa_type: data.visa_type as CandidateProfile['visa_type'],
        visa_expiry_date: data.visa_expiry_date,
        requires_sponsorship: data.requires_sponsorship ?? false,
        employment_history: (data.employment_history as unknown as EmploymentEntry[]) || [],
        role_changes_5yr: data.role_changes_5yr,
        sector_exposure: data.sector_exposure || [],
        last_contact_date: data.last_contact_date,
        consent_given_at: data.consent_given_at,
        consent_expires_at: data.consent_expires_at,
        anonymised_at: data.anonymised_at,
        gdpr_notes: data.gdpr_notes,
        admin_notes: data.admin_notes,
        added_by: data.added_by,
        potential_duplicate_of: data.potential_duplicate_of,
      };
    },
    enabled: !!candidateId,
  });
}

/**
 * Update a candidate's profile
 */
export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCandidateProfileData }) => {
      // Serialize custom types to JSON-compatible format
      const dbData = {
        ...data,
        qualifications: data.qualifications ? JSON.parse(JSON.stringify(data.qualifications)) : undefined,
        employment_history: data.employment_history ? JSON.parse(JSON.stringify(data.employment_history)) : undefined,
      };
      
      const { data: updated, error } = await supabase
        .from('cv_submissions')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.cvSubmissions, 'profile', variables.id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
      toast.success('Profile updated');
      logActivity({
        action: 'candidate_profile_updated',
        resourceType: 'cv_submission',
        resourceId: variables.id,
        details: { fields_updated: Object.keys(variables.data) },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });
}

/**
 * Update last contact date (common GDPR action)
 */
export function useUpdateLastContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string) => {
      const { data, error } = await supabase
        .from('cv_submissions')
        .update({ last_contact_date: new Date().toISOString() })
        .eq('id', candidateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, candidateId) => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.cvSubmissions, 'profile', candidateId] });
      toast.success('Contact date updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update contact date: ' + error.message);
    },
  });
}

/**
 * Anonymise a candidate (GDPR)
 */
export function useAnonymiseCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string) => {
      // Generate anonymous placeholder data
      const anonymousData = {
        name: 'Anonymous Candidate',
        email: `anonymous-${candidateId.substring(0, 8)}@anonymised.local`,
        phone: '0000000000',
        admin_notes: null,
        gdpr_notes: 'Anonymised per GDPR request',
        anonymised_at: new Date().toISOString(),
        // Clear sensitive fields
        current_salary: null,
        salary_expectation: null,
        employment_history: [],
        qualifications: [],
        ai_profile: null,
        skills: null,
        experience_summary: null,
      };

      const { data, error } = await supabase
        .from('cv_submissions')
        .update(anonymousData)
        .eq('id', candidateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, candidateId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
      toast.success('Candidate data anonymised');
      logActivity({
        action: 'candidate_anonymised',
        resourceType: 'cv_submission',
        resourceId: candidateId,
        details: { reason: 'GDPR request' },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to anonymise candidate: ' + error.message);
    },
  });
}

/**
 * Fetch candidates with potential duplicates
 */
export function useDuplicateCandidates() {
  return useQuery({
    queryKey: [...queryKeys.cvSubmissions, 'duplicates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cv_submissions')
        .select('id, name, email, phone, cv_file_url, created_at, source, potential_duplicate_of')
        .not('potential_duplicate_of', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Mark candidate as not a duplicate
 */
export function useClearDuplicateFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string) => {
      const { data, error } = await supabase
        .from('cv_submissions')
        .update({ potential_duplicate_of: null })
        .eq('id', candidateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.cvSubmissions, 'duplicates'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
      toast.success('Duplicate flag cleared');
    },
    onError: (error: Error) => {
      toast.error('Failed to clear duplicate flag: ' + error.message);
    },
  });
}

/**
 * Merge duplicate candidates (keep primary, delete duplicate)
 */
export function useMergeDuplicates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ primaryId, duplicateId }: { primaryId: string; duplicateId: string }) => {
      // First, update any pipeline entries to point to the primary
      await supabase
        .from('candidate_pipeline')
        .update({ cv_submission_id: primaryId })
        .eq('cv_submission_id', duplicateId);

      // Delete the duplicate
      const { error } = await supabase
        .from('cv_submissions')
        .delete()
        .eq('id', duplicateId);

      if (error) throw error;
      return { primaryId, duplicateId };
    },
    onSuccess: ({ primaryId, duplicateId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      toast.success('Candidates merged successfully');
      logActivity({
        action: 'candidates_merged',
        resourceType: 'cv_submission',
        resourceId: primaryId,
        details: { merged_from: duplicateId },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to merge candidates: ' + error.message);
    },
  });
}

/**
 * Get candidate's pipeline history
 */
export function useCandidatePipelineHistory(candidateId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.candidatePipeline, 'candidate', candidateId],
    queryFn: async () => {
      if (!candidateId) return [];

      const { data, error } = await supabase
        .from('candidate_pipeline')
        .select(`
          *,
          job:jobs(id, title, reference_id, location, sector),
          activities:pipeline_activity(*)
        `)
        .eq('cv_submission_id', candidateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!candidateId,
  });
}
