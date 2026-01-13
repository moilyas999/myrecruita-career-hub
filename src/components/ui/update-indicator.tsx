import { RefreshCw, X } from 'lucide-react';
import { useAppUpdates } from '@/hooks/useAppUpdates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const UpdateIndicator = () => {
  const { updateAvailable, applyUpdate, dismissUpdate, buildVersion } = useAppUpdates();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[9999]",
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
        "motion-reduce:animate-none"
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="relative bg-primary text-primary-foreground rounded-lg shadow-2xl p-4 pr-10 max-w-xs">
        {/* Pulsing background effect */}
        <div className="absolute inset-0 bg-primary rounded-lg animate-pulse opacity-30" />
        
        {/* Content */}
        <div className="relative flex items-center gap-3">
          <div className="flex-shrink-0">
            <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Update Available</p>
            <p className="text-xs opacity-80 truncate">
              New version ready
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative mt-3 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={applyUpdate}
            className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reload Now
          </Button>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismissUpdate}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          aria-label="Dismiss update notification"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Version info (subtle) */}
        <div className="relative mt-2 text-[10px] opacity-50 text-center">
          {buildVersion}
        </div>
      </div>
    </div>
  );
};

export default UpdateIndicator;
