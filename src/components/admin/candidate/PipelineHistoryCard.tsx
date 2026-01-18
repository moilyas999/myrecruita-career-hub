import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GitBranch,
  Briefcase,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCandidatePipelineHistory } from '@/hooks/useCandidateProfile';
import { STAGE_CONFIG, type PipelineStage } from '@/types/pipeline';

interface PipelineHistoryCardProps {
  candidateId: string;
}

export default function PipelineHistoryCard({ candidateId }: PipelineHistoryCardProps) {
  const { data: pipelineHistory, isLoading } = useCandidatePipelineHistory(candidateId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          Pipeline History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-2 h-2 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : pipelineHistory && pipelineHistory.length > 0 ? (
          <div className="space-y-4">
            {pipelineHistory.map((entry) => {
              const stageConfig = STAGE_CONFIG[entry.stage as PipelineStage];
              
              return (
                <div 
                  key={entry.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  {/* Stage indicator */}
                  <div 
                    className={cn(
                      'w-3 h-3 rounded-full shrink-0 mt-1',
                      stageConfig?.color.replace('border-', 'bg-') || 'bg-muted-foreground'
                    )} 
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {/* Job Info */}
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm truncate">
                            {entry.job?.title || 'Unknown Job'}
                          </span>
                          {entry.job?.reference_id && (
                            <Badge variant="outline" className="text-xs">
                              {entry.job.reference_id}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Stage Badge */}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={cn(
                              'text-xs',
                              stageConfig?.bgColor,
                              stageConfig?.textColor
                            )}
                          >
                            {stageConfig?.label || entry.stage}
                          </Badge>
                          
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(entry.updated_at), 'dd MMM yyyy')}
                          </span>
                        </div>
                      </div>

                      {/* Link to pipeline */}
                      <Link to={`/admin?view=pipeline&job=${entry.job_id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>

                    {/* Notes preview */}
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic py-4 text-center">
            This candidate has not been added to any job pipelines
          </p>
        )}
      </CardContent>
    </Card>
  );
}
