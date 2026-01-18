import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RequiredFieldRenderer } from './shared/RequiredFieldRenderer';
import { PlacementForm } from './PlacementForm';
import {
  STAGE_CONFIG,
  STAGE_REQUIRED_ACTIONS,
  getStageRequirements,
  stageRequiresMandatoryFields,
  type PipelineStage,
  type PipelineEntryWithDetails,
  type RequiredField,
} from '@/types/pipeline';
import { useScorecardExists } from '@/hooks/useInterviewScorecard';
import { useUpdatePipelineStage } from '@/hooks/usePipeline';
import { usePermissions } from '@/hooks/usePermissions';

interface StageTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: PipelineEntryWithDetails | null;
  targetStage: PipelineStage | null;
  onSuccess?: () => void;
}

export function StageTransitionDialog({
  open,
  onOpenChange,
  entry,
  targetStage,
  onSuccess,
}: StageTransitionDialogProps) {
  const [showPlacement, setShowPlacement] = useState(false);
  const { hasPermission } = usePermissions();
  const updateStage = useUpdatePipelineStage();

  // Get requirements for the target stage
  const requirements = targetStage ? getStageRequirements(targetStage) : null;
  const requiredFields = requirements?.requiredFields || [];

  // Check if this requires a previous scorecard
  const previousInterviewStage = entry?.stage.includes('interview') ? entry.stage : null;
  const { data: hasPreviousScorecard, isLoading: checkingScorecard } = useScorecardExists(
    requirements?.requiresPreviousScorecard ? entry?.id || null : null,
    previousInterviewStage
  );

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    defaultValues: {},
  });

  // Reset form when dialog opens/closes or stage changes
  useEffect(() => {
    if (open && targetStage) {
      const defaults: Record<string, unknown> = {};
      requiredFields.forEach((field) => {
        if (field.type === 'checkbox') {
          defaults[field.field] = false;
        } else {
          defaults[field.field] = '';
        }
      });
      reset(defaults);
      setShowPlacement(false);
    }
  }, [open, targetStage, reset, requiredFields]);

  // Check permissions
  const canUpdatePipeline = hasPermission('pipeline.update');

  if (!entry || !targetStage) return null;

  const currentStageConfig = STAGE_CONFIG[entry.stage as PipelineStage];
  const targetStageConfig = STAGE_CONFIG[targetStage];
  const hasMandatoryFields = stageRequiresMandatoryFields(targetStage);

  // Check if we need to show placement form instead
  const needsPlacementForm = requiredFields.some((f) => f.type === 'placement');

  // Validation: requires previous scorecard but doesn't have one
  const blockedByScorecard = requirements?.requiresPreviousScorecard && !hasPreviousScorecard;

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!canUpdatePipeline) return;

    // Extract special fields
    const rejectionReason = data.rejection_reason as string | undefined;
    const note = (data.qualification_notes || 
                  data.submission_note || 
                  data.contact_note || 
                  data.hold_reason || 
                  data.rejection_notes ||
                  data.withdrawal_notes) as string | undefined;

    await updateStage.mutateAsync({
      id: entry.id,
      stage: targetStage,
      rejection_reason: rejectionReason,
      note: note,
      stageData: data,
    });

    onOpenChange(false);
    onSuccess?.();
  };

  const handlePlacementSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  // If this is a placement stage, show the placement form instead
  if (needsPlacementForm && showPlacement) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Placement Details</DialogTitle>
            <DialogDescription>
              Fill in all placement details before marking as placed.
            </DialogDescription>
          </DialogHeader>
          <PlacementForm
            pipelineEntry={entry}
            onSuccess={handlePlacementSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Move to</span>
            <Badge className={cn(targetStageConfig.bgColor, targetStageConfig.textColor)}>
              {targetStageConfig.label}
            </Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className={cn(currentStageConfig.bgColor, currentStageConfig.textColor)}>
              {currentStageConfig.label}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge className={cn(targetStageConfig.bgColor, targetStageConfig.textColor)}>
              {targetStageConfig.label}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {!canUpdatePipeline && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to update pipeline stages.
            </AlertDescription>
          </Alert>
        )}

        {blockedByScorecard && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {requirements?.validationMessage || 'Please complete the previous interview scorecard first.'}
            </AlertDescription>
          </Alert>
        )}

        {hasMandatoryFields && !needsPlacementForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {requiredFields
                .filter((f) => f.type !== 'placement' && f.type !== 'scorecard')
                .map((field) => (
                  <RequiredFieldRenderer
                    key={field.field}
                    field={field}
                    control={control}
                    errors={errors as Record<string, { message?: string }>}
                    disabled={!canUpdatePipeline || blockedByScorecard || checkingScorecard}
                  />
                ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canUpdatePipeline || blockedByScorecard || isSubmitting || checkingScorecard}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Moving...
                  </>
                ) : (
                  `Move to ${targetStageConfig.label}`
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {needsPlacementForm && !showPlacement && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowPlacement(true)}
              disabled={!canUpdatePipeline}
            >
              Continue to Placement Details
            </Button>
          </DialogFooter>
        )}

        {!hasMandatoryFields && !needsPlacementForm && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await updateStage.mutateAsync({
                  id: entry.id,
                  stage: targetStage,
                });
                onOpenChange(false);
                onSuccess?.();
              }}
              disabled={!canUpdatePipeline || updateStage.isPending}
            >
              {updateStage.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                `Move to ${targetStageConfig.label}`
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default StageTransitionDialog;
