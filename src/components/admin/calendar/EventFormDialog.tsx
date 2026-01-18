import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCreateCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendar';
import { EVENT_TYPE_CONFIG } from '@/types/calendar';
import type { CalendarEventWithRelations, EventType } from '@/types/calendar';

const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  eventType: z.enum(['interview', 'meeting', 'followup', 'reminder', 'other']),
  date: z.date({ required_error: 'Date is required' }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEventWithRelations;
  defaultDate?: Date;
  defaultEventType?: EventType;
  defaultTitle?: string;
}

export default function EventFormDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  defaultEventType = 'meeting',
  defaultTitle = '',
}: EventFormDialogProps) {
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  
  const isEditing = !!event;
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      eventType: defaultEventType,
      date: defaultDate || new Date(),
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      meetingLink: '',
    },
  });
  
  // Reset form when dialog opens or event changes
  useEffect(() => {
    if (open) {
      if (event) {
        const startDate = new Date(event.startTime);
        const endDate = new Date(event.endTime);
        form.reset({
          title: event.title,
          eventType: event.eventType,
          date: startDate,
          startTime: format(startDate, 'HH:mm'),
          endTime: format(endDate, 'HH:mm'),
          description: event.description || '',
          location: event.location || '',
          meetingLink: event.meetingLink || '',
        });
      } else {
        form.reset({
          title: defaultTitle,
          eventType: defaultEventType,
          date: defaultDate || new Date(),
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          meetingLink: '',
        });
      }
    }
  }, [open, event, defaultDate, defaultEventType, defaultTitle, form]);
  
  const onSubmit = async (values: EventFormValues) => {
    // Combine date with time
    const startTime = new Date(values.date);
    const [startHours, startMinutes] = values.startTime.split(':').map(Number);
    startTime.setHours(startHours, startMinutes, 0, 0);
    
    const endTime = new Date(values.date);
    const [endHours, endMinutes] = values.endTime.split(':').map(Number);
    endTime.setHours(endHours, endMinutes, 0, 0);
    
    const eventData = {
      title: values.title,
      eventType: values.eventType as EventType,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      description: values.description || null,
      location: values.location || null,
      meetingLink: values.meetingLink || null,
    };
    
    try {
      if (isEditing) {
        await updateEvent.mutateAsync({ id: event.id, ...eventData });
      } else {
        await createEvent.mutateAsync(eventData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  const isLoading = createEvent.isPending || updateEvent.isPending;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the event details below.'
              : 'Fill in the details to create a new calendar event.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.entries(EVENT_TYPE_CONFIG) as [EventType, typeof EVENT_TYPE_CONFIG[EventType]][]).map(([type, config]) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", config.color)} />
                            {config.label}
                          </div>
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
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Office, video call, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="meetingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://meet.google.com/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to video call or online meeting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes or details..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
