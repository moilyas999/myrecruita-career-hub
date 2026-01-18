import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import type { CandidateProfile } from '@/types/candidate';
import { NOTICE_PERIOD_OPTIONS, SENIORITY_LEVEL_OPTIONS } from '@/types/candidate';

interface CompensationCardProps {
  candidate: CandidateProfile;
}

function formatSalary(salary: string | null): string {
  if (!salary) return '-';
  // Try to parse as number and format
  const num = parseInt(salary.replace(/[^0-9]/g, ''), 10);
  if (!isNaN(num)) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(num);
  }
  return salary;
}

export default function CompensationCard({ candidate }: CompensationCardProps) {
  const noticePeriodLabel = NOTICE_PERIOD_OPTIONS.find(
    (opt) => opt.value === candidate.notice_period
  )?.label || candidate.notice_period;

  const seniorityLabel = SENIORITY_LEVEL_OPTIONS.find(
    (opt) => opt.value === candidate.seniority_level
  )?.label || candidate.seniority_level;

  const hasCompensationInfo = 
    candidate.current_salary || 
    candidate.salary_expectation || 
    candidate.notice_period || 
    candidate.available_from;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          Compensation & Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seniority Level */}
        {candidate.seniority_level && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Seniority</span>
            <Badge variant="outline">{seniorityLabel}</Badge>
          </div>
        )}

        {/* Experience */}
        {candidate.years_experience !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Experience</span>
            <span className="text-sm font-medium">
              {candidate.years_experience} year{candidate.years_experience !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {(candidate.seniority_level || candidate.years_experience !== null) && 
          (candidate.current_salary || candidate.salary_expectation) && <Separator />}

        {/* Current Salary */}
        {candidate.current_salary && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Salary</span>
            <span className="text-sm font-medium">
              {formatSalary(candidate.current_salary)}
            </span>
          </div>
        )}

        {/* Salary Expectation */}
        {candidate.salary_expectation && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expected Salary</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatSalary(candidate.salary_expectation)}
              </span>
            </div>
          </div>
        )}

        {(candidate.current_salary || candidate.salary_expectation) && 
          (candidate.notice_period || candidate.available_from) && <Separator />}

        {/* Notice Period */}
        {candidate.notice_period && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Notice Period</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{noticePeriodLabel}</span>
            </div>
          </div>
        )}

        {/* Available From */}
        {candidate.available_from && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available From</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {format(new Date(candidate.available_from), 'dd MMM yyyy')}
              </span>
            </div>
          </div>
        )}

        {/* No info */}
        {!hasCompensationInfo && (
          <p className="text-sm text-muted-foreground italic">
            No compensation information recorded
          </p>
        )}
      </CardContent>
    </Card>
  );
}
