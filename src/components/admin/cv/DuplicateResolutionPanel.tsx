/**
 * DuplicateResolutionPanel
 * 
 * Panel for managing and resolving duplicate candidate records.
 * - Displays candidates flagged as potential duplicates
 * - Allows side-by-side comparison
 * - Enables merging or clearing duplicate flags
 * 
 * @requires cv.view to view
 * @requires cv.update to merge
 * @requires cv.delete to delete duplicates
 */

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useDuplicateCandidates, useCandidateProfile } from '@/hooks/useCandidateProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessDenied, EmptyState } from '@/components/admin/shared';
import { Users, AlertTriangle, Eye, Merge, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { DuplicateCandidateComparison } from './DuplicateCandidateComparison';

export function DuplicateResolutionPanel() {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { data: duplicates, isLoading, error } = useDuplicateCandidates();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Permission check
  if (!permissionsLoading && !hasPermission('cv.view')) {
    return (
      <AccessDenied
        message="You don't have permission to view duplicate candidates."
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
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
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
          <p className="text-destructive">Failed to load duplicates</p>
        </CardContent>
      </Card>
    );
  }
  
  const canMerge = hasPermission('cv.update');
  const canDelete = hasPermission('cv.delete');
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Duplicate Resolution</CardTitle>
          {duplicates && duplicates.length > 0 && (
            <Badge variant="secondary">{duplicates.length}</Badge>
          )}
        </div>
        <CardDescription>
          Review and resolve potential duplicate candidate records
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!duplicates || duplicates.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Duplicates Found"
            description="All candidate records appear to be unique."
          />
        ) : (
          <div className="space-y-4">
            {duplicates.map(duplicate => (
              <DuplicateRow
                key={duplicate.id}
                duplicate={duplicate}
                isExpanded={expandedId === duplicate.id}
                onToggle={() => setExpandedId(
                  expandedId === duplicate.id ? null : duplicate.id
                )}
                canMerge={canMerge}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DuplicateRowProps {
  duplicate: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cv_file_url: string | null;
    created_at: string;
    source: string | null;
    potential_duplicate_of: string | null;
  };
  isExpanded: boolean;
  onToggle: () => void;
  canMerge: boolean;
  canDelete: boolean;
}

function DuplicateRow({ duplicate, isExpanded, onToggle, canMerge, canDelete }: DuplicateRowProps) {
  const { data: primaryCandidate, isLoading } = useCandidateProfile(
    isExpanded ? duplicate.potential_duplicate_of : null
  );
  
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Summary Row */}
      <div 
        className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-medium">{duplicate.name}</p>
            <p className="text-sm text-muted-foreground">{duplicate.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            {duplicate.source || 'Unknown source'}
          </Badge>
          <Badge variant="secondary">
            {new Date(duplicate.created_at).toLocaleDateString()}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {/* Expanded Comparison */}
      {isExpanded && (
        <div className="border-t">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : primaryCandidate ? (
            <DuplicateCandidateComparison
              primaryCandidate={primaryCandidate}
              duplicateCandidate={{
                id: duplicate.id,
                name: duplicate.name,
                email: duplicate.email,
                phone: duplicate.phone,
                cv_file_url: duplicate.cv_file_url,
                created_at: duplicate.created_at,
                source: duplicate.source,
              }}
              canMerge={canMerge}
              canDelete={canDelete}
            />
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>Primary candidate not found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                disabled={!canMerge}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear Duplicate Flag
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DuplicateResolutionPanel;
