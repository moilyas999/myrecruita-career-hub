import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Building2 } from "lucide-react";

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const jobs = [
    {
      id: "MR-2025-001",
      title: "Senior Software Engineer",
      company: "TechCorp Solutions",
      location: "London, UK",
      sector: "Technology",
      type: "Full-time",
      salary: "£70,000 - £90,000",
      description: "Lead development of cutting-edge applications using modern frameworks and cloud technologies.",
      posted: "2 days ago"
    },
    {
      id: "MR-2025-002",
      title: "Marketing Director",
      company: "Creative Agency Ltd",
      location: "Manchester, UK",
      sector: "Marketing",
      type: "Full-time",
      salary: "£65,000 - £80,000",
      description: "Drive marketing strategy and lead a dynamic team in a fast-growing creative environment.",
      posted: "1 week ago"
    },
    {
      id: "MR-2025-003",
      title: "Financial Analyst",
      company: "Investment Partners",
      location: "Birmingham, UK",
      sector: "Finance",
      type: "Full-time",
      salary: "£45,000 - £55,000",
      description: "Analyze financial data and provide insights to support strategic business decisions.",
      posted: "3 days ago"
    },
    {
      id: "MR-2025-004",
      title: "Operations Manager",
      company: "Logistics Express",
      location: "Leeds, UK",
      sector: "Operations",
      type: "Full-time",
      salary: "£50,000 - £65,000",
      description: "Oversee daily operations and optimize processes for maximum efficiency.",
      posted: "5 days ago"
    },
    {
      id: "MR-2025-005",
      title: "UX Designer",
      company: "Digital Innovations",
      location: "Remote",
      sector: "Design",
      type: "Full-time",
      salary: "£40,000 - £55,000",
      description: "Create exceptional user experiences for web and mobile applications.",
      posted: "1 day ago"
    },
    {
      id: "MR-2025-006",
      title: "Sales Director",
      company: "Global Sales Corp",
      location: "Edinburgh, UK",
      sector: "Sales",
      type: "Full-time",
      salary: "£80,000 - £100,000",
      description: "Lead sales strategy and drive revenue growth across multiple markets.",
      posted: "4 days ago"
    }
  ];

  const sectors = ["Technology", "Marketing", "Finance", "Operations", "Design", "Sales"];
  const locations = ["London, UK", "Manchester, UK", "Birmingham, UK", "Leeds, UK", "Edinburgh, UK", "Remote"];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Explore Roles</h1>
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
              <Button className="w-full">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} opportunities
          </p>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job, index) => (
            <Card key={job.id} className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.posted}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="secondary">{job.sector}</Badge>
                      <Badge variant="outline">{job.type}</Badge>
                      <Badge className="bg-accent text-accent-foreground">{job.salary}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-2">Ref: {job.id}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{job.description}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="flex-1">
                    <Link to={`/jobs/${job.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredJobs.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all available positions.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedSector("all");
                setSelectedLocation("all");
              }}>
                Clear Filters
              </Button>
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
    </div>
  );
};

export default Jobs;