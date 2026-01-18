import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  ExternalLink,
  MapPin,
  Users,
} from 'lucide-react';
import type { JobWithDetails, JobPriority, JobStatus } from '@/types/job';

interface JobHeaderProps {
  job: JobWithDetails | null;
  isLoading?: boolean;
  onEdit?: () => void;
  canEdit?: boolean;
}

const PRIORITY_CONFIG: Record<JobPriority, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-destructive text-destructive-foreground' },
  high: { label: 'High', className: 'bg-orange-500 text-white' },
  medium: { label: 'Medium', className: 'bg-primary text-primary-foreground' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
};

const STATUS_CONFIG: Record<JobStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  on_hold: { label: 'On Hold', variant: 'secondary' },
  filled: { label: 'Filled', variant: 'outline' },
  closed: { label: 'Closed', variant: 'destructive' },
};

export default function JobHeader({
  job,
  isLoading,
  onEdit,
  canEdit = false,
}: JobHeaderProps) {
  if (isLoading || !job) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  const priorityConfig = PRIORITY_CONFIG[job.priority || 'medium'];
  const statusConfig = STATUS_CONFIG[(job.status as JobStatus) || 'active'];
  const clientName = (job.client as { company_name?: string } | null)?.company_name;
  const hiringManager = job.hiring_manager as { name?: string; job_title?: string } | null;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin?tab=jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      {/* Header Content */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          {/* Title & Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            {job.priority && (
              <Badge className={priorityConfig.className}>
                {priorityConfig.label}
              </Badge>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
            <span className="font-mono text-sm">{job.reference_id}</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <span>{job.sector}</span>
            {job.salary && <span className="font-medium">{job.salary}</span>}
          </div>

          {/* Client & Hiring Manager */}
          <div className="flex items-center gap-4 text-sm">
            {clientName && (
              <Link
                to={`/admin/client/${job.client_id}`}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Building2 className="h-4 w-4" />
                <span>{clientName}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            {hiringManager?.name && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {hiringManager.name}
                  {hiringManager.job_title && ` (${hiringManager.job_title})`}
                </span>
              </div>
            )}
            {job.created_at && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created {format(new Date(job.created_at), 'dd MMM yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <Button onClick={onEdit} className="shrink-0">
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
        )}
      </div>
    </div>
  );
}
