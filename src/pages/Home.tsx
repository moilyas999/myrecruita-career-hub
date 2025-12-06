import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

const sectors = [
  "All Sectors",
  "Accounting & Finance",
  "Banking",
  "Legal",
  "Technology",
  "Healthcare",
  "Engineering",
  "Marketing",
  "Human Resources",
];

const locations = [
  "All Locations",
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Bristol",
  "Edinburgh",
  "Glasgow",
  "Remote",
];

interface Job {
  id: string;
  title: string;
  location: string;
  sector: string;
  salary: string | null;
  created_at: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [sector, setSector] = useState("All Sectors");
  const [location, setLocation] = useState("All Locations");
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);

  useSEO({
    title: "MyRecruita | Expert Recruitment Agency UK",
    description: "APSCo-accredited recruitment agency connecting exceptional talent with leading UK employers. Expert recruiters in finance, legal, technology and more.",
    keywords: ["recruitment agency UK", "job search", "APSCo accredited", "finance jobs", "legal jobs", "technology jobs"],
  });

  useEffect(() => {
    const fetchLatestJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('id, title, location, sector, salary, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (data) {
        setLatestJobs(data);
      }
    };

    fetchLatestJobs();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (sector !== "All Sectors") params.set("sector", sector);
    if (location !== "All Locations") params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Height BlueLegal Style */}
      <section className="relative min-h-screen flex items-end justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/lovable-uploads/ec4f6544-f68f-47e5-80eb-2cbb2b7b0790.png')`,
          }}
        />
        
        {/* Subtle Gradient Overlay - Only at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Hero Content - Positioned at bottom */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* Headline */}
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-light text-center mb-10">
            Check out the roles we're handling right now
          </h1>
          
          {/* Search Bar - Floating individual elements */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full sm:w-56 h-12 px-4 bg-white text-foreground rounded-lg border-0 text-sm focus:ring-2 focus:ring-accent outline-none appearance-none cursor-pointer"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, 
                backgroundRepeat: 'no-repeat', 
                backgroundPosition: 'right 12px center' 
              }}
            >
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full sm:w-56 h-12 px-4 bg-white text-foreground rounded-lg border-0 text-sm focus:ring-2 focus:ring-accent outline-none appearance-none cursor-pointer"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, 
                backgroundRepeat: 'no-repeat', 
                backgroundPosition: 'right 12px center' 
              }}
            >
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            
            <Button 
              onClick={handleSearch}
              variant="accent"
              className="w-full sm:w-auto h-12 px-8 rounded-lg font-medium"
            >
              Submit
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-foreground mb-3">Latest Jobs</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestJobs.map((job) => (
              <Link 
                key={job.id} 
                to={`/jobs/${job.id}`}
                className="group bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-3">
                  {job.title}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                  {job.salary && (
                    <>
                      <span className="mx-2">|</span>
                      <span>{job.salary}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-4">{formatDate(job.created_at)}</p>
                <span className="text-accent text-sm font-medium group-hover:underline">
                  View more →
                </span>
              </Link>
            ))}
          </div>
          
          {latestJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs available at the moment. Check back soon!</p>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg">
              <Link to="/jobs">
                View All Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light text-primary-foreground mb-4">
            Ready to take the next step in your career?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-2xl mx-auto">
            Whether you're looking for your next role or seeking the best talent for your team, 
            we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="accent" size="lg">
              <Link to="/submit-cv">
                Submit Your CV
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/post-job">
                Post a Job
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
