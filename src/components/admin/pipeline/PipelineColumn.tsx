import { memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import PipelineCard from './PipelineCard';
import type { PipelineEntryWithDetails, PipelineStage, StageConfig } from '@/types/pipeline';

interface PipelineColumnProps {
  stageConfig: StageConfig;
  entries: PipelineEntryWithDetails[];
  onStageChange: (id: string, stage: PipelineStage) => void;
  onViewDetails: (entry: PipelineEntryWithDetails) => void;
  onViewCV: (url: string) => void;
  onRemove: (id: string) => void;
  onDragStart?: (entry: PipelineEntryWithDetails) => void;
  onDragOver?: (e: React.DragEvent, stage: PipelineStage) => void;
  onDrop?: (e: React.DragEvent, stage: PipelineStage) => void;
  isDragTarget?: boolean;
}

function PipelineColumn({
  stageConfig,
  entries,
  onStageChange,
  onViewDetails,
  onViewCV,
  onRemove,
  onDragOver,
  onDrop,
  isDragTarget,
}: PipelineColumnProps) {
  return (
    <div
      className={cn(
        'flex flex-col min-w-[280px] max-w-[300px] bg-muted/30 rounded-lg border transition-all duration-200',
        isDragTarget && 'ring-2 ring-primary border-primary bg-primary/5'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, stageConfig.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e, stageConfig.id);
      }}
    >
      {/* Column Header */}
      <div className={cn('p-3 border-b', stageConfig.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', stageConfig.color.replace('border-', 'bg-'))} />
            <h3 className={cn('font-semibold text-sm', stageConfig.textColor)}>
              {stageConfig.label}
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {entries.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stageConfig.description}
        </p>
      </div>

      {/* Cards Container */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No candidates</p>
              <p className="text-xs">Drag candidates here</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('pipelineId', entry.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <PipelineCard
                  entry={entry}
                  onStageChange={onStageChange}
                  onViewDetails={onViewDetails}
                  onViewCV={onViewCV}
                  onRemove={onRemove}
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default memo(PipelineColumn);
