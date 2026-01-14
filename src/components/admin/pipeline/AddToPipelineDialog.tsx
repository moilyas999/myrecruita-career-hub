import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAddToPipeline, useCheckPipelineExists } from '@/hooks/usePipeline';
import { STAGE_CONFIG, ACTIVE_STAGES, type PipelineStage } from '@/types/pipeline';
import { queryKeys } from '@/lib/queryKeys';

interface AddToPipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cvSubmission: {
    id: string;
    name: string;
    email: string;
    job_title?: string | null;
  } | null;
  preselectedJobId?: string;
}

export default function AddToPipelineDialog({
  open,
  onOpenChange,
  cvSubmission,
  preselectedJobId,
}: AddToPipelineDialogProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJobId || '');
  const [selectedStage, setSelectedStage] = useState<PipelineStage>('sourced');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState([0]);

  const addToPipeline = useAddToPipeline();

  // Fetch active jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: [...queryKeys.jobs, 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, reference_id, location, sector')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Check if already in pipeline
  const { data: existingEntry, isLoading: checkingExists } = useCheckPipelineExists(
    cvSubmission?.id || null,
    selectedJobId || null
  );

  const handleSubmit = async () => {
    if (!cvSubmission?.id || !selectedJobId) return;

    await addToPipeline.mutateAsync({
      cv_submission_id: cvSubmission.id,
      job_id: selectedJobId,
      stage: selectedStage,
      notes: notes || undefined,
      priority: priority[0],
    });

    // Reset form
    setSelectedJobId(preselectedJobId || '');
    setSelectedStage('sourced');
    setNotes('');
    setPriority([0]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedJobId(preselectedJobId || '');
    setSelectedStage('sourced');
    setNotes('');
    setPriority([0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Pipeline</DialogTitle>
          <DialogDescription>
            Add {cvSubmission?.name || 'this candidate'} to a job pipeline
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Candidate Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{cvSubmission?.name}</p>
            <p className="text-sm text-muted-foreground">{cvSubmission?.email}</p>
            {cvSubmission?.job_title && (
              <p className="text-sm text-muted-foreground">{cvSubmission.job_title}</p>
            )}
          </div>

          {/* Job Selection */}
          <div className="space-y-2">
            <Label>Select Job</Label>
            {jobsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading jobs...
              </div>
            ) : (
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job..." />
                </SelectTrigger>
                <SelectContent>
                  {jobs?.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.reference_id}</span>
                        <span className="text-muted-foreground">-</span>
                        <span>{job.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Already exists warning */}
            {existingEntry && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Already in pipeline: <Badge variant="outline">{STAGE_CONFIG[existingEntry.stage as PipelineStage].label}</Badge>
                </span>
              </div>
            )}
          </div>

          {/* Stage Selection */}
          <div className="space-y-2">
            <Label>Initial Stage</Label>
            <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as PipelineStage)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVE_STAGES.map((stage) => {
                  const config = STAGE_CONFIG[stage];
                  return (
                    <SelectItem key={stage} value={stage}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${config.color.replace('border-', 'bg-')}`} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Priority</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < priority[0]
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            <Slider
              value={priority}
              onValueChange={setPriority}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Add any initial notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedJobId || !!existingEntry || addToPipeline.isPending}
          >
            {addToPipeline.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add to Pipeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
