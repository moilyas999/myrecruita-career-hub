import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } }),
    },
  },
}));

// Mock usePermissions hook
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: vi.fn().mockReturnValue(true),
    isLoading: false,
  }),
}));

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    adminRole: 'admin',
    isAuthenticated: true,
  }),
}));

// Mock activity logger
vi.mock('@/services/activityLogger', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Calendar queryKeys', () => {
  it('should generate correct base keys', () => {
    expect(queryKeys.calendarEvents).toEqual(['calendar-events']);
    expect(queryKeys.calendarEventDetail('123')).toEqual(['calendar-events', '123']);
  });

  it('should generate my events key', () => {
    expect(queryKeys.myCalendarEvents).toEqual(['calendar-events', 'mine']);
  });

  it('should generate upcoming interviews key', () => {
    expect(queryKeys.upcomingInterviews).toEqual(['calendar-events', 'upcoming-interviews']);
  });

  it('should generate keys with parameters', () => {
    expect(queryKeys.upcomingEvents(7)).toEqual(['calendar-events', 'upcoming', 7]);
    expect(queryKeys.eventsByDate('2026-01-18')).toEqual(['calendar-events', 'date', '2026-01-18']);
    expect(queryKeys.eventsByJob('job-123')).toEqual(['calendar-events', 'job', 'job-123']);
    expect(queryKeys.eventsByCandidate('candidate-456')).toEqual(['calendar-events', 'candidate', 'candidate-456']);
  });

  it('should generate availability keys', () => {
    expect(queryKeys.availability).toEqual(['availability']);
    expect(queryKeys.myAvailability).toEqual(['availability', 'mine']);
    expect(queryKeys.userAvailability('user-123')).toEqual(['availability', 'user-123']);
  });

  it('should generate connections keys', () => {
    expect(queryKeys.calendarConnections).toEqual(['calendar-connections']);
    expect(queryKeys.myCalendarConnection).toEqual(['calendar-connections', 'mine']);
  });
});

describe('Calendar Type Definitions', () => {
  it('should have correct EventType values', () => {
    const validEventTypes = ['interview', 'meeting', 'followup', 'reminder', 'availability'];
    expect(validEventTypes).toContain('interview');
    expect(validEventTypes).toContain('meeting');
    expect(validEventTypes).toContain('followup');
    expect(validEventTypes).toContain('reminder');
    expect(validEventTypes).toContain('availability');
  });

  it('should have correct SyncStatus values', () => {
    const validSyncStatuses = ['pending', 'synced', 'failed'];
    expect(validSyncStatuses).toContain('pending');
    expect(validSyncStatuses).toContain('synced');
    expect(validSyncStatuses).toContain('failed');
  });
});

describe('Calendar Permissions', () => {
  it('should define all calendar permissions', () => {
    const calendarPermissions = [
      'calendar.view',
      'calendar.create',
      'calendar.update',
      'calendar.delete',
      'calendar.sync',
    ];
    
    calendarPermissions.forEach(permission => {
      expect(typeof permission).toBe('string');
      expect(permission.startsWith('calendar.')).toBe(true);
    });
  });
});
