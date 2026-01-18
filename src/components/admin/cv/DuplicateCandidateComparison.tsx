/**
 * DuplicateCandidateComparison
 * 
 * Side-by-side comparison of primary and duplicate candidate records.
 * Enables merging or clearing duplicates with proper permission checks.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useMergeDuplicates, useClearDuplicateFlag } from '@/hooks/useCandidateProfile';
import { Merge, XCircle, Check, ExternalLink, FileText, Calendar, MapPin } from 'lucide-react';
import type { CandidateProfile } from '@/types/candidate';

interface DuplicateCandidateComparisonProps {
  primaryCandidate: CandidateProfile;
  duplicateCandidate: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cv_file_url: string | null;
    created_at: string;
    source: string | null;
  };
  canMerge: boolean;
  canDelete: boolean;
}

export function DuplicateCandidateComparison({
  primaryCandidate,
  duplicateCandidate,
  canMerge,
  canDelete,
}: DuplicateCandidateComparisonProps) {
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  const mergeMutation = useMergeDuplicates();
  const clearFlagMutation = useClearDuplicateFlag();
  
  const handleMerge = async () => {
    await mergeMutation.mutateAsync({
      primaryId: primaryCandidate.id,
      duplicateId: duplicateCandidate.id,
    });
    setShowMergeDialog(false);
  };
  
  const handleClearFlag = async () => {
    await clearFlagMutation.mutateAsync(duplicateCandidate.id);
    setShowClearDialog(false);
  };
  
  return (
    <div className="p-4 space-y-4">
      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Candidate */}
        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="default" className="bg-green-600">Primary</Badge>
            <span className="text-sm text-muted-foreground">
              Created {new Date(primaryCandidate.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="space-y-2">
            <ComparisonField label="Name" value={primaryCandidate.name} />
            <ComparisonField label="Email" value={primaryCandidate.email} />
            <ComparisonField label="Phone" value={primaryCandidate.phone} />
            <ComparisonField label="Job Title" value={primaryCandidate.job_title} />
            <ComparisonField label="Location" value={primaryCandidate.location} />
            <ComparisonField label="Source" value={primaryCandidate.source} />
            
            {primaryCandidate.cv_file_url && (
              <div className="pt-2">
                <a
                  href={primaryCandidate.cv_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  View CV
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Duplicate Candidate */}
        <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Duplicate
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created {new Date(duplicateCandidate.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="space-y-2">
            <ComparisonField 
              label="Name" 
              value={duplicateCandidate.name} 
              isDifferent={duplicateCandidate.name !== primaryCandidate.name}
            />
            <ComparisonField 
              label="Email" 
              value={duplicateCandidate.email}
              isDifferent={duplicateCandidate.email !== primaryCandidate.email}
            />
            <ComparisonField 
              label="Phone" 
              value={duplicateCandidate.phone}
              isDifferent={duplicateCandidate.phone !== primaryCandidate.phone}
            />
            <ComparisonField label="Source" value={duplicateCandidate.source} />
            
            {duplicateCandidate.cv_file_url && (
              <div className="pt-2">
                <a
                  href={duplicateCandidate.cv_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  View CV
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <Button
          variant="default"
          size="sm"
          disabled={!canMerge || mergeMutation.isPending}
          onClick={() => setShowMergeDialog(true)}
        >
          <Merge className="h-4 w-4 mr-2" />
          {mergeMutation.isPending ? 'Merging...' : 'Merge into Primary'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          disabled={!canMerge || clearFlagMutation.isPending}
          onClick={() => setShowClearDialog(true)}
        >
          <XCircle className="h-4 w-4 mr-2" />
          {clearFlagMutation.isPending ? 'Clearing...' : 'Not a Duplicate'}
        </Button>
        
        {(!canMerge || !canDelete) && (
          <p className="text-xs text-muted-foreground mt-2 w-full">
            You need cv.update and cv.delete permissions to merge candidates.
          </p>
        )}
      </div>
      
      {/* Merge Confirmation Dialog */}
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Candidates</AlertDialogTitle>
            <AlertDialogDescription>
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Transfer all pipeline entries to the primary candidate</li>
                <li>Permanently delete the duplicate record</li>
                <li>Keep all data from the primary candidate</li>
              </ul>
              <p className="mt-3 font-medium">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMerge}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Merge & Delete Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Clear Flag Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Duplicate Flag</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark "{duplicateCandidate.name}" as not a duplicate. 
              Both candidate records will be kept as separate entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearFlag}>
              Clear Flag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ComparisonFieldProps {
  label: string;
  value: string | null | undefined;
  isDifferent?: boolean;
}

function ComparisonField({ label, value, isDifferent }: ComparisonFieldProps) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className={`text-sm font-medium text-right ${isDifferent ? 'text-amber-600 dark:text-amber-400' : ''}`}>
        {value || '—'}
        {isDifferent && <span className="ml-1 text-amber-500">*</span>}
      </span>
    </div>
  );
}

export default DuplicateCandidateComparison;
