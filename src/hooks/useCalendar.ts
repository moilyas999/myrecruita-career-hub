import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { queryKeys } from '@/lib/queryKeys';
import { logActivity } from '@/services/activityLogger';
import { toast } from 'sonner';
import type {
  CalendarEvent,
  CalendarEventWithRelations,
  CalendarConnection,
  AvailabilitySlot,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CreateAvailabilitySlotInput,
  UpdateAvailabilitySlotInput,
  CalendarEventFilters,
} from '@/types/calendar';

// ============= Calendar Events =============

export function useCalendarEvents(filters?: CalendarEventFilters) {
  const { hasPermission } = usePermissions();
  
  return useQuery({
    queryKey: [...queryKeys.calendarEvents, filters],
    queryFn: async () => {
      let query = supabase
        .from('calendar_events')
        .select(`
          *,
          candidate:cv_submissions!candidate_id(id, name, email, job_title),
          job:jobs!job_id(id, title, reference_id, location),
          client:clients!client_id(id, company_name)
        `)
        .order('start_time', { ascending: true });
      
      if (filters?.startDate) {
        query = query.gte('start_time', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('start_time', filters.endDate);
      }
      if (filters?.eventType) {
        if (Array.isArray(filters.eventType)) {
          query = query.in('event_type', filters.eventType);
        } else {
          query = query.eq('event_type', filters.eventType);
        }
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters?.jobId) {
        query = query.eq('job_id', filters.jobId);
      }
      if (filters?.candidateId) {
        query = query.eq('candidate_id', filters.candidateId);
      }
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (!filters?.includesCancelled) {
        query = query.eq('is_cancelled', false);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(transformEventFromDb) as CalendarEventWithRelations[];
    },
    enabled: hasPermission('calendar.view'),
  });
}

export function useCalendarEvent(id: string | undefined) {
  const { hasPermission } = usePermissions();
  
  return useQuery({
    queryKey: queryKeys.calendarEventDetail(id || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          candidate:cv_submissions!candidate_id(id, name, email, job_title),
          job:jobs!job_id(id, title, reference_id, location),
          client:clients!client_id(id, company_name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return transformEventFromDb(data) as CalendarEventWithRelations;
    },
    enabled: !!id && hasPermission('calendar.view'),
  });
}

export function useMyCalendarEvents() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.myCalendarEvents,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          candidate:cv_submissions!candidate_id(id, name, email, job_title),
          job:jobs!job_id(id, title, reference_id, location),
          client:clients!client_id(id, company_name)
        `)
        .or(`created_by.eq.${user?.id},assigned_to.eq.${user?.id}`)
        .eq('is_cancelled', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(transformEventFromDb) as CalendarEventWithRelations[];
    },
    enabled: !!user?.id,
  });
}

export function useUpcomingInterviews(days = 7) {
  const { hasPermission } = usePermissions();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return useQuery({
    queryKey: queryKeys.upcomingEvents(days),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          candidate:cv_submissions!candidate_id(id, name, email, job_title),
          job:jobs!job_id(id, title, reference_id, location),
          client:clients!client_id(id, company_name)
        `)
        .eq('event_type', 'interview')
        .eq('is_cancelled', false)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(transformEventFromDb) as CalendarEventWithRelations[];
    },
    enabled: hasPermission('calendar.view'),
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (input: CreateCalendarEventInput) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...transformEventToDb(input),
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformEventFromDb(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents });
      queryClient.invalidateQueries({ queryKey: queryKeys.myCalendarEvents });
      
      logActivity({
        action: 'cv_created', // Using existing action type
        resourceType: 'cv_submission',
        resourceId: data.id,
        details: {
          event_type: data.eventType,
          title: data.title,
          start_time: data.startTime,
        },
      });
      
      toast.success('Event created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create event', { description: error.message });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateCalendarEventInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('calendar_events')
        .update(transformEventToDb(updates))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformEventFromDb(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents });
      queryClient.invalidateQueries({ queryKey: queryKeys.myCalendarEvents });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarEventDetail(data.id) });
      
      toast.success('Event updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update event', { description: error.message });
    },
  });
}

export function useCancelCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          is_cancelled: true,
          cancellation_reason: reason || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformEventFromDb(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents });
      queryClient.invalidateQueries({ queryKey: queryKeys.myCalendarEvents });
      
      toast.success('Event cancelled');
    },
    onError: (error: Error) => {
      toast.error('Failed to cancel event', { description: error.message });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents });
      queryClient.invalidateQueries({ queryKey: queryKeys.myCalendarEvents });
      
      toast.success('Event deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete event', { description: error.message });
    },
  });
}

// ============= Availability Slots =============

export function useMyAvailability() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.myAvailability,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('user_id', user?.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(transformAvailabilityFromDb);
    },
    enabled: !!user?.id,
  });
}

export function useUserAvailability(userId: string | undefined) {
  const { hasPermission } = usePermissions();
  
  return useQuery({
    queryKey: queryKeys.userAvailability(userId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('user_id', userId)
        .eq('is_available', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(transformAvailabilityFromDb);
    },
    enabled: !!userId && hasPermission('calendar.view'),
  });
}

export function useCreateAvailabilitySlot() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (input: CreateAvailabilitySlotInput) => {
      const { data, error } = await supabase
        .from('availability_slots')
        .insert({
          ...transformAvailabilityToDb(input),
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformAvailabilityFromDb(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availability });
      queryClient.invalidateQueries({ queryKey: queryKeys.myAvailability });
      toast.success('Availability slot added');
    },
    onError: (error: Error) => {
      toast.error('Failed to add availability', { description: error.message });
    },
  });
}

export function useUpdateAvailabilitySlot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateAvailabilitySlotInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('availability_slots')
        .update(transformAvailabilityToDb(updates))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformAvailabilityFromDb(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availability });
      queryClient.invalidateQueries({ queryKey: queryKeys.myAvailability });
      toast.success('Availability updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update availability', { description: error.message });
    },
  });
}

export function useDeleteAvailabilitySlot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availability });
      queryClient.invalidateQueries({ queryKey: queryKeys.myAvailability });
      toast.success('Availability slot removed');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove availability', { description: error.message });
    },
  });
}

// ============= Calendar Connection =============

export function useMyCalendarConnection() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.myCalendarConnection,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data ? transformConnectionFromDb(data) : null;
    },
    enabled: !!user?.id,
  });
}

// ============= Transform Functions =============

function transformEventFromDb(data: any): CalendarEvent | CalendarEventWithRelations {
  return {
    id: data.id,
    pipelineId: data.pipeline_id,
    jobId: data.job_id,
    candidateId: data.candidate_id,
    clientId: data.client_id,
    createdBy: data.created_by,
    assignedTo: data.assigned_to,
    eventType: data.event_type,
    title: data.title,
    description: data.description,
    startTime: data.start_time,
    endTime: data.end_time,
    location: data.location,
    meetingLink: data.meeting_link,
    googleEventId: data.google_event_id,
    googleCalendarId: data.google_calendar_id,
    syncStatus: data.sync_status,
    reminderSent: data.reminder_sent,
    reminder24hSent: data.reminder_24h_sent,
    reminder1hSent: data.reminder_1h_sent,
    isCancelled: data.is_cancelled,
    cancellationReason: data.cancellation_reason,
    metadata: data.metadata || {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    // Relations
    ...(data.candidate && {
      candidate: {
        id: data.candidate.id,
        name: data.candidate.name,
        email: data.candidate.email,
        jobTitle: data.candidate.job_title,
      },
    }),
    ...(data.job && {
      job: {
        id: data.job.id,
        title: data.job.title,
        referenceId: data.job.reference_id,
        location: data.job.location,
      },
    }),
    ...(data.client && {
      client: {
        id: data.client.id,
        companyName: data.client.company_name,
      },
    }),
  };
}

function transformEventToDb(input: Partial<CreateCalendarEventInput & { isCancelled?: boolean; cancellationReason?: string }>): any {
  const result: any = {};
  
  if (input.pipelineId !== undefined) result.pipeline_id = input.pipelineId;
  if (input.jobId !== undefined) result.job_id = input.jobId;
  if (input.candidateId !== undefined) result.candidate_id = input.candidateId;
  if (input.clientId !== undefined) result.client_id = input.clientId;
  if (input.assignedTo !== undefined) result.assigned_to = input.assignedTo;
  if (input.eventType !== undefined) result.event_type = input.eventType;
  if (input.title !== undefined) result.title = input.title;
  if (input.description !== undefined) result.description = input.description;
  if (input.startTime !== undefined) result.start_time = input.startTime;
  if (input.endTime !== undefined) result.end_time = input.endTime;
  if (input.location !== undefined) result.location = input.location;
  if (input.meetingLink !== undefined) result.meeting_link = input.meetingLink;
  if (input.metadata !== undefined) result.metadata = input.metadata;
  if (input.isCancelled !== undefined) result.is_cancelled = input.isCancelled;
  if (input.cancellationReason !== undefined) result.cancellation_reason = input.cancellationReason;
  
  return result;
}

function transformAvailabilityFromDb(data: any): AvailabilitySlot {
  return {
    id: data.id,
    userId: data.user_id,
    dayOfWeek: data.day_of_week,
    startTime: data.start_time,
    endTime: data.end_time,
    isRecurring: data.is_recurring,
    specificDate: data.specific_date,
    isAvailable: data.is_available,
    timezone: data.timezone,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformAvailabilityToDb(input: Partial<CreateAvailabilitySlotInput>): any {
  const result: any = {};
  
  if (input.dayOfWeek !== undefined) result.day_of_week = input.dayOfWeek;
  if (input.startTime !== undefined) result.start_time = input.startTime;
  if (input.endTime !== undefined) result.end_time = input.endTime;
  if (input.isRecurring !== undefined) result.is_recurring = input.isRecurring;
  if (input.specificDate !== undefined) result.specific_date = input.specificDate;
  if (input.isAvailable !== undefined) result.is_available = input.isAvailable;
  if (input.timezone !== undefined) result.timezone = input.timezone;
  
  return result;
}

function transformConnectionFromDb(data: any): CalendarConnection {
  return {
    id: data.id,
    userId: data.user_id,
    provider: data.provider,
    isActive: data.is_active,
    calendarId: data.calendar_id,
    calendarName: data.calendar_name,
    tokenExpiresAt: data.token_expires_at,
    lastSyncAt: data.last_sync_at,
    syncError: data.sync_error,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
