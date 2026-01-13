import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { queryKeys } from '@/lib/queryKeys';

interface Job {
  id: string;
  reference_id: string;
  title: string;
  location: string;
  sector: string;
  description: string;
  requirements: string;
  benefits: string;
  salary?: string;
  status: string;
  created_at: string;
}

async function fetchJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export default function JobsManagement() {
  const queryClient = useQueryClient();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    sector: '',
    description: '',
    requirements: '',
    benefits: '',
    salary: '',
    status: 'active'
  });

  // Real-time subscription
  useRealtimeSubscription({
    table: 'jobs',
    queryKeys: [queryKeys.jobs, queryKeys.dashboardOverview],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New job created: ${data.title}`,
      update: (data) => `Job updated: ${data.title}`,
      delete: () => 'Job deleted',
    },
  });

  const { data: jobs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.jobs,
    queryFn: fetchJobs,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { reference_id: string }) => {
      const { error } = await supabase.from('jobs').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to create job: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('jobs').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Job updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to update job: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs });
      const previous = queryClient.getQueryData<Job[]>(queryKeys.jobs);
      queryClient.setQueryData<Job[]>(queryKeys.jobs, (old) => 
        old?.filter(job => job.id !== id) || []
      );
      return { previous };
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(queryKeys.jobs, context?.previous);
      toast.error('Failed to delete job: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
    },
    onSuccess: () => {
      toast.success('Job deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      sector: '',
      description: '',
      requirements: '',
      benefits: '',
      salary: '',
      status: 'active'
    });
    setEditingJob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data: formData });
    } else {
      const { data: refData } = await supabase.rpc('generate_job_reference');
      createMutation.mutate({ ...formData, reference_id: refData });
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      location: job.location,
      sector: job.sector,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits || '',
      salary: job.salary || '',
      status: job.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    deleteMutation.mutate(jobId);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Jobs Management</h2>
          <p className="text-muted-foreground">Manage job postings and applications</p>
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
                Add New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
                <DialogDescription>
                  {editingJob ? 'Update job details' : 'Add a new job posting to the system'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits (Optional)</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (Optional)</Label>
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g., £30,000 - £35,000 per annum"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {job.title}
                    <Badge 
                      variant={
                        job.status === 'active' ? 'default' : 
                        job.status === 'filled' ? 'outline' : 
                        'secondary'
                      }
                      className={
                        job.status === 'expired' ? 'bg-muted text-muted-foreground' :
                        job.status === 'filled' ? 'border-blue-500 text-blue-600' :
                        ''
                      }
                    >
                      {job.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {job.reference_id} • {job.location} • {job.sector}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(job)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(job.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Created: {new Date(job.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}