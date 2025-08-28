import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Calendar, Building2, Star, Filter, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

const FeaturedTalent = () => {
  const { toast } = useToast();
  
  useSEO({
    title: "Hire Talent | Pre-vetted Professionals in Finance, IT & Law | MyRecruita",
    description: "Browse top candidate profiles ready for placement. Hire top-tier professionals in the UK across legal, tech, and finance sectors.",
    canonical: `${window.location.origin}/featured-talent`
  });
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [requestFormData, setRequestFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
    candidateRef: ""
  });

  useEffect(() => {
    fetchTalents();
  }, []);

  const fetchTalents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load talent profiles. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setTalents(data || []);
      
      // Extract unique sectors and locations from talents
      const uniqueSectors = [...new Set(data?.map(talent => talent.sector).filter(Boolean))];
      const uniqueLocations = [...new Set(data?.map(talent => talent.preferred_location).filter(Boolean))];
      
      setSectors(uniqueSectors);
      setLocations(uniqueLocations);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load talent profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTalents = talents.filter(talent => {
    const matchesSector = selectedSector === "all" || talent.sector === selectedSector;
    const matchesLocation = selectedLocation === "all" || talent.preferred_location === selectedLocation;
    return matchesSector && matchesLocation;
  });

  const toggleExpanded = (talentId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(talentId)) {
      newExpanded.delete(talentId);
    } else {
      newExpanded.add(talentId);
    }
    setExpandedCards(newExpanded);
  };

  const handleRequestProfile = (candidateRef: string) => {
    setRequestFormData({ ...requestFormData, candidateRef });
  };

  const submitRequest = async () => {
    try {
      const { error } = await supabase
        .from('talent_requests')
        .insert({
          talent_id: requestFormData.candidateRef,
          contact_name: requestFormData.name,
          company_name: requestFormData.company,
          email: requestFormData.email,
          message: requestFormData.message
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit request. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile Request Sent!",
        description: "We'll send you the full candidate profile within 24 hours.",
      });
      
      // Send admin notification
      try {
        await supabase.functions.invoke('send-admin-notification', {
          body: {
            type: 'talent_request',
            data: {
              talent_id: requestFormData.candidateRef,
              contact_name: requestFormData.name,
              company_name: requestFormData.company,
              email: requestFormData.email,
              message: requestFormData.message
            }
          }
        });
      } catch (notificationError) {
        console.log('Admin notification failed (non-critical):', notificationError);
      }
      
      setRequestFormData({ name: "", company: "", email: "", message: "", candidateRef: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Featured Talent</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover exceptional professionals ready for their next challenge. All candidates are pre-screened, 
            interviewed, and available for immediate opportunities.
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 bg-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-semibold text-accent">For Employers Only</h3>
                <p className="text-sm text-muted-foreground">
                  Access detailed profiles of pre-vetted candidates. All talent has been thoroughly interviewed and reference-checked.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Filter Candidates</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Button onClick={() => {
                setSelectedSector("all");
                setSelectedLocation("all");
              }} variant="outline">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? "Loading candidates..." : `Showing ${filteredTalents.length} of ${talents.length} candidates`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading candidates...</span>
          </div>
        )}

        {/* Talent Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredTalents.map((talent, index) => (
              <Card key={talent.id} className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{talent.role}</CardTitle>
                      <p className="text-sm text-muted-foreground">{talent.reference_id}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{talent.sector}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{talent.years_experience}+ years experience</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{talent.preferred_location}</span>
                    </div>
                  </div>
                  {talent.details && (
                    <div className="mt-3">
                      <p className={`text-sm text-muted-foreground ${expandedCards.has(talent.id) ? '' : 'line-clamp-3'}`}>
                        {talent.details}
                      </p>
                      {talent.details.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(talent.id)}
                          className="text-primary text-sm mt-1 hover:underline flex items-center gap-1"
                        >
                          {expandedCards.has(talent.id) ? (
                            <>
                              Show less <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              Show more <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => handleRequestProfile(talent.id)}
                      >
                        Request Full Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Candidate Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm font-semibold">Candidate Reference: {talent.reference_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {talent.role} - {talent.sector}
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="request-name">Your Name</Label>
                          <Input
                            id="request-name"
                            value={requestFormData.name}
                            onChange={(e) => setRequestFormData({...requestFormData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="request-company">Company</Label>
                          <Input
                            id="request-company"
                            value={requestFormData.company}
                            onChange={(e) => setRequestFormData({...requestFormData, company: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="request-email">Email</Label>
                          <Input
                            id="request-email"
                            type="email"
                            value={requestFormData.email}
                            onChange={(e) => setRequestFormData({...requestFormData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="request-message">Message (Optional)</Label>
                          <Textarea
                            id="request-message"
                            value={requestFormData.message}
                            onChange={(e) => setRequestFormData({...requestFormData, message: e.target.value})}
                            placeholder="Tell us about the opportunity or any specific requirements..."
                            rows={3}
                          />
                        </div>
                        <Button 
                          onClick={submitRequest}
                          disabled={!requestFormData.name || !requestFormData.company || !requestFormData.email}
                          className="w-full"
                        >
                          Request Profile
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Requests are sent to help@myrecruita.com and you'll receive the full profile within 24 hours.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && filteredTalents.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">No candidates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or browse all available talent.
              </p>
              <Button onClick={() => {
                setSelectedSector("all");
                setSelectedLocation("all");
              }}>
                Show All Candidates
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Looking for Specific Talent?</h3>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Can't find exactly what you're looking for? Let us know your requirements and we'll source the perfect candidates for your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Contact Our Team
              </Button>
              <Button size="lg" variant="secondary">
                Submit Job Brief
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeaturedTalent;