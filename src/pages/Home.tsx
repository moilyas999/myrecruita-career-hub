import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Users, Briefcase, Award, CheckCircle, Building2, Linkedin, Shield, ExternalLink, BadgeCheck, TrendingUp, Heart, Search, MapPin } from "lucide-react";
import { useSEO, injectStructuredData } from "@/hooks/useSEO";
import { StructuredData, generateOrganizationSchema, generateLocalBusinessSchema } from "@/components/SEO/StructuredData";
import { useEffect, useState } from "react";
import heroBackground from "@/assets/hero-background.jpg";

const Home = () => {
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");

  useSEO({
    title: "MyRecruita | APSCo-Accredited Specialist Recruitment in Finance, IT & Law",
    description: "APSCo-accredited recruitment specialists connecting top talent with leading employers in Finance, IT, Legal, HR and Executive sectors across the UK. Join 500+ successful placements.",
    canonical: window.location.origin,
    keywords: ["recruitment agency UK", "finance jobs", "IT careers", "legal recruitment", "executive search", "APSCo accredited", "talent acquisition"],
    schema: generateOrganizationSchema()
  });

  useEffect(() => {
    const webSiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "MyRecruita",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.origin}/jobs?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
    
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Professional Recruitment Services",
      "description": "Specialist recruitment and talent acquisition services for Finance, IT, Legal, HR and Executive roles",
      "provider": {
        "@type": "Organization",
        "name": "MyRecruita",
        "url": window.location.origin
      },
      "serviceType": "Recruitment and Staffing",
      "areaServed": {
        "@type": "Country",
        "name": "United Kingdom"
      }
    };
    
    injectStructuredData(webSiteSchema, "website-schema");
    injectStructuredData(serviceSchema, "service-schema");
    injectStructuredData(generateLocalBusinessSchema(), "local-business-schema");
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

  const sectors = ["Finance", "IT & Technology", "Legal", "HR", "Executive"];
  const locations = ["London", "Manchester", "Birmingham", "Leeds", "Remote"];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (sector) params.set("sector", sector);
    if (location) params.set("location", location);
    window.location.href = `/jobs${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section - BlueLegal style */}
      <section 
        className="relative text-white min-h-[85vh] flex items-center -mt-16"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
              Find Your Next
              <span className="block text-accent">Career Opportunity</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-10 text-white/90">
              Connecting exceptional talent with leading employers in Finance, IT, Legal, HR & Executive sectors across the UK.
            </p>
            
            {/* Job Search Bar - BlueLegal style */}
            <div className="bg-white rounded-lg p-2 shadow-xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger className="w-full h-12 bg-background border-border text-foreground">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <SelectValue placeholder="Select Sector" className="text-muted-foreground" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {sectors.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full h-12 bg-background border-border text-foreground">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <SelectValue placeholder="Select Location" className="text-muted-foreground" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {locations.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSearch}
                  variant="accent" 
                  size="lg"
                  className="h-12 px-8"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Jobs
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="outline-white" size="lg">
                <a href="https://calendly.com/zuhair-myrecruita/30min" target="_blank" rel="noopener noreferrer">
                  Book a Call
                </a>
              </Button>
              <Button asChild variant="solid-white" size="lg">
                <Link to="/submit-cv">
                  Submit Your CV
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* APSCo Accreditation Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              <span className="accent-underline">Proud APSCo Member</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-6">
              MyRecruita is a certified member of APSCo UK, demonstrating our commitment to excellence, ethics, and professionalism in recruitment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 border-0">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <img 
                    src="/lovable-uploads/4eb1ab2b-840d-4af3-b4bf-c47f13a76a4f.png" 
                    alt="APSCo Trusted Partner Recruitment Accreditation"
                    className="h-16 w-auto object-contain mx-auto mb-4"
                  />
                  <div className="inline-flex items-center bg-accent/10 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                    <BadgeCheck className="h-4 w-4 mr-2 text-accent" />
                    Verified Member
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Official Member</h3>
                <p className="text-sm text-muted-foreground">
                  Certified professional staffing company recognized by APSCo UK
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 border-0">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">View Our Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See MyRecruita's official APSCo member profile
                </p>
                <Button asChild variant="accent">
                  <a 
                    href="https://uk.apsco.org/discover-apsco/recruitment-members/myrecruita-ltd" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View APSCo Profile
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Industry Excellence", desc: "Recognised as part of a trusted global recruitment body." },
              { icon: CheckCircle, title: "Code of Conduct", desc: "We follow APSCo's strict professional standards." },
              { icon: Building2, title: "Client Confidence", desc: "Assurance of ethical, compliant, and high-quality service." },
              { icon: Heart, title: "Candidate Care", desc: "Protecting candidate rights and ensuring fair processes." },
              { icon: TrendingUp, title: "Continuous Improvement", desc: "Ongoing training, resources, and best-practice updates." },
              { icon: Award, title: "APSCo Values", desc: "Dynamic, knowledgeable, professional, and supportive approach." },
            ].map((item, index) => (
              <Card key={index} className="shadow-card hover:shadow-card-lg transition-all duration-300 border-0">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              <span className="accent-underline">Your Career, Powered by MyRecruita</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
              From exclusive roles and expert guidance to personalised support at every stage — MyRecruita is built to help ambitious professionals secure the jobs they deserve, faster.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 shadow-card hover:shadow-card-lg transition-all duration-300 border-0">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Highlight */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                <span className="accent-underline">Your Career Partner</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 mt-6">
                Our comprehensive career support services are designed to elevate your professional profile and maximize your opportunities.
              </p>
              <ul className="space-y-3 mb-8">
                {["Free CV Reviews & Enhancement", "LinkedIn Profile Optimization", "Mock Interview Preparation", "Personalized Career Coaching"].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="accent">
                <Link to="/career-partner">
                  Learn More About Our Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div>
              <Card className="p-6 shadow-card-lg border-0">
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
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Hiring Top Talent?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Connect with exceptional candidates across Finance, IT, and Legal sectors. 
            Submit your job requirements and let our specialists find the perfect match.
          </p>
          <Button asChild size="lg" variant="accent">
            <Link to="/post-job">
              Post a Job
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">
              <span className="accent-underline">Success Stories</span>
            </h2>
            <p className="text-lg text-muted-foreground mt-6">
              Hear from professionals who found their dream roles through MyRecruita
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 shadow-card border-0">
                <CardContent>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-border pt-4">
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
      <section className="py-12 bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-background rounded-lg p-8 shadow-card">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#0077B5] rounded-lg flex items-center justify-center">
                <Linkedin className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3">Stay Connected</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Follow our LinkedIn page to keep up to date with live roles, industry insights, and connect directly with our recruiters.
            </p>
            <Button asChild className="bg-[#0077B5] hover:bg-[#005885]">
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
          <p className="text-xl mb-8 text-primary-foreground/80">
            Join thousands of professionals who have advanced their careers with MyRecruita
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="accent">
              <Link to="/submit-cv">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline-white" size="lg">
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
