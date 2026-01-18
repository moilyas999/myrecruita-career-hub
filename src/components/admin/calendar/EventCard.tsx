import { format } from 'date-fns';
import { Video, Users, PhoneCall, Bell, Calendar, MapPin, Link2, User, Briefcase, Building2, MoreHorizontal, Edit2, Trash2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EVENT_TYPE_CONFIG, SYNC_STATUS_CONFIG } from '@/types/calendar';
import type { CalendarEventWithRelations, EventType } from '@/types/calendar';
import { useCancelCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendar';
import { usePermissions } from '@/hooks/usePermissions';
import { useState } from 'react';
import EventFormDialog from './EventFormDialog';

interface EventCardProps {
  event: CalendarEventWithRelations;
  compact?: boolean;
}

const eventTypeIcons: Record<EventType, React.ElementType> = {
  interview: Video,
  meeting: Users,
  followup: PhoneCall,
  reminder: Bell,
  other: Calendar,
};

export default function EventCard({ event, compact = false }: EventCardProps) {
  const { hasPermission } = usePermissions();
  const cancelEvent = useCancelCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const config = EVENT_TYPE_CONFIG[event.eventType];
  const syncConfig = SYNC_STATUS_CONFIG[event.syncStatus];
  const Icon = eventTypeIcons[event.eventType];
  
  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this event?')) {
      cancelEvent.mutate({ id: event.id });
    }
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this event?')) {
      deleteEvent.mutate(event.id);
    }
  };
  
  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg border",
        event.isCancelled && "opacity-50 line-through"
      )}>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", config.color)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {config.label}
        </Badge>
      </div>
    );
  }
  
  return (
    <>
      <Card className={cn(
        "transition-all hover:shadow-md",
        event.isCancelled && "opacity-60"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Event type icon */}
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
              config.color
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            
            {/* Event details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={cn(
                    "font-semibold",
                    event.isCancelled && "line-through"
                  )}>
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{config.label}</Badge>
                  {event.isCancelled && (
                    <Badge variant="destructive">Cancelled</Badge>
                  )}
                  
                  {hasPermission('calendar.view') && !event.isCancelled && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCancel}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Event
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              {/* Description */}
              {event.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {event.description}
                </p>
              )}
              
              {/* Meta information */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                
                {event.meetingLink && (
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Link2 className="h-4 w-4" />
                    <span>Join Meeting</span>
                  </a>
                )}
                
                {event.candidate && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{event.candidate.name}</span>
                  </div>
                )}
                
                {event.job && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{event.job.title}</span>
                  </div>
                )}
                
                {event.client && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{event.client.companyName}</span>
                  </div>
                )}
              </div>
              
              {/* Sync status */}
              {event.syncStatus !== 'not_synced' && (
                <div className="mt-3 flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", syncConfig.color)} />
                  <span className="text-xs text-muted-foreground">{syncConfig.label}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <EventFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        event={event}
      />
    </>
  );
}
