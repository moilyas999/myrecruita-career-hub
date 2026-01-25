import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { logActivity } from '@/services/activityLogger';

interface SponsorshipToggleProps {
  candidateId: string;
  candidateName: string;
  currentValue: boolean | null | undefined;
}

export function SponsorshipToggle({ 
  candidateId, 
  candidateName, 
  currentValue 
}: SponsorshipToggleProps) {
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [localValue, setLocalValue] = useState<boolean>(currentValue ?? false);

  const canUpdate = hasPermission('cv.update');

  const handleToggle = async (checked: boolean) => {
    if (!canUpdate || isUpdating) return;

    const previousValue = localValue;
    setLocalValue(checked); // Optimistic update
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('cv_submissions')
        .update({ requires_sponsorship: checked })
        .eq('id', candidateId);

      if (error) throw error;

      // Log activity
      await logActivity({
        action: 'cv_updated',
        resourceType: 'cv_submission',
        resourceId: candidateId,
        details: {
          field: 'requires_sponsorship',
          candidate_name: candidateName,
          requires_sponsorship: checked,
        },
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['cv-submissions'] });

      toast({
        title: 'Sponsorship status updated',
        description: `${candidateName} ${checked ? 'requires' : 'does not require'} visa sponsorship`,
      });
    } catch (error) {
      console.error('Failed to update sponsorship status:', error);
      setLocalValue(previousValue); // Rollback on error
      toast({
        title: 'Update failed',
        description: 'Could not update sponsorship status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Read-only badge when user doesn't have permission
  if (!canUpdate) {
    return (
      <Badge 
        variant={localValue ? 'default' : 'secondary'}
        className={localValue 
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        }
      >
        {localValue ? (
          <>
            <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />
            Visa Required
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
            No Visa Needed
          </>
        )}
      </Badge>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md border transition-colors ${
            localValue 
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' 
              : 'bg-muted/50 border-border'
          }`}
        >
          <Label 
            htmlFor={`sponsorship-${candidateId}`}
            className="text-xs font-medium cursor-pointer flex items-center gap-1.5"
          >
            {isUpdating ? (
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
            ) : localValue ? (
              <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            )}
            <span className={localValue ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}>
              Visa
            </span>
          </Label>
          <Switch
            id={`sponsorship-${candidateId}`}
            checked={localValue}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            aria-label={`Mark ${candidateName} as requiring visa sponsorship`}
            className="scale-75"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{localValue ? 'Requires visa sponsorship' : 'Does not require visa sponsorship'}</p>
        <p className="text-xs text-muted-foreground">Click to toggle</p>
      </TooltipContent>
    </Tooltip>
  );
}
