import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Receipt,
} from 'lucide-react';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Placement } from '@/types/pipeline';
import { PLACEMENT_STATUS_CONFIG, JOB_TYPE_CONFIG } from '@/types/pipeline';
import { useMarkInvoiceRaised, useMarkInvoicePaid } from '@/hooks/usePlacement';
import { usePermissions } from '@/hooks/usePermissions';

interface PlacementSummaryProps {
  placement: Placement;
  onEdit?: () => void;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

function getGuaranteeStatus(placement: Placement): {
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number | null;
  message: string;
} {
  if (!placement.guarantee_expires_at) {
    return { status: 'expired', daysRemaining: null, message: 'No guarantee period' };
  }

  const expiryDate = new Date(placement.guarantee_expires_at);
  const today = new Date();

  if (isAfter(today, expiryDate)) {
    return { status: 'expired', daysRemaining: 0, message: 'Guarantee period ended' };
  }

  const daysRemaining = differenceInDays(expiryDate, today);

  if (daysRemaining <= 14) {
    return { 
      status: 'expiring', 
      daysRemaining, 
      message: `Guarantee expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}` 
    };
  }

  return { 
    status: 'active', 
    daysRemaining, 
    message: `${daysRemaining} days remaining` 
  };
}

export default function PlacementSummary({ placement, onEdit }: PlacementSummaryProps) {
  const { hasPermission } = usePermissions();
  const markInvoiceRaised = useMarkInvoiceRaised();
  const markInvoicePaid = useMarkInvoicePaid();

  const statusConfig = PLACEMENT_STATUS_CONFIG[placement.status as keyof typeof PLACEMENT_STATUS_CONFIG];
  const jobTypeConfig = JOB_TYPE_CONFIG[placement.job_type as keyof typeof JOB_TYPE_CONFIG];
  const guaranteeStatus = getGuaranteeStatus(placement);

  const canManage = hasPermission('pipeline.update');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Placement Details
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', statusConfig?.color)}>
              {statusConfig?.label || placement.status}
            </Badge>
            {onEdit && canManage && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Start Date:</span>{' '}
              <span className="font-medium">
                {format(new Date(placement.start_date), 'dd MMM yyyy')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Type:</span>{' '}
              <Badge variant="outline" className="text-xs">
                {jobTypeConfig?.label}
              </Badge>
            </div>
          </div>

          {placement.salary && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Salary:</span>{' '}
                <span className="font-medium">{formatCurrency(placement.salary)}</span>
              </div>
            </div>
          )}

          {placement.day_rate && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Day Rate:</span>{' '}
                <span className="font-medium">{formatCurrency(placement.day_rate)}/day</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Fee Information */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Fee Details</span>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {placement.fee_percentage && (
              <div>
                <span className="text-muted-foreground">Fee %:</span>{' '}
                <span className="font-medium">{placement.fee_percentage}%</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Fee Value:</span>{' '}
              <span className="font-bold text-green-600">
                {formatCurrency(placement.fee_value)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Invoice Status */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Invoice Status</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Receipt className={cn(
                'w-4 h-4',
                placement.invoice_raised ? 'text-green-600' : 'text-muted-foreground'
              )} />
              <span className="text-sm">
                {placement.invoice_raised ? (
                  <span className="text-green-600">
                    Raised {placement.invoice_number && `(${placement.invoice_number})`}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not raised</span>
                )}
              </span>
              {!placement.invoice_raised && canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markInvoiceRaised.mutate({ id: placement.id })}
                  disabled={markInvoiceRaised.isPending}
                >
                  Raise Invoice
                </Button>
              )}
            </div>

            {placement.invoice_raised && (
              <div className="flex items-center gap-2">
                <DollarSign className={cn(
                  'w-4 h-4',
                  placement.invoice_paid ? 'text-green-600' : 'text-amber-600'
                )} />
                <span className="text-sm">
                  {placement.invoice_paid ? (
                    <span className="text-green-600">Paid</span>
                  ) : (
                    <span className="text-amber-600">Awaiting payment</span>
                  )}
                </span>
                {!placement.invoice_paid && canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markInvoicePaid.mutate(placement.id)}
                    disabled={markInvoicePaid.isPending}
                  >
                    Mark Paid
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Guarantee Period */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Guarantee Period</span>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm',
                  guaranteeStatus.status === 'active' && 'bg-green-50 text-green-700',
                  guaranteeStatus.status === 'expiring' && 'bg-amber-50 text-amber-700',
                  guaranteeStatus.status === 'expired' && 'bg-muted text-muted-foreground'
                )}>
                  {guaranteeStatus.status === 'active' && <CheckCircle2 className="w-4 h-4" />}
                  {guaranteeStatus.status === 'expiring' && <AlertTriangle className="w-4 h-4" />}
                  {guaranteeStatus.status === 'expired' && <Clock className="w-4 h-4" />}
                  <span>{guaranteeStatus.message}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {placement.guarantee_expires_at && (
                  <span>Expires: {format(new Date(placement.guarantee_expires_at), 'dd MMM yyyy')}</span>
                )}
              </TooltipContent>
            </Tooltip>

            <span className="text-sm text-muted-foreground">
              {placement.guarantee_period_days || 90} days
            </span>
          </div>

          {placement.rebate_triggered && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Rebate Triggered</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                {placement.rebate_reason}
              </p>
              {placement.rebate_amount && (
                <p className="text-sm text-red-700 mt-1">
                  Rebate Amount: {formatCurrency(placement.rebate_amount)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Team */}
        {(placement.placed_by || placement.sourced_by) && (
          <>
            <Separator />
            <div className="flex items-center gap-4 text-sm">
              {placement.placed_by && (
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Placed by:</span>
                  <span className="font-medium">Staff</span>
                </div>
              )}
              {placement.sourced_by && (
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Sourced by:</span>
                  <span className="font-medium">Staff</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Notes */}
        {placement.notes && (
          <>
            <Separator />
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Notes</span>
              <p className="text-sm">{placement.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
