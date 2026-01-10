import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, FileText, Briefcase, ArrowLeft, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const quickLinks = [
    {
      icon: Home,
      title: "Homepage",
      description: "Back to the main page",
      href: "/",
    },
    {
      icon: Briefcase,
      title: "Browse Jobs",
      description: "Explore available opportunities",
      href: "/explore-roles",
    },
    {
      icon: FileText,
      title: "Submit CV",
      description: "Let us find you a role",
      href: "/submit-cv",
    },
    {
      icon: HelpCircle,
      title: "Contact Us",
      description: "Get help from our team",
      href: "/contact",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[150px] sm:text-[200px] font-bold text-primary/5 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-accent/10 rounded-full p-6 animate-float">
              <Search className="h-16 w-16 text-accent" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or may have been moved. 
          Let's get you back on track.
        </p>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/explore-roles">
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </Link>
          </Button>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Card 
              key={link.href} 
              className="group hover:shadow-card-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <Link to={link.href}>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                    <link.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{link.title}</h3>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Go Back Link */}
        <div className="mt-8">
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back to previous page
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{" "}
            <a 
              href="mailto:help@myrecruita.com" 
              className="text-accent hover:underline font-medium"
            >
              help@myrecruita.com
            </a>
            {" "}or call{" "}
            <a 
              href="tel:+442080584490" 
              className="text-accent hover:underline font-medium"
            >
              +44 208 058 4490
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
