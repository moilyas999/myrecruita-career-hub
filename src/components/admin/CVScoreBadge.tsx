import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CVScoreBreakdown, ScoreCategory, LegacyCVScoreBreakdown } from '@/types/cv';

// Re-export types for backward compatibility
export type { CVScoreBreakdown } from '@/types/cv';

interface CVScoreBadgeProps {
  score: number | null;
  breakdown?: CVScoreBreakdown | LegacyCVScoreBreakdown | null;
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

/**
 * Normalize a category value from either number or ScoreCategory format
 * Handles both legacy (number) and current (ScoreCategory) formats
 */
function getCategoryData(value: ScoreCategory | number | undefined, defaultMax: number): { score: number; max: number; notes?: string } {
  if (value === undefined || value === null) return { score: 0, max: defaultMax };
  if (typeof value === 'number') return { score: value, max: defaultMax };
  return { 
    score: value.score ?? 0, 
    max: value.max ?? defaultMax, 
    notes: value.notes 
  };
}

/**
 * Normalize a breakdown object to handle both legacy and current field names
 */
function normalizeBreakdown(breakdown: CVScoreBreakdown | LegacyCVScoreBreakdown): {
  completeness: ScoreCategory | number | undefined;
  skills_relevance: ScoreCategory | number | undefined;
  experience_depth: ScoreCategory | number | undefined;
  achievements: ScoreCategory | number | undefined;
  education: ScoreCategory | number | undefined;
  presentation: ScoreCategory | number | undefined;
  summary?: string;
} {
  // Handle legacy field names
  const legacy = breakdown as LegacyCVScoreBreakdown;
  const current = breakdown as CVScoreBreakdown;
  
  return {
    completeness: current.completeness ?? legacy.completeness,
    // skills_relevance was previously skills_depth
    skills_relevance: current.skills_relevance ?? legacy.skills_depth,
    // experience_depth was previously experience_quality
    experience_depth: current.experience_depth ?? legacy.experience_quality,
    achievements: current.achievements ?? legacy.achievements,
    education: current.education ?? legacy.education,
    presentation: current.presentation ?? legacy.presentation,
    summary: (current as CVScoreBreakdown).summary
  };
}

const categories = [
  { key: 'completeness', label: 'Completeness', description: 'All required sections present', defaultMax: 20 },
  { key: 'skills_relevance', label: 'Skills Relevance', description: 'Quality & relevance of listed skills', defaultMax: 20 },
  { key: 'experience_depth', label: 'Experience Depth', description: 'Detail level and career progression', defaultMax: 25 },
  { key: 'achievements', label: 'Achievements', description: 'Quantifiable accomplishments listed', defaultMax: 15 },
  { key: 'education', label: 'Education', description: 'Qualifications & certifications', defaultMax: 10 },
  { key: 'presentation', label: 'Presentation', description: 'Structure, formatting & clarity', defaultMax: 10 },
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

  // Normalize the breakdown to handle both legacy and current formats
  const normalizedBreakdown = normalizeBreakdown(breakdown);

  // Calculate category scores for the sum display
  const categoryScores = categories.map(cat => {
    const value = normalizedBreakdown[cat.key as keyof Omit<typeof normalizedBreakdown, 'summary'>];
    const data = getCategoryData(value as ScoreCategory | number | undefined, cat.defaultMax);
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
            {normalizedBreakdown.summary && (
              <div className="pt-3 border-t border-border">
                <h4 className="font-medium text-sm mb-2">AI Assessment</h4>
                <p className="text-sm text-muted-foreground">{normalizedBreakdown.summary}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CVScoreBreakdownCard({ score, breakdown }: { score: number; breakdown: CVScoreBreakdown | LegacyCVScoreBreakdown }) {
  // Normalize the breakdown to handle both legacy and current formats
  const normalizedBreakdown = normalizeBreakdown(breakdown);
  
  const categoryScores = categories.map(cat => {
    const value = normalizedBreakdown[cat.key as keyof typeof normalizedBreakdown];
    const data = getCategoryData(value as ScoreCategory | number | undefined, cat.defaultMax);
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
      
      {normalizedBreakdown.summary && (
        <p className="text-xs text-muted-foreground border-t border-border pt-3">{normalizedBreakdown.summary}</p>
      )}
    </div>
  );
}
