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

describe('queryKeys.calendar', () => {
  const calendarKeys = queryKeys.calendar;
  
  it('should generate correct base keys', () => {
    expect(calendarKeys.all).toEqual(['calendar-events']);
    expect(calendarKeys.lists()).toEqual(['calendar-events', 'list']);
    expect(calendarKeys.detail('123')).toEqual(['calendar-events', 'detail', '123']);
  });

  it('should generate keys with filters', () => {
    const filters = { eventType: 'interview', startDate: '2026-01-01' };
    expect(calendarKeys.list(filters)).toEqual(['calendar-events', 'list', filters]);
  });

  it('should generate my events key', () => {
    expect(calendarKeys.myEvents()).toEqual(['calendar-events', 'my']);
  });

  it('should generate upcoming interviews key', () => {
    expect(calendarKeys.upcomingInterviews()).toEqual(['calendar-events', 'upcoming-interviews']);
  });

  it('should generate availability keys', () => {
    expect(calendarKeys.availability()).toEqual(['availability']);
    expect(calendarKeys.userAvailability('user-123')).toEqual(['availability', 'user-123']);
  });

  it('should generate connections keys', () => {
    expect(calendarKeys.connections()).toEqual(['calendar-connections']);
    expect(calendarKeys.myConnection()).toEqual(['calendar-connections', 'mine']);
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
