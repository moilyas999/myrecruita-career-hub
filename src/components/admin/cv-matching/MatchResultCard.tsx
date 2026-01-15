import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Eye, 
  MapPin, 
  Briefcase, 
  Clock, 
  ChevronRight,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchResult } from "./types";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { AdvancedSignals } from "./AdvancedSignals";
import { MatchInsights } from "./MatchInsights";

interface MatchResultCardProps {
  match: MatchResult;
  index: number;
  onDownloadCV: (url: string | null, name: string) => void;
}

export function MatchResultCard({ match, index, onDownloadCV }: MatchResultCardProps) {
  const getScoreBadgeColor = (score: number): string => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    if (score >= 60) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              #{index + 1}
            </span>
            <h4 className="font-semibold truncate">
              {match.candidate.name}
            </h4>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {match.candidate.job_title || "No title specified"}
          </p>
        </div>
        <Badge 
          variant="outline"
          className={cn(
            "text-lg font-bold px-3 py-1 border",
            getScoreBadgeColor(match.final_score)
          )}
        >
          {match.final_score}%
        </Badge>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {match.candidate.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {match.candidate.location}
          </span>
        )}
        {match.candidate.sector && (
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {match.candidate.sector}
          </span>
        )}
        {match.candidate.years_experience && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {match.candidate.years_experience} years
          </span>
        )}
        {match.candidate.cv_score && (
          <Badge variant="outline" className="text-xs gap-1">
            <Star className="h-3 w-3" />
            CV: {match.candidate.cv_score}
          </Badge>
        )}
      </div>

      {/* Score Breakdown */}
      <ScoreBreakdown
        algorithmicScore={match.algorithmic_score}
        aiScore={match.ai_score}
        finalScore={match.final_score}
      />

      {/* Explanation */}
      <p className="text-sm text-foreground/90 leading-relaxed">
        {match.explanation}
      </p>

      {/* Skills */}
      <div className="space-y-2">
        {match.skills_matched.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {match.skills_matched.slice(0, 6).map((skill) => (
              <Badge 
                key={skill} 
                variant="outline"
                className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
              >
                ✓ {skill}
              </Badge>
            ))}
            {match.skills_matched.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{match.skills_matched.length - 6} more
              </Badge>
            )}
          </div>
        )}
        
        {match.skills_partial && match.skills_partial.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {match.skills_partial.slice(0, 3).map((skill) => (
              <Badge 
                key={skill} 
                variant="outline"
                className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
              >
                ~ {skill}
              </Badge>
            ))}
          </div>
        )}
        
        {match.skills_missing.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {match.skills_missing.slice(0, 3).map((skill) => (
              <Badge 
                key={skill} 
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Missing: {skill}
              </Badge>
            ))}
            {match.skills_missing.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{match.skills_missing.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Advanced Signals */}
      <AdvancedSignals
        overqualificationRisk={match.overqualification_risk}
        careerTrajectoryFit={match.career_trajectory_fit}
        salaryExpectationFit={match.salary_expectation_fit}
      />

      {/* AI Insights - Collapsible */}
      <MatchInsights
        strengths={match.strengths}
        fitConcerns={match.fit_concerns}
        interviewQuestions={match.interview_questions}
      />

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDownloadCV(match.candidate.cv_file_url, match.candidate.name)}
          disabled={!match.candidate.cv_file_url}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Download CV
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.open(`/admin?tab=talent&search=${encodeURIComponent(match.candidate.email)}`, "_blank")}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          View Profile
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
