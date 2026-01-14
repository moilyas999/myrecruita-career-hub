import { Brain, Sparkles, Target, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { AIProfile, SkillEntry } from './types';

// Normalize skill format - handles both string and {skill, proficiency} object formats
function normalizeSkill(skill: SkillEntry): string {
  if (typeof skill === 'string') {
    return skill;
  }
  return skill?.skill || '';
}

interface AIProfilePreviewProps {
  aiProfile: AIProfile;
  cvScore?: number | null;
}

export function AIProfilePreview({ aiProfile, cvScore }: AIProfilePreviewProps) {
  const [expanded, setExpanded] = useState(false);
  
  const hasContent = aiProfile.summary_for_matching || 
    (aiProfile.hard_skills && aiProfile.hard_skills.length > 0) ||
    (aiProfile.soft_skills && aiProfile.soft_skills.length > 0);

  if (!hasContent) return null;

  return (
    <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
          <Brain className="w-4 h-4" aria-hidden="true" />
          <span>AI Analysis</span>
          {cvScore !== null && cvScore !== undefined && (
            <Badge 
              variant="secondary" 
              className={`ml-2 ${
                cvScore >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                cvScore >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              Score: {cvScore}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-6 px-2 text-purple-600 hover:text-purple-700 dark:text-purple-400"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse AI analysis" : "Expand AI analysis"}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Summary - always visible */}
      {aiProfile.summary_for_matching && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {aiProfile.summary_for_matching}
        </p>
      )}

      {/* Hard Skills - always visible (first 5) */}
      {aiProfile.hard_skills && aiProfile.hard_skills.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            <span>Skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {aiProfile.hard_skills.slice(0, expanded ? undefined : 5).map((skill, index) => {
              const skillName = normalizeSkill(skill);
              return (
                <Badge key={`${skillName}-${index}`} variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  {skillName}
                </Badge>
              );
            })}
            {!expanded && aiProfile.hard_skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{aiProfile.hard_skills.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 space-y-3 pt-3 border-t border-purple-100 dark:border-purple-800/30">
          {/* Soft Skills */}
          {aiProfile.soft_skills && aiProfile.soft_skills.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                <Target className="w-3 h-3" aria-hidden="true" />
                <span>Soft Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aiProfile.soft_skills.map((skill, index) => {
                  const skillName = normalizeSkill(skill);
                  return (
                    <Badge key={`${skillName}-${index}`} variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {skillName}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ideal Roles */}
          {aiProfile.ideal_roles && aiProfile.ideal_roles.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                <Briefcase className="w-3 h-3" aria-hidden="true" />
                <span>Ideal Roles</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aiProfile.ideal_roles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Industries */}
          {aiProfile.industries && aiProfile.industries.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">Industries</div>
              <div className="flex flex-wrap gap-1.5">
                {aiProfile.industries.map((industry) => (
                  <Badge key={industry} variant="outline" className="text-xs">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Career Progression */}
          {aiProfile.career_progression && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Career Progression</div>
              <p className="text-xs text-muted-foreground">{aiProfile.career_progression}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
