import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { PermissionType, StaffRole, ROLE_CONFIG } from '@/lib/permissions';
import { queryKeys } from '@/lib/queryKeys';

interface UsePermissionsReturn {
  permissions: PermissionType[];
  hasPermission: (permission: PermissionType) => boolean;
  hasAnyPermission: (permissions: PermissionType[]) => boolean;
  hasAllPermissions: (permissions: PermissionType[]) => boolean;
  canAccess: (resource: string, action?: string) => boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePermissions(): UsePermissionsReturn {
  const { user, adminRole } = useAuth();

  const { data: permissions = [], isLoading, error, refetch } = useQuery({
    queryKey: [...queryKeys.staffPermissions, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('staff_permissions')
        .select('permission')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(p => p.permission as PermissionType);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const hasPermission = (permission: PermissionType): boolean => {
    // Full admins always have all permissions
    if (adminRole === 'admin') return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: PermissionType[]): boolean => {
    if (adminRole === 'admin') return true;
    return perms.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (perms: PermissionType[]): boolean => {
    if (adminRole === 'admin') return true;
    return perms.every(p => permissions.includes(p));
  };

  const canAccess = (resource: string, action?: string): boolean => {
    if (adminRole === 'admin') return true;
    
    const permission = action 
      ? `${resource}.${action}` as PermissionType
      : `${resource}.view` as PermissionType;
    
    return hasPermission(permission);
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// Hook to get default permissions for a role
export function useRolePermissions(role: StaffRole): PermissionType[] {
  return ROLE_CONFIG[role]?.defaultPermissions || [];
}
