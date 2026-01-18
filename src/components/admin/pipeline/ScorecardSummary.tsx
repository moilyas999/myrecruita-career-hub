import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InterviewScorecard, ScorecardRecommendation } from '@/types/pipeline';
import { RECOMMENDATION_CONFIG } from '@/types/pipeline';

interface ScorecardSummaryProps {
  scorecards: InterviewScorecard[];
  compact?: boolean;
}

interface CategoryScore {
  label: string;
  value: number | null;
  key: keyof InterviewScorecard;
}

const SCORE_CATEGORIES: CategoryScore[] = [
  { label: 'Technical Skills', value: null, key: 'technical_skills' },
  { label: 'Communication', value: null, key: 'communication' },
  { label: 'Cultural Fit', value: null, key: 'cultural_fit' },
  { label: 'Motivation', value: null, key: 'motivation' },
  { label: 'Experience', value: null, key: 'experience_relevance' },
  { label: 'Overall', value: null, key: 'overall_impression' },
];

function calculateAverages(scorecards: InterviewScorecard[]): Record<string, number | null> {
  const averages: Record<string, number | null> = {};
  
  SCORE_CATEGORIES.forEach(({ key }) => {
    const values = scorecards
      .map(s => s[key] as number | null)
      .filter((v): v is number => v !== null);
    
    averages[key] = values.length > 0 
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : null;
  });
  
  return averages;
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-muted-foreground';
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-amber-600';
  return 'text-red-600';
}

function getProgressColor(score: number | null): string {
  if (score === null) return 'bg-muted';
  if (score >= 4) return 'bg-green-500';
  if (score >= 3) return 'bg-amber-500';
  return 'bg-red-500';
}

function RecommendationIcon({ recommendation }: { recommendation: ScorecardRecommendation }) {
  const config = RECOMMENDATION_CONFIG[recommendation];
  
  switch (recommendation) {
    case 'strong_hire':
    case 'hire':
      return <CheckCircle2 className={cn('w-4 h-4', config.color)} />;
    case 'no_hire':
    case 'strong_no_hire':
      return <XCircle className={cn('w-4 h-4', config.color)} />;
    case 'maybe':
      return <HelpCircle className={cn('w-4 h-4', config.color)} />;
    default:
      return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  }
}

export default function ScorecardSummary({ scorecards, compact = false }: ScorecardSummaryProps) {
  if (scorecards.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        No interview scorecards yet
      </div>
    );
  }

  const averages = calculateAverages(scorecards);
  const recommendations = scorecards
    .map(s => s.recommendation)
    .filter((r): r is ScorecardRecommendation => r !== null);

  const overallScore = averages.overall_impression;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Overall Score */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3.5 h-3.5',
                    overallScore !== null && i < Math.round(overallScore)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {overallScore !== null 
              ? `Average Score: ${overallScore.toFixed(1)}/5 from ${scorecards.length} interview(s)`
              : 'No scores yet'
            }
          </TooltipContent>
        </Tooltip>

        {/* Latest Recommendation */}
        {recommendations.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  RECOMMENDATION_CONFIG[recommendations[recommendations.length - 1]]?.color
                )}
              >
                <RecommendationIcon recommendation={recommendations[recommendations.length - 1]} />
                <span className="ml-1">
                  {RECOMMENDATION_CONFIG[recommendations[recommendations.length - 1]]?.label}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Latest recommendation</TooltipContent>
          </Tooltip>
        )}

        <span className="text-xs text-muted-foreground">
          {scorecards.length} scorecard{scorecards.length !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Interview Summary
          <Badge variant="outline">{scorecards.length} scorecard{scorecards.length !== 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Breakdown */}
        <div className="space-y-2">
          {SCORE_CATEGORIES.map(({ label, key }) => {
            const score = averages[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs w-24 text-muted-foreground">{label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full transition-all', getProgressColor(score))}
                    style={{ width: score !== null ? `${(score / 5) * 100}%` : '0%' }}
                  />
                </div>
                <span className={cn('text-xs font-medium w-8 text-right', getScoreColor(score))}>
                  {score !== null ? score.toFixed(1) : '-'}
                </span>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Recommendations Summary */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Recommendations</span>
          <div className="flex flex-wrap gap-2">
            {recommendations.length > 0 ? (
              recommendations.map((rec, idx) => {
                const config = RECOMMENDATION_CONFIG[rec];
                return (
                  <Badge 
                    key={idx}
                    variant="outline"
                    className={cn('text-xs', config?.color)}
                  >
                    <RecommendationIcon recommendation={rec} />
                    <span className="ml-1">{config?.label || rec}</span>
                  </Badge>
                );
              })
            ) : (
              <span className="text-xs text-muted-foreground">No recommendations yet</span>
            )}
          </div>
        </div>

        {/* Key Insights from latest scorecard */}
        {scorecards.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Latest Feedback</span>
              <div className="space-y-1">
                {scorecards[scorecards.length - 1].strengths && (
                  <p className="text-xs">
                    <span className="font-medium text-green-600">Strengths:</span>{' '}
                    {scorecards[scorecards.length - 1].strengths}
                  </p>
                )}
                {scorecards[scorecards.length - 1].concerns && (
                  <p className="text-xs">
                    <span className="font-medium text-red-600">Concerns:</span>{' '}
                    {scorecards[scorecards.length - 1].concerns}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
