import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const ThankYou = () => {
  useSEO({
    title: "Thank You | MyRecruita",
    description: "Thank you for your submission. We'll be in touch shortly.",
    canonical: `${window.location.origin}/thank-you`
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center p-8 shadow-card-lg">
          <CardContent>
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              ✅ Thank You!
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              We've received your submission. A member of our team will be in touch shortly.
            </p>

            <Card className="bg-secondary/50 p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact Us Anytime</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <div>
                    <strong>General Inquiries:</strong>{" "}
                    <a 
                      href="mailto:help@myrecruita.com" 
                      className="text-accent hover:text-accent/80 transition-colors"
                    >
                      help@myrecruita.com
                    </a>
                  </div>
                  <div>
                    <strong>Career Opportunities:</strong>{" "}
                    <a 
                      href="mailto:careers@myrecruita.com" 
                      className="text-accent hover:text-accent/80 transition-colors"
                    >
                      careers@myrecruita.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <Phone className="h-5 w-5 text-accent" />
                  <div>
                    <strong>Phone:</strong>{" "}
                    <a 
                      href="tel:+442080584490" 
                      className="text-accent hover:text-accent/80 transition-colors"
                    >
                      +44 208 058 4490
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <MapPin className="h-5 w-5 text-accent" />
                  <div>
                    <strong>Address:</strong> Office 124, Barking Enterprise Centre, IG11
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Continue exploring opportunities while we review your submission:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/">
                    Return to Homepage
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link to="/explore-roles">
                    Explore Available Roles
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Response time: <strong>Within 2 hours during business hours</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Monday - Friday: 9AM - 6PM | Saturday: 10AM - 2PM
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;