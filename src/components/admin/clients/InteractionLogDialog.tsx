/**
 * Interaction Log Dialog Component
 * Log a new interaction with a client
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
import { useCreateInteraction, useClientContacts } from '@/hooks/useClients';
import type { InteractionType, InteractionDirection } from '@/types/client';

const interactionSchema = z.object({
  interaction_type: z.enum(['call', 'email', 'meeting', 'linkedin', 'note', 'proposal']),
  direction: z.enum(['inbound', 'outbound']).optional(),
  contact_id: z.string().optional(),
  subject: z.string().optional(),
  summary: z.string().optional(),
  outcome: z.string().optional(),
  duration_minutes: z.number().min(0).optional(),
  follow_up_required: z.boolean(),
  follow_up_date: z.string().optional(),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

interface InteractionLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

export default function InteractionLogDialog({ 
  open, 
  onOpenChange, 
  clientId 
}: InteractionLogDialogProps) {
  const createInteraction = useCreateInteraction();
  const { data: contacts } = useClientContacts(clientId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      interaction_type: 'call',
      direction: 'outbound',
      contact_id: '',
      subject: '',
      summary: '',
      outcome: '',
      duration_minutes: undefined,
      follow_up_required: false,
      follow_up_date: '',
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset({
        interaction_type: 'call',
        direction: 'outbound',
        contact_id: '',
        subject: '',
        summary: '',
        outcome: '',
        duration_minutes: undefined,
        follow_up_required: false,
        follow_up_date: '',
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: InteractionFormData) => {
    try {
      await createInteraction.mutateAsync({
        client_id: clientId,
        interaction_type: data.interaction_type,
        direction: data.direction,
        contact_id: data.contact_id || undefined,
        subject: data.subject || undefined,
        summary: data.summary || undefined,
        outcome: data.outcome || undefined,
        duration_minutes: data.duration_minutes || undefined,
        follow_up_required: data.follow_up_required,
        follow_up_date: data.follow_up_date || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const interactionType = watch('interaction_type');
  const followUpRequired = watch('follow_up_required');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
          <DialogDescription>
            Record a call, email, meeting, or other interaction with this client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Interaction Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={watch('interaction_type')}
                onValueChange={(value: InteractionType) => setValue('interaction_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={watch('direction') || 'outbound'}
                onValueChange={(value: InteractionDirection) => setValue('direction', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact (if available) */}
          {contacts && contacts.length > 0 && (
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select
                value={watch('contact_id') || 'none'}
                onValueChange={(value) => setValue('contact_id', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific contact</SelectItem>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}{contact.job_title ? ` - ${contact.job_title}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="Discussion about Q2 hiring plans..."
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              {...register('summary')}
              placeholder="Brief summary of the interaction..."
              rows={3}
            />
          </div>

          {/* Outcome */}
          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome</Label>
            <Input
              id="outcome"
              {...register('outcome')}
              placeholder="e.g., Agreed to proceed, Will revert next week..."
            />
          </div>

          {/* Duration (for calls/meetings) */}
          {(interactionType === 'call' || interactionType === 'meeting') && (
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="0"
                {...register('duration_minutes', { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
          )}

          {/* Follow-up Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label>Follow-up Required</Label>
              <p className="text-sm text-muted-foreground">
                Set a reminder for a follow-up action
              </p>
            </div>
            <Switch
              checked={followUpRequired}
              onCheckedChange={(checked) => setValue('follow_up_required', checked)}
            />
          </div>

          {/* Follow-up Date */}
          {followUpRequired && (
            <div className="space-y-2">
              <Label htmlFor="follow_up_date">Follow-up Date</Label>
              <Input
                id="follow_up_date"
                type="date"
                {...register('follow_up_date')}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Log Interaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
