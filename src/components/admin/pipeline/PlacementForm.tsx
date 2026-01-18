import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { CalendarIcon, Calculator, Loader2, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCreatePlacement, useUpdatePlacement, usePlacement } from '@/hooks/usePlacement';
import { useUpdatePipelineStage } from '@/hooks/usePipeline';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PipelineEntryWithDetails, JobType, CreatePlacementData } from '@/types/pipeline';

// Validation schema
const placementSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  job_type: z.enum(['permanent', 'contract', 'temp_to_perm', 'interim']),
  salary: z.number().nullable().optional(),
  day_rate: z.number().nullable().optional(),
  fee_percentage: z.number().min(0).max(100).nullable().optional(),
  fee_value: z.number().min(0).nullable().optional(),
  invoice_date: z.string().optional(),
  guarantee_period_days: z.number().min(0).max(365).optional(),
  placed_by: z.string().optional(),
  sourced_by: z.string().optional(),
  split_with: z.string().optional(),
  split_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // For permanent roles, salary is required
  if (data.job_type === 'permanent' && !data.salary) {
    return false;
  }
  // For contract/interim roles, day rate is required
  if ((data.job_type === 'contract' || data.job_type === 'interim') && !data.day_rate) {
    return false;
  }
  return true;
}, {
  message: 'Please provide salary for permanent roles or day rate for contract/interim roles',
  path: ['salary'],
});

type PlacementFormData = z.infer<typeof placementSchema>;

interface PlacementFormProps {
  pipelineEntry: PipelineEntryWithDetails;
  onSuccess?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const JOB_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'temp_to_perm', label: 'Temp to Perm' },
  { value: 'interim', label: 'Interim' },
];

const GUARANTEE_PERIODS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days (standard)' },
  { value: 180, label: '180 days' },
];

export function PlacementForm({
  pipelineEntry,
  onSuccess,
  onCancel,
  isEditing = false,
}: PlacementFormProps) {
  const { hasPermission } = usePermissions();
  const createPlacement = useCreatePlacement();
  const updatePlacement = useUpdatePlacement();
  const updateStage = useUpdatePipelineStage();
  const { data: existingPlacement } = usePlacement(isEditing ? pipelineEntry.id : null);

  // Fetch team members for dropdowns
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('user_id, display_name, email')
        .order('display_name');
      if (error) throw error;
      return data;
    },
  });

  const canEdit = hasPermission('pipeline.create') || hasPermission('pipeline.update');

  const defaultValues: PlacementFormData = {
    start_date: existingPlacement?.start_date || '',
    job_type: (existingPlacement?.job_type as JobType) || 'permanent',
    salary: existingPlacement?.salary || null,
    day_rate: existingPlacement?.day_rate || null,
    fee_percentage: existingPlacement?.fee_percentage || 20,
    fee_value: existingPlacement?.fee_value || null,
    invoice_date: existingPlacement?.invoice_date || '',
    guarantee_period_days: existingPlacement?.guarantee_period_days || 90,
    placed_by: existingPlacement?.placed_by || '',
    sourced_by: existingPlacement?.sourced_by || '',
    split_with: existingPlacement?.split_with || '',
    split_percentage: existingPlacement?.split_percentage || 100,
    notes: existingPlacement?.notes || '',
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlacementFormData>({
    resolver: zodResolver(placementSchema),
    defaultValues,
  });

  const watchedJobType = watch('job_type');
  const watchedSalary = watch('salary');
  const watchedDayRate = watch('day_rate');
  const watchedFeePercentage = watch('fee_percentage');
  const watchedStartDate = watch('start_date');
  const watchedGuaranteePeriod = watch('guarantee_period_days');

  // Calculate fee value automatically
  const calculatedFeeValue = useMemo(() => {
    if (watchedJobType === 'permanent' && watchedSalary && watchedFeePercentage) {
      return Math.round((watchedSalary * watchedFeePercentage) / 100);
    }
    // For contracts, might calculate differently (e.g., day rate × margin × expected days)
    return null;
  }, [watchedJobType, watchedSalary, watchedFeePercentage]);

  // Calculate guarantee expiry date
  const guaranteeExpiryDate = useMemo(() => {
    if (watchedStartDate && watchedGuaranteePeriod) {
      return format(addDays(new Date(watchedStartDate), watchedGuaranteePeriod), 'PPP');
    }
    return null;
  }, [watchedStartDate, watchedGuaranteePeriod]);

  // Auto-populate fee value when salary/percentage changes
  useEffect(() => {
    if (calculatedFeeValue !== null) {
      setValue('fee_value', calculatedFeeValue);
    }
  }, [calculatedFeeValue, setValue]);

  const onSubmit = async (data: PlacementFormData) => {
    if (!canEdit) return;

    const placementData: CreatePlacementData = {
      pipeline_id: pipelineEntry.id,
      start_date: data.start_date,
      job_type: data.job_type,
      candidate_name: pipelineEntry.cv_submission?.name,
      job_title: pipelineEntry.job?.title,
      company_name: pipelineEntry.job?.reference_id,
      salary: data.salary ?? undefined,
      day_rate: data.day_rate ?? undefined,
      fee_percentage: data.fee_percentage ?? undefined,
      fee_value: data.fee_value ?? undefined,
      invoice_date: data.invoice_date || data.start_date,
      guarantee_period_days: data.guarantee_period_days,
      placed_by: data.placed_by || undefined,
      sourced_by: data.sourced_by || undefined,
      split_with: data.split_with || undefined,
      split_percentage: data.split_percentage,
      notes: data.notes || undefined,
    };

    if (isEditing && existingPlacement) {
      await updatePlacement.mutateAsync({
        id: existingPlacement.id,
        data: placementData,
      });
    } else {
      // Create placement and update pipeline stage
      await createPlacement.mutateAsync(placementData);
      await updateStage.mutateAsync({
        id: pipelineEntry.id,
        stage: 'placed',
        note: `Placed: Start ${data.start_date}, Fee £${data.fee_value || 'TBC'}`,
      });
    }

    onSuccess?.();
  };

  const isMutating = createPlacement.isPending || updatePlacement.isPending || updateStage.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Candidate & Job Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Placement Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Candidate</Label>
            <p className="font-medium">{pipelineEntry.cv_submission?.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Job</Label>
            <p className="font-medium">{pipelineEntry.job?.title}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Reference</Label>
            <Badge variant="outline">{pipelineEntry.job?.reference_id}</Badge>
          </div>
          <div>
            <Label className="text-muted-foreground">Location</Label>
            <p className="font-medium">{pipelineEntry.job?.location}</p>
          </div>
        </CardContent>
      </Card>

      {/* Placement Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Placement Details</CardTitle>
          <CardDescription>Core placement information</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start_date"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground',
                        errors.start_date && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_type">
              Job Type <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="job_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="job_type">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {watchedJobType === 'permanent' || watchedJobType === 'temp_to_perm' ? (
            <div className="space-y-2">
              <Label htmlFor="salary">
                Annual Salary (£) <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <Input
                    id="salary"
                    type="number"
                    placeholder="50000"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    className={cn(errors.salary && 'border-destructive')}
                  />
                )}
              />
              {errors.salary && (
                <p className="text-sm text-destructive">{errors.salary.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="day_rate">
                Day Rate (£) <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="day_rate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="day_rate"
                    type="number"
                    placeholder="500"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="guarantee_period_days">Guarantee Period</Label>
            <Controller
              name="guarantee_period_days"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value?.toString()} 
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger id="guarantee_period_days">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {GUARANTEE_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value.toString()}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {guaranteeExpiryDate && (
              <p className="text-xs text-muted-foreground">
                Expires: {guaranteeExpiryDate}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fee Calculation */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fee Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fee_percentage">Fee Percentage (%)</Label>
            <Controller
              name="fee_percentage"
              control={control}
              render={({ field }) => (
                <Input
                  id="fee_percentage"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  placeholder="20"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee_value">Fee Value (£)</Label>
            <Controller
              name="fee_value"
              control={control}
              render={({ field }) => (
                <Input
                  id="fee_value"
                  type="number"
                  placeholder="10000"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              )}
            />
            {calculatedFeeValue !== null && (
              <p className="text-xs text-muted-foreground">
                Calculated: £{calculatedFeeValue.toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_date">Invoice Date</Label>
            <Controller
              name="invoice_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="invoice_date"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), 'PPP') : 'Default: Start Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Assignment */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Team Assignment</CardTitle>
          <CardDescription>Who worked on this placement</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="placed_by">Placed By</Label>
            <Controller
              name="placed_by"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="placed_by">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.display_name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourced_by">Sourced By</Label>
            <Controller
              name="sourced_by"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="sourced_by">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.display_name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="split_with">Split With (Optional)</Label>
            <Controller
              name="split_with"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger id="split_with">
                    <SelectValue placeholder="No split" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No split</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.display_name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="split_percentage">Your Split (%)</Label>
            <Controller
              name="split_percentage"
              control={control}
              render={({ field }) => (
                <Input
                  id="split_percentage"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="100"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 100)}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Textarea
              id="notes"
              placeholder="Any additional notes about this placement..."
              rows={3}
              {...field}
            />
          )}
        />
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the errors above before submitting.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isMutating}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!canEdit || isMutating}>
          {isMutating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating Placement...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Placement' : 'Create Placement'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default PlacementForm;
