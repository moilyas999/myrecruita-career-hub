import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock dependencies
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

import { usePermissions, useRolePermissions } from '../usePermissions';
import { useAuth } from '../useAuth';
import { ROLE_CONFIG } from '@/lib/permissions';

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('usePermissions', () => {
  const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { permission: 'cv.view' },
          { permission: 'cv.create' },
          { permission: 'pipeline.view' },
        ],
        error: null,
      }),
    });
  });

  it('returns empty permissions when user is not logged in', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      adminRole: null,
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.permissions).toEqual([]);
  });

  it('fetches permissions from Supabase for logged-in user', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'recruiter',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('staff_permissions');
    expect(result.current.permissions).toContain('cv.view');
    expect(result.current.permissions).toContain('pipeline.view');
  });

  it('hasPermission returns true for admin role', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'admin',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Admin should have all permissions
    expect(result.current.hasPermission('cv.delete')).toBe(true);
    expect(result.current.hasPermission('staff.delete')).toBe(true);
    expect(result.current.hasPermission('pipeline.create')).toBe(true);
  });

  it('hasPermission returns true when permission exists', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'recruiter',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasPermission('cv.view')).toBe(true);
    expect(result.current.hasPermission('cv.create')).toBe(true);
  });

  it('hasPermission returns false when permission is missing', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'recruiter',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // staff.delete is not in our mock permissions
    expect(result.current.hasPermission('staff.delete')).toBe(false);
  });

  it('hasAnyPermission returns true if any permission matches', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'recruiter',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAnyPermission(['cv.view', 'staff.delete'])).toBe(true);
    expect(result.current.hasAnyPermission(['staff.delete', 'settings.update'])).toBe(false);
  });

  it('hasAnyPermission returns true for admin role', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'admin',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAnyPermission(['staff.delete', 'settings.update'])).toBe(true);
  });

  it('hasAllPermissions returns true if all permissions match', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'recruiter',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAllPermissions(['cv.view', 'cv.create'])).toBe(true);
    expect(result.current.hasAllPermissions(['cv.view', 'staff.delete'])).toBe(false);
  });

  it('hasAllPermissions returns true for admin role', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'admin',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAllPermissions(['cv.view', 'staff.delete', 'settings.update'])).toBe(true);
  });

  it('canAccess constructs correct permission string', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'recruiter',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // canAccess('cv') should check for 'cv.view'
    expect(result.current.canAccess('cv')).toBe(true);
    
    // canAccess('cv', 'create') should check for 'cv.create'
    expect(result.current.canAccess('cv', 'create')).toBe(true);
    
    // canAccess('staff') should check for 'staff.view' which we don't have
    expect(result.current.canAccess('staff')).toBe(false);
  });

  it('canAccess returns true for admin role', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'admin',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.canAccess('staff', 'delete')).toBe(true);
  });

  it('handles Supabase error gracefully', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      adminRole: 'recruiter',
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});

describe('useRolePermissions', () => {
  it('returns default permissions for a role', () => {
    const { result } = renderHook(() => useRolePermissions('recruiter'), {
      wrapper: createWrapper(),
    });

    expect(result.current).toEqual(ROLE_CONFIG.recruiter.defaultPermissions);
  });

  it('returns empty array for invalid role', () => {
    const { result } = renderHook(() => useRolePermissions('nonexistent' as any), {
      wrapper: createWrapper(),
    });

    expect(result.current).toEqual([]);
  });

  it('returns all permissions for admin role', () => {
    const { result } = renderHook(() => useRolePermissions('admin'), {
      wrapper: createWrapper(),
    });

    expect(result.current).toEqual(ROLE_CONFIG.admin.defaultPermissions);
    expect(result.current.length).toBeGreaterThan(20); // Admin has many permissions
  });
});
