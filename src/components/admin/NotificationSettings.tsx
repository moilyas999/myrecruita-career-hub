import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  AlertCircle,
  FileText,
  Briefcase,
  MessageSquare,
  Users,
  Building,
  Star,
  UserPlus,
  Shield,
  BookOpen,
  Settings,
  Calendar,
  Send,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { 
  NOTIFICATION_EVENT_CONFIG,
  NotificationEventType,
  DEFAULT_EVENT_PREFERENCES 
} from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const eventIcons: Record<NotificationEventType, React.ElementType> = {
  cv_submission: FileText,
  job_application: Briefcase,
  contact_submission: MessageSquare,
  career_partner_request: Users,
  employer_job_submission: Building,
  talent_request: Star,
  staff_added: UserPlus,
  permission_changed: Shield,
  blog_published: BookOpen,
  system_updates: Settings,
  weekly_digest: Calendar,
  daily_summary: BarChart3,
};

// Get event descriptions from config
const eventDescriptions: Record<NotificationEventType, string> = NOTIFICATION_EVENT_CONFIG.reduce(
  (acc, event) => {
    acc[event.id] = event.description;
    return acc;
  },
  {} as Record<NotificationEventType, string>
);

export default function NotificationSettings() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences();
  const { 
    isSupported, 
    isSubscribed, 
    isLoading: pushLoading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();
  const { user } = useAuth();
  const [sendingTest, setSendingTest] = useState(false);

  const eventPreferences = preferences?.event_preferences as Record<string, boolean> || DEFAULT_EVENT_PREFERENCES;

  const handleSendTestNotification = async () => {
    if (!user) return;
    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: 'Test Notification',
          message: 'This is a test notification to verify your settings work correctly.',
          category: 'system_updates',
          link: '/admin?tab=notification-settings',
          targetUserIds: [user.id],
        }
      });
      
      if (error) throw error;
      toast.success('Test notification sent! Check your notification center.');
    } catch (err) {
      console.error('Test notification failed:', err);
      toast.error('Failed to send test notification');
    } finally {
      setSendingTest(false);
    }
  };

  const handleChannelToggle = (channel: 'email_enabled' | 'push_enabled' | 'in_app_enabled', value: boolean) => {
    updatePreferences({ [channel]: value });
  };

  const handleEventToggle = (event: NotificationEventType, value: boolean) => {
    updatePreferences({
      event_preferences: {
        ...eventPreferences,
        [event]: value,
      },
    });
  };

  const handlePushToggle = async (value: boolean) => {
    if (value) {
      await subscribe();
      handleChannelToggle('push_enabled', true);
    } else {
      await unsubscribe();
      handleChannelToggle('push_enabled', false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-primary">Notification Settings</h2>
          <p className="text-muted-foreground">Manage how you receive notifications</p>
        </div>
        <Button
          variant="outline"
          onClick={handleSendTestNotification}
          disabled={sendingTest}
        >
          {sendingTest ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Test
            </>
          )}
        </Button>
      </div>

      {/* Channel Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={preferences?.email_enabled ?? true}
              onCheckedChange={(value) => handleChannelToggle('email_enabled', value)}
              disabled={isUpdating}
            />
          </div>

          <Separator />

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive instant push notifications in your browser
                </p>
                {!isSupported && (
                  <Badge variant="outline" className="mt-1 text-amber-600">
                    Not supported in this browser
                  </Badge>
                )}
              </div>
            </div>
            <Switch
              checked={isSubscribed && (preferences?.push_enabled ?? true)}
              onCheckedChange={handlePushToggle}
              disabled={!isSupported || pushLoading || isUpdating}
            />
          </div>

          {isSupported && !isSubscribed && preferences?.push_enabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Push notifications are enabled in your preferences but not activated in this browser.
                <Button 
                  variant="link" 
                  className="h-auto p-0 ml-1" 
                  onClick={subscribe}
                  disabled={pushLoading}
                >
                  Click here to enable
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* In-App Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-medium">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  See notifications in the notification center
                </p>
              </div>
            </div>
            <Switch
              checked={preferences?.in_app_enabled ?? true}
              onCheckedChange={(value) => handleChannelToggle('in_app_enabled', value)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Event Notifications</CardTitle>
          <CardDescription>
            Choose which events you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {NOTIFICATION_EVENT_CONFIG.map((event, index) => {
              const Icon = eventIcons[event.id];
              const isEnabled = eventPreferences[event.id] ?? DEFAULT_EVENT_PREFERENCES[event.id];
              
              return (
                <div key={event.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isEnabled ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4",
                          isEnabled ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <Label className={cn(
                          "text-sm font-medium",
                          !isEnabled && "text-muted-foreground"
                        )}>
                          {event.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(value) => handleEventToggle(event.id, value)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
