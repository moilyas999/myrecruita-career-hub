import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ExternalLink,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Star,
  Loader2,
  History,
  User,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useUpdatePipelineStage,
  useUpdatePipelineNotes,
  useUpdatePipelinePriority,
  usePipelineActivity,
} from '@/hooks/usePipeline';
import { useScorecards } from '@/hooks/useInterviewScorecard';
import { usePlacement } from '@/hooks/usePlacement';
import { usePermissions } from '@/hooks/usePermissions';
import {
  STAGE_CONFIG,
  PIPELINE_STAGES,
  isInterviewStage,
  stageRequiresMandatoryFields,
  type PipelineEntryWithDetails,
  type PipelineStage,
} from '@/types/pipeline';
import StageTransitionDialog from './StageTransitionDialog';
import InterviewScorecardForm from './InterviewScorecardForm';
import ScorecardSummary from './ScorecardSummary';
import PlacementSummary from './PlacementSummary';
import PlacementForm from './PlacementForm';

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
  const [activeTab, setActiveTab] = useState('details');
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [targetStage, setTargetStage] = useState<PipelineStage | null>(null);
  const [showScorecardForm, setShowScorecardForm] = useState(false);
  const [showPlacementForm, setShowPlacementForm] = useState(false);

  const { hasPermission } = usePermissions();
  const updateStage = useUpdatePipelineStage();
  const updateNotes = useUpdatePipelineNotes();
  const updatePriority = useUpdatePipelinePriority();
  const { data: activities, isLoading: activitiesLoading } = usePipelineActivity(entry?.id || null);
  const { data: scorecards = [], isLoading: scorecardsLoading } = useScorecards(entry?.id || null);
  const { data: placement, isLoading: placementLoading } = usePlacement(entry?.id || null);

  const canUpdate = hasPermission('pipeline.update');
  const canCreate = hasPermission('pipeline.create');

  // Sync local state when entry changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && entry) {
      setNotes(entry.notes || '');
      setPriority([entry.priority || 0]);
      setActiveTab('details');
      setShowScorecardForm(false);
      setShowPlacementForm(false);
    }
    onOpenChange(isOpen);
  };

  const handleStageChange = (newStage: PipelineStage) => {
    if (!entry || !canUpdate) return;
    
    // Check if stage requires mandatory fields
    if (stageRequiresMandatoryFields(newStage)) {
      setTargetStage(newStage);
      setShowTransitionDialog(true);
    } else {
      // Direct update for simple stages
      updateStage.mutateAsync({
        id: entry.id,
        stage: newStage,
        rejection_reason: newStage === 'rejected' ? undefined : undefined,
      });
    }
  };

  const handleTransitionComplete = () => {
    setShowTransitionDialog(false);
    setTargetStage(null);
  };

  const handleNotesUpdate = async () => {
    if (!entry || !canUpdate) return;
    await updateNotes.mutateAsync({ id: entry.id, notes });
  };

  const handlePriorityUpdate = async () => {
    if (!entry || !canUpdate) return;
    await updatePriority.mutateAsync({ id: entry.id, priority: priority[0] });
  };

  if (!entry) return null;

  const candidate = entry.cv_submission;
  const job = entry.job;
  const currentStageConfig = STAGE_CONFIG[entry.stage];
  const isPlaced = entry.stage === 'placed';
  const showInterviewSection = isInterviewStage(entry.stage as PipelineStage) || scorecards.length > 0;

  // Check for visa/sponsorship indicator
  const requiresSponsorship = candidate?.requires_sponsorship;
  const rightToWork = candidate?.right_to_work;

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  {candidate?.name || 'Unknown Candidate'}
                  {/* Work Authorization Indicator */}
                  {requiresSponsorship !== undefined && (
                    <Tooltip>
                      <TooltipTrigger>
                        {requiresSponsorship ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {requiresSponsorship 
                          ? 'Requires Visa Sponsorship' 
                          : rightToWork || 'Has Right to Work'
                        }
                      </TooltipContent>
                    </Tooltip>
                  )}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  {job?.title || 'Unknown Job'}
                  {job?.reference_id && (
                    <Badge variant="outline" className="text-xs">
                      {job.reference_id}
                    </Badge>
                  )}
                </SheetDescription>
              </div>
              <Link to={`/admin/candidate/${candidate?.id}`}>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Full Profile
                </Button>
              </Link>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden mt-4">
            <TabsList className={cn("grid w-full flex-shrink-0", isPlaced ? "grid-cols-4" : "grid-cols-3")}>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="interviews" className="relative">
                Interviews
                {scorecards.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 text-xs flex items-center justify-center">
                    {scorecards.length}
                  </Badge>
                )}
              </TabsTrigger>
              {isPlaced && (
                <TabsTrigger value="placement">Placement</TabsTrigger>
              )}
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6 mt-0 px-1">
                {/* Current Stage */}
                <div className="space-y-3">
                  <Label>Current Stage</Label>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(currentStageConfig.bgColor, currentStageConfig.textColor, 'border', currentStageConfig.color)}>
                      {currentStageConfig.label}
                    </Badge>
                    {entry.stage_entered_at && (
                      <span className="text-sm text-muted-foreground">
                        since {format(new Date(entry.stage_entered_at), 'dd MMM yyyy')}
                      </span>
                    )}
                  </div>

                  {/* Stage Selector */}
                  {canUpdate && (
                    <div className="flex flex-wrap gap-2">
                      {PIPELINE_STAGES.filter(s => s !== entry.stage).slice(0, 6).map((stage) => {
                        const config = STAGE_CONFIG[stage];
                        return (
                          <Button
                            key={stage}
                            variant="outline"
                            size="sm"
                            onClick={() => handleStageChange(stage)}
                            disabled={updateStage.isPending}
                            className="text-xs"
                          >
                            <div className={cn('w-2 h-2 rounded-full mr-1.5', config.color.replace('border-', 'bg-'))} />
                            {config.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}

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
                    
                    <div className="flex items-center gap-3 pt-2">
                      {candidate?.cv_score !== null && candidate?.cv_score !== undefined && (
                        <Badge variant="outline" className={cn(
                          candidate.cv_score >= 80 && 'border-green-500 text-green-600',
                          candidate.cv_score >= 60 && candidate.cv_score < 80 && 'border-amber-500 text-amber-600',
                          candidate.cv_score < 60 && 'border-red-500 text-red-600'
                        )}>
                          CV Score: {candidate.cv_score}%
                        </Badge>
                      )}
                      {entry.salary_confirmed && (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          £{entry.salary_confirmed.toLocaleString()} confirmed
                        </Badge>
                      )}
                    </div>

                    {candidate?.cv_file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(candidate.cv_file_url!, '_blank')}
                        className="mt-2"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View CV
                      </Button>
                    )}
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
                  {canUpdate && (
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
                  )}
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
                    disabled={!canUpdate}
                  />
                  {canUpdate && (
                    <Button
                      size="sm"
                      onClick={handleNotesUpdate}
                      disabled={updateNotes.isPending || notes === (entry.notes || '')}
                    >
                      {updateNotes.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Update Notes
                    </Button>
                  )}
                </div>

                {/* Interview Summary Preview */}
                {showInterviewSection && scorecards.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <ClipboardCheck className="w-4 h-4" />
                          Interview Summary
                        </Label>
                        <Button variant="link" size="sm" onClick={() => setActiveTab('interviews')}>
                          View All
                        </Button>
                      </div>
                      <ScorecardSummary scorecards={scorecards} compact />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Interviews Tab */}
              <TabsContent value="interviews" className="space-y-4 mt-0 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Interview Scorecards</h3>
                  {canCreate && !showScorecardForm && (
                    <Button size="sm" onClick={() => setShowScorecardForm(true)}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Scorecard
                    </Button>
                  )}
                </div>

                {showScorecardForm ? (
                  <InterviewScorecardForm
                    pipelineId={entry.id}
                    stage={entry.stage as PipelineStage}
                    onSuccess={() => setShowScorecardForm(false)}
                    onCancel={() => setShowScorecardForm(false)}
                  />
                ) : scorecardsLoading ? (
                  <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading scorecards...
                  </div>
                ) : scorecards.length > 0 ? (
                  <ScorecardSummary scorecards={scorecards} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No interview scorecards yet</p>
                    {canCreate && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowScorecardForm(true)}
                      >
                        Add First Scorecard
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Placement Tab */}
              {isPlaced && (
                <TabsContent value="placement" className="space-y-4 mt-0 px-1">
                  {placementLoading ? (
                    <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading placement...
                    </div>
                  ) : placement ? (
                    <PlacementSummary 
                      placement={placement}
                      onEdit={() => setShowPlacementForm(true)} 
                    />
                  ) : showPlacementForm ? (
                    <PlacementForm
                      pipelineId={entry.id}
                      candidateName={candidate?.name || ''}
                      jobTitle={job?.title || ''}
                      onSuccess={() => setShowPlacementForm(false)}
                      onCancel={() => setShowPlacementForm(false)}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No placement details yet</p>
                      {canCreate && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowPlacementForm(true)}
                        >
                          Add Placement Details
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              )}

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4 mt-0 px-1">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <Label>Activity History</Label>
                </div>
                
                {activitiesLoading ? (
                  <div className="flex items-center gap-2 py-4 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium capitalize">
                              {activity.action.replace(/_/g, ' ')}
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
                            <p className="text-muted-foreground mt-0.5">{activity.note}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4">No activity yet</p>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Stage Transition Dialog */}
      {entry && targetStage && (
        <StageTransitionDialog
          open={showTransitionDialog}
          onOpenChange={setShowTransitionDialog}
          pipelineId={entry.id}
          currentStage={entry.stage as PipelineStage}
          targetStage={targetStage}
          candidateName={candidate?.name || 'Unknown'}
          jobTitle={job?.title || 'Unknown'}
          onComplete={handleTransitionComplete}
        />
      )}
    </>
  );
}