import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Find Jobs", path: "/jobs" },
    { name: "Submit CV", path: "/submit-cv" },
    { name: "Career Partner", path: "/career-partner" },
    { name: "Featured Talent", path: "/featured-talent" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === "/";

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? "bg-background shadow-md border-b border-border"
          : "bg-primary"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/lovable-uploads/4121491c-ffff-4dec-82a6-3b0fa454c578.png" 
              alt="MyRecruita - Expert Recruitment Agency" 
              className={`h-10 w-auto object-contain flex-shrink-0 transition-all ${
                isScrolled || !isHomePage ? "" : "brightness-0 invert"
              }`}
              style={{ minWidth: 'auto' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                  isActive(item.path)
                    ? isScrolled || !isHomePage
                      ? "text-accent bg-accent/10"
                      : "text-accent"
                    : isScrolled || !isHomePage
                      ? "text-foreground hover:text-accent hover:bg-muted"
                      : "text-primary-foreground/90 hover:text-accent"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden xl:flex items-center space-x-3">
            <Button 
              asChild 
              size="sm" 
              variant="accent"
              className="rounded-md"
            >
              <Link to="/post-job">
                Post a Job
              </Link>
            </Button>
            <a 
              href="tel:+442080584490" 
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                isScrolled || !isHomePage
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "bg-accent text-accent-foreground hover:bg-accent/90"
              }`}
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center space-x-2">
            <a 
              href="tel:+442080584490" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground"
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className={isScrolled || !isHomePage ? "text-foreground" : "text-primary-foreground"}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="xl:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                    isActive(item.path)
                      ? "text-accent bg-accent/10"
                      : "text-foreground hover:text-accent hover:bg-muted"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Button asChild size="sm" variant="accent" className="w-full">
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
