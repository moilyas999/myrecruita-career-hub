import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Search,
  RefreshCw,
  Users,
  Settings,
  Check,
  X,
  Loader2,
  Shield,
  UserCheck,
  Building,
  Megaphone,
  Upload,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  NOTIFICATION_EVENT_CONFIG,
  ROLE_NOTIFICATION_DEFAULTS,
  NotificationEventType,
  StaffRole,
  ROLE_CONFIG,
  generateEventPreferencesForRole,
} from '@/lib/permissions';
import { cn } from '@/lib/utils';

interface StaffMember {
  user_id: string;
  email: string;
  display_name: string | null;
  role: StaffRole;
}

interface NotificationPrefs {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  event_preferences: Record<string, boolean>;
}

const roleIcons: Record<StaffRole, React.ElementType> = {
  admin: Shield,
  recruiter: UserCheck,
  account_manager: Building,
  marketing: Megaphone,
  cv_uploader: Upload,
  viewer: Eye,
};

export default function UserNotificationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all');
  const [editingUser, setEditingUser] = useState<StaffMember | null>(null);
  const [editingPrefs, setEditingPrefs] = useState<NotificationPrefs | null>(null);
  const queryClient = useQueryClient();

  // Fetch all staff members
  const { data: staffMembers, isLoading: staffLoading } = useQuery({
    queryKey: ['staff-members-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('user_id, email, display_name, role')
        .order('email');
      
      if (error) throw error;
      return data as StaffMember[];
    },
  });

  // Fetch all notification preferences
  const { data: allPreferences, isLoading: prefsLoading } = useQuery({
    queryKey: ['all-notification-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*');
      
      if (error) throw error;
      return data as NotificationPrefs[];
    },
  });

  // Update notification preferences mutation
  const updatePrefsMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<NotificationPrefs> }) => {
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-notification-preferences'] });
      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    },
  });

  // Bulk reset to role defaults
  const resetToDefaultsMutation = useMutation({
    mutationFn: async (users: { userId: string; role: StaffRole }[]) => {
      const updates = users.map(({ userId, role }) => ({
        user_id: userId,
        event_preferences: generateEventPreferencesForRole(role),
        email_enabled: true,
        push_enabled: true,
        in_app_enabled: true,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('notification_preferences')
          .upsert(update, { onConflict: 'user_id' });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-notification-preferences'] });
      toast.success('Reset all users to role defaults');
    },
    onError: (error) => {
      console.error('Failed to reset defaults:', error);
      toast.error('Failed to reset to defaults');
    },
  });

  // Get preferences for a specific user
  const getUserPrefs = (userId: string): NotificationPrefs | undefined => {
    return allPreferences?.find(p => p.user_id === userId);
  };

  // Filter staff members
  const filteredStaff = staffMembers?.filter(staff => {
    const matchesSearch = staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (staff.display_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle editing a user's preferences
  const handleEdit = (staff: StaffMember) => {
    const prefs = getUserPrefs(staff.user_id);
    setEditingUser(staff);
    setEditingPrefs(prefs ? { ...prefs } : {
      id: '',
      user_id: staff.user_id,
      email_enabled: true,
      push_enabled: true,
      in_app_enabled: true,
      event_preferences: generateEventPreferencesForRole(staff.role),
    });
  };

  // Save edited preferences
  const handleSave = async () => {
    if (!editingUser || !editingPrefs) return;
    
    await updatePrefsMutation.mutateAsync({
      userId: editingUser.user_id,
      updates: {
        email_enabled: editingPrefs.email_enabled,
        push_enabled: editingPrefs.push_enabled,
        in_app_enabled: editingPrefs.in_app_enabled,
        event_preferences: editingPrefs.event_preferences,
      },
    });
    
    setEditingUser(null);
    setEditingPrefs(null);
  };

  // Apply role defaults to editing user
  const applyRoleDefaults = () => {
    if (!editingUser || !editingPrefs) return;
    setEditingPrefs({
      ...editingPrefs,
      event_preferences: generateEventPreferencesForRole(editingUser.role),
    });
  };

  // Reset all filtered users to defaults
  const handleResetAllToDefaults = () => {
    if (!filteredStaff) return;
    const users = filteredStaff.map(s => ({ userId: s.user_id, role: s.role }));
    resetToDefaultsMutation.mutate(users);
  };

  // Count enabled events for a user
  const countEnabledEvents = (userId: string): number => {
    const prefs = getUserPrefs(userId);
    if (!prefs?.event_preferences) return 0;
    return Object.values(prefs.event_preferences).filter(Boolean).length;
  };

  const isLoading = staffLoading || prefsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">User Notification Management</h2>
          <p className="text-muted-foreground">Manage notification preferences for all staff members</p>
        </div>
        <Button
          variant="outline"
          onClick={handleResetAllToDefaults}
          disabled={resetToDefaultsMutation.isPending || !filteredStaff?.length}
        >
          {resetToDefaultsMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Reset All to Defaults
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={roleFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('all')}
              >
                All
              </Button>
              {(Object.keys(ROLE_CONFIG) as StaffRole[]).map(role => {
                const config = ROLE_CONFIG[role];
                return (
                  <Button
                    key={role}
                    variant={roleFilter === role ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRoleFilter(role)}
                  >
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Staff Members ({filteredStaff?.length || 0})
          </CardTitle>
          <CardDescription>
            Click on a user to edit their notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredStaff?.length ? (
            <p className="text-muted-foreground text-center py-8">No staff members found</p>
          ) : (
            <div className="space-y-2">
              {filteredStaff.map(staff => {
                const prefs = getUserPrefs(staff.user_id);
                const RoleIcon = roleIcons[staff.role];
                const roleConfig = ROLE_CONFIG[staff.role];
                const enabledCount = countEnabledEvents(staff.user_id);
                const totalEvents = NOTIFICATION_EVENT_CONFIG.length;
                
                return (
                  <div
                    key={staff.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleEdit(staff)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg", roleConfig.color)}>
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {staff.display_name || staff.email}
                        </p>
                        {staff.display_name && (
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                        )}
                      </div>
                      <Badge variant="outline">{roleConfig.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {prefs?.push_enabled ? (
                          <Smartphone className="w-4 h-4 text-green-500" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-muted-foreground/30" />
                        )}
                        {prefs?.email_enabled ? (
                          <Mail className="w-4 h-4 text-green-500" />
                        ) : (
                          <Mail className="w-4 h-4 text-muted-foreground/30" />
                        )}
                        {prefs?.in_app_enabled ? (
                          <Bell className="w-4 h-4 text-green-500" />
                        ) : (
                          <Bell className="w-4 h-4 text-muted-foreground/30" />
                        )}
                      </div>
                      <Badge variant="secondary">
                        {enabledCount}/{totalEvents} events
                      </Badge>
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Edit Notification Preferences
            </DialogTitle>
            <DialogDescription>
              {editingUser?.display_name || editingUser?.email} ({ROLE_CONFIG[editingUser?.role || 'viewer'].label})
            </DialogDescription>
          </DialogHeader>
          
          {editingPrefs && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Channels */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Notification Channels</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <Label>Push</Label>
                      </div>
                      <Switch
                        checked={editingPrefs.push_enabled}
                        onCheckedChange={(v) => setEditingPrefs({...editingPrefs, push_enabled: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <Label>Email</Label>
                      </div>
                      <Switch
                        checked={editingPrefs.email_enabled}
                        onCheckedChange={(v) => setEditingPrefs({...editingPrefs, email_enabled: v})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <Label>In-App</Label>
                      </div>
                      <Switch
                        checked={editingPrefs.in_app_enabled}
                        onCheckedChange={(v) => setEditingPrefs({...editingPrefs, in_app_enabled: v})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Event Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Event Notifications</h4>
                    <Button variant="ghost" size="sm" onClick={applyRoleDefaults}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Apply Role Defaults
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {NOTIFICATION_EVENT_CONFIG.map(event => {
                      const isEnabled = editingPrefs.event_preferences?.[event.id] ?? false;
                      const isRoleDefault = ROLE_NOTIFICATION_DEFAULTS[editingUser?.role || 'viewer'].includes(event.id);
                      
                      return (
                        <div 
                          key={event.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium">{event.label}</Label>
                              {isRoleDefault && (
                                <Badge variant="outline" className="text-xs">
                                  Role Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(v) => setEditingPrefs({
                              ...editingPrefs,
                              event_preferences: {
                                ...editingPrefs.event_preferences,
                                [event.id]: v,
                              },
                            })}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updatePrefsMutation.isPending}
            >
              {updatePrefsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
