import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UserPlus, FileText, Mail, Phone, Briefcase, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import CVScoreBadge from '@/components/admin/CVScoreBadge';

interface CVSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  job_title: string | null;
  location: string | null;
  sector: string | null;
  cv_score: number | null;
  cv_file_url: string | null;
}

interface CandidateSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCandidate: (candidate: CVSubmission) => void;
}

// Simple debounce hook for search
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function CandidateSearchDialog({
  open,
  onOpenChange,
  onSelectCandidate,
}: CandidateSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounceValue(searchQuery, 300);

  // Fetch candidates from CV database
  const { data: candidates, isLoading } = useQuery({
    queryKey: [...queryKeys.cvSubmissions, 'search', debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from('cv_submissions')
        .select('id, name, email, phone, job_title, location, sector, cv_score, cv_file_url')
        .order('created_at', { ascending: false })
        .limit(20);

      if (debouncedSearch.trim()) {
        const search = `%${debouncedSearch.trim()}%`;
        query = query.or(`name.ilike.${search},email.ilike.${search},job_title.ilike.${search}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CVSubmission[];
    },
    enabled: open,
  });

  const handleSelect = useCallback((candidate: CVSubmission) => {
    onSelectCandidate(candidate);
    setSearchQuery('');
  }, [onSelectCandidate]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Candidate to Pipeline
          </DialogTitle>
          <DialogDescription>
            Search your CV database to find and add candidates to a job pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or job title..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-[350px] pr-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            ) : candidates && candidates.length > 0 ? (
              <div className="space-y-2">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{candidate.name}</h4>
                          {candidate.cv_score !== null && (
                            <CVScoreBadge score={candidate.cv_score} size="sm" />
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {candidate.job_title && (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{candidate.job_title}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{candidate.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 flex-wrap">
                            {candidate.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                            {candidate.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span>{candidate.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {candidate.sector && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {candidate.sector}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleSelect(candidate)}
                          className="gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Add
                        </Button>
                        {candidate.cv_file_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(candidate.cv_file_url!, '_blank')}
                            className="gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            CV
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="font-medium text-muted-foreground">
                  {searchQuery ? 'No candidates found' : 'Search for candidates'}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {searchQuery 
                    ? 'Try a different search term'
                    : 'Enter a name, email, or job title to search'
                  }
                </p>
              </div>
            )}
          </ScrollArea>

          {candidates && candidates.length === 20 && (
            <p className="text-xs text-muted-foreground text-center">
              Showing first 20 results. Refine your search for more specific results.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
