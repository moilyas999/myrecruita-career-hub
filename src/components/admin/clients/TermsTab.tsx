/**
 * Terms Tab Component
 * Displays and manages client terms and fee agreements
 */
import { useState } from 'react';
import { Plus, FileText, Edit2, Trash2, MoreVertical, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useClientTerms, useUpdateTerms } from '@/hooks/useClients';
import TermsFormDialog from './TermsFormDialog';
import type { ClientTerms, JobTypeCategory } from '@/types/client';

interface TermsTabProps {
  clientId: string;
  canUpdate: boolean;
}

const JOB_TYPE_LABELS: Record<JobTypeCategory, string> = {
  permanent: 'Permanent',
  contract: 'Contract',
  temp: 'Temporary',
  ftc: 'Fixed Term',
};

export default function TermsTab({ clientId, canUpdate }: TermsTabProps) {
  const { data: terms, isLoading } = useClientTerms(clientId);
  const updateTerms = useUpdateTerms();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTerms, setEditingTerms] = useState<ClientTerms | null>(null);
  const [deactivatingTerms, setDeactivatingTerms] = useState<ClientTerms | null>(null);

  const handleDeactivate = async () => {
    if (!deactivatingTerms) return;
    try {
      await updateTerms.mutateAsync({ 
        id: deactivatingTerms.id, 
        is_active: false,
        effective_until: new Date().toISOString(),
      });
      setDeactivatingTerms(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const formatPercentage = (value: number | null) => {
    return value != null ? `${value}%` : '-';
  };

  const formatCurrency = (value: number | null) => {
    if (value == null) return '-';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  const activeTerms = terms?.filter(t => t.is_active) || [];
  const inactiveTerms = terms?.filter(t => !t.is_active) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Terms & Fee Agreements ({terms?.length || 0})
        </h3>
        {canUpdate && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Terms
          </Button>
        )}
      </div>

      {/* No Terms State */}
      {!terms || terms.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No terms defined</h3>
            <p className="text-muted-foreground mb-4">
              Add fee agreements and payment terms for this client
            </p>
            {canUpdate && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Terms
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Terms */}
          {activeTerms.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Active Terms
              </h4>
              {activeTerms.map(term => (
                <TermsCard 
                  key={term.id} 
                  term={term} 
                  canUpdate={canUpdate}
                  onEdit={() => setEditingTerms(term)}
                  onDeactivate={() => setDeactivatingTerms(term)}
                />
              ))}
            </div>
          )}

          {/* Inactive/Historical Terms */}
          {inactiveTerms.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Historical Terms
              </h4>
              {inactiveTerms.map(term => (
                <TermsCard 
                  key={term.id} 
                  term={term} 
                  canUpdate={canUpdate}
                  onEdit={() => setEditingTerms(term)}
                  isHistorical
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <TermsFormDialog
        open={showCreateDialog || !!editingTerms}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingTerms(null);
          }
        }}
        clientId={clientId}
        terms={editingTerms}
      />

      {/* Deactivate Confirmation */}
      <AlertDialog open={!!deactivatingTerms} onOpenChange={() => setDeactivatingTerms(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Terms</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{deactivatingTerms?.name}"? 
              The terms will be moved to historical records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface TermsCardProps {
  term: ClientTerms;
  canUpdate: boolean;
  onEdit: () => void;
  onDeactivate?: () => void;
  isHistorical?: boolean;
}

function TermsCard({ term, canUpdate, onEdit, onDeactivate, isHistorical }: TermsCardProps) {
  return (
    <Card className={isHistorical ? 'opacity-70' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {term.name}
              {term.is_exclusive && (
                <Badge variant="default" className="text-xs">Exclusive</Badge>
              )}
              {!term.is_active && (
                <Badge variant="outline" className="text-xs">Inactive</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {JOB_TYPE_LABELS[term.job_type]}
              </Badge>
              <span>
                From {format(new Date(term.effective_from), 'dd MMM yyyy')}
                {term.effective_until && ` to ${format(new Date(term.effective_until), 'dd MMM yyyy')}`}
              </span>
            </div>
          </div>
          {canUpdate && !isHistorical && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {onDeactivate && (
                  <DropdownMenuItem onClick={onDeactivate}>
                    <X className="w-4 h-4 mr-2" />
                    Deactivate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {term.fee_percentage_perm && (
            <div>
              <span className="text-muted-foreground block">Perm Fee</span>
              <span className="font-medium">{term.fee_percentage_perm}%</span>
            </div>
          )}
          {term.fee_percentage_contract && (
            <div>
              <span className="text-muted-foreground block">Contract Fee</span>
              <span className="font-medium">{term.fee_percentage_contract}%</span>
            </div>
          )}
          {term.flat_fee && (
            <div>
              <span className="text-muted-foreground block">Flat Fee</span>
              <span className="font-medium">
                {new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP',
                  minimumFractionDigits: 0,
                }).format(term.flat_fee)}
              </span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground block">Payment Terms</span>
            <span className="font-medium">{term.payment_terms_days} days</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Rebate Period</span>
            <span className="font-medium">{term.rebate_period_days} days @ {term.rebate_percentage}%</span>
          </div>
          {term.min_salary_threshold && (
            <div>
              <span className="text-muted-foreground block">Min Salary</span>
              <span className="font-medium">
                {new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP',
                  minimumFractionDigits: 0,
                }).format(term.min_salary_threshold)}
              </span>
            </div>
          )}
          {term.max_salary_cap && (
            <div>
              <span className="text-muted-foreground block">Max Salary Cap</span>
              <span className="font-medium">
                {new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP',
                  minimumFractionDigits: 0,
                }).format(term.max_salary_cap)}
              </span>
            </div>
          )}
        </div>
        {term.notes && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-muted-foreground text-sm">Notes: </span>
            <span className="text-sm">{term.notes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
