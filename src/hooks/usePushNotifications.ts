import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isProgressierAvailable } from '@/lib/progressier';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
}

interface UserData {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
}

// Progressier will be loaded via script tag
declare global {
  interface Window {
    progressier?: {
      add: (options: { 
        id?: string;
        userId?: string;
        email?: string;
        name?: string;
        tags?: string[];
      }) => void;
      subscribe: () => Promise<void>;
      unsubscribe: () => Promise<void>;
      isSubscribed: () => Promise<boolean>;
    };
  }
}

export function usePushNotifications(userData?: UserData): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasAutoSubscribed = useRef(false);

  // Check if push notifications are supported and auto-subscribe if enabled
  useEffect(() => {
    const checkSupportAndAutoSubscribe = async () => {
      const supported = 
        'Notification' in window && 
        'serviceWorker' in navigator &&
        'PushManager' in window;
      
      setIsSupported(supported);

      // Check if already subscribed via Progressier (only if loaded)
      if (supported && isProgressierAvailable() && window.progressier) {
        try {
          const subscribed = await window.progressier.isSubscribed();
          setIsSubscribed(subscribed);
          
          // Auto-subscribe if user has push_enabled and not already subscribed
          if (!subscribed && user && !hasAutoSubscribed.current) {
            // Check user's notification preferences
            const { data: prefs } = await supabase
              .from('notification_preferences')
              .select('push_enabled')
              .eq('user_id', user.id)
              .single();
            
            if (prefs?.push_enabled && Notification.permission === 'granted') {
              hasAutoSubscribed.current = true;
              try {
                await window.progressier.subscribe();
                setIsSubscribed(true);
                
                // Sync user data
                if (userData) {
                  window.progressier.add({
                    userId: userData.userId,
                    email: userData.email,
                    name: userData.name,
                    tags: userData.role ? [userData.role] : undefined,
                  });
                }
                console.log('Auto-subscribed to push notifications');
              } catch (err) {
                console.error('Auto-subscribe failed:', err);
              }
            }
          }
        } catch {
          setIsSubscribed(false);
        }
      }
      
      setIsLoading(false);
    };

    // Wait a bit for Progressier to load
    const timer = setTimeout(checkSupportAndAutoSubscribe, 1000);
    return () => clearTimeout(timer);
  }, [user, userData]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';
    return Notification.requestPermission();
  }, [isSupported]);

  const syncUserToProgressier = useCallback((data?: UserData) => {
    if (!isProgressierAvailable() || !window.progressier) return;
    
    const syncData = data || userData;
    if (!syncData) return;

    try {
      window.progressier.add({
        userId: syncData.userId,
        email: syncData.email,
        name: syncData.name,
        tags: syncData.role ? [syncData.role] : undefined,
      });
      console.log('User synced to Progressier:', syncData);
    } catch (error) {
      console.error('Failed to sync user to Progressier:', error);
    }
  }, [userData]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    try {
      const permission = await requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Please allow notifications to receive updates');
        return;
      }

      if (isProgressierAvailable() && window.progressier) {
        await window.progressier.subscribe();
        setIsSubscribed(true);
        
        // Sync user data to Progressier after successful subscription
        syncUserToProgressier();
        
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Push notification service not available. Please try again later.');
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('Failed to enable push notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, requestPermission, syncUserToProgressier]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isProgressierAvailable() && window.progressier) {
        await window.progressier.unsubscribe();
        setIsSubscribed(false);
        toast.success('Push notifications disabled');
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      toast.error('Failed to disable push notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    requestPermission,
  };
}
