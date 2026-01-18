import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CandidateProfile, Qualification } from '@/types/candidate';
import { QUALIFICATION_BODIES } from '@/types/candidate';

interface QualificationsCardProps {
  candidate: CandidateProfile;
}

function getQualificationStatusConfig(status: Qualification['status']) {
  switch (status) {
    case 'Qualified':
      return { icon: CheckCircle2, color: 'text-green-600', label: 'Qualified' };
    case 'Studying':
      return { icon: Clock, color: 'text-blue-600', label: 'Studying' };
    case 'Part Qualified':
      return { icon: BookOpen, color: 'text-amber-600', label: 'Part Qualified' };
    case 'Exempt':
      return { icon: CheckCircle2, color: 'text-gray-600', label: 'Exempt' };
    default:
      return { icon: BookOpen, color: 'text-muted-foreground', label: status };
  }
}

function getQualificationBodyLabel(code: string): string {
  const body = QUALIFICATION_BODIES.find((b) => b.value === code);
  return body?.label || code;
}

export default function QualificationsCard({ candidate }: QualificationsCardProps) {
  const qualifications = candidate.qualifications || [];
  const memberships = candidate.professional_memberships || [];

  const hasContent = qualifications.length > 0 || memberships.length > 0 || candidate.education_level;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-muted-foreground" />
          Qualifications & Memberships
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Education Level */}
        {candidate.education_level && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Education Level</span>
            <Badge variant="outline">{candidate.education_level}</Badge>
          </div>
        )}

        {/* Professional Qualifications */}
        {qualifications.length > 0 && (
          <>
            {candidate.education_level && <Separator />}
            <div className="space-y-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Professional Qualifications
              </span>
              {qualifications.map((qual, idx) => {
                const statusConfig = getQualificationStatusConfig(qual.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={idx} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{qual.name}</span>
                          <Badge variant="outline" className={cn('text-xs', statusConfig.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getQualificationBodyLabel(qual.body)}
                        </p>
                      </div>
                    </div>

                    {/* Exam Progress (for part qualified/studying) */}
                    {(qual.status === 'Studying' || qual.status === 'Part Qualified') &&
                      qual.exams_passed !== undefined && qual.exams_remaining !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Exam Progress</span>
                            <span className="font-medium">
                              {qual.exams_passed} passed, {qual.exams_remaining} remaining
                            </span>
                          </div>
                          <Progress 
                            value={(qual.exams_passed / (qual.exams_passed + qual.exams_remaining)) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                    {qual.completion_date && (
                      <p className="text-xs text-muted-foreground">
                        {qual.status === 'Qualified' ? 'Completed' : 'Expected'}: {qual.completion_date}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Professional Memberships */}
        {memberships.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Professional Memberships
              </span>
              <div className="flex flex-wrap gap-2">
                {memberships.map((membership, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    <Award className="w-3 h-3" />
                    {membership}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* No content */}
        {!hasContent && (
          <p className="text-sm text-muted-foreground italic">
            No qualifications or memberships recorded
          </p>
        )}
      </CardContent>
    </Card>
  );
}
