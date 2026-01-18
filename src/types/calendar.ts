// Calendar event types for Phase 6: Calendar & Scheduling

export type EventType = 'interview' | 'meeting' | 'followup' | 'reminder' | 'other';
export type SyncStatus = 'pending' | 'synced' | 'failed' | 'not_synced';
export type CalendarProvider = 'google' | 'outlook' | 'other';

export interface CalendarEvent {
  id: string;
  pipelineId: string | null;
  jobId: string | null;
  candidateId: string | null;
  clientId: string | null;
  createdBy: string;
  assignedTo: string | null;
  eventType: EventType;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  meetingLink: string | null;
  googleEventId: string | null;
  googleCalendarId: string | null;
  syncStatus: SyncStatus;
  reminderSent: boolean;
  reminder24hSent: boolean;
  reminder1hSent: boolean;
  isCancelled: boolean;
  cancellationReason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventWithRelations extends CalendarEvent {
  candidate?: {
    id: string;
    name: string;
    email: string;
    jobTitle: string | null;
  } | null;
  job?: {
    id: string;
    title: string;
    referenceId: string;
    location: string;
  } | null;
  client?: {
    id: string;
    companyName: string;
  } | null;
  assignedUser?: {
    id: string;
    displayName: string | null;
    email: string;
  } | null;
}

export interface CalendarConnection {
  id: string;
  userId: string;
  provider: CalendarProvider;
  isActive: boolean;
  calendarId: string | null;
  calendarName: string | null;
  tokenExpiresAt: string | null;
  lastSyncAt: string | null;
  syncError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  id: string;
  userId: string;
  dayOfWeek: number | null; // 0-6 (Sunday-Saturday)
  startTime: string; // TIME as string "HH:MM:SS"
  endTime: string;
  isRecurring: boolean;
  specificDate: string | null; // DATE as string "YYYY-MM-DD"
  isAvailable: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// Form types for creating/updating events
export interface CreateCalendarEventInput {
  pipelineId?: string | null;
  jobId?: string | null;
  candidateId?: string | null;
  clientId?: string | null;
  assignedTo?: string | null;
  eventType: EventType;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  location?: string | null;
  meetingLink?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateCalendarEventInput extends Partial<CreateCalendarEventInput> {
  id: string;
  isCancelled?: boolean;
  cancellationReason?: string | null;
}

export interface CreateAvailabilitySlotInput {
  dayOfWeek?: number | null;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string | null;
  isAvailable?: boolean;
  timezone?: string;
}

export interface UpdateAvailabilitySlotInput extends Partial<CreateAvailabilitySlotInput> {
  id: string;
}

// Filter types for querying events
export interface CalendarEventFilters {
  startDate?: string;
  endDate?: string;
  eventType?: EventType | EventType[];
  assignedTo?: string;
  jobId?: string;
  candidateId?: string;
  clientId?: string;
  syncStatus?: SyncStatus;
  includesCancelled?: boolean;
}

// Interview scheduling specific types
export interface InterviewScheduleInput {
  pipelineId: string;
  candidateId: string;
  jobId: string;
  interviewType: 'phone_screen' | 'video' | 'in_person' | 'technical' | 'final';
  scheduledTime: string;
  duration: number; // minutes
  location?: string;
  meetingLink?: string;
  interviewerIds: string[];
  notes?: string;
}

// Calendar sync types
export interface CalendarSyncResult {
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsFailed: number;
  errors: string[];
}

// Day of week helpers
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
] as const;

// Event type configuration
export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; icon: string }> = {
  interview: { label: 'Interview', color: 'bg-blue-500', icon: 'Video' },
  meeting: { label: 'Meeting', color: 'bg-purple-500', icon: 'Users' },
  followup: { label: 'Follow-up', color: 'bg-amber-500', icon: 'PhoneCall' },
  reminder: { label: 'Reminder', color: 'bg-green-500', icon: 'Bell' },
  other: { label: 'Other', color: 'bg-slate-500', icon: 'Calendar' },
};

// Sync status configuration
export const SYNC_STATUS_CONFIG: Record<SyncStatus, { label: string; color: string }> = {
  pending: { label: 'Pending Sync', color: 'bg-amber-500' },
  synced: { label: 'Synced', color: 'bg-green-500' },
  failed: { label: 'Sync Failed', color: 'bg-red-500' },
  not_synced: { label: 'Not Synced', color: 'bg-slate-500' },
};
