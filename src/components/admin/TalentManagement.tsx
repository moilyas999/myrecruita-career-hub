import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

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

export default function TalentManagement() {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchTalents();
  }, []);

  const fetchTalents = async () => {
    try {
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTalents(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch talent profiles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
    setLoading(true);

    try {
      if (editingTalent) {
        // Update existing talent
        const { error } = await supabase
          .from('talent_profiles')
          .update(formData)
          .eq('id', editingTalent.id);

        if (error) throw error;
        toast.success('Talent profile updated successfully');
      } else {
        // Create new talent
        const { data: refData } = await supabase.rpc('generate_talent_reference');
        
        const { error } = await supabase
          .from('talent_profiles')
          .insert({
            ...formData,
            reference_id: refData
          });

        if (error) throw error;
        toast.success('Talent profile created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTalents();
    } catch (error: any) {
      toast.error('Failed to save talent profile: ' + error.message);
    } finally {
      setLoading(false);
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

    try {
      const { error } = await supabase
        .from('talent_profiles')
        .delete()
        .eq('id', talentId);

      if (error) throw error;
      toast.success('Talent profile deleted successfully');
      fetchTalents();
    } catch (error: any) {
      toast.error('Failed to delete talent profile: ' + error.message);
    }
  };

  const toggleVisibility = async (talent: TalentProfile) => {
    try {
      const { error } = await supabase
        .from('talent_profiles')
        .update({ is_visible: !talent.is_visible })
        .eq('id', talent.id);

      if (error) throw error;
      toast.success(`Talent profile ${!talent.is_visible ? 'shown' : 'hidden'} successfully`);
      fetchTalents();
    } catch (error: any) {
      toast.error('Failed to update visibility: ' + error.message);
    }
  };

  if (loading && talents.length === 0) {
    return <div className="text-center py-8">Loading talent profiles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Talent Management</h2>
          <p className="text-muted-foreground">Manage featured talent profiles for employers</p>
        </div>
        
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
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingTalent ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                  <Button variant="outline" size="sm" onClick={() => toggleVisibility(talent)}>
                    {talent.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(talent)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(talent.id)}>
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