import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { isProgressierAvailable } from '@/lib/progressier';

interface UseProgressierUpdatesOptions {
  autoReloadOnVisibility?: boolean;
  showToast?: boolean;
}

interface UseProgressierUpdatesReturn {
  updateAvailable: boolean;
  checkForUpdates: () => void;
  applyUpdate: () => void;
}

export function useProgressierUpdates(
  options: UseProgressierUpdatesOptions = {}
): UseProgressierUpdatesReturn {
  const { autoReloadOnVisibility = true, showToast = true } = options;
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Check if service worker has detected an update via cache
  const checkForUpdates = useCallback(() => {
    // Check if there's a waiting service worker (indicates update available)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          setUpdateAvailable(true);
        }
      });
    }
    return updateAvailable;
  }, [updateAvailable]);

  // Apply the update by reloading the page
  const applyUpdate = useCallback(() => {
    // Clear all caches before reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  }, []);

  // Listen for visibility changes to check for updates (no auto-reload)
  useEffect(() => {
    if (!autoReloadOnVisibility) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Just check for updates - NEVER auto-reload
        // This preserves user state during uploads and other operations
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoReloadOnVisibility, checkForUpdates]);

  // Check for updates periodically and show toast
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (checkForUpdates() && showToast && !updateAvailable) {
        toast.info('Update Available', {
          description: 'A new version is available. Reload to update.',
          action: {
            label: 'Reload',
            onClick: applyUpdate,
          },
          duration: Infinity,
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [checkForUpdates, showToast, updateAvailable, applyUpdate]);

  // Initial check on mount
  useEffect(() => {
    // Delay initial check to allow Progressier to initialize
    const timeout = setTimeout(() => {
      if (isProgressierAvailable()) {
        checkForUpdates();
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [checkForUpdates]);

  return {
    updateAvailable,
    checkForUpdates,
    applyUpdate,
  };
}

// Helper function to sync user data to Progressier segments
export function syncUserToProgressier(userData: {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
}) {
  // Safety check - only sync if Progressier is available
  if (!isProgressierAvailable()) {
    return;
  }

  const tags: string[] = [];
  
  // Add role as a tag for segment targeting
  if (userData.role) {
    tags.push(userData.role);
  }
  
  // Add additional tags for targeting
  tags.push('admin_user'); // All admin users get this tag
  
  window.progressier!.add({
    userId: userData.userId,
    email: userData.email,
    name: userData.name,
    tags: tags.length > 0 ? tags : undefined,
  });
  
  console.log('[Progressier] User synced with tags:', tags);
}
