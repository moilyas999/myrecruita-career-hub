import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  Users,
  Calendar,
  Building2,
  Clock,
} from 'lucide-react';
import type { Job, JobPriority, JobStatus } from '@/types/job';

interface JobCardProps {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;
  onClick?: (job: Job) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  compact?: boolean;
}

// Priority configuration for visual styling
const PRIORITY_CONFIG: Record<JobPriority, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-destructive text-destructive-foreground' },
  high: { label: 'High', className: 'bg-orange-500 text-white' },
  medium: { label: 'Medium', className: 'bg-primary text-primary-foreground' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
};

// Status configuration
const STATUS_CONFIG: Record<JobStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  on_hold: { label: 'On Hold', variant: 'secondary' },
  filled: { label: 'Filled', variant: 'outline' },
  closed: { label: 'Closed', variant: 'destructive' },
};

// Ageing status for visual indicator
function getAgeingStatus(createdAt: string): { label: string; className: string } {
  const daysOpen = differenceInDays(new Date(), new Date(createdAt));
  
  if (daysOpen <= 7) return { label: 'New', className: 'text-emerald-600' };
  if (daysOpen <= 14) return { label: `${daysOpen}d`, className: 'text-muted-foreground' };
  if (daysOpen <= 30) return { label: `${daysOpen}d`, className: 'text-amber-600' };
  return { label: `${daysOpen}d`, className: 'text-destructive' };
}

export default function JobCard({
  job,
  onEdit,
  onDelete,
  onClick,
  canEdit = false,
  canDelete = false,
  compact = false,
}: JobCardProps) {
  const priorityConfig = PRIORITY_CONFIG[job.priority || 'medium'];
  const statusConfig = STATUS_CONFIG[(job.status as JobStatus) || 'active'];
  const ageingStatus = getAgeingStatus(job.created_at);

  const clientName = (job.client as { company_name?: string } | null)?.company_name;
  const hiringManager = job.hiring_manager as { name?: string; job_title?: string } | null;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/admin/job/${job.id}`}
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
              >
                <CardTitle className="text-lg truncate">{job.title}</CardTitle>
              </Link>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              {job.priority && (
                <Badge className={priorityConfig.className}>
                  {priorityConfig.label}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs">{job.reference_id}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.sector}</span>
            </CardDescription>
          </div>

          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Job actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/admin/job/${job.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit?.(job)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Job
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(job)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Job
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Client & Hiring Manager */}
        {(clientName || hiringManager) && (
          <div className="flex items-center gap-4 text-sm mb-3">
            {clientName && (
              <Link
                to={`/admin/client/${job.client_id}`}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Building2 className="h-4 w-4" />
                <span>{clientName}</span>
              </Link>
            )}
            {hiringManager?.name && (
              <span className="text-muted-foreground">
                HM: {hiringManager.name}
              </span>
            )}
          </div>
        )}

        {/* Metrics Row */}
        <div className="flex items-center gap-4 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{job.cvs_submitted_count || 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>CVs Submitted</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{job.interviews_scheduled_count || 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Interviews</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{job.offers_made_count || 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Offers Made</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center gap-1.5 ${ageingStatus.className}`}>
                <Clock className="h-4 w-4" />
                <span>{ageingStatus.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Days Open</TooltipContent>
          </Tooltip>

          {job.salary && (
            <span className="ml-auto text-sm font-medium">{job.salary}</span>
          )}
        </div>

        {/* Salary & Revenue */}
        {job.revenue_forecast && job.revenue_forecast > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Projected Revenue: £{job.revenue_forecast.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
