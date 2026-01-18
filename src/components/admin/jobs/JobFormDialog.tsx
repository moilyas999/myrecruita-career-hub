import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useClients, useClientContacts } from '@/hooks/useClients';
import { useCreateJob, useUpdateJob } from '@/hooks/useJobs';
import type { Job, JobPriority, JobTypeCategory, CreateJobInput, UpdateJobInput } from '@/types/job';

// Form validation schema - matches database enums exactly
const jobFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  sector: z.string().min(2, 'Sector is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  benefits: z.string().optional(),
  salary: z.string().optional(),
  status: z.enum(['draft', 'active', 'on_hold', 'filled', 'closed']).default('active'),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).optional(),
  job_type_category: z.enum(['permanent', 'contract', 'temp', 'ftc']).optional(),
  client_id: z.string().optional(),
  hiring_manager_id: z.string().optional(),
  fee_percentage: z.number().min(0).max(100).optional(),
  revenue_forecast: z.number().min(0).optional(),
  target_fill_date: z.string().optional(),
  target_start_date: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null;
  onSuccess?: () => void;
}

const PRIORITY_OPTIONS: { value: JobPriority; label: string }[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const JOB_TYPE_OPTIONS: { value: JobTypeCategory; label: string }[] = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'temp', label: 'Temporary' },
  { value: 'ftc', label: 'Fixed Term' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'filled', label: 'Filled' },
  { value: 'closed', label: 'Closed' },
];

export default function JobFormDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
}: JobFormDialogProps) {
  const isEditing = !!job;
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    job?.client_id || undefined
  );

  const { data: clients = [] } = useClients();
  const { data: contacts = [] } = useClientContacts(selectedClientId);

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      location: '',
      sector: '',
      description: '',
      requirements: '',
      benefits: '',
      salary: '',
      status: 'active',
      priority: 'medium',
      job_type_category: 'permanent',
      client_id: undefined,
      hiring_manager_id: undefined,
      fee_percentage: undefined,
      revenue_forecast: undefined,
      target_fill_date: '',
      target_start_date: '',
    },
  });

  // Reset form when job changes or dialog opens
  useEffect(() => {
    if (open && job) {
      // Type assertion for status - job.status from DB might have extra values
      const validStatus = ['draft', 'active', 'on_hold', 'filled', 'closed'].includes(job.status) 
        ? job.status as 'draft' | 'active' | 'on_hold' | 'filled' | 'closed'
        : 'active';
      const validPriority = job.priority && ['urgent', 'high', 'medium', 'low'].includes(job.priority)
        ? job.priority as 'urgent' | 'high' | 'medium' | 'low'
        : 'medium';
      const validJobType = job.job_type_category && ['permanent', 'contract', 'temp', 'ftc'].includes(job.job_type_category)
        ? job.job_type_category as 'permanent' | 'contract' | 'temp' | 'ftc'
        : 'permanent';
      
      form.reset({
        title: job.title,
        location: job.location,
        sector: job.sector,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits || '',
        salary: job.salary || '',
        status: validStatus,
        priority: validPriority,
        job_type_category: validJobType,
        client_id: job.client_id || undefined,
        hiring_manager_id: job.hiring_manager_id || undefined,
        fee_percentage: job.fee_percentage || undefined,
        revenue_forecast: job.revenue_forecast || undefined,
        target_fill_date: job.target_fill_date || '',
        target_start_date: job.target_start_date || '',
      });
      setSelectedClientId(job.client_id || undefined);
    } else if (open && !job) {
      form.reset({
        title: '',
        location: '',
        sector: '',
        description: '',
        requirements: '',
        benefits: '',
        salary: '',
        status: 'active',
        priority: 'medium',
        job_type_category: 'permanent',
        client_id: undefined,
        hiring_manager_id: undefined,
        fee_percentage: undefined,
        revenue_forecast: undefined,
        target_fill_date: '',
        target_start_date: '',
      });
      setSelectedClientId(undefined);
    }
  }, [open, job, form]);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId === 'none' ? undefined : clientId);
    form.setValue('client_id', clientId === 'none' ? undefined : clientId);
    form.setValue('hiring_manager_id', undefined);
  };

  const onSubmit = async (values: JobFormValues) => {
    try {
      if (isEditing && job) {
        const updateData: UpdateJobInput = {
          id: job.id,
          title: values.title,
          location: values.location,
          sector: values.sector,
          description: values.description,
          requirements: values.requirements,
          benefits: values.benefits || null,
          salary: values.salary || null,
          status: values.status,
          priority: values.priority,
          job_type_category: values.job_type_category,
          client_id: values.client_id || null,
          hiring_manager_id: values.hiring_manager_id || null,
          fee_percentage: values.fee_percentage || null,
          revenue_forecast: values.revenue_forecast || null,
          target_fill_date: values.target_fill_date || null,
          target_start_date: values.target_start_date || null,
        };
        await updateJob.mutateAsync(updateData);
      } else {
        const createData: CreateJobInput = {
          title: values.title,
          location: values.location,
          sector: values.sector,
          description: values.description,
          requirements: values.requirements,
          benefits: values.benefits || undefined,
          salary: values.salary || undefined,
          status: values.status,
          priority: values.priority,
          job_type_category: values.job_type_category,
          client_id: values.client_id || undefined,
          hiring_manager_id: values.hiring_manager_id || undefined,
          fee_percentage: values.fee_percentage,
          revenue_forecast: values.revenue_forecast,
          target_fill_date: values.target_fill_date || undefined,
          target_start_date: values.target_start_date || undefined,
        };
        await createJob.mutateAsync(createData);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isPending = createJob.isPending || updateJob.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Job' : 'Create New Job'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update job details and settings'
              : 'Add a new job posting to the system'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Accountant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., London" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Finance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., £50,000 - £60,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status, Priority, Job Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_type_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JOB_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client & Hiring Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={handleClientChange}
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Client</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hiring_manager_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hiring Manager</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || 'none'}
                      disabled={!selectedClientId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hiring manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Hiring Manager</SelectItem>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name} - {contact.job_title || 'Contact'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!selectedClientId && 'Select a client first'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fee_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Percentage (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        placeholder="e.g., 20"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revenue_forecast"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Forecast (£)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={100}
                        placeholder="e.g., 12000"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Target Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_fill_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Fill Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description & Requirements */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Enter the job description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Enter the job requirements..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Enter the benefits package..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
