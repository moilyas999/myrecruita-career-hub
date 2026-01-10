import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 
        'Notification' in window && 
        'serviceWorker' in navigator &&
        'PushManager' in window;
      
      setIsSupported(supported);

      // Check if already subscribed via Progressier
      if (supported && window.progressier) {
        try {
          const subscribed = await window.progressier.isSubscribed();
          setIsSubscribed(subscribed);
        } catch {
          setIsSubscribed(false);
        }
      }
      
      setIsLoading(false);
    };

    // Wait a bit for Progressier to load
    const timer = setTimeout(checkSupport, 1000);
    return () => clearTimeout(timer);
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';
    return Notification.requestPermission();
  }, [isSupported]);

  const syncUserToProgressier = useCallback((data?: UserData) => {
    if (!window.progressier) return;
    
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

      if (window.progressier) {
        await window.progressier.subscribe();
        setIsSubscribed(true);
        
        // Sync user data to Progressier after successful subscription
        syncUserToProgressier();
        
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Push notification service not available');
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
      if (window.progressier) {
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
