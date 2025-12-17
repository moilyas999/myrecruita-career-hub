import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface CVScoreBreakdown {
  completeness: number;
  skills_relevance: number;
  experience_depth: number;
  achievements: number;
  education: number;
  presentation: number;
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

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

const categories = [
  { key: 'completeness', label: 'Completeness', description: 'All required sections present', weight: '20%' },
  { key: 'skills_relevance', label: 'Skills Relevance', description: 'Quality & relevance of listed skills', weight: '20%' },
  { key: 'experience_depth', label: 'Experience Depth', description: 'Detail level and career progression', weight: '25%' },
  { key: 'achievements', label: 'Achievements', description: 'Quantifiable accomplishments listed', weight: '15%' },
  { key: 'education', label: 'Education', description: 'Qualifications & certifications', weight: '10%' },
  { key: 'presentation', label: 'Presentation', description: 'Structure, formatting & clarity', weight: '10%' },
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>CV Quality Score Breakdown</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="flex flex-col items-center py-4 bg-muted/50 rounded-lg">
              <div className={`text-4xl font-bold ${score >= 60 ? 'text-green-600' : 'text-orange-600'}`}>
                {score}/100
              </div>
              <Badge className={`${getScoreColor(score)} mt-2`}>
                {getScoreLabel(score)}
              </Badge>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
              {categories.map((cat) => {
                const value = breakdown[cat.key as keyof CVScoreBreakdown] as number;
                return (
                  <div key={cat.key} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-sm">{cat.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">({cat.weight})</span>
                      </div>
                      <span className={`text-sm font-semibold ${value >= 60 ? 'text-green-600' : 'text-orange-600'}`}>
                        {value}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getBarColor(value)} transition-all duration-300`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                );
              })}
            </div>

            {/* AI Summary */}
            {breakdown.summary && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">AI Assessment</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {breakdown.summary}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CVScoreBreakdownCard({ score, breakdown }: { score: number; breakdown: CVScoreBreakdown }) {
  const categories = [
    { label: 'Completeness', value: breakdown.completeness, description: 'All sections present', weight: '20%' },
    { label: 'Skills Relevance', value: breakdown.skills_relevance, description: 'Quality of listed skills', weight: '20%' },
    { label: 'Experience Depth', value: breakdown.experience_depth, description: 'Detail & progression', weight: '25%' },
    { label: 'Achievements', value: breakdown.achievements, description: 'Quantified accomplishments', weight: '15%' },
    { label: 'Education', value: breakdown.education, description: 'Qualifications', weight: '10%' },
    { label: 'Presentation', value: breakdown.presentation, description: 'Structure & clarity', weight: '10%' },
  ];

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">CV Quality Score</span>
        <Badge className={`${getScoreColor(score)} text-sm font-bold`}>
          {score}/100 • {getScoreLabel(score)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{cat.label}</span>
              <span className="font-medium">{cat.value}%</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div 
                className={`h-full ${getBarColor(cat.value)} transition-all`}
                style={{ width: `${cat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {breakdown.summary && (
        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          <strong>AI Summary:</strong> {breakdown.summary}
        </p>
      )}
    </div>
  );
}
