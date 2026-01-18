import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Video, Users, PhoneCall, Bell, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCalendarEvents, useUpcomingInterviews } from '@/hooks/useCalendar';
import { usePermissions } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/admin/shared';
import { cn } from '@/lib/utils';
import { EVENT_TYPE_CONFIG } from '@/types/calendar';
import type { CalendarEventWithRelations, EventType } from '@/types/calendar';
import EventFormDialog from './EventFormDialog';
import EventCard from './EventCard';

type ViewMode = 'week' | 'month';

const eventTypeIcons: Record<EventType, React.ElementType> = {
  interview: Video,
  meeting: Users,
  followup: PhoneCall,
  reminder: Bell,
  other: Calendar,
};

export default function CalendarDashboard() {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      };
    }
    return {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    };
  }, [currentDate, viewMode]);
  
  const { data: events, isLoading: eventsLoading } = useCalendarEvents({
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
  });
  
  const { data: upcomingInterviews, isLoading: interviewsLoading } = useUpcomingInterviews(7);
  
  // Permission check
  if (permissionsLoading) {
    return <CalendarSkeleton />;
  }
  
  if (!hasPermission('calendar.view')) {
    return <AccessDenied message="You don't have permission to view the calendar." requiredPermission="calendar.view" />;
  }
  
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  
  const getEventsForDay = (date: Date): CalendarEventWithRelations[] => {
    if (!events) return [];
    return events.filter(event => isSameDay(new Date(event.startTime), date));
  };
  
  const navigatePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
      });
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };
  
  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
      });
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };
  
  const navigateToday = () => {
    setCurrentDate(new Date());
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Calendar
          </h1>
          <p className="text-muted-foreground">
            Manage interviews, meetings, and follow-ups
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Today
          </Button>
          {hasPermission('calendar.view') && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={navigatePrev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-lg">
                    {viewMode === 'week' 
                      ? `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`
                      : format(currentDate, 'MMMM yyyy')
                    }
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={navigateNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <TabsList className="grid w-32 grid-cols-2">
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            
            <CardContent>
              {eventsLoading ? (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-md" />
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "grid gap-1",
                  viewMode === 'week' ? "grid-cols-7" : "grid-cols-7"
                )}>
                  {/* Day headers */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {days.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(isSelected ? null : day)}
                        className={cn(
                          "min-h-24 p-1 rounded-md border text-left transition-colors hover:bg-accent/50",
                          isToday(day) && "border-primary bg-primary/5",
                          isSelected && "ring-2 ring-primary",
                          viewMode === 'month' && format(day, 'M') !== format(currentDate, 'M') && "opacity-50"
                        )}
                      >
                        <div className={cn(
                          "text-sm font-medium mb-1",
                          isToday(day) && "text-primary"
                        )}>
                          {format(day, 'd')}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(event => {
                            const config = EVENT_TYPE_CONFIG[event.eventType];
                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  "text-xs px-1 py-0.5 rounded truncate",
                                  config.color,
                                  "text-white"
                                )}
                                title={event.title}
                              >
                                {format(new Date(event.startTime), 'HH:mm')} {event.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground px-1">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Selected day events */}
          {selectedDate && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  Events for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDay(selectedDate).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No events scheduled for this day
                  </p>
                ) : (
                  <div className="space-y-3">
                    {getEventsForDay(selectedDate).map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-500" />
                Upcoming Interviews
              </CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {interviewsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : upcomingInterviews?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No interviews scheduled
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingInterviews?.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Video className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{event.candidate?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {event.job?.title || event.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.startTime), 'EEE, MMM d · HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Event Type Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(Object.entries(EVENT_TYPE_CONFIG) as [EventType, typeof EVENT_TYPE_CONFIG[EventType]][]).map(([type, config]) => {
                  const Icon = eventTypeIcons[type];
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", config.color)} />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{config.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Create Event Dialog */}
      <EventFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        defaultDate={selectedDate || undefined}
      />
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
