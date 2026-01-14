/**
 * Staff Assignment Select Component
 * 
 * Reusable dropdown for assigning work to staff members.
 */

import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Shield, UserCheck, Building, Megaphone, Upload, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface StaffAssignmentSelectProps {
  value: string | null;
  onValueChange: (userId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  roleFilter?: string[];
  className?: string;
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  admin: Shield,
  recruiter: UserCheck,
  account_manager: Building,
  marketing: Megaphone,
  cv_uploader: Upload,
  viewer: Eye,
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
  account_manager: 'Account Manager',
  marketing: 'Marketing',
  cv_uploader: 'CV Uploader',
  viewer: 'Viewer',
};

export default function StaffAssignmentSelect({
  value,
  onValueChange,
  placeholder = 'Assign to...',
  disabled = false,
  roleFilter,
  className,
}: StaffAssignmentSelectProps) {
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff-for-assignment', roleFilter],
    queryFn: async (): Promise<AdminProfile[]> => {
      let query = supabase
        .from('admin_profiles')
        .select('id, user_id, email, display_name, avatar_url, role')
        .order('display_name');
      
      if (roleFilter && roleFilter.length > 0) {
        query = query.in('role', roleFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const getInitials = (profile: AdminProfile): string => {
    if (profile.display_name) {
      return profile.display_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile.email.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (profile: AdminProfile): string => {
    return profile.display_name || profile.email.split('@')[0];
  };

  const selectedProfile = staff.find(s => s.user_id === value);

  return (
    <Select 
      value={value || 'unassigned'} 
      onValueChange={(v) => onValueChange(v === 'unassigned' ? null : v)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={cn("w-[200px]", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedProfile ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedProfile.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(selectedProfile)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{getDisplayName(selectedProfile)}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">Unassigned</span>
          </div>
        </SelectItem>
        {staff.map((profile) => {
          const RoleIcon = ROLE_ICONS[profile.role] || User;
          return (
            <SelectItem key={profile.user_id} value={profile.user_id}>
              <div className="flex items-center gap-2 w-full">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(profile)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="truncate">{getDisplayName(profile)}</span>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {ROLE_LABELS[profile.role] || profile.role}
                </Badge>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
