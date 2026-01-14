import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ExternalLink,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Star,
  Clock,
  User,
  Loader2,
  History,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useUpdatePipelineStage,
  useUpdatePipelineNotes,
  useUpdatePipelinePriority,
  usePipelineActivity,
} from '@/hooks/usePipeline';
import {
  STAGE_CONFIG,
  ACTIVE_STAGES,
  TERMINAL_STAGES,
  PIPELINE_STAGES,
  type PipelineEntryWithDetails,
  type PipelineStage,
} from '@/types/pipeline';

interface PipelineDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: PipelineEntryWithDetails | null;
}

export default function PipelineDetailSheet({
  open,
  onOpenChange,
  entry,
}: PipelineDetailSheetProps) {
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<number[]>([0]);
  const [rejectionReason, setRejectionReason] = useState('');

  const updateStage = useUpdatePipelineStage();
  const updateNotes = useUpdatePipelineNotes();
  const updatePriority = useUpdatePipelinePriority();
  const { data: activities, isLoading: activitiesLoading } = usePipelineActivity(entry?.id || null);

  // Sync local state when entry changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && entry) {
      setNotes(entry.notes || '');
      setPriority([entry.priority || 0]);
      setRejectionReason('');
    }
    onOpenChange(isOpen);
  };

  const handleStageChange = async (newStage: PipelineStage) => {
    if (!entry) return;
    
    await updateStage.mutateAsync({
      id: entry.id,
      stage: newStage,
      rejection_reason: newStage === 'rejected' ? rejectionReason : undefined,
    });
  };

  const handleNotesUpdate = async () => {
    if (!entry) return;
    await updateNotes.mutateAsync({ id: entry.id, notes });
  };

  const handlePriorityUpdate = async () => {
    if (!entry) return;
    await updatePriority.mutateAsync({ id: entry.id, priority: priority[0] });
  };

  if (!entry) return null;

  const candidate = entry.cv_submission;
  const job = entry.job;
  const currentStageConfig = STAGE_CONFIG[entry.stage];

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{candidate?.name || 'Unknown Candidate'}</SheetTitle>
          <SheetDescription>
            Pipeline entry for {job?.title || 'Unknown Job'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Current Stage */}
          <div className="space-y-3">
            <Label>Current Stage</Label>
            <div className="flex items-center gap-2">
              <Badge className={cn(currentStageConfig.bgColor, currentStageConfig.textColor, 'border', currentStageConfig.color)}>
                {currentStageConfig.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })}
              </span>
            </div>

            {/* Stage Selector */}
            <Select
              value={entry.stage}
              onValueChange={(v) => handleStageChange(v as PipelineStage)}
              disabled={updateStage.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((stage) => {
                  const config = STAGE_CONFIG[stage];
                  return (
                    <SelectItem key={stage} value={stage}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', config.color.replace('border-', 'bg-'))} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Rejection Reason */}
            {entry.stage === 'rejected' && entry.rejection_reason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <strong>Rejection Reason:</strong> {entry.rejection_reason}
              </div>
            )}
          </div>

          <Separator />

          {/* Candidate Info */}
          <div className="space-y-3">
            <Label>Candidate Details</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${candidate?.email}`} className="text-primary hover:underline">
                  {candidate?.email}
                </a>
              </div>
              {candidate?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${candidate.phone}`} className="text-primary hover:underline">
                    {candidate.phone}
                  </a>
                </div>
              )}
              {candidate?.job_title && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{candidate.job_title}</span>
                </div>
              )}
              {candidate?.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{candidate.location}</span>
                </div>
              )}
              {candidate?.cv_score !== null && candidate?.cv_score !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">CV Score:</span>
                  <Badge variant="outline">{candidate.cv_score}%</Badge>
                </div>
              )}
              {candidate?.cv_file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(candidate.cv_file_url!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View CV
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Info */}
          <div className="space-y-3">
            <Label>Job Details</Label>
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{job?.reference_id}</Badge>
                <span className="font-medium">{job?.title}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{job?.location}</span>
                <span>{job?.sector}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Priority */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Priority</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4 transition-colors',
                      i < priority[0]
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Slider
                value={priority}
                onValueChange={setPriority}
                max={5}
                step={1}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handlePriorityUpdate}
                disabled={updatePriority.isPending || priority[0] === entry.priority}
              >
                {updatePriority.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <Label>Notes</Label>
            <Textarea
              placeholder="Add notes about this candidate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <Button
              size="sm"
              onClick={handleNotesUpdate}
              disabled={updateNotes.isPending || notes === (entry.notes || '')}
            >
              {updateNotes.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Notes
            </Button>
          </div>

          <Separator />

          {/* Activity History */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <Label>Activity History</Label>
            </div>
            
            {activitiesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : activities && activities.length > 0 ? (
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium capitalize">
                            {activity.action.replace('_', ' ')}
                          </span>
                          {activity.from_stage && activity.to_stage && (
                            <span className="text-muted-foreground">
                              {STAGE_CONFIG[activity.from_stage as PipelineStage]?.label || activity.from_stage}
                              {' → '}
                              {STAGE_CONFIG[activity.to_stage as PipelineStage]?.label || activity.to_stage}
                            </span>
                          )}
                        </div>
                        {activity.note && (
                          <p className="text-muted-foreground mt-0.5 line-clamp-2">{activity.note}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
