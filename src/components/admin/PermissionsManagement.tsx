import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Search, 
  Shield, 
  UserCheck, 
  Building, 
  Megaphone, 
  Upload, 
  Eye,
  Settings,
  RefreshCw,
  Save,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { 
  PermissionType, 
  StaffRole, 
  ROLE_CONFIG, 
  PERMISSION_CATEGORIES, 
  PERMISSION_LABELS,
  ALL_PERMISSIONS,
} from '@/lib/permissions';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface StaffMember {
  id: string;
  user_id: string;
  email: string;
  role: string;
  display_name: string | null;
  created_at: string;
}

interface StaffPermission {
  user_id: string;
  permission: PermissionType;
}

const roleIcons: Record<StaffRole, React.ElementType> = {
  admin: Shield,
  recruiter: UserCheck,
  account_manager: Building,
  marketing: Megaphone,
  cv_uploader: Upload,
  viewer: Eye,
};

export default function PermissionsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<PermissionType[]>([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all staff members
  const { data: staffMembers = [], isLoading: staffLoading } = useQuery({
    queryKey: queryKeys.adminProfiles,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as StaffMember[];
    },
  });

  // Fetch all permissions for all staff
  const { data: allPermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: queryKeys.staffPermissions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_permissions')
        .select('user_id, permission');
      if (error) throw error;
      return data as StaffPermission[];
    },
  });

  // Mutation to update permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: PermissionType[] }) => {
      // Delete all existing permissions for this user
      const { error: deleteError } = await supabase
        .from('staff_permissions')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) throw deleteError;

      // Insert new permissions
      if (permissions.length > 0) {
        const { error: insertError } = await supabase
          .from('staff_permissions')
          .insert(permissions.map(p => ({
            user_id: userId,
            permission: p,
            granted_by: user?.id,
          })));
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffPermissions });
      toast.success('Permissions updated successfully');
      setSelectedStaff(null);
    },
    onError: (error) => {
      toast.error('Failed to update permissions: ' + error.message);
    },
  });

  // Apply role defaults mutation
  const applyRoleDefaultsMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: StaffRole }) => {
      const { error } = await supabase.rpc('assign_role_permissions', {
        _user_id: userId,
        _role: role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffPermissions });
      toast.success('Role defaults applied');
    },
    onError: (error) => {
      toast.error('Failed to apply role defaults: ' + error.message);
    },
  });

  // Filter staff members
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = 
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get permissions for a specific user
  const getUserPermissions = (userId: string): PermissionType[] => {
    return allPermissions
      .filter(p => p.user_id === userId)
      .map(p => p.permission);
  };

  // Open edit dialog
  const openEditDialog = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setEditedPermissions(getUserPermissions(staff.user_id));
  };

  // Handle permission toggle
  const togglePermission = (permission: PermissionType) => {
    setEditedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  // Toggle all permissions in a category
  const toggleCategory = (categoryPerms: PermissionType[], enable: boolean) => {
    setEditedPermissions(prev => {
      if (enable) {
        return [...new Set([...prev, ...categoryPerms])];
      } else {
        return prev.filter(p => !categoryPerms.includes(p));
      }
    });
  };

  // Save permissions
  const savePermissions = () => {
    if (!selectedStaff) return;
    updatePermissionsMutation.mutate({
      userId: selectedStaff.user_id,
      permissions: editedPermissions,
    });
  };

  const isLoading = staffLoading || permissionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Permissions Management</h2>
        <p className="text-muted-foreground">View and edit staff permissions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                  <SelectItem key={role} value={role}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            Click on a staff member to edit their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No staff members found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => {
                  const userPerms = getUserPermissions(staff.user_id);
                  const RoleIcon = roleIcons[staff.role as StaffRole] || Shield;
                  const roleConfig = ROLE_CONFIG[staff.role as StaffRole];
                  
                  return (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{staff.display_name || staff.email}</p>
                          {staff.display_name && (
                            <p className="text-xs text-muted-foreground">{staff.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={cn("flex items-center gap-1 w-fit", roleConfig?.color)}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {roleConfig?.label || staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {userPerms.length} / {ALL_PERMISSIONS.length} permissions
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyRoleDefaultsMutation.mutate({
                              userId: staff.user_id,
                              role: staff.role as StaffRole,
                            })}
                            disabled={applyRoleDefaultsMutation.isPending}
                            title="Reset to role defaults"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                            Reset
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openEditDialog(staff)}
                          >
                            <Settings className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Permissions Dialog */}
      <Dialog open={!!selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Permissions for {selectedStaff?.display_name || selectedStaff?.email}
            </DialogTitle>
            <DialogDescription>
              Select the permissions this staff member should have
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditedPermissions([...ALL_PERMISSIONS])}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditedPermissions([])}
              >
                Clear All
              </Button>
              <Separator orientation="vertical" className="h-8" />
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => setEditedPermissions(config.defaultPermissions)}
                >
                  Apply {config.label}
                </Button>
              ))}
            </div>

            <Separator />

            {/* Permission Categories */}
            <Accordion type="multiple" className="w-full">
              {Object.entries(PERMISSION_CATEGORIES).map(([category, { label, permissions }]) => {
                const allChecked = permissions.every(p => editedPermissions.includes(p));
                const someChecked = permissions.some(p => editedPermissions.includes(p));
                
                return (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={allChecked}
                          onCheckedChange={(checked) => {
                            toggleCategory(permissions, !!checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            someChecked && !allChecked && "data-[state=unchecked]:bg-primary/50"
                          )}
                        />
                        <span className="font-medium">{label}</span>
                        <Badge variant="secondary" className="ml-auto mr-4">
                          {permissions.filter(p => editedPermissions.includes(p)).length}/{permissions.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8 pt-2">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center gap-2">
                            <Checkbox
                              id={permission}
                              checked={editedPermissions.includes(permission)}
                              onCheckedChange={() => togglePermission(permission)}
                            />
                            <Label 
                              htmlFor={permission} 
                              className="text-sm cursor-pointer"
                            >
                              {PERMISSION_LABELS[permission]}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setSelectedStaff(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={savePermissions}
              disabled={updatePermissionsMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
