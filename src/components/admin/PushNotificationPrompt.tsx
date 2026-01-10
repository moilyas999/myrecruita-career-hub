import { useState, useEffect } from 'react';
import { Bell, X, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationPromptProps {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

const roleMessages: Record<string, { title: string; message: string }> = {
  admin: {
    title: "Never Miss a Submission",
    message: "Get instant alerts when new CVs arrive, jobs are posted, or candidates apply."
  },
  recruiter: {
    title: "Stay Ahead of Applications",
    message: "Be the first to see new candidates and job applications as they come in."
  },
  account_manager: {
    title: "Client Updates in Real-time",
    message: "Get notified about employer requests and talent inquiries instantly."
  },
  marketing: {
    title: "Content Engagement Alerts",
    message: "Stay updated on blog performance and engagement metrics."
  },
  default: {
    title: "Enable Push Notifications",
    message: "Get instant updates when new activities require your attention."
  }
};

export function PushNotificationPrompt({
  userId,
  userEmail,
  userName,
  userRole,
}: PushNotificationPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

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

  const messageConfig = roleMessages[userRole || 'default'] || roleMessages.default;

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
    }, 5000); // Show after 5 seconds (give user time to orient)

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, isLoading]);

  const handleDismiss = (remindOption: 'later' | 'week' | 'never') => {
    setIsDismissed(true);
    setShouldShow(false);
    
    const remindDate = new Date();
    switch (remindOption) {
      case 'later':
        remindDate.setDate(remindDate.getDate() + 1); // Tomorrow
        break;
      case 'week':
        remindDate.setDate(remindDate.getDate() + 7); // 1 week
        break;
      case 'never':
        remindDate.setFullYear(remindDate.getFullYear() + 10); // Effectively never
        break;
    }
    localStorage.setItem('push_prompt_dismissed_until', remindDate.toISOString());
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
    <Card className="fixed bottom-4 right-4 max-w-sm shadow-lg border-accent/30 z-50 animate-slide-up overflow-hidden">
      {/* Decorative accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center relative">
            <Bell className="h-6 w-6 text-accent" />
            <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm">{messageConfig.title}</h4>
              <button
                onClick={() => handleDismiss(dontShowAgain ? 'never' : 'later')}
                className="text-muted-foreground hover:text-foreground p-1 -mr-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {messageConfig.message}
            </p>
            
            <div className="flex gap-2 mb-3">
              <Button size="sm" onClick={handleEnable} className="flex-1 gap-1">
                <Bell className="h-3 w-3" />
                Enable Now
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleDismiss('week')}
                className="text-xs gap-1"
              >
                <Clock className="h-3 w-3" />
                In a Week
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dont-show" 
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                className="h-3 w-3"
              />
              <label 
                htmlFor="dont-show" 
                className="text-[10px] text-muted-foreground cursor-pointer"
              >
                Don't show this again
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
