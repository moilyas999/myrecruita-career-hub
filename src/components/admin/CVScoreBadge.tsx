import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

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

export default function CVScoreBadge({ score, breakdown, showBreakdown = true, size = 'md' }: CVScoreBadgeProps) {
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
    <Badge className={`${getScoreColor(score)} ${sizeClasses[size]} font-semibold`}>
      {score}/100 • {getScoreLabel(score)}
    </Badge>
  );

  if (!showBreakdown || !breakdown) {
    return badge;
  }

  const categories = [
    { label: 'Completeness', value: breakdown.completeness, weight: '20%' },
    { label: 'Skills Relevance', value: breakdown.skills_relevance, weight: '20%' },
    { label: 'Experience Depth', value: breakdown.experience_depth, weight: '25%' },
    { label: 'Achievements', value: breakdown.achievements, weight: '15%' },
    { label: 'Education', value: breakdown.education, weight: '10%' },
    { label: 'Presentation', value: breakdown.presentation, weight: '10%' },
  ];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="w-80 p-4" side="left">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">CV Quality Score</span>
              <span className={`text-lg font-bold ${score >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                {score}/100
              </span>
            </div>
            
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{cat.label} ({cat.weight})</span>
                    <span className="font-medium">{cat.value}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getBarColor(cat.value)} transition-all`}
                      style={{ width: `${cat.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {breakdown.summary && (
              <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                {breakdown.summary}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
