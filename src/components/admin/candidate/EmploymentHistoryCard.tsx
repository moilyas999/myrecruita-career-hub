import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Briefcase,
  Building2,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CandidateProfile, EmploymentEntry } from '@/types/candidate';

interface EmploymentHistoryCardProps {
  candidate: CandidateProfile;
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = startDate;
  const end = endDate || 'Present';
  return `${start} - ${end}`;
}

function calculateTenure(startDate: string, endDate: string | null): string {
  // Simple tenure calculation based on years/months
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years}y ${remainingMonths}m`;
}

export default function EmploymentHistoryCard({ candidate }: EmploymentHistoryCardProps) {
  const history = candidate.employment_history || [];
  const roleChanges = candidate.role_changes_5yr;
  const sectorExposure = candidate.sector_exposure || [];

  const hasContent = history.length > 0 || sectorExposure.length > 0;

  // Check for job hopping (more than 3 role changes in 5 years)
  const isJobHopper = roleChanges !== null && roleChanges > 3;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            Employment History
          </div>
          {roleChanges !== null && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                isJobHopper ? 'border-amber-500 text-amber-600' : 'border-green-500 text-green-600'
              )}
            >
              {roleChanges} role{roleChanges !== 1 ? 's' : ''} in 5 years
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Hopper Warning */}
        {isJobHopper && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-800">High Role Turnover</p>
              <p className="text-amber-700 text-xs mt-0.5">
                This candidate has changed roles {roleChanges} times in the last 5 years.
              </p>
            </div>
          </div>
        )}

        {/* Sector Exposure */}
        {sectorExposure.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sector Exposure
            </span>
            <div className="flex flex-wrap gap-2">
              {sectorExposure.map((sector, idx) => (
                <Badge key={idx} variant="secondary">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Employment Timeline */}
        {history.length > 0 && (
          <>
            {sectorExposure.length > 0 && <Separator />}
            <div className="space-y-4">
              {history.map((entry, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "relative pl-4 pb-4",
                    idx !== history.length - 1 && "border-l-2 border-muted"
                  )}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-primary -translate-x-[5px]" />
                  
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">{entry.role}</h4>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span className="text-sm">{entry.company}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {calculateTenure(entry.start_date, entry.end_date)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateRange(entry.start_date, entry.end_date)}</span>
                    </div>

                    {entry.responsibilities && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {entry.responsibilities}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Experience Summary */}
        {candidate.experience_summary && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Experience Summary
              </span>
              <p className="text-sm">{candidate.experience_summary}</p>
            </div>
          </>
        )}

        {/* No content */}
        {!hasContent && !candidate.experience_summary && (
          <p className="text-sm text-muted-foreground italic">
            No employment history recorded
          </p>
        )}
      </CardContent>
    </Card>
  );
}
