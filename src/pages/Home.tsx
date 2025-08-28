import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Briefcase, Award, CheckCircle, Building2, Linkedin } from "lucide-react";
import { useSEO, injectStructuredData } from "@/hooks/useSEO";
import { useEffect } from "react";
import heroBackground from "@/assets/hero-background.jpg";

const Home = () => {
  useSEO({
    title: "MyRecruita | Specialist Recruitment in Finance, IT & Law",
    description: "Looking for a career move or talent in finance, tech, or legal sectors? MyRecruita is your trusted partner for recruitment in the UK and beyond.",
    canonical: window.location.origin
  });

  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "MyRecruita",
      "description": "Specialist recruitment agency for Finance, IT, and Legal sectors",
      "url": window.location.origin,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+44 208 058 4490",
        "contactType": "Customer Service"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Office 124, Barking Enterprise Centre",
        "postalCode": "IG11",
        "addressCountry": "GB"
      }
    };
    
    injectStructuredData(organizationSchema, "organization-schema");
  }, []);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior Marketing Manager",
      content: "MyRecruita found me the perfect role within 2 weeks. Their career support was exceptional!"
    },
    {
      name: "Michael Chen",
      role: "Finance Director",
      content: "The team understood exactly what I was looking for and delivered beyond expectations."
    },
    {
      name: "Emma Williams",
      role: "Operations Manager",
      content: "Outstanding service from start to finish. I couldn't have asked for better support."
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Strategic Career Mentorship",
      description: "Partner with specialists who understand your industry, your goals, and how to get you there — fast."
    },
    {
      icon: Briefcase,
      title: "Access to Hidden Roles",
      description: "We unlock roles reserved for vetted talent — curated, confidential, career-changing."
    },
    {
      icon: Award,
      title: "Efficiency You Can Trust",
      description: "95% of our candidates secure interviews within 14 days."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 lg:py-32 min-h-[90vh] flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Where Ambition Meets
              <span className="block text-blue-400">Opportunity</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Empowering ambitious professionals to connect, grow, and lead — across Tech, Legal, HR, Finance & Executive sectors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3">
                <Link to="/jobs">
                  Explore Live Roles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-primary bg-white hover:bg-white/90 hover:text-primary text-lg px-8 py-3">
                <a href="https://calendly.com/zuhair-myrecruita/30min" target="_blank" rel="noopener noreferrer">
                  Book a call with a recruiter
                </a>
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
              Your Career, Powered by Myrecruita
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From exclusive roles and expert guidance to personalised support at every stage — MyRecruita is built to help ambitious professionals secure the jobs they deserve, faster.
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
              <Button asChild className="bg-accent hover:bg-accent/90 text-white">
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

      {/* Employer Hiring Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Hiring Top Talent?
          </h2>
          <h3 className="text-2xl lg:text-3xl font-semibold text-primary mb-8">
            Submit Vacancy Now
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with exceptional candidates across Finance, IT, and Legal sectors. 
            Submit your job requirements and let our specialists find the perfect match for your organization.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3">
            <Link to="/post-job">
              Post a Job
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <Linkedin className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3">Stay Connected</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Follow our LinkedIn page to keep up to date with live roles, industry insights, and connect directly with our recruiters.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a 
                href="https://www.linkedin.com/company/myrecruita" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Linkedin className="mr-2 h-4 w-4" />
                Follow MyRecruita
              </a>
            </Button>
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
            <Button asChild variant="outline" size="lg" className="border-white text-primary hover:bg-white hover:text-primary">
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