/**
 * Contact Form Dialog Component
 * Create or edit a client contact
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
import { useCreateContact, useUpdateContact } from '@/hooks/useClients';
import type { ClientContact, ContactMethod } from '@/types/client';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
  is_primary: z.boolean(),
  is_billing_contact: z.boolean(),
  is_active: z.boolean(),
  preferred_contact_method: z.enum(['email', 'phone', 'mobile']),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  contact?: ClientContact | null;
}

export default function ContactFormDialog({ 
  open, 
  onOpenChange, 
  clientId, 
  contact 
}: ContactFormDialogProps) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const isEditing = !!contact;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      mobile: '',
      job_title: '',
      department: '',
      linkedin_url: '',
      notes: '',
      is_primary: false,
      is_billing_contact: false,
      is_active: true,
      preferred_contact_method: 'email',
    },
  });

  // Reset form when dialog opens/closes or contact changes
  useEffect(() => {
    if (open && contact) {
      reset({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        job_title: contact.job_title || '',
        department: contact.department || '',
        linkedin_url: contact.linkedin_url || '',
        notes: contact.notes || '',
        is_primary: contact.is_primary,
        is_billing_contact: contact.is_billing_contact,
        is_active: contact.is_active,
        preferred_contact_method: contact.preferred_contact_method,
      });
    } else if (!open) {
      reset({
        name: '',
        email: '',
        phone: '',
        mobile: '',
        job_title: '',
        department: '',
        linkedin_url: '',
        notes: '',
        is_primary: false,
        is_billing_contact: false,
        is_active: true,
        preferred_contact_method: 'email',
      });
    }
  }, [open, contact, reset]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      if (isEditing && contact) {
        await updateContact.mutateAsync({
          id: contact.id,
          ...data,
          email: data.email || null,
          linkedin_url: data.linkedin_url || null,
        });
      } else {
        await createContact.mutateAsync({
          client_id: clientId,
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          mobile: data.mobile || undefined,
          job_title: data.job_title || undefined,
          department: data.department || undefined,
          linkedin_url: data.linkedin_url || undefined,
          notes: data.notes || undefined,
          is_primary: data.is_primary,
          is_billing_contact: data.is_billing_contact,
          preferred_contact_method: data.preferred_contact_method,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update contact details below.' 
              : 'Add a new contact or hiring manager.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="John Smith"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Job Title & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                {...register('job_title')}
                placeholder="Hiring Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...register('department')}
                placeholder="Finance"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@company.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+44 20 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                {...register('mobile')}
                placeholder="+44 7700 900000"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              {...register('linkedin_url')}
              placeholder="https://linkedin.com/in/johnsmith"
            />
            {errors.linkedin_url && (
              <p className="text-sm text-destructive">{errors.linkedin_url.message}</p>
            )}
          </div>

          {/* Preferred Contact Method */}
          <div className="space-y-2">
            <Label>Preferred Contact Method</Label>
            <Select
              value={watch('preferred_contact_method')}
              onValueChange={(value: ContactMethod) => setValue('preferred_contact_method', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Primary Contact</Label>
                <p className="text-sm text-muted-foreground">Main point of contact</p>
              </div>
              <Switch
                checked={watch('is_primary')}
                onCheckedChange={(checked) => setValue('is_primary', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Billing Contact</Label>
                <p className="text-sm text-muted-foreground">Receives invoices</p>
              </div>
              <Switch
                checked={watch('is_billing_contact')}
                onCheckedChange={(checked) => setValue('is_billing_contact', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Contact is still at company</p>
              </div>
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Contact' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
