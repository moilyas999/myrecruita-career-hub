import { useState, useEffect, useCallback } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setIsExiting(false);
    // Show reconnection message then animate out
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => setShowIndicator(false), 300);
    }, 2000);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setShowIndicator(true);
    setIsExiting(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  if (!showIndicator) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium',
        'transition-all duration-300 ease-in-out',
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        isOnline
          ? 'bg-emerald-500 text-white'
          : 'bg-amber-500 text-white'
      )}
    >
      {isOnline ? (
        <Wifi className="w-4 h-4" aria-hidden="true" />
      ) : (
        <WifiOff className="w-4 h-4" aria-hidden="true" />
      )}
      {isOnline ? 'Back online' : 'You are offline'}
    </div>
  );
}
