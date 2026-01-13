import { useState, useEffect, useCallback } from 'react';
import { BUILD_VERSION } from '@/lib/version';

const VERSION_STORAGE_KEY = 'app_build_version';
const DISMISSED_STORAGE_KEY = 'update_dismissed_until';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useAppUpdates = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if update was recently dismissed
  const checkDismissed = useCallback(() => {
    const dismissedUntil = sessionStorage.getItem(DISMISSED_STORAGE_KEY);
    if (dismissedUntil) {
      const until = parseInt(dismissedUntil, 10);
      if (Date.now() < until) {
        return true;
      }
      sessionStorage.removeItem(DISMISSED_STORAGE_KEY);
    }
    return false;
  }, []);

  // Check for version mismatch
  const checkForUpdates = useCallback(() => {
    if (checkDismissed()) {
      return;
    }

    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    
    if (!storedVersion) {
      // First visit - store current version
      localStorage.setItem(VERSION_STORAGE_KEY, BUILD_VERSION);
      return;
    }

    if (storedVersion !== BUILD_VERSION) {
      console.log('[Update] New version detected:', BUILD_VERSION, 'vs stored:', storedVersion);
      setUpdateAvailable(true);
    }
  }, [checkDismissed]);

  // Check service worker for updates
  const checkServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        console.log('[Update] Service worker waiting');
        if (!checkDismissed()) {
          setUpdateAvailable(true);
        }
      }
    } catch (error) {
      console.error('[Update] Service worker check failed:', error);
    }
  }, [checkDismissed]);

  // Apply update by reloading
  const applyUpdate = useCallback(() => {
    // Update stored version before reload
    localStorage.setItem(VERSION_STORAGE_KEY, BUILD_VERSION);
    
    // Clear caches if available
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    // Activate waiting service worker if present
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }

    // Hard reload
    window.location.reload();
  }, []);

  // Dismiss update temporarily (for this session)
  const dismissUpdate = useCallback(() => {
    // Dismiss for 30 minutes
    const until = Date.now() + 30 * 60 * 1000;
    sessionStorage.setItem(DISMISSED_STORAGE_KEY, until.toString());
    setDismissed(true);
    setUpdateAvailable(false);
  }, []);

  // Initial check and setup listeners
  useEffect(() => {
    // Store current version on mount
    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    if (storedVersion && storedVersion !== BUILD_VERSION) {
      console.log('[Update] Version mismatch on mount:', BUILD_VERSION, 'vs stored:', storedVersion);
      if (!checkDismissed()) {
        setUpdateAvailable(true);
      }
    } else if (!storedVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, BUILD_VERSION);
    }

    // Check service worker
    checkServiceWorker();

    // Periodic check
    const intervalId = setInterval(() => {
      checkForUpdates();
      checkServiceWorker();
    }, CHECK_INTERVAL);

    // Check on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
        checkServiceWorker();
      }
    };

    // Check on focus
    const handleFocus = () => {
      checkForUpdates();
      checkServiceWorker();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Listen for service worker controller change
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[Update] Service worker controller changed');
      });
    }

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkForUpdates, checkServiceWorker, checkDismissed]);

  return {
    updateAvailable: updateAvailable && !dismissed,
    applyUpdate,
    dismissUpdate,
    buildVersion: BUILD_VERSION,
  };
};
