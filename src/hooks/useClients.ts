import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Client, 
  ClientContact, 
  ClientTerms, 
  ClientInteraction,
  JobSubmission,
  RejectionReason,
  CreateClientInput, 
  CreateContactInput,
  CreateTermsInput,
  CreateInteractionInput,
  CreateJobSubmissionInput,
  ClientFilters 
} from '@/types/client';

// Query key factory
const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: ClientFilters) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  contacts: (clientId: string) => [...clientKeys.detail(clientId), 'contacts'] as const,
  terms: (clientId: string) => [...clientKeys.detail(clientId), 'terms'] as const,
  interactions: (clientId: string) => [...clientKeys.detail(clientId), 'interactions'] as const,
  rejectionReasons: ['rejection-reasons'] as const,
  jobSubmissions: (jobId: string) => ['job-submissions', jobId] as const,
};

// Fetch all clients with optional filters
export function useClients(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select(`
          *,
          account_manager:admin_profiles!clients_account_manager_id_fkey(id, display_name, email)
        `)
        .order('company_name');

      if (filters.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.psl_status) {
        query = query.eq('psl_status', filters.psl_status);
      }
      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters.account_manager_id) {
        query = query.eq('account_manager_id', filters.account_manager_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Client[];
    },
  });
}

// Fetch single client with full details
export function useClient(clientId: string | undefined) {
  return useQuery({
    queryKey: clientKeys.detail(clientId || ''),
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required');
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          account_manager:admin_profiles!clients_account_manager_id_fkey(id, display_name, email)
        `)
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data as Client;
    },
    enabled: !!clientId,
  });
}

// Fetch client contacts
export function useClientContacts(clientId: string | undefined) {
  return useQuery({
    queryKey: clientKeys.contacts(clientId || ''),
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required');
      
      const { data, error } = await supabase
        .from('client_contacts')
        .select('*')
        .eq('client_id', clientId)
        .order('is_primary', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as ClientContact[];
    },
    enabled: !!clientId,
  });
}

// Fetch client terms
export function useClientTerms(clientId: string | undefined) {
  return useQuery({
    queryKey: clientKeys.terms(clientId || ''),
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required');
      
      const { data, error } = await supabase
        .from('client_terms')
        .select('*')
        .eq('client_id', clientId)
        .order('is_active', { ascending: false })
        .order('effective_from', { ascending: false });

      if (error) throw error;
      return data as ClientTerms[];
    },
    enabled: !!clientId,
  });
}

// Fetch client interactions
export function useClientInteractions(clientId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: clientKeys.interactions(clientId || ''),
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID required');
      
      const { data, error } = await supabase
        .from('client_interactions')
        .select(`
          *,
          contact:client_contacts(id, name, email, job_title)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ClientInteraction[];
    },
    enabled: !!clientId,
  });
}

// Fetch rejection reasons
export function useRejectionReasons() {
  return useQuery({
    queryKey: clientKeys.rejectionReasons,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rejection_reasons')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as RejectionReason[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// Fetch job submissions
export function useJobSubmissions(jobId: string | undefined) {
  return useQuery({
    queryKey: clientKeys.jobSubmissions(jobId || ''),
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID required');
      
      const { data, error } = await supabase
        .from('job_submissions')
        .select(`
          *,
          cv_submission:cv_submissions(id, name, email, job_title, cv_score)
        `)
        .eq('job_id', jobId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as JobSubmission[];
    },
    enabled: !!jobId,
  });
}

// Create client mutation
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...input,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success('Client created successfully');
    },
    onError: (error) => {
      console.error('Failed to create client:', error);
      toast.error('Failed to create client');
    },
  });
}

// Update client mutation
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(data.id) });
      toast.success('Client updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update client:', error);
      toast.error('Failed to update client');
    },
  });
}

// Delete client mutation
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete client:', error);
      toast.error('Failed to delete client');
    },
  });
}

// Create contact mutation
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateContactInput) => {
      const { data, error } = await supabase
        .from('client_contacts')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.contacts(data.client_id) });
      toast.success('Contact added successfully');
    },
    onError: (error) => {
      console.error('Failed to create contact:', error);
      toast.error('Failed to add contact');
    },
  });
}

// Update contact mutation
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ClientContact> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_contacts')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.contacts(data.client_id) });
      toast.success('Contact updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update contact:', error);
      toast.error('Failed to update contact');
    },
  });
}

// Delete contact mutation
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, clientId }: { contactId: string; clientId: string }) => {
      const { error } = await supabase
        .from('client_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      return { clientId };
    },
    onSuccess: ({ clientId }) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.contacts(clientId) });
      toast.success('Contact deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete contact:', error);
      toast.error('Failed to delete contact');
    },
  });
}

// Create terms mutation
export function useCreateTerms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTermsInput) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('client_terms')
        .insert({
          ...input,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.terms(data.client_id) });
      toast.success('Terms created successfully');
    },
    onError: (error) => {
      console.error('Failed to create terms:', error);
      toast.error('Failed to create terms');
    },
  });
}

// Update terms mutation
export function useUpdateTerms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ClientTerms> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_terms')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.terms(data.client_id) });
      toast.success('Terms updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update terms:', error);
      toast.error('Failed to update terms');
    },
  });
}

// Create interaction mutation
export function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateInteractionInput) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('client_interactions')
        .insert({
          ...input,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update last_contact_at on client
      await supabase
        .from('clients')
        .update({ last_contact_at: new Date().toISOString() })
        .eq('id', input.client_id);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.interactions(data.client_id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(data.client_id) });
      toast.success('Interaction logged successfully');
    },
    onError: (error) => {
      console.error('Failed to log interaction:', error);
      toast.error('Failed to log interaction');
    },
  });
}

// Create job submission mutation
export function useCreateJobSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateJobSubmissionInput) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('job_submissions')
        .insert({
          ...input,
          submitted_by: user.user?.id,
          client_response: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.jobSubmissions(data.job_id) });
      toast.success('CV submitted to client');
    },
    onError: (error: any) => {
      console.error('Failed to submit CV:', error);
      if (error.code === '23505') {
        toast.error('This CV has already been submitted for this job');
      } else {
        toast.error('Failed to submit CV');
      }
    },
  });
}

// Update job submission response
export function useUpdateJobSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      jobId,
      ...input 
    }: Partial<JobSubmission> & { id: string; jobId: string }) => {
      const updateData: Record<string, any> = { ...input };
      
      // Auto-set responded_at when response changes
      if (input.client_response && input.client_response !== 'pending') {
        updateData.client_responded_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('job_submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, jobId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.jobSubmissions(data.jobId) });
      toast.success('Submission updated');
    },
    onError: (error) => {
      console.error('Failed to update submission:', error);
      toast.error('Failed to update submission');
    },
  });
}
