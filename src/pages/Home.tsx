import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Briefcase, Award, CheckCircle, Building2, Linkedin, Shield, ExternalLink, BadgeCheck, Users2, BookOpen, TrendingUp, Heart } from "lucide-react";
import { useSEO, injectStructuredData } from "@/hooks/useSEO";
import { StructuredData, generateOrganizationSchema, generateLocalBusinessSchema } from "@/components/SEO/StructuredData";
import { useEffect } from "react";
import heroBackground from "@/assets/hero-background.jpg";

const Home = () => {
  useSEO({
    title: "MyRecruita | APSCo-Accredited Specialist Recruitment in Finance, IT & Law",
    description: "APSCo-accredited recruitment specialists connecting top talent with leading employers in Finance, IT, Legal, HR and Executive sectors across the UK. Join 500+ successful placements.",
    canonical: window.location.origin,
    keywords: ["recruitment agency UK", "finance jobs", "IT careers", "legal recruitment", "executive search", "APSCo accredited", "talent acquisition"],
    schema: generateOrganizationSchema()
  });

  useEffect(() => {
    // Inject additional structured data for better SEO
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
              APSCo-Accredited Recruitment Specialists
              <span className="block text-blue-400">Where Ambition Meets Opportunity</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Connecting exceptional talent with leading employers in Finance, IT, Legal, HR & Executive sectors across the UK. Join 500+ successful career transformations.
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

      {/* APSCo Accreditation Section */}
      <section className="py-16 bg-gradient-to-br from-secondary/30 to-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              <span>Professional Accreditation</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Proud APSCo Member
            </h2>
            <p className="text-xl text-accent font-medium mb-2">
              Setting the highest standard in UK recruitment
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              MyRecruita is a certified member of APSCo UK, the leading professional body for recruitment agencies. 
              APSCo membership demonstrates our commitment to excellence, ethics, and professionalism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            {/* APSCo Logo Card */}
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up bg-gradient-to-br from-white to-secondary/20">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <img 
                    src="/lovable-uploads/da3135d3-42af-409b-8a27-fee3dafb8969.png" 
                    alt="APSCo Trusted Partner Recruitment Accreditation"
                    className="h-16 w-auto object-contain mx-auto mb-4"
                  />
                  <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    <BadgeCheck className="h-4 w-4 mr-2" />
                    Verified Member
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Official Member</h3>
                <p className="text-sm text-muted-foreground">
                  Certified professional staffing company recognized by APSCo UK
                </p>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up bg-gradient-to-br from-primary/5 to-accent/5" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">View Our Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See MyRecruita's official APSCo member profile
                </p>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Industry Excellence</h4>
                    <p className="text-sm text-muted-foreground">Recognised as part of a trusted global recruitment body.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Code of Conduct</h4>
                    <p className="text-sm text-muted-foreground">We follow APSCo's strict professional standards.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.5s'}}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Client Confidence</h4>
                    <p className="text-sm text-muted-foreground">Assurance of ethical, compliant, and high-quality service.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Candidate Care</h4>
                    <p className="text-sm text-muted-foreground">Protecting candidate rights and ensuring fair processes.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.7s'}}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Continuous Improvement</h4>
                    <p className="text-sm text-muted-foreground">Ongoing training, resources, and best-practice updates.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: '0.8s'}}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">APSCo Values</h4>
                    <p className="text-sm text-muted-foreground">Dynamic, knowledgeable, professional, and supportive approach to recruitment.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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