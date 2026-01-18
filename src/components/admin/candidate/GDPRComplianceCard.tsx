import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  UserX,
  Trash2,
  Calendar,
  Loader2,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CandidateProfile, GDPRStatus } from '@/types/candidate';
import { useUpdateLastContact, useAnonymiseCandidate } from '@/hooks/useCandidateProfile';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

interface GDPRComplianceCardProps {
  candidate: CandidateProfile;
  gdprStatus: GDPRStatus | null;
  onDelete: () => void;
}

function getGDPRStatusConfig(status: GDPRStatus['status']) {
  switch (status) {
    case 'active':
      return { 
        icon: CheckCircle2, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        progressColor: 'bg-green-500',
        label: 'Active',
        description: 'Candidate data is within retention period'
      };
    case 'stale':
      return { 
        icon: Clock, 
        color: 'text-amber-600', 
        bgColor: 'bg-amber-50',
        progressColor: 'bg-amber-500',
        label: 'Stale',
        description: 'Consider re-contacting to refresh consent'
      };
    case 'at_risk':
      return { 
        icon: AlertTriangle, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-50',
        progressColor: 'bg-orange-500',
        label: 'At Risk',
        description: 'Data approaching retention limit'
      };
    case 'expired':
      return { 
        icon: XCircle, 
        color: 'text-red-600', 
        bgColor: 'bg-red-50',
        progressColor: 'bg-red-500',
        label: 'Expired',
        description: 'Data should be deleted or anonymised'
      };
  }
}

export default function GDPRComplianceCard({ 
  candidate, 
  gdprStatus,
  onDelete 
}: GDPRComplianceCardProps) {
  const { hasPermission } = usePermissions();
  const updateLastContact = useUpdateLastContact();
  const anonymiseCandidate = useAnonymiseCandidate();

  const canUpdate = hasPermission('cv.update');
  const canDelete = hasPermission('cv.delete');

  const gdprConfig = gdprStatus ? getGDPRStatusConfig(gdprStatus.status) : null;
  const GDPRIcon = gdprConfig?.icon || Clock;

  // Calculate progress (730 days = 2 years max)
  const maxDays = 730;
  const daysSinceContact = gdprStatus?.daysSinceContact ?? 0;
  const progressPercent = Math.min((daysSinceContact / maxDays) * 100, 100);

  const handleRefreshContact = async () => {
    try {
      await updateLastContact.mutateAsync(candidate.id);
      toast.success('Last contact date updated');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAnonymise = async () => {
    try {
      await anonymiseCandidate.mutateAsync(candidate.id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isAnonymised = candidate.anonymised_at !== null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            GDPR Compliance
          </div>
          {gdprStatus && gdprConfig && (
            <Badge 
              variant="outline" 
              className={cn('gap-1', gdprConfig.color, gdprConfig.bgColor)}
            >
              <GDPRIcon className="w-3 h-3" />
              {gdprConfig.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnonymised ? (
          <div className="p-4 bg-muted rounded-lg text-center">
            <UserX className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Data Anonymised</p>
            <p className="text-sm text-muted-foreground">
              This candidate's personal data was anonymised on{' '}
              {format(new Date(candidate.anonymised_at!), 'dd MMM yyyy')}
            </p>
          </div>
        ) : (
          <>
            {/* Status Description */}
            {gdprConfig && (
              <p className={cn('text-sm', gdprConfig.color)}>
                {gdprConfig.description}
              </p>
            )}

            {/* Last Contact */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Contact</span>
                <span className="font-medium">
                  {candidate.last_contact_date 
                    ? format(new Date(candidate.last_contact_date), 'dd MMM yyyy')
                    : 'Not recorded'
                  }
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress 
                  value={100 - progressPercent} 
                  className={cn('h-2', gdprConfig?.progressColor && `[&>div]:${gdprConfig.progressColor}`)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {gdprStatus?.daysSinceContact !== null 
                      ? `${gdprStatus.daysSinceContact} days ago`
                      : 'Unknown'
                    }
                  </span>
                  <span>
                    {gdprStatus?.daysUntilExpiry !== null && gdprStatus.daysUntilExpiry > 0
                      ? `${gdprStatus.daysUntilExpiry} days remaining`
                      : 'Expired'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Consent Dates */}
            {(candidate.consent_given_at || candidate.consent_expires_at) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {candidate.consent_given_at && (
                    <div>
                      <span className="text-muted-foreground block">Consent Given</span>
                      <span className="font-medium">
                        {format(new Date(candidate.consent_given_at), 'dd MMM yyyy')}
                      </span>
                    </div>
                  )}
                  {candidate.consent_expires_at && (
                    <div>
                      <span className="text-muted-foreground block">Consent Expires</span>
                      <span className="font-medium">
                        {format(new Date(candidate.consent_expires_at), 'dd MMM yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* GDPR Notes */}
            {candidate.gdpr_notes && (
              <>
                <Separator />
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                    GDPR Notes
                  </span>
                  <p className="text-sm">{candidate.gdpr_notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {/* Refresh Contact */}
              {canUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshContact}
                  disabled={updateLastContact.isPending}
                >
                  {updateLastContact.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh Contact
                </Button>
              )}

              {/* Anonymise */}
              {canUpdate && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-amber-600">
                      <UserX className="w-4 h-4 mr-2" />
                      Anonymise
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anonymise Candidate Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently replace personal data (name, email, phone) with 
                        anonymised placeholders. The candidate's skills and experience data 
                        will be retained for statistical purposes. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleAnonymise}
                        className="bg-amber-600 hover:bg-amber-700"
                        disabled={anonymiseCandidate.isPending}
                      >
                        {anonymiseCandidate.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Anonymise Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Delete */}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this candidate and all associated data 
                        including pipeline entries and interview scorecards. This action 
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
