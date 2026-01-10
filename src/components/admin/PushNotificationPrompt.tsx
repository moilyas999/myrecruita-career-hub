import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationPromptProps {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

export function PushNotificationPrompt({
  userId,
  userEmail,
  userName,
  userRole,
}: PushNotificationPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    subscribe 
  } = usePushNotifications({
    userId,
    email: userEmail,
    name: userName,
    role: userRole,
  });

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const dismissedUntil = localStorage.getItem('push_prompt_dismissed_until');
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        setIsDismissed(true);
        return;
      } else {
        localStorage.removeItem('push_prompt_dismissed_until');
      }
    }

    // Show prompt after a short delay if:
    // - Push is supported
    // - User is not already subscribed
    // - User hasn't dismissed it
    const timer = setTimeout(() => {
      if (isSupported && !isSubscribed && !isLoading) {
        setShouldShow(true);
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, isLoading]);

  const handleDismiss = (remindLater: boolean) => {
    setIsDismissed(true);
    setShouldShow(false);
    
    if (remindLater) {
      // Remind again in 7 days
      const remindDate = new Date();
      remindDate.setDate(remindDate.getDate() + 7);
      localStorage.setItem('push_prompt_dismissed_until', remindDate.toISOString());
    } else {
      // Don't show again for 30 days
      const remindDate = new Date();
      remindDate.setDate(remindDate.getDate() + 30);
      localStorage.setItem('push_prompt_dismissed_until', remindDate.toISOString());
    }
  };

  const handleEnable = async () => {
    await subscribe();
    setIsDismissed(true);
    setShouldShow(false);
  };

  // Don't render if:
  // - Not supported
  // - Already subscribed
  // - User dismissed
  // - Still loading
  // - Not ready to show
  if (!isSupported || isSubscribed || isDismissed || isLoading || !shouldShow) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 max-w-sm shadow-lg border-primary/20 z-50 animate-slide-up">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm">Enable Push Notifications</h4>
              <button
                onClick={() => handleDismiss(false)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Get instant updates when CVs are submitted, jobs are posted, or someone needs your attention.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEnable} className="flex-1">
                Enable Now
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleDismiss(true)}
                className="text-xs"
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
