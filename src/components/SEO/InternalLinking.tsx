import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ExternalLink } from "lucide-react";

interface RelatedLink {
  title: string;
  url: string;
  description: string;
  category: string;
}

interface InternalLinkingProps {
  currentPage: string;
  className?: string;
}

const linkSuggestions: Record<string, RelatedLink[]> = {
  "/": [
    { title: "Browse Jobs", url: "/jobs", description: "Explore latest opportunities across Finance, Tech & Legal sectors", category: "Jobs" },
    { title: "Submit Your CV", url: "/submit-cv", description: "Get noticed by top employers with our professional CV service", category: "Candidates" },
    { title: "About MyRecruita", url: "/about", description: "Learn about our mission and expert recruitment team", category: "Company" },
    { title: "For Employers", url: "/employers", description: "Find exceptional talent for your organization", category: "Employers" }
  ],
  "/jobs": [
    { title: "Submit Your CV", url: "/submit-cv", description: "Apply to exclusive opportunities in your field", category: "Application" },
    { title: "Career Partner Service", url: "/career-partner", description: "Get professional career guidance and CV optimization", category: "Services" },
    { title: "Featured Talent", url: "/featured-talent", description: "See examples of successful placements", category: "Success Stories" }
  ],
  "/about": [
    { title: "Contact Our Team", url: "/contact", description: "Get in touch with our recruitment experts", category: "Contact" },
    { title: "Browse Jobs", url: "/jobs", description: "See current opportunities from our partner companies", category: "Opportunities" },
    { title: "Read Our Blog", url: "/blog", description: "Industry insights and career advice from experts", category: "Insights" }
  ],
  "/submit-cv": [
    { title: "Career Partner", url: "/career-partner", description: "Professional CV review and LinkedIn optimization", category: "Services" },
    { title: "Browse Jobs", url: "/jobs", description: "View current opportunities matching your profile", category: "Jobs" },
    { title: "Featured Talent", url: "/featured-talent", description: "See how we've helped professionals like you", category: "Success" }
  ],
  "/employers": [
    { title: "Post a Job", url: "/post-job", description: "Advertise your vacancy to qualified candidates", category: "Hiring" },
    { title: "Featured Talent", url: "/featured-talent", description: "Browse pre-screened professional candidates", category: "Talent" },
    { title: "Contact Us", url: "/contact", description: "Discuss your recruitment needs with our team", category: "Consultation" }
  ],
  "/contact": [
    { title: "Submit Your CV", url: "/submit-cv", description: "Start your job search with professional support", category: "Candidates" },
    { title: "Post a Job", url: "/post-job", description: "Find the right talent for your organization", category: "Employers" },
    { title: "About Us", url: "/about", description: "Learn more about our recruitment expertise", category: "Company" }
  ]
};

export function InternalLinking({ currentPage, className = "" }: InternalLinkingProps) {
  const suggestions = linkSuggestions[currentPage] || [];
  
  if (suggestions.length === 0) return null;

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Explore More
          </h2>
          <p className="text-muted-foreground">
            Discover related services and opportunities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((link, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {link.category}
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  <Link to={link.url} className="flex items-center gap-2">
                    {link.title}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}