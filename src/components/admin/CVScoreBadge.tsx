import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CategoryScore {
  score: number;
  max: number;
  notes?: string;
}

export interface CVScoreBreakdown {
  completeness: CategoryScore | number;
  skills_relevance: CategoryScore | number;
  experience_depth: CategoryScore | number;
  achievements: CategoryScore | number;
  education: CategoryScore | number;
  presentation: CategoryScore | number;
  summary: string;
}

interface CVScoreBadgeProps {
  score: number | null;
  breakdown?: CVScoreBreakdown | null;
  showBreakdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'bg-emerald-600 text-white hover:bg-emerald-700';
  if (score >= 75) return 'bg-green-500 text-white hover:bg-green-600';
  if (score >= 60) return 'bg-yellow-500 text-white hover:bg-yellow-600';
  if (score >= 40) return 'bg-orange-500 text-white hover:bg-orange-600';
  return 'bg-red-500 text-white hover:bg-red-600';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Average';
  if (score >= 40) return 'Below Avg';
  return 'Poor';
}

function getBarColor(percentage: number): string {
  if (percentage >= 80) return 'bg-emerald-500';
  if (percentage >= 60) return 'bg-green-500';
  if (percentage >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

// Helper to extract score data from either number or CategoryScore object
function getCategoryData(value: CategoryScore | number | undefined): { score: number; max: number; notes?: string } {
  if (value === undefined) return { score: 0, max: 0 };
  if (typeof value === 'number') return { score: value, max: value }; // Legacy: assume max equals score
  return { score: value.score ?? 0, max: value.max ?? 0, notes: value.notes };
}

const categories = [
  { key: 'completeness', label: 'Completeness', description: 'All required sections present' },
  { key: 'skills_relevance', label: 'Skills Relevance', description: 'Quality & relevance of listed skills' },
  { key: 'experience_depth', label: 'Experience Depth', description: 'Detail level and career progression' },
  { key: 'achievements', label: 'Achievements', description: 'Quantifiable accomplishments listed' },
  { key: 'education', label: 'Education', description: 'Qualifications & certifications' },
  { key: 'presentation', label: 'Presentation', description: 'Structure, formatting & clarity' },
] as const;

export default function CVScoreBadge({ score, breakdown, showBreakdown = true, size = 'md' }: CVScoreBadgeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (score === null || score === undefined) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Not scored
      </Badge>
    );
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  const badge = (
    <Badge 
      className={`${getScoreColor(score)} ${sizeClasses[size]} font-semibold cursor-pointer transition-transform hover:scale-105`}
      onClick={() => breakdown && setDialogOpen(true)}
    >
      {score}/100 • {getScoreLabel(score)}
    </Badge>
  );

  if (!showBreakdown || !breakdown) {
    return badge;
  }

  // Calculate category scores for the sum display
  const categoryScores = categories.map(cat => {
    const data = getCategoryData(breakdown[cat.key as keyof Omit<CVScoreBreakdown, 'summary'>]);
    return { ...cat, ...data };
  });

  const calculatedTotal = categoryScores.reduce((sum, cat) => sum + cat.score, 0);
  const maxTotal = categoryScores.reduce((sum, cat) => sum + cat.max, 0);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            Click for detailed breakdown
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>CV Quality Score Breakdown</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5">
            {/* Overall Score */}
            <div className="flex flex-col items-center py-4 bg-muted/50 rounded-lg">
              <div className={`text-4xl font-bold ${score >= 60 ? 'text-green-600' : 'text-orange-600'}`}>
                {score}/100
              </div>
              <div className="text-sm text-muted-foreground mt-1">{getScoreLabel(score)}</div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
              {categoryScores.map((cat) => {
                const percentage = cat.max > 0 ? Math.round((cat.score / cat.max) * 100) : 0;
                return (
                  <div key={cat.key} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-sm">{cat.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{cat.description}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-sm">{cat.score}/{cat.max} pts</span>
                        <span className="text-xs text-muted-foreground ml-1">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getBarColor(percentage)} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {cat.notes && (
                      <p className="text-xs text-muted-foreground italic pl-1">"{cat.notes}"</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sum Calculation */}
            <div className="pt-3 border-t border-border">
              <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground justify-center">
                {categoryScores.map((cat, index) => (
                  <span key={cat.key}>
                    {cat.score}{index < categoryScores.length - 1 && ' + '}
                  </span>
                ))}
                <span className="font-semibold text-foreground ml-1">= {calculatedTotal}/{maxTotal}</span>
              </div>
            </div>

            {/* AI Summary */}
            {breakdown.summary && (
              <div className="pt-3 border-t border-border">
                <h4 className="font-medium text-sm mb-2">AI Assessment</h4>
                <p className="text-sm text-muted-foreground">{breakdown.summary}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CVScoreBreakdownCard({ score, breakdown }: { score: number; breakdown: CVScoreBreakdown }) {
  const categoryScores = categories.map(cat => {
    const data = getCategoryData(breakdown[cat.key as keyof Omit<CVScoreBreakdown, 'summary'>]);
    return { ...cat, ...data };
  });

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">CV Quality Score</h4>
        <Badge className={getScoreColor(score)}>{score}/100 • {getScoreLabel(score)}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {categoryScores.map((cat) => {
          const percentage = cat.max > 0 ? Math.round((cat.score / cat.max) * 100) : 0;
          return (
            <div key={cat.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{cat.label}</span>
                <span className="font-medium">{cat.score}/{cat.max}</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getBarColor(percentage)} transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {breakdown.summary && (
        <p className="text-xs text-muted-foreground border-t border-border pt-3">{breakdown.summary}</p>
      )}
    </div>
  );
}
