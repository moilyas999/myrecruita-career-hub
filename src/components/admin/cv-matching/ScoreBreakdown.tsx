import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bot, Calculator } from "lucide-react";

interface ScoreBreakdownProps {
  algorithmicScore: number;
  aiScore: number;
  finalScore: number;
}

export function ScoreBreakdown({ algorithmicScore, aiScore, finalScore }: ScoreBreakdownProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getBarColor = (score: number): string => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-orange-500";
  };

  return (
    <div className="space-y-2 py-2 px-3 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>Score Breakdown</span>
        <Badge 
          variant="outline" 
          className={cn("text-sm font-bold", getScoreColor(finalScore))}
        >
          {finalScore}% Final
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Algorithmic Score */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Calculator className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Algorithm</span>
            <span className={cn("ml-auto font-medium", getScoreColor(algorithmicScore))}>
              {algorithmicScore}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all", getBarColor(algorithmicScore))}
              style={{ width: `${algorithmicScore}%` }}
            />
          </div>
        </div>

        {/* AI Score */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Bot className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">AI Analysis</span>
            <span className={cn("ml-auto font-medium", getScoreColor(aiScore))}>
              {aiScore}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all", getBarColor(aiScore))}
              style={{ width: `${aiScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
