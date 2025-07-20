import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Briefcase, Award, CheckCircle } from "lucide-react";

const Home = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior Marketing Manager",
      content: "MyRecruita found me the perfect role within 2 weeks. Their career support was exceptional!",
      company: "Tech Solutions Ltd"
    },
    {
      name: "Michael Chen",
      role: "Finance Director",
      content: "The team understood exactly what I was looking for and delivered beyond expectations.",
      company: "Global Finance Corp"
    },
    {
      name: "Emma Williams",
      role: "Operations Manager",
      content: "Outstanding service from start to finish. I couldn't have asked for better support.",
      company: "Logistics Plus"
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Expert Career Guidance",
      description: "Personalized support from experienced recruitment professionals"
    },
    {
      icon: Briefcase,
      title: "Exclusive Opportunities",
      description: "Access to premium roles not advertised elsewhere"
    },
    {
      icon: Award,
      title: "Proven Success Rate",
      description: "95% of our candidates secure interviews within 30 days"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-hero-gradient text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Your Career Success
              <span className="block text-accent">Starts Here</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Connect with top employers, enhance your career prospects, and unlock your potential with MyRecruita's expert recruitment services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3">
                <Link to="/jobs">
                  Explore Roles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-3">
                <Link to="/submit-cv">
                  Submit Your CV
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose MyRecruita?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're more than just a recruitment agency - we're your career partners committed to your success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Highlight */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Your Career Partner
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our comprehensive career support services are designed to elevate your professional profile and maximize your opportunities.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Free CV Reviews & Enhancement</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>LinkedIn Profile Optimization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Mock Interview Preparation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Personalized Career Coaching</span>
                </li>
              </ul>
              <Button asChild className="bg-accent hover:bg-accent/90">
                <Link to="/career-partner">
                  Learn More About Our Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Card className="p-6 shadow-card-lg">
                <CardContent>
                  <h3 className="text-xl font-semibold mb-4 text-primary">Featured for Employers</h3>
                  <p className="text-muted-foreground mb-4">
                    Looking for exceptional talent? Browse our curated selection of pre-screened professionals ready for their next challenge.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/featured-talent">
                      View Featured Talent
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              Hear from professionals who found their dream roles through MyRecruita
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 shadow-card animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-accent">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of professionals who have advanced their careers with MyRecruita
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link to="/submit-cv">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;