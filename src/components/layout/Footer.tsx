import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* CTA Banner */}
      <div className="bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-accent-foreground">Ready to find your next opportunity?</h3>
              <p className="text-accent-foreground/80">Submit your CV and let us connect you with top employers.</p>
            </div>
            <Button asChild variant="default" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/submit-cv">
                Submit Your CV
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/4121491c-ffff-4dec-82a6-3b0fa454c578.png" 
                alt="MyRecruita" 
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Your trusted APSCo-accredited recruitment partner, connecting exceptional talent with leading employers across the UK.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/company/myrecruita" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-accent transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-accent">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/submit-cv" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Submit CV
                </Link>
              </li>
              <li>
                <Link to="/career-partner" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Career Partner
                </Link>
              </li>
              <li>
                <Link to="/featured-talent" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Featured Talent
                </Link>
              </li>
              <li>
                <Link to="/post-job" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Post a Job
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-accent">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/career-partner" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  CV Review & Enhancement
                </Link>
              </li>
              <li>
                <Link to="/career-partner" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  LinkedIn Optimization
                </Link>
              </li>
              <li>
                <Link to="/career-partner" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Interview Preparation
                </Link>
              </li>
              <li>
                <Link to="/career-partner" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Career Coaching
                </Link>
              </li>
              <li>
                <Link to="/employers" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Talent Sourcing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-accent">Contact</h3>
            <div className="space-y-3 text-sm">
              <a href="mailto:help@myrecruita.com" className="flex items-center space-x-2 text-primary-foreground/70 hover:text-accent transition-colors">
                <Mail className="h-4 w-4" />
                <span>help@myrecruita.com</span>
              </a>
              <a href="mailto:careers@myrecruita.com" className="flex items-center space-x-2 text-primary-foreground/70 hover:text-accent transition-colors">
                <Mail className="h-4 w-4" />
                <span>careers@myrecruita.com</span>
              </a>
              <a href="tel:+442080584490" className="flex items-center space-x-2 text-primary-foreground/70 hover:text-accent transition-colors">
                <Phone className="h-4 w-4" />
                <span>+44 208 058 4490</span>
              </a>
              <div className="flex items-center space-x-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                <span>Unit 124, Barking Enterprise Centre, IG11</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/50">
          <p>&copy; 2025 MyRecruita. All rights reserved. | APSCo Accredited Member</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
