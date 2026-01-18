import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Shield,
} from 'lucide-react';
import { format, differenceInDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CandidateProfile } from '@/types/candidate';
import { RIGHT_TO_WORK_OPTIONS, VISA_TYPE_OPTIONS } from '@/types/candidate';

interface WorkAuthorizationCardProps {
  candidate: CandidateProfile;
}

function getVisaStatus(expiryDate: string | null): {
  status: 'valid' | 'expiring' | 'expired';
  daysRemaining: number | null;
  message: string;
} {
  if (!expiryDate) {
    return { status: 'valid', daysRemaining: null, message: 'No expiry date' };
  }

  const expiry = new Date(expiryDate);
  const today = new Date();

  if (isBefore(expiry, today)) {
    return { status: 'expired', daysRemaining: 0, message: 'Visa expired' };
  }

  const daysRemaining = differenceInDays(expiry, today);

  if (daysRemaining <= 90) {
    return {
      status: 'expiring',
      daysRemaining,
      message: `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
    };
  }

  return {
    status: 'valid',
    daysRemaining,
    message: `Valid for ${daysRemaining} days`,
  };
}

export default function WorkAuthorizationCard({ candidate }: WorkAuthorizationCardProps) {
  const visaStatus = candidate.visa_expiry_date 
    ? getVisaStatus(candidate.visa_expiry_date) 
    : null;

  const rightToWorkLabel = RIGHT_TO_WORK_OPTIONS.find(
    (opt) => opt.value === candidate.right_to_work
  )?.label || candidate.right_to_work;

  const visaTypeLabel = VISA_TYPE_OPTIONS.find(
    (opt) => opt.value === candidate.visa_type
  )?.label || candidate.visa_type;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          Work Authorization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sponsorship Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Sponsorship Required</span>
          {candidate.requires_sponsorship ? (
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Yes
            </Badge>
          ) : (
            <Badge variant="outline" className="border-green-500 text-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              No
            </Badge>
          )}
        </div>

        {/* Right to Work */}
        {candidate.right_to_work && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Right to Work</span>
            <span className="text-sm font-medium">{rightToWorkLabel}</span>
          </div>
        )}

        {/* Visa Details (only if requires sponsorship or has visa info) */}
        {(candidate.requires_sponsorship || candidate.visa_type) && (
          <>
            <Separator />
            
            {candidate.visa_type && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Visa Type</span>
                <span className="text-sm font-medium">{visaTypeLabel}</span>
              </div>
            )}

            {candidate.visa_expiry_date && visaStatus && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visa Expiry</span>
                  <span className="text-sm font-medium">
                    {format(new Date(candidate.visa_expiry_date), 'dd MMM yyyy')}
                  </span>
                </div>

                {/* Visual Status Indicator */}
                <div
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md text-sm',
                    visaStatus.status === 'valid' && 'bg-green-50 text-green-700',
                    visaStatus.status === 'expiring' && 'bg-amber-50 text-amber-700',
                    visaStatus.status === 'expired' && 'bg-red-50 text-red-700'
                  )}
                >
                  {visaStatus.status === 'valid' && <CheckCircle2 className="w-4 h-4" />}
                  {visaStatus.status === 'expiring' && <AlertTriangle className="w-4 h-4" />}
                  {visaStatus.status === 'expired' && <XCircle className="w-4 h-4" />}
                  <span>{visaStatus.message}</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* No authorization info */}
        {!candidate.right_to_work && !candidate.visa_type && candidate.requires_sponsorship === null && (
          <p className="text-sm text-muted-foreground italic">
            No work authorization information recorded
          </p>
        )}
      </CardContent>
    </Card>
  );
}
