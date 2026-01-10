import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { queryKeys } from '@/lib/queryKeys';

interface TalentProfile {
  id: string;
  reference_id: string;
  role: string;
  sector: string;
  years_experience: number;
  preferred_location: string;
  details?: string;
  is_visible: boolean;
  created_at: string;
}

async function fetchTalents() {
  const { data, error } = await supabase
    .from('talent_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export default function TalentManagement() {
  const queryClient = useQueryClient();
  const [editingTalent, setEditingTalent] = useState<TalentProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    sector: '',
    years_experience: 1,
    preferred_location: '',
    details: '',
    is_visible: true
  });

  // Real-time subscription
  useRealtimeSubscription({
    table: 'talent_profiles',
    queryKeys: [queryKeys.talentProfiles, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New talent added: ${data.role}`,
      update: (data) => `Talent updated: ${data.role}`,
      delete: () => 'Talent profile deleted',
    },
  });

  const { data: talents = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.talentProfiles,
    queryFn: fetchTalents,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { reference_id: string }) => {
      const { error } = await supabase.from('talent_profiles').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Talent profile created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.talentProfiles });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to create talent profile: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('talent_profiles').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Talent profile updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.talentProfiles });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to update talent profile: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('talent_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.talentProfiles });
      const previous = queryClient.getQueryData<TalentProfile[]>(queryKeys.talentProfiles);
      queryClient.setQueryData<TalentProfile[]>(queryKeys.talentProfiles, (old) => 
        old?.filter(t => t.id !== id) || []
      );
      return { previous };
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(queryKeys.talentProfiles, context?.previous);
      toast.error('Failed to delete talent profile: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.talentProfiles });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
    onSuccess: () => {
      toast.success('Talent profile deleted successfully');
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('talent_profiles')
        .update({ is_visible })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, is_visible }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.talentProfiles });
      const previous = queryClient.getQueryData<TalentProfile[]>(queryKeys.talentProfiles);
      queryClient.setQueryData<TalentProfile[]>(queryKeys.talentProfiles, (old) => 
        old?.map(t => t.id === id ? { ...t, is_visible } : t) || []
      );
      return { previous };
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(queryKeys.talentProfiles, context?.previous);
      toast.error('Failed to update visibility: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.talentProfiles });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
    onSuccess: (_, { is_visible }) => {
      toast.success(`Talent profile ${is_visible ? 'shown' : 'hidden'} successfully`);
    },
  });

  const resetForm = () => {
    setFormData({
      role: '',
      sector: '',
      years_experience: 1,
      preferred_location: '',
      details: '',
      is_visible: true
    });
    setEditingTalent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTalent) {
      updateMutation.mutate({ id: editingTalent.id, data: formData });
    } else {
      const { data: refData } = await supabase.rpc('generate_talent_reference');
      createMutation.mutate({ ...formData, reference_id: refData });
    }
  };

  const handleEdit = (talent: TalentProfile) => {
    setEditingTalent(talent);
    setFormData({
      role: talent.role,
      sector: talent.sector,
      years_experience: talent.years_experience,
      preferred_location: talent.preferred_location,
      details: talent.details || '',
      is_visible: talent.is_visible
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (talentId: string) => {
    if (!confirm('Are you sure you want to delete this talent profile?')) return;
    deleteMutation.mutate(talentId);
  };

  const toggleVisibility = (talent: TalentProfile) => {
    toggleVisibilityMutation.mutate({ id: talent.id, is_visible: !talent.is_visible });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <div className="text-center py-8">Loading talent profiles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Talent Management</h2>
          <p className="text-muted-foreground">Manage featured talent profiles for employers</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Talent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTalent ? 'Edit Talent Profile' : 'Create New Talent Profile'}</DialogTitle>
                <DialogDescription>
                  {editingTalent ? 'Update talent profile details' : 'Add a new talent profile for employers to discover'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferred_location">Preferred Location</Label>
                  <Input
                    id="preferred_location"
                    value={formData.preferred_location}
                    onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="details">Details (Optional)</Label>
                  <Textarea
                    id="details"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Additional details about the candidate's experience, skills, or background..."
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                  />
                  <Label htmlFor="is_visible">Visible to employers</Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : editingTalent ? 'Update Profile' : 'Create Profile'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {talents.map((talent) => (
          <Card key={talent.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {talent.role}
                    <Badge variant={talent.is_visible ? 'default' : 'secondary'}>
                      {talent.is_visible ? 'Visible' : 'Hidden'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {talent.reference_id} • {talent.sector} • {talent.years_experience} years • {talent.preferred_location}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toggleVisibility(talent)}
                    disabled={toggleVisibilityMutation.isPending}
                  >
                    {talent.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(talent)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(talent.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Created: {new Date(talent.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}