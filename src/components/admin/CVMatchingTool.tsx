import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Wand2, 
  FileText,
  Target,
  AlertCircle,
  Sparkles,
  Filter,
  Info,
  Loader2
} from "lucide-react";
import { 
  MatchResponse, 
  MatchWeights, 
  DEFAULT_WEIGHTS, 
  SECTORS, 
  LOCATIONS 
} from "./cv-matching/types";
import { MatchResultCard } from "./cv-matching/MatchResultCard";
import { WeightsPanel } from "./cv-matching/WeightsPanel";
import { MatchingErrorBoundary } from "./cv-matching/MatchingErrorBoundary";
import { AccessDenied } from "./cv-matching/AccessDenied";
import { usePermissions } from "@/hooks/usePermissions";

function CVMatchingToolContent() {
  const [jobDescription, setJobDescription] = useState("");
  const [location, setLocation] = useState("all");
  const [sector, setSector] = useState("all");
  const [minExperience, setMinExperience] = useState([0]);
  const [maxResults, setMaxResults] = useState("25");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Advanced weights state
  const [showWeightsPanel, setShowWeightsPanel] = useState(false);
  const [weights, setWeights] = useState<MatchWeights>(DEFAULT_WEIGHTS);
  
  // Memoize total weight calculation
  const totalWeight = useMemo(() => 
    weights.skills + weights.experience + weights.seniority + weights.location,
    [weights]
  );

  const handleMatch = useCallback(async () => {
    if (jobDescription.trim().length < 50) {
      toast.error("Please enter a more detailed job description (at least 50 characters)");
      return;
    }

    // Validate weights sum to 100
    if (totalWeight !== 100) {
      toast.error(`Weights must sum to 100% (currently ${totalWeight}%)`);
      return;
    }

    setIsMatching(true);
    setHasSearched(true);
    setMatchResults(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to use this feature");
        return;
      }

      const response = await fetch(
        `https://yoegksjmdtubnkgdtttj.supabase.co/functions/v1/match-cv-to-job`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            jobDescription: jobDescription.trim(),
            filters: {
              location: location !== "all" ? location : undefined,
              sector: sector !== "all" ? sector : undefined,
              minExperience: minExperience[0] > 0 ? minExperience[0] : undefined,
              maxResults: parseInt(maxResults),
            },
            weights: {
              skills: weights.skills / 100,
              experience: weights.experience / 100,
              seniority: weights.seniority / 100,
              location: weights.location / 100,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (response.status === 402) {
          toast.error("AI usage limit reached. Please contact administrator.");
        } else {
          toast.error(errorData.error || "Failed to find matches");
        }
        return;
      }

      const data: MatchResponse = await response.json();
      setMatchResults(data);
      
      if (data.matches.length === 0) {
        toast.info(data.message || "No matching candidates found");
      } else {
        toast.success(`Found ${data.matches.length} matching candidates`);
      }
    } catch (error) {
      console.error("Matching error:", error);
      toast.error("An error occurred while matching. Please try again.");
    } finally {
      setIsMatching(false);
    }
  }, [jobDescription, location, sector, minExperience, maxResults, weights, totalWeight]);

  const handleDownloadCV = useCallback((url: string | null, name: string) => {
    if (!url) {
      toast.error("CV file not available");
      return;
    }
    window.open(url, "_blank");
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Panel - Job Input */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Job Description
          </CardTitle>
          <CardDescription>
            Enter the job description to find matching candidates from your CV database
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <Textarea
            placeholder="Paste the full job description here...&#10;&#10;Include details about:&#10;• Required skills and qualifications&#10;• Years of experience needed&#10;• Location and work arrangement&#10;• Key responsibilities"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="flex-1 min-h-[180px] resize-none"
          />

          {/* Filters */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Optional Filters
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any location</SelectItem>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sector</label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any sector</SelectItem>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Minimum Experience: {minExperience[0]} years
              </label>
              <Slider
                value={minExperience}
                onValueChange={setMinExperience}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Results</label>
              <Select value={maxResults} onValueChange={setMaxResults}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Weights Panel */}
          <div className="pt-2">
            <WeightsPanel
              weights={weights}
              onWeightsChange={setWeights}
              isOpen={showWeightsPanel}
              onOpenChange={setShowWeightsPanel}
            />
          </div>

          <Button 
            onClick={handleMatch} 
            disabled={isMatching || jobDescription.trim().length < 50}
            className="w-full mt-4"
            size="lg"
          >
            {isMatching ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Finding Matches...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Find Matching Candidates
              </>
            )}
          </Button>

          {jobDescription.length > 0 && jobDescription.length < 50 && (
            <p className="text-sm text-muted-foreground text-center">
              {50 - jobDescription.length} more characters needed
            </p>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Results */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Matching Candidates
            {matchResults && matchResults.matches.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {matchResults.matches.length} found
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {matchResults 
              ? `Evaluated ${matchResults.total_evaluated} candidates`
              : "Results will appear here after matching"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {/* Parsed Requirements Info */}
          {matchResults?.parsed_requirements && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Info className="h-4 w-4" />
                <span className="font-medium">Parsed Job Requirements</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Title: </span>
                  <span>{matchResults.parsed_requirements.job_title || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Level: </span>
                  <span className="capitalize">{matchResults.parsed_requirements.seniority_level || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Experience: </span>
                  <span>
                    {matchResults.parsed_requirements.min_experience}
                    {matchResults.parsed_requirements.max_experience 
                      ? `-${matchResults.parsed_requirements.max_experience}` 
                      : "+"} years
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  <span>{matchResults.parsed_requirements.location || "Any"}</span>
                </div>
              </div>
              {matchResults.parsed_requirements.required_skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {matchResults.parsed_requirements.required_skills.slice(0, 5).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {matchResults.parsed_requirements.required_skills.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{matchResults.parsed_requirements.required_skills.length - 5} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {isMatching ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasSearched ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Wand2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-medium text-lg mb-2">Ready to Match</h3>
              <p className="text-muted-foreground max-w-sm">
                Enter a job description on the left and click "Find Matching Candidates" to discover your best fits
              </p>
            </div>
          ) : matchResults && matchResults.matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-medium text-lg mb-2">No Matches Found</h3>
              <p className="text-muted-foreground max-w-sm">
                {matchResults.message || "Try adjusting your filters or using a different job description"}
              </p>
            </div>
          ) : matchResults ? (
            <ScrollArea className="h-[calc(100vh-420px)]">
              <div className="space-y-4 pr-4">
                {matchResults.matches.map((match, index) => (
                  <MatchResultCard
                    key={match.cv_id}
                    match={match}
                    index={index}
                    onDownloadCV={handleDownloadCV}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

// Main export with permission check and error boundary
export default function CVMatchingTool() {
  const { hasPermission, isLoading } = usePermissions();
  
  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Check for matching.view permission
  if (!hasPermission('matching.view')) {
    return <AccessDenied 
      message="You don't have permission to access the CV Matching Tool." 
      requiredPermission="matching.view" 
    />;
  }
  
  return (
    <MatchingErrorBoundary>
      <CVMatchingToolContent />
    </MatchingErrorBoundary>
  );
}
