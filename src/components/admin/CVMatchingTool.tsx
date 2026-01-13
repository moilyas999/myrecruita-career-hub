import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Download, 
  Eye, 
  MapPin, 
  Briefcase, 
  Clock, 
  ChevronRight,
  FileText,
  Target,
  AlertCircle,
  Sparkles,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchCandidate {
  id: string;
  name: string;
  email: string;
  job_title: string | null;
  sector: string | null;
  location: string | null;
  years_experience: number | null;
  cv_score: number | null;
  cv_file_url: string | null;
}

interface MatchResult {
  cv_id: string;
  match_score: number;
  explanation: string;
  skills_matched: string[];
  skills_missing: string[];
  candidate: MatchCandidate;
}

interface MatchResponse {
  matches: MatchResult[];
  total_evaluated: number;
  filters_applied: Record<string, unknown>;
  message?: string;
}

const SECTORS = [
  "Accounting & Finance",
  "Banking",
  "Financial Services",
  "Insurance",
  "Technology",
  "Healthcare",
  "Legal",
  "Human Resources",
  "Marketing",
  "Sales",
  "Operations",
  "Other",
];

const LOCATIONS = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Liverpool",
  "Bristol",
  "Edinburgh",
  "Glasgow",
  "Cardiff",
  "Remote",
];

export default function CVMatchingTool() {
  const [jobDescription, setJobDescription] = useState("");
  const [location, setLocation] = useState("all");
  const [sector, setSector] = useState("all");
  const [minExperience, setMinExperience] = useState([0]);
  const [maxResults, setMaxResults] = useState("25");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleMatch = useCallback(async () => {
    if (jobDescription.trim().length < 50) {
      toast.error("Please enter a more detailed job description (at least 50 characters)");
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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/match-cv-to-job`,
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
  }, [jobDescription, location, sector, minExperience, maxResults]);

  const handleDownloadCV = useCallback((url: string | null, name: string) => {
    if (!url) {
      toast.error("CV file not available");
      return;
    }
    window.open(url, "_blank");
  }, []);

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "outline";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

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
            className="flex-1 min-h-[200px] resize-none"
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
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="space-y-4 pr-4">
                {matchResults.matches.map((match, index) => (
                  <div 
                    key={match.cv_id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <h4 className="font-semibold truncate">
                            {match.candidate.name}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {match.candidate.job_title || "No title specified"}
                        </p>
                      </div>
                      <Badge 
                        variant={getScoreBadgeVariant(match.match_score)}
                        className={cn(
                          "text-lg font-bold px-3 py-1",
                          getScoreColor(match.match_score)
                        )}
                      >
                        {match.match_score}%
                      </Badge>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {match.candidate.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {match.candidate.location}
                        </span>
                      )}
                      {match.candidate.sector && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {match.candidate.sector}
                        </span>
                      )}
                      {match.candidate.years_experience && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {match.candidate.years_experience} years
                        </span>
                      )}
                      {match.candidate.cv_score && (
                        <Badge variant="outline" className="text-xs">
                          CV Score: {match.candidate.cv_score}
                        </Badge>
                      )}
                    </div>

                    {/* Explanation */}
                    <p className="text-sm text-foreground/90">
                      {match.explanation}
                    </p>

                    {/* Skills */}
                    <div className="space-y-2">
                      {match.skills_matched.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {match.skills_matched.slice(0, 5).map((skill) => (
                            <Badge 
                              key={skill} 
                              variant="default"
                              className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {match.skills_matched.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{match.skills_matched.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                      {match.skills_missing.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {match.skills_missing.slice(0, 3).map((skill) => (
                            <Badge 
                              key={skill} 
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              Missing: {skill}
                            </Badge>
                          ))}
                          {match.skills_missing.length > 3 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              +{match.skills_missing.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadCV(match.candidate.cv_file_url, match.candidate.name)}
                        disabled={!match.candidate.cv_file_url}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download CV
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`/admin?tab=talent&search=${encodeURIComponent(match.candidate.email)}`, "_blank")}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View Profile
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
