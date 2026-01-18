/**
 * RuleFormDialog Component
 * Dialog for creating and editing automation rules
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateRule, useUpdateRule } from '@/hooks/useAutomation';
import type { AutomationRule, AutomationTriggerType, AutomationActionType } from '@/types/automation';
import { TRIGGER_TYPE_LABELS, ACTION_TYPE_LABELS } from '@/types/automation';

const ruleFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  trigger_type: z.enum([
    'cv_submitted', 'cv_score_above', 'stage_changed', 'job_created',
    'job_ageing', 'interview_scheduled', 'placement_made',
    'client_interaction', 'time_based', 'inactivity'
  ] as const),
  action_type: z.enum([
    'create_task', 'send_notification', 'move_stage',
    'assign_user', 'update_status', 'add_tag'
  ] as const),
  priority: z.number().min(0).max(100),
  is_active: z.boolean(),
});

type RuleFormValues = z.infer<typeof ruleFormSchema>;

interface RuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: AutomationRule | null;
}

export default function RuleFormDialog({
  open,
  onOpenChange,
  rule,
}: RuleFormDialogProps) {
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const isEditing = !!rule;

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger_type: 'cv_submitted',
      action_type: 'create_task',
      priority: 0,
      is_active: true,
    },
  });

  // Reset form when rule changes
  useEffect(() => {
    if (rule) {
      form.reset({
        name: rule.name,
        description: rule.description || '',
        trigger_type: rule.trigger_type,
        action_type: rule.action_type,
        priority: rule.priority,
        is_active: rule.is_active,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        trigger_type: 'cv_submitted',
        action_type: 'create_task',
        priority: 0,
        is_active: true,
      });
    }
  }, [rule, form]);

  const onSubmit = async (values: RuleFormValues) => {
    try {
      if (isEditing) {
        await updateRule.mutateAsync({ 
          id: rule.id, 
          ...values,
          trigger_config: {},
          action_config: {},
        });
      } else {
        await createRule.mutateAsync({
          name: values.name,
          description: values.description,
          trigger_type: values.trigger_type,
          action_type: values.action_type,
          priority: values.priority,
          is_active: values.is_active,
          trigger_config: {},
          action_config: {},
        });
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const isPending = createRule.isPending || updateRule.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Rule' : 'Create Automation Rule'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the automation rule settings.'
              : 'Create a rule to automate repetitive tasks in your workflow.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Notify on high-score CV" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this rule does"
                      className="resize-none"
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trigger_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger (When)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(TRIGGER_TYPE_LABELS) as [AutomationTriggerType, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      What event should trigger this rule
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="action_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action (Then)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(ACTION_TYPE_LABELS) as [AutomationActionType, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      What action to perform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      max={100}
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Higher priority rules run first (0-100)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Enable this rule to start running automatically
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Rule' : 'Create Rule')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
