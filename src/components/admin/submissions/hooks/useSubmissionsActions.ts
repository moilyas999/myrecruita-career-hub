import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, submissionQueryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import type { CVSubmission } from '../types';

export function useSubmissionsActions() {
  const queryClient = useQueryClient();

  // Delete CV mutation with optimistic update
  const deleteCVMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cv_submissions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cvSubmissions });
      const previousCVs = queryClient.getQueryData<CVSubmission[]>(queryKeys.cvSubmissions);
      queryClient.setQueryData<CVSubmission[]>(queryKeys.cvSubmissions, (old) =>
        old?.filter((cv) => cv.id !== id) || []
      );
      return { previousCVs };
    },
    onError: (err, _id, context) => {
      queryClient.setQueryData(queryKeys.cvSubmissions, context?.previousCVs);
      toast.error('Failed to delete CV submission');
      console.error('Delete error:', err);
    },
    onSuccess: () => {
      toast.success('CV submission deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
  });

  // Rescore CVs
  const rescoreCVs = async () => {
    const { data, error } = await supabase.functions.invoke('rescore-cvs');
    if (error) throw error;
    return data;
  };

  // Export all emails
  const exportEmails = (
    jobApplications: Array<{ email: string; name: string; created_at: string }>,
    cvSubmissions: Array<{ email: string; name: string; created_at: string }>,
    careerRequests: Array<{ email: string; name: string; created_at: string }>,
    talentRequests: Array<{ email: string; contact_name: string; created_at: string }>,
    employerJobSubmissions: Array<{ email: string; contact_name: string; created_at: string }>,
    contactSubmissions: Array<{ email: string; name: string; created_at: string }>
  ) => {
    const allEmails: Array<{
      email: string;
      name: string;
      source: string;
      date: string;
    }> = [];

    jobApplications.forEach(app => allEmails.push({
      email: app.email,
      name: app.name,
      source: 'Job Application',
      date: app.created_at
    }));

    cvSubmissions.forEach(cv => allEmails.push({
      email: cv.email,
      name: cv.name,
      source: 'CV Submission',
      date: cv.created_at
    }));

    careerRequests.forEach(req => allEmails.push({
      email: req.email,
      name: req.name,
      source: 'Career Partner Request',
      date: req.created_at
    }));

    talentRequests.forEach(req => allEmails.push({
      email: req.email,
      name: req.contact_name,
      source: 'Talent Request',
      date: req.created_at
    }));

    employerJobSubmissions.forEach(sub => allEmails.push({
      email: sub.email,
      name: sub.contact_name,
      source: 'Employer Job Post',
      date: sub.created_at
    }));

    contactSubmissions.forEach(sub => allEmails.push({
      email: sub.email,
      name: sub.name,
      source: 'Contact Form',
      date: sub.created_at
    }));

    const uniqueEmails = Array.from(
      new Map(allEmails.map(e => [e.email.toLowerCase(), e])).values()
    );

    const csvContent = [
      ['Email', 'Name', 'Source', 'Submission Date'].join(','),
      ...uniqueEmails.map(e => 
        [`"${e.email}"`, `"${e.name.replace(/"/g, '""')}"`, `"${e.source}"`, `"${new Date(e.date).toLocaleDateString()}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myrecruita-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${uniqueEmails.length} unique emails`);
  };

  // Refresh all queries
  const refreshAll = () => {
    submissionQueryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
  };

  // Handle CV success (after adding/importing)
  const handleCVSuccess = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
  };

  return {
    deleteCVMutation,
    rescoreCVs,
    exportEmails,
    refreshAll,
    handleCVSuccess,
  };
}
