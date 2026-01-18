/**
 * GDPRManagementPanel
 * 
 * Admin panel for bulk GDPR compliance management.
 * - Filter candidates by last contact date
 * - Bulk anonymise or delete stale records
 * - Track GDPR status across the database
 * 
 * @requires cv.view to view
 * @requires cv.delete for bulk actions (admin only)
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { queryKeys } from '@/lib/queryKeys';
import { logActivity } from '@/services/activityLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { AccessDenied, EmptyState } from '@/components/admin/shared';
import { 
  Shield, 
  AlertTriangle, 
  UserX, 
  Trash2, 
  Clock, 
  CheckCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { calculateGDPRStatus, type CalculatedGDPRStatus } from '@/types/candidate';

type FilterStatus = 'all' | 'active' | 'stale' | 'at_risk' | 'expired';

interface GDPRCandidate {
  id: string;
  name: string;
  email: string;
  last_contact_date: string | null;
  created_at: string;
  anonymised_at: string | null;
  gdprStatus: CalculatedGDPRStatus;
}

export function GDPRManagementPanel() {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkAnonymiseDialog, setShowBulkAnonymiseDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Permission check - require cv.view at minimum, cv.delete for actions
  const canView = hasPermission('cv.view');
  const canDelete = hasPermission('cv.delete');
  
  // Fetch candidates with GDPR-relevant fields
  const { data: candidates, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKeys.cvSubmissions, 'gdpr-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cv_submissions')
        .select('id, name, email, last_contact_date, created_at, anonymised_at')
        .is('anonymised_at', null) // Only show non-anonymised
        .order('last_contact_date', { ascending: true, nullsFirst: true });
      
      if (error) throw error;
      
      // Calculate GDPR status for each candidate
      return data.map(candidate => ({
        ...candidate,
        gdprStatus: calculateGDPRStatus(candidate.last_contact_date),
      })) as GDPRCandidate[];
    },
    enabled: canView,
  });
  
  // Filter candidates based on status
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    if (statusFilter === 'all') return candidates;
    return candidates.filter(c => c.gdprStatus.status === statusFilter);
  }, [candidates, statusFilter]);
  
  // Stats for quick reference
  const stats = useMemo(() => {
    if (!candidates) return { active: 0, stale: 0, atRisk: 0, expired: 0, total: 0 };
    return {
      active: candidates.filter(c => c.gdprStatus.status === 'active').length,
      stale: candidates.filter(c => c.gdprStatus.status === 'stale').length,
      atRisk: candidates.filter(c => c.gdprStatus.status === 'at_risk').length,
      expired: candidates.filter(c => c.gdprStatus.status === 'expired').length,
      total: candidates.length,
    };
  }, [candidates]);
  
  // Bulk anonymise mutation
  const bulkAnonymise = useMutation({
    mutationFn: async (ids: string[]) => {
      setIsProcessing(true);
      setProcessingProgress(0);
      
      const results = { success: 0, failed: 0 };
      
      for (let i = 0; i < ids.length; i++) {
        try {
          await supabase
            .from('cv_submissions')
            .update({
              name: 'Anonymous Candidate',
              email: `anonymous-${ids[i].substring(0, 8)}@anonymised.local`,
              phone: '0000000000',
              admin_notes: null,
              gdpr_notes: 'Bulk anonymised for GDPR compliance',
              anonymised_at: new Date().toISOString(),
              current_salary: null,
              salary_expectation: null,
              employment_history: [],
              qualifications: [],
              ai_profile: null,
              skills: null,
              experience_summary: null,
            })
            .eq('id', ids[i]);
          
          results.success++;
        } catch {
          results.failed++;
        }
        
        setProcessingProgress(Math.round(((i + 1) / ids.length) * 100));
      }
      
      return results;
    },
    onSuccess: (results) => {
      setIsProcessing(false);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
      
      if (results.failed === 0) {
        toast.success(`Successfully anonymised ${results.success} candidates`);
      } else {
        toast.warning(`Anonymised ${results.success}, failed ${results.failed}`);
      }
      
      logActivity({
        action: 'bulk_gdpr_anonymise',
        resourceType: 'cv_submission',
        resourceId: 'bulk',
        details: { count: results.success, failed: results.failed },
      });
    },
    onError: () => {
      setIsProcessing(false);
      toast.error('Bulk anonymisation failed');
    },
  });
  
  // Bulk delete mutation
  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      setIsProcessing(true);
      setProcessingProgress(0);
      
      const results = { success: 0, failed: 0 };
      
      for (let i = 0; i < ids.length; i++) {
        try {
          // First delete from pipeline
          await supabase
            .from('candidate_pipeline')
            .delete()
            .eq('cv_submission_id', ids[i]);
          
          // Then delete the candidate
          await supabase
            .from('cv_submissions')
            .delete()
            .eq('id', ids[i]);
          
          results.success++;
        } catch {
          results.failed++;
        }
        
        setProcessingProgress(Math.round(((i + 1) / ids.length) * 100));
      }
      
      return results;
    },
    onSuccess: (results) => {
      setIsProcessing(false);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: queryKeys.cvSubmissions });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidatePipeline });
      
      if (results.failed === 0) {
        toast.success(`Successfully deleted ${results.success} candidates`);
      } else {
        toast.warning(`Deleted ${results.success}, failed ${results.failed}`);
      }
      
      logActivity({
        action: 'bulk_gdpr_delete',
        resourceType: 'cv_submission',
        resourceId: 'bulk',
        details: { count: results.success, failed: results.failed },
      });
    },
    onError: () => {
      setIsProcessing(false);
      toast.error('Bulk deletion failed');
    },
  });
  
  // Permission check
  if (!permissionsLoading && !canView) {
    return (
      <AccessDenied
        message="You don't have permission to view GDPR management."
        requiredPermission="cv.view"
      />
    );
  }
  
  if (isLoading || permissionsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">Failed to load GDPR data</p>
        </CardContent>
      </Card>
    );
  }
  
  const handleSelectAll = () => {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCandidates.map(c => c.id)));
    }
  };
  
  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>GDPR Compliance Management</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Manage candidate data retention and GDPR compliance across the database
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            label="Active"
            count={stats.active}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-50 dark:bg-green-950/20"
          />
          <StatusCard
            label="Stale (6-12mo)"
            count={stats.stale}
            icon={Clock}
            color="text-amber-600"
            bgColor="bg-amber-50 dark:bg-amber-950/20"
          />
          <StatusCard
            label="At Risk (12-24mo)"
            count={stats.atRisk}
            icon={AlertTriangle}
            color="text-orange-600"
            bgColor="bg-orange-50 dark:bg-orange-950/20"
          />
          <StatusCard
            label="Expired (24mo+)"
            count={stats.expired}
            icon={UserX}
            color="text-red-600"
            bgColor="bg-red-50 dark:bg-red-950/20"
          />
        </div>
        
        {/* Filter and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="stale">Stale</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredCandidates.length} candidates
            </span>
          </div>
          
          {canDelete && selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedIds.size} selected</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkAnonymiseDialog(true)}
                disabled={isProcessing}
              >
                <UserX className="h-4 w-4 mr-2" />
                Anonymise
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
        
        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing...</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} />
          </div>
        )}
        
        {/* Candidate List */}
        {filteredCandidates.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No Candidates"
            description={statusFilter === 'all' 
              ? "No candidate records found." 
              : `No candidates with ${statusFilter} status.`}
          />
        ) : (
          <div className="space-y-2">
            {/* Header Row */}
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm font-medium">
              {canDelete && (
                <Checkbox
                  checked={selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              )}
              <span className="flex-1">Candidate</span>
              <span className="w-32 text-center hidden sm:block">Last Contact</span>
              <span className="w-24 text-center">Status</span>
            </div>
            
            {/* Candidate Rows */}
            {filteredCandidates.slice(0, 50).map(candidate => (
              <div 
                key={candidate.id}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                {canDelete && (
                  <Checkbox
                    checked={selectedIds.has(candidate.id)}
                    onCheckedChange={() => handleSelectOne(candidate.id)}
                    aria-label={`Select ${candidate.name}`}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                </div>
                <div className="w-32 text-center hidden sm:block">
                  <span className="text-sm text-muted-foreground">
                    {candidate.last_contact_date
                      ? new Date(candidate.last_contact_date).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
                <div className="w-24 text-center">
                  <GDPRStatusBadge status={candidate.gdprStatus} />
                </div>
              </div>
            ))}
            
            {filteredCandidates.length > 50 && (
              <p className="text-center text-sm text-muted-foreground py-2">
                Showing first 50 of {filteredCandidates.length} candidates
              </p>
            )}
          </div>
        )}
        
        {!canDelete && (
          <p className="text-xs text-muted-foreground text-center">
            You need cv.delete permission to perform bulk GDPR actions.
          </p>
        )}
      </CardContent>
      
      {/* Bulk Anonymise Dialog */}
      <AlertDialog open={showBulkAnonymiseDialog} onOpenChange={setShowBulkAnonymiseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Anonymise Candidates</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to anonymise {selectedIds.size} candidate(s).
              <br /><br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Replace all personal information with anonymous placeholders</li>
                <li>Remove salary, skills, and employment history</li>
                <li>Mark records as anonymised for audit trail</li>
              </ul>
              <p className="mt-3 font-medium">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkAnonymise.mutate(Array.from(selectedIds))}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              Anonymise {selectedIds.size} Candidate(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Delete Candidates</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete {selectedIds.size} candidate(s).
              <br /><br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove all pipeline entries for these candidates</li>
                <li>Permanently delete all candidate data</li>
                <li>Cannot be recovered after deletion</li>
              </ul>
              <p className="mt-3 font-medium text-destructive">
                This is a destructive action and cannot be undone!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDelete.mutate(Array.from(selectedIds))}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedIds.size} Candidate(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

interface StatusCardProps {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

function StatusCard({ label, count, icon: Icon, color, bgColor }: StatusCardProps) {
  return (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{count}</p>
    </div>
  );
}

function GDPRStatusBadge({ status }: { status: CalculatedGDPRStatus }) {
  const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    active: 'default',
    stale: 'secondary',
    at_risk: 'outline',
    expired: 'destructive',
  };
  
  return (
    <Badge variant={variants[status.status] || 'secondary'} className="text-xs">
      {status.label}
    </Badge>
  );
}

export default GDPRManagementPanel;
