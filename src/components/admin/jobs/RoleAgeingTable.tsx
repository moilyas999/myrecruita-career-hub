import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoleAgeingData, JobPriority } from '@/types/job';

interface RoleAgeingTableProps {
  data: RoleAgeingData[];
  isLoading?: boolean;
  limit?: number;
}

const AGEING_STATUS_CONFIG = {
  new: { label: 'New', className: 'bg-emerald-500/10 text-emerald-600', icon: null },
  normal: { label: 'Normal', className: 'bg-primary/10 text-primary', icon: null },
  ageing: { label: 'Ageing', className: 'bg-amber-500/10 text-amber-600', icon: AlertTriangle },
  stale: { label: 'Stale', className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
};

const PRIORITY_CONFIG: Record<JobPriority, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-destructive text-destructive-foreground' },
  high: { label: 'High', className: 'bg-orange-500 text-white' },
  medium: { label: 'Medium', className: 'bg-primary text-primary-foreground' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
};

export default function RoleAgeingTable({
  data,
  isLoading,
  limit,
}: RoleAgeingTableProps) {
  const displayData = limit ? data.slice(0, limit) : data;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mb-2 opacity-50" />
        <p>No active jobs</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">Job</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-center">Days Open</TableHead>
            <TableHead className="text-center">CVs</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((job) => {
            const ageingConfig = AGEING_STATUS_CONFIG[job.ageing_status];
            const priorityConfig = job.priority
              ? PRIORITY_CONFIG[job.priority]
              : null;
            const AgeingIcon = ageingConfig.icon;

            return (
              <TableRow key={job.id} className="group">
                <TableCell>
                  <Link
                    to={`/admin/job/${job.id}`}
                    className="hover:underline font-medium"
                  >
                    {job.title}
                  </Link>
                  <p className="text-xs text-muted-foreground font-mono">
                    {job.reference_id}
                  </p>
                </TableCell>
                <TableCell>
                  {job.client_name ? (
                    <Link
                      to={`/admin/client/${job.client_id}`}
                      className="hover:underline text-sm"
                    >
                      {job.client_name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 font-medium',
                      job.ageing_status === 'ageing' && 'text-amber-600',
                      job.ageing_status === 'stale' && 'text-destructive'
                    )}
                  >
                    {AgeingIcon && <AgeingIcon className="h-3.5 w-3.5" />}
                    {job.days_open}d
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{job.cvs_submitted_count}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {priorityConfig && (
                    <Badge className={priorityConfig.className} variant="outline">
                      {priorityConfig.label}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={ageingConfig.className} variant="outline">
                    {ageingConfig.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
