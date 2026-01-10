import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Building2, Heart, FileText, RefreshCw, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { JobCardSkeleton } from "@/components/ui/skeleton-card";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";

const Jobs = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  useSEO({
    title: "Current Job Vacancies UK | Finance, IT & Legal Careers 2025 | MyRecruita",
    description: "Discover latest job openings in Finance, IT, Legal and Executive sectors. Browse 100+ active roles with competitive salaries. Apply with MyRecruita - APSCo accredited recruiters.",
    canonical: `${window.location.origin}/jobs`,
    keywords: ["jobs UK 2025", "finance careers", "IT jobs London", "legal recruitment", "executive positions", "professional jobs", "current vacancies"]
  });

  // Initialize from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedSector, setSelectedSector] = useState(searchParams.get("sector") || "all");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "all");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedSector !== "all") params.set("sector", selectedSector);
    if (selectedLocation !== "all") params.set("location", selectedLocation);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedSector, selectedLocation, setSearchParams]);

  useEffect(() => {
    fetchJobs();
    // Load saved jobs from localStorage
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setJobs(data || []);
      
      // Extract unique sectors and locations from jobs
      const uniqueSectors = [...new Set(data?.map(job => job.sector).filter(Boolean))];
      const uniqueLocations = [...new Set(data?.map(job => job.location).filter(Boolean))];
      
      setSectors(uniqueSectors);
      setLocations(uniqueLocations);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = (jobId: string) => {
    const newSavedJobs = savedJobs.includes(jobId) 
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    
    setSavedJobs(newSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
    
    toast({
      title: savedJobs.includes(jobId) ? "Job Removed" : "Job Saved",
      description: savedJobs.includes(jobId) 
        ? "Job removed from your saved list" 
        : "Job saved to your list for later viewing",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSector("all");
    setSelectedLocation("all");
  };

  const activeFilterCount = [
    searchTerm,
    selectedSector !== "all" ? selectedSector : null,
    selectedLocation !== "all" ? selectedLocation : null
  ].filter(Boolean).length;

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === "all" || job.sector === selectedSector;
    const matchesLocation = selectedLocation === "all" || job.location === selectedLocation;
    
    return matchesSearch && matchesSector && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Explore Job Vacancies</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover exciting career opportunities with leading companies across various industries.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant={activeFilterCount > 0 ? "secondary" : "outline"}
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Filters
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? "Loading jobs..." : `Showing ${filteredJobs.length} of ${jobs.length} opportunities`}
          </p>
        </div>

        {/* Loading State with Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Job Listings */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job, index) => (
              <Card key={job.id} className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center space-x-1 max-w-full">
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{job.salary}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="secondary">{job.sector}</Badge>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-muted-foreground mb-2">Ref: {job.reference_id}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{job.description}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link to={`/roles/${job.reference_id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleSaveJob(job.id)}
                    >
                      <Heart className={`mr-2 h-4 w-4 ${savedJobs.includes(job.id) ? 'fill-current text-red-500' : ''}`} />
                      {savedJobs.includes(job.id) ? 'Saved' : 'Save Job'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Enhanced Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <Card className="text-center p-12 shadow-card">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any jobs matching your criteria. Try adjusting your filters or submit your CV and we'll notify you when new positions become available.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={clearFilters} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Clear All Filters
                </Button>
                <Button asChild className="gap-2">
                  <Link to="/submit-cv">
                    <FileText className="h-4 w-4" />
                    Submit Your CV
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="mt-12 bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h3>
            <p className="text-primary-foreground/90 mb-6">
              Submit your CV and let us match you with exclusive opportunities that align with your career goals.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link to="/submit-cv">
                Submit Your CV
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ScrollToTopButton />
    </div>
  );
};

export default Jobs;
