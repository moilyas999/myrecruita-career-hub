/**
 * Terms Form Dialog Component
 * Create or edit client terms and fee agreements
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTerms, useUpdateTerms } from '@/hooks/useClients';
import type { ClientTerms, JobTypeCategory } from '@/types/client';

const termsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  job_type: z.enum(['permanent', 'contract', 'temp', 'ftc']),
  fee_percentage_perm: z.number().min(0).max(100).optional().nullable(),
  fee_percentage_contract: z.number().min(0).max(100).optional().nullable(),
  flat_fee: z.number().min(0).optional().nullable(),
  payment_terms_days: z.number().min(0).max(365),
  rebate_period_days: z.number().min(0).max(365),
  rebate_percentage: z.number().min(0).max(100),
  is_exclusive: z.boolean(),
  min_salary_threshold: z.number().min(0).optional().nullable(),
  max_salary_cap: z.number().min(0).optional().nullable(),
  notes: z.string().optional(),
  effective_from: z.string(),
  effective_until: z.string().optional(),
});

type TermsFormData = z.infer<typeof termsSchema>;

interface TermsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  terms?: ClientTerms | null;
}

export default function TermsFormDialog({ 
  open, 
  onOpenChange, 
  clientId, 
  terms 
}: TermsFormDialogProps) {
  const createTerms = useCreateTerms();
  const updateTerms = useUpdateTerms();
  const isEditing = !!terms;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TermsFormData>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      name: '',
      job_type: 'permanent',
      fee_percentage_perm: null,
      fee_percentage_contract: null,
      flat_fee: null,
      payment_terms_days: 30,
      rebate_period_days: 90,
      rebate_percentage: 100,
      is_exclusive: false,
      min_salary_threshold: null,
      max_salary_cap: null,
      notes: '',
      effective_from: format(new Date(), 'yyyy-MM-dd'),
      effective_until: '',
    },
  });

  // Reset form when dialog opens/closes or terms changes
  useEffect(() => {
    if (open && terms) {
      reset({
        name: terms.name,
        job_type: terms.job_type,
        fee_percentage_perm: terms.fee_percentage_perm,
        fee_percentage_contract: terms.fee_percentage_contract,
        flat_fee: terms.flat_fee,
        payment_terms_days: terms.payment_terms_days,
        rebate_period_days: terms.rebate_period_days,
        rebate_percentage: terms.rebate_percentage,
        is_exclusive: terms.is_exclusive,
        min_salary_threshold: terms.min_salary_threshold,
        max_salary_cap: terms.max_salary_cap,
        notes: terms.notes || '',
        effective_from: format(new Date(terms.effective_from), 'yyyy-MM-dd'),
        effective_until: terms.effective_until 
          ? format(new Date(terms.effective_until), 'yyyy-MM-dd') 
          : '',
      });
    } else if (!open) {
      reset({
        name: '',
        job_type: 'permanent',
        fee_percentage_perm: null,
        fee_percentage_contract: null,
        flat_fee: null,
        payment_terms_days: 30,
        rebate_period_days: 90,
        rebate_percentage: 100,
        is_exclusive: false,
        min_salary_threshold: null,
        max_salary_cap: null,
        notes: '',
        effective_from: format(new Date(), 'yyyy-MM-dd'),
        effective_until: '',
      });
    }
  }, [open, terms, reset]);

  const onSubmit = async (data: TermsFormData) => {
    try {
      if (isEditing && terms) {
        await updateTerms.mutateAsync({
          id: terms.id,
          ...data,
          effective_until: data.effective_until || undefined,
        });
      } else {
        await createTerms.mutateAsync({
          client_id: clientId,
          name: data.name,
          job_type: data.job_type,
          fee_percentage_perm: data.fee_percentage_perm ?? undefined,
          fee_percentage_contract: data.fee_percentage_contract ?? undefined,
          flat_fee: data.flat_fee ?? undefined,
          payment_terms_days: data.payment_terms_days,
          rebate_period_days: data.rebate_period_days,
          rebate_percentage: data.rebate_percentage,
          is_exclusive: data.is_exclusive,
          min_salary_threshold: data.min_salary_threshold ?? undefined,
          max_salary_cap: data.max_salary_cap ?? undefined,
          notes: data.notes || undefined,
          effective_from: data.effective_from,
          effective_until: data.effective_until || undefined,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Terms' : 'Add Terms'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update fee agreement and payment terms.' 
              : 'Define new fee agreement and payment terms.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Agreement Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Standard Terms 2025"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Job Type */}
          <div className="space-y-2">
            <Label>Job Type *</Label>
            <Select
              value={watch('job_type')}
              onValueChange={(value: JobTypeCategory) => setValue('job_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="temp">Temporary</SelectItem>
                <SelectItem value="ftc">Fixed Term Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fee Percentages */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee_percentage_perm">Perm Fee %</Label>
              <Input
                id="fee_percentage_perm"
                type="number"
                step="0.5"
                min="0"
                max="100"
                {...register('fee_percentage_perm', { valueAsNumber: true })}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee_percentage_contract">Contract Fee %</Label>
              <Input
                id="fee_percentage_contract"
                type="number"
                step="0.5"
                min="0"
                max="100"
                {...register('fee_percentage_contract', { valueAsNumber: true })}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flat_fee">Flat Fee (£)</Label>
              <Input
                id="flat_fee"
                type="number"
                min="0"
                {...register('flat_fee', { valueAsNumber: true })}
                placeholder="5000"
              />
            </div>
          </div>

          {/* Payment & Rebate Terms */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_terms_days">Payment Terms (days)</Label>
              <Input
                id="payment_terms_days"
                type="number"
                min="0"
                max="365"
                {...register('payment_terms_days', { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rebate_period_days">Rebate Period (days)</Label>
              <Input
                id="rebate_period_days"
                type="number"
                min="0"
                max="365"
                {...register('rebate_period_days', { valueAsNumber: true })}
                placeholder="90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rebate_percentage">Rebate %</Label>
              <Input
                id="rebate_percentage"
                type="number"
                step="0.5"
                min="0"
                max="100"
                {...register('rebate_percentage', { valueAsNumber: true })}
                placeholder="100"
              />
            </div>
          </div>

          {/* Salary Thresholds */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_salary_threshold">Min Salary Threshold (£)</Label>
              <Input
                id="min_salary_threshold"
                type="number"
                min="0"
                {...register('min_salary_threshold', { valueAsNumber: true })}
                placeholder="30000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_salary_cap">Max Salary Cap (£)</Label>
              <Input
                id="max_salary_cap"
                type="number"
                min="0"
                {...register('max_salary_cap', { valueAsNumber: true })}
                placeholder="150000"
              />
            </div>
          </div>

          {/* Effective Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective_from">Effective From *</Label>
              <Input
                id="effective_from"
                type="date"
                {...register('effective_from')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective_until">Effective Until</Label>
              <Input
                id="effective_until"
                type="date"
                {...register('effective_until')}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any special conditions or notes..."
              rows={3}
            />
          </div>

          {/* Exclusive Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label>Exclusive Agreement</Label>
              <p className="text-sm text-muted-foreground">
                Client uses only us for these roles
              </p>
            </div>
            <Switch
              checked={watch('is_exclusive')}
              onCheckedChange={(checked) => setValue('is_exclusive', checked)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Terms' : 'Add Terms'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
