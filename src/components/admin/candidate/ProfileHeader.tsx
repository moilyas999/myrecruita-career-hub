import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  MoreVertical,
  Download,
  UserX,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CandidateProfile, CalculatedGDPRStatus } from '@/types/candidate';
import { usePermissions } from '@/hooks/usePermissions';

interface ProfileHeaderProps {
  candidate: CandidateProfile;
  gdprStatus: CalculatedGDPRStatus | null;
  onAnonymise: () => void;
  onDelete: () => void;
}

function getGDPRStatusConfig(status: CalculatedGDPRStatus['status']) {
  switch (status) {
    case 'active':
      return { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Active' };
    case 'stale':
      return { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Stale' };
    case 'at_risk':
      return { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'At Risk' };
    case 'expired':
      return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Expired' };
  }
}

export default function ProfileHeader({
  candidate,
  gdprStatus,
  onAnonymise,
  onDelete,
}: ProfileHeaderProps) {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('cv.update');
  const canDelete = hasPermission('cv.delete');
  const canExport = hasPermission('cv.export');

  const gdprConfig = gdprStatus ? getGDPRStatusConfig(gdprStatus.status) : null;
  const GDPRIcon = gdprConfig?.icon || Clock;

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-start justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold truncate">{candidate.name}</h1>
            
            {/* CV Score */}
            {candidate.cv_score !== null && (
              <Badge
                variant="outline"
                className={cn(
                  'text-sm',
                  candidate.cv_score >= 80 && 'border-green-500 text-green-600',
                  candidate.cv_score >= 60 && candidate.cv_score < 80 && 'border-amber-500 text-amber-600',
                  candidate.cv_score < 60 && 'border-red-500 text-red-600'
                )}
              >
                {candidate.cv_score}% Match
              </Badge>
            )}

            {/* Work Authorization */}
            {candidate.requires_sponsorship !== null && (
              <Tooltip>
                <TooltipTrigger>
                  {candidate.requires_sponsorship ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Sponsorship Required
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {candidate.right_to_work || 'Right to Work'}
                    </Badge>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {candidate.requires_sponsorship
                    ? `Requires visa sponsorship${candidate.visa_type ? ` (${candidate.visa_type})` : ''}`
                    : candidate.right_to_work || 'Has right to work in UK'
                  }
                </TooltipContent>
              </Tooltip>
            )}

            {/* GDPR Status */}
            {gdprStatus && gdprConfig && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant="outline" 
                    className={cn('gap-1', gdprConfig.color, gdprConfig.bgColor)}
                  >
                    <GDPRIcon className="w-3 h-3" />
                    GDPR: {gdprConfig.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {gdprStatus.daysSinceContact !== null
                    ? `Last contacted ${gdprStatus.daysSinceContact} days ago`
                    : 'No contact recorded'
                  }
                  {gdprStatus.daysUntilExpiry !== null && gdprStatus.daysUntilExpiry > 0 && (
                    <span className="block">Expires in {gdprStatus.daysUntilExpiry} days</span>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Job Title */}
          {candidate.job_title && (
            <p className="text-lg text-muted-foreground mb-3">{candidate.job_title}</p>
          )}

          {/* Contact Details */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a
              href={`mailto:${candidate.email}`}
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              {candidate.email}
            </a>
            {candidate.phone && (
              <a
                href={`tel:${candidate.phone}`}
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Phone className="w-4 h-4" />
                {candidate.phone}
              </a>
            )}
            {candidate.location && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {candidate.location}
              </span>
            )}
            {candidate.sector && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                {candidate.sector}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {candidate.cv_file_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(candidate.cv_file_url!, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View CV
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canExport && candidate.cv_file_url && (
                <DropdownMenuItem onClick={() => window.open(candidate.cv_file_url!, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download CV
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canUpdate && (
                <DropdownMenuItem
                  onClick={onAnonymise}
                  className="text-amber-600"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Anonymise (GDPR)
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Candidate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
