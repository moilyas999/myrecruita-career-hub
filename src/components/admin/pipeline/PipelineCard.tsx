import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MoreVertical,
  ExternalLink,
  FileText,
  MapPin,
  Briefcase,
  Star,
  Clock,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { PipelineEntryWithDetails, PipelineStage } from '@/types/pipeline';
import { STAGE_CONFIG, ACTIVE_STAGES } from '@/types/pipeline';

interface PipelineCardProps {
  entry: PipelineEntryWithDetails;
  onStageChange: (id: string, stage: PipelineStage) => void;
  onViewDetails: (entry: PipelineEntryWithDetails) => void;
  onViewCV: (url: string) => void;
  onRemove: (id: string) => void;
  isDragging?: boolean;
}

function PipelineCard({
  entry,
  onStageChange,
  onViewDetails,
  onViewCV,
  onRemove,
  isDragging,
}: PipelineCardProps) {
  const candidate = entry.cv_submission;
  const currentStageConfig = STAGE_CONFIG[entry.stage];
  const stageIndex = ACTIVE_STAGES.indexOf(entry.stage as any);
  const nextStage = stageIndex >= 0 && stageIndex < ACTIVE_STAGES.length - 1 
    ? ACTIVE_STAGES[stageIndex + 1] 
    : null;

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-primary/30',
        isDragging && 'opacity-50 rotate-2 shadow-lg',
        entry.priority >= 4 && 'ring-2 ring-amber-400'
      )}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="hidden group-hover:flex cursor-grab">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate">{candidate?.name || 'Unknown'}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {candidate?.email}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails(entry)}>
                <FileText className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {candidate?.cv_file_url && (
                <DropdownMenuItem onClick={() => onViewCV(candidate.cv_file_url!)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open CV
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {nextStage && (
                <DropdownMenuItem onClick={() => onStageChange(entry.id, nextStage)}>
                  Move to {STAGE_CONFIG[nextStage].label}
                </DropdownMenuItem>
              )}
              {entry.stage !== 'rejected' && (
                <DropdownMenuItem 
                  onClick={() => onStageChange(entry.id, 'rejected')}
                  className="text-destructive"
                >
                  Reject
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onRemove(entry.id)}
                className="text-destructive"
              >
                Remove from Pipeline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Job Title & Location */}
        <div className="space-y-1">
          {candidate?.job_title && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="w-3 h-3 shrink-0" />
              <span className="truncate">{candidate.job_title}</span>
            </div>
          )}
          {candidate?.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{candidate.location}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* CV Score */}
            {candidate?.cv_score !== null && candidate?.cv_score !== undefined && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      candidate.cv_score >= 80 && 'border-green-500 text-green-600',
                      candidate.cv_score >= 60 && candidate.cv_score < 80 && 'border-amber-500 text-amber-600',
                      candidate.cv_score < 60 && 'border-red-500 text-red-600'
                    )}
                  >
                    {candidate.cv_score}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>CV Match Score</TooltipContent>
              </Tooltip>
            )}
            
            {/* Priority Stars */}
            {entry.priority > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: Math.min(entry.priority, 5) }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Priority: {entry.priority}/5</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Time in Stage */}
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(entry.updated_at), { addSuffix: false })}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Time in current stage</TooltipContent>
          </Tooltip>
        </div>

        {/* Notes Preview */}
        {entry.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t">
            {entry.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(PipelineCard);
