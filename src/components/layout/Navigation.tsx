import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Submit CV", path: "/submit-cv" },
    { name: "Your Career Partner", path: "/career-partner" },
    { name: "Featured Talent", path: "/featured-talent" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/lovable-uploads/4121491c-ffff-4dec-82a6-3b0fa454c578.png" 
              alt="MyRecruita - Your Job. Our Mission." 
              className="h-12 w-auto object-contain flex-shrink-0"
              style={{ minWidth: 'auto' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-6 2xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive(item.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex space-x-2 flex-shrink-0">
              <Button asChild size="sm" variant="outline" className="whitespace-nowrap">
                <Link to="/jobs">
                  Find a Job
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap">
                <Link to="/post-job">
                  Post a Job
                </Link>
              </Button>
            </div>
          </div>

          {/* Medium/Large Screen Navigation - Buttons Only */}
          <div className="hidden md:flex xl:hidden items-center space-x-2">
            <Button asChild size="sm" variant="outline" className="whitespace-nowrap">
              <Link to="/jobs">
                Find a Job
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap">
              <Link to="/post-job">
                Post a Job
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2 space-y-2">
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/jobs" onClick={() => setIsOpen(false)}>
                    Find a Job
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link to="/post-job" onClick={() => setIsOpen(false)}>
                    Post a Job
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;