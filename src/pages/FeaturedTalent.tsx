import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Calendar, Building2, Star, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FeaturedTalent = () => {
  const { toast } = useToast();
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [requestFormData, setRequestFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
    candidateRef: ""
  });

  const talents = [
    {
      id: "TAL-MR-001",
      role: "Senior Software Engineer",
      sector: "Technology",
      experience: "7+ years",
      location: "London, UK",
      skills: ["React", "Node.js", "AWS", "TypeScript"],
      availability: "Immediate",
      summary: "Full-stack developer with expertise in modern web technologies and cloud architecture."
    },
    {
      id: "TAL-MR-002",
      role: "Marketing Director",
      sector: "Marketing",
      experience: "10+ years",
      location: "Manchester, UK",
      skills: ["Digital Marketing", "Brand Strategy", "Team Leadership", "Analytics"],
      availability: "4 weeks",
      summary: "Strategic marketing leader with proven track record in driving growth for B2B companies."
    },
    {
      id: "TAL-MR-003",
      role: "Financial Controller",
      sector: "Finance",
      experience: "8+ years",
      location: "Birmingham, UK",
      skills: ["IFRS", "Financial Reporting", "SAP", "Risk Management"],
      availability: "6 weeks",
      summary: "Experienced finance professional with expertise in corporate finance and compliance."
    },
    {
      id: "TAL-MR-004",
      role: "Operations Manager",
      sector: "Operations",
      experience: "6+ years",
      location: "Leeds, UK",
      skills: ["Process Optimization", "Lean Six Sigma", "Team Management", "KPI Tracking"],
      availability: "2 weeks",
      summary: "Results-driven operations leader focused on efficiency and continuous improvement."
    },
    {
      id: "TAL-MR-005",
      role: "UX/UI Designer",
      sector: "Design",
      experience: "5+ years",
      location: "Remote",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      availability: "Immediate",
      summary: "Creative designer with strong focus on user-centered design and modern interfaces."
    },
    {
      id: "TAL-MR-006",
      role: "Sales Director",
      sector: "Sales",
      experience: "12+ years",
      location: "Edinburgh, UK",
      skills: ["Enterprise Sales", "CRM", "Team Leadership", "Negotiation"],
      availability: "8 weeks",
      summary: "Senior sales executive with expertise in B2B enterprise solutions and team development."
    },
    {
      id: "TAL-MR-007",
      role: "Data Scientist",
      sector: "Technology",
      experience: "4+ years",
      location: "London, UK",
      skills: ["Python", "Machine Learning", "SQL", "Tableau"],
      availability: "3 weeks",
      summary: "Data scientist specializing in predictive analytics and business intelligence solutions."
    },
    {
      id: "TAL-MR-008",
      role: "HR Director",
      sector: "Human Resources",
      experience: "9+ years",
      location: "Manchester, UK",
      skills: ["Talent Management", "Change Management", "HRIS", "Employment Law"],
      availability: "6 weeks",
      summary: "Strategic HR leader with experience in organizational development and talent acquisition."
    },
    {
      id: "TAL-MR-009",
      role: "Project Manager",
      sector: "Operations",
      experience: "7+ years",
      location: "Remote",
      skills: ["Agile", "Scrum", "Risk Management", "Stakeholder Management"],
      availability: "4 weeks",
      summary: "Certified project manager with track record of delivering complex initiatives on time and budget."
    }
  ];

  const sectors = ["Technology", "Marketing", "Finance", "Operations", "Design", "Sales", "Human Resources"];
  const locations = ["London, UK", "Manchester, UK", "Birmingham, UK", "Leeds, UK", "Edinburgh, UK", "Remote"];

  const filteredTalents = talents.filter(talent => {
    const matchesSector = selectedSector === "all" || talent.sector === selectedSector;
    const matchesLocation = selectedLocation === "all" || talent.location === selectedLocation;
    return matchesSector && matchesLocation;
  });

  const handleRequestProfile = (candidateRef: string) => {
    setRequestFormData({ ...requestFormData, candidateRef });
  };

  const submitRequest = () => {
    toast({
      title: "Profile Request Sent!",
      description: "We'll send you the full candidate profile within 24 hours.",
    });
    setRequestFormData({ name: "", company: "", email: "", message: "", candidateRef: "" });
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
            Showing {filteredTalents.length} of {talents.length} candidates
          </p>
        </div>

        {/* Talent Grid */}
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
                    <p className="text-sm text-muted-foreground">{talent.id}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{talent.sector}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{talent.experience} experience</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{talent.location}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{talent.summary}</p>
                
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Key Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">Availability:</span>
                  <Badge className={talent.availability === "Immediate" ? "bg-accent" : "bg-muted"}>
                    {talent.availability}
                  </Badge>
                </div>

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
                        <p className="text-sm font-semibold">Candidate Reference: {requestFormData.candidateRef}</p>
                        <p className="text-sm text-muted-foreground">
                          {talents.find(t => t.id === requestFormData.candidateRef)?.role} - {talents.find(t => t.id === requestFormData.candidateRef)?.sector}
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
                        Requests are sent to zuhair@myrecruita.com and you'll receive the full profile within 24 hours.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredTalents.length === 0 && (
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