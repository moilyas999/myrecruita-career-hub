import { format, isToday, isTomorrow } from 'date-fns';
import { Video, Users, PhoneCall, Bell, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMyCalendarEvents } from '@/hooks/useCalendar';
import { EVENT_TYPE_CONFIG } from '@/types/calendar';
import type { EventType } from '@/types/calendar';

const eventTypeIcons: Record<EventType, React.ElementType> = {
  interview: Video,
  meeting: Users,
  followup: PhoneCall,
  reminder: Bell,
  other: Calendar,
};

interface UpcomingEventsWidgetProps {
  maxEvents?: number;
}

export default function UpcomingEventsWidget({ maxEvents = 5 }: UpcomingEventsWidgetProps) {
  const { data: events, isLoading } = useMyCalendarEvents();
  
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const displayEvents = events?.slice(0, maxEvents) || [];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Your scheduled events</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin?tab=calendar" className="flex items-center gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayEvents.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming events</p>
            <Button variant="link" size="sm" asChild>
              <Link to="/admin?tab=calendar">Schedule something</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.map(event => {
              const config = EVENT_TYPE_CONFIG[event.eventType];
              const Icon = eventTypeIcons[event.eventType];
              
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    config.color
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {getDateLabel(event.startTime)} · {format(new Date(event.startTime), 'HH:mm')}
                    </p>
                    {event.candidate && (
                      <p className="text-xs text-muted-foreground truncate">
                        with {event.candidate.name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
