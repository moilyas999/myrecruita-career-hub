import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Eye, EyeOff, Shield, Upload, UserCheck, Building, Megaphone, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StaffRole, ROLE_CONFIG } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  role: string;
  display_name: string | null;
  created_at: string;
}

const roleIcons: Record<StaffRole, React.ElementType> = {
  admin: Shield,
  recruiter: UserCheck,
  account_manager: Building,
  marketing: Megaphone,
  cv_uploader: Upload,
  viewer: Eye,
};

export default function AdminManagement() {
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<StaffRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const { createAdminUser } = useAuth();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admins:', error);
        toast.error('Failed to load admin profiles');
      } else {
        setAdminProfiles(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load admin profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const { error } = await createAdminUser(newAdminEmail.toLowerCase(), newAdminPassword, newAdminRole);
    
    if (error) {
      toast.error(error);
    } else {
      const roleConfig = ROLE_CONFIG[newAdminRole];
      toast.success(`${roleConfig.label} account created successfully!`);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminRole('admin');
      setIsDialogOpen(false);
      fetchAdmins();
    }
    
    setCreating(false);
  };

  const getRoleBadgeColor = (role: string) => {
    const config = ROLE_CONFIG[role as StaffRole];
    return config?.color || '';
  };

  const getRoleIcon = (role: string) => {
    const RoleIcon = roleIcons[role as StaffRole] || Shield;
    return <RoleIcon className="w-3 h-3" />;
  };

  const getRoleLabel = (role: string) => {
    const config = ROLE_CONFIG[role as StaffRole];
    return config?.label || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Staff Management</h2>
          <p className="text-muted-foreground">Manage staff accounts and permissions</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin?tab=permissions">
              <Settings className="w-4 h-4 mr-2" />
              Manage Permissions
            </Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Staff Account</DialogTitle>
                <DialogDescription>
                  Create a new staff account. Role determines default permissions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-role">Role</Label>
                  <Select value={newAdminRole} onValueChange={(v) => setNewAdminRole(v as StaffRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(ROLE_CONFIG) as [StaffRole, typeof ROLE_CONFIG[StaffRole]][]).map(([role, config]) => {
                        const RoleIcon = roleIcons[role];
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <RoleIcon className="w-4 h-4" />
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">
                      {ROLE_CONFIG[newAdminRole].description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ROLE_CONFIG[newAdminRole].defaultPermissions.length} default permissions
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Accounts</CardTitle>
          <CardDescription>
            All staff accounts with access to this panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminProfiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No staff accounts found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminProfiles.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>{admin.display_name || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={cn("flex items-center gap-1 w-fit", getRoleBadgeColor(admin.role))}
                      >
                        {getRoleIcon(admin.role)}
                        {getRoleLabel(admin.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin?tab=permissions`}>
                          <Settings className="w-4 h-4 mr-1" />
                          Permissions
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
