import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Target, Award, Heart, ArrowRight, CheckCircle, Sparkles, Star, TrendingUp } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  useSEO({
    title: "About MyRecruita | Expert Finance, Tech & Legal Recruiters",
    description: "Learn about MyRecruita's mission to connect skilled professionals with high-impact roles in Finance, IT, and Law.",
    canonical: `${window.location.origin}/about`
  });

  const values = [
    {
      icon: Users,
      title: "People First",
      description: "We believe in the power of human potential and are committed to unlocking opportunities for every individual."
    },
    {
      icon: Target,
      title: "Excellence",
      description: "We deliver exceptional results through expertise, dedication, and attention to detail in everything we do."
    },
    {
      icon: Award,
      title: "Integrity",
      description: "Trust is the foundation of our relationships. We operate with transparency and honesty at all times."
    },
    {
      icon: Heart,
      title: "Partnership",
      description: "We're not just recruiters – we're career partners invested in your long-term success and growth."
    }
  ];

  const stats = [
    { number: "500+", label: "Successful Placements" },
    { number: "95%", label: "Client Satisfaction Rate" },
    { number: "200+", label: "Partner Companies" },
    { number: "24hrs", label: "Average Response Time" }
  ];

  const team = [
    {
      name: "Zuhair Nadeem",
      role: "Founder & Managing Director",
      description: "With 5 years of experience in audit and accountancy — including time at Grant Thornton — Zuhair brings technical precision and commercial insight to every hiring conversation. After launching Kingsley Hart, a finance-specialist recruitment firm, he expanded into multi-sector hiring through MyRecruita, now serving industries across Tech, Legal, HR, Finance, and Executive Search.",
      specialties: ["Finance & Accountancy", "Executive Search", "Strategic Partnerships", "Multi-Sector Recruitment"]
    },
    {
      name: "Seaneen Ahmed",
      role: "Co-Founder & Director",
      description: "Seaneen brings a wealth of experience in healthcare recruitment, having spent several years building trusted partnerships with providers across the UK. As Co-Founder of MyRecruita, he plays a central role in shaping strategy, nurturing client relationships, and driving candidate-first delivery across all sectors.",
      specialties: ["Client Relationships", "Healthcare Recruitment", "Executive Search", "Business Development & Partnerships"]
    },
    {
      name: "Shamsul Islam",
      role: "Head of Candidate Engagement & Client Success",
      description: "With over a decade of experience in operations, project delivery, and stakeholder engagement, Shamsul brings a unique perspective to the recruitment process. He previously managed multi-agency partnerships on high-profile projects such as the Grenfell Tower Recovery, and led operational delivery at national charities and service centres. At MyRecruita, Shamsul ensures seamless candidate experiences, leads interview support workshops, and supports relationship-building with both clients and community networks.",
      specialties: ["Candidate Experience & Onboarding", "Client Engagement & Retention", "Interview Support & Workshops"]
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              About MyRecruita
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-8">
              Recruitment Reimagined
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
              We didn't set out to be just another recruitment agency — we built MyRecruita to raise the standard of what recruitment should be.
            </p>
            
            <div className="relative max-w-6xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20 p-8 lg:p-12 animate-scale-in" style={{animationDelay: '0.2s'}}>
                <div className="space-y-6 text-left">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    With a foundation rooted in professional services, MyRecruita was born out of two distinct but powerful journeys. One of our founders spent several years in audit at Grant Thornton, before launching Kingsley Hart, a specialist finance and accountancy recruitment firm. The other brings deep expertise from the healthcare recruitment space, having supported some of the UK's leading providers through complex hiring demands.
                  </p>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Together, we combined our backgrounds, insight and networks to build a multi-sector recruitment company that actually understands both sides of the hiring table — from candidate experience to client delivery.
                  </p>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Starting in finance, MyRecruita now recruits across Tech, Legal, HR, Finance, Healthcare, and Executive roles — with a growing presence across the UK and beyond.
                  </p>
                  
                  <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 mt-8">
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      We're not generalists. We're specialists who scale.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 transition-all duration-300 hover-scale animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardContent className="pt-6">
                    <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mb-20 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-50" />
              <CardContent className="relative z-10 p-8 lg:p-16 text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Target className="h-4 w-4" />
                  Our Mission
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Redefining Great Recruitment
                </h2>
                <div className="space-y-6 max-w-5xl mx-auto">
                  <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                    We exist to bridge the gap between high-calibre talent and forward-thinking organisations, by offering tailored, relationship-led recruitment that goes beyond just filling a role.
                  </p>
                  <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                    At MyRecruita, we believe job searches shouldn't be overwhelming, and hiring shouldn't be hit-or-miss. That's why we focus on real conversations, sector expertise, and a deep understanding of people — to deliver matches that actually make sense.
                  </p>
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mt-8">
                    <p className="text-xl lg:text-2xl font-bold text-foreground">
                      Because people deserve careers they're proud of. And businesses deserve teams that drive results.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Values Section */}
          <div className="mb-20">
            <div className="text-center mb-16 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                Our Values
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                What Drives Us
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide everything we do and define who we are as an organization.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="group p-8 bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 transition-all duration-500 hover-scale animate-fade-in overflow-hidden relative" style={{animationDelay: `${index * 0.1 + 0.6}s`}}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="relative z-10 pt-6">
                    <div className="flex items-start space-x-6 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <value.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                          {value.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-20">
            <div className="text-center mb-16 animate-fade-in" style={{animationDelay: '0.8s'}}>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Users className="h-4 w-4" />
                Meet Our Team
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Expert Professionals
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                Experienced professionals dedicated to your success, bringing together expertise from across industries.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="group bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 transition-all duration-500 hover-scale animate-fade-in overflow-hidden relative" style={{animationDelay: `${index * 0.2 + 0.9}s`}}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="relative z-10 text-center pb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                      {member.name}
                    </CardTitle>
                    <p className="text-accent font-semibold text-lg">{member.role}</p>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground mb-6 leading-relaxed text-center">
                      {member.description}
                    </p>
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4">
                      <p className="text-sm font-semibold mb-3 text-center">Specialties:</p>
                      <div className="space-y-2">
                        {member.specialties.map((specialty, specialtyIndex) => (
                          <div key={specialtyIndex} className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{specialty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="animate-fade-in" style={{animationDelay: '1.2s'}}>
            <Card className="bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
              <CardContent className="relative z-10 p-8 lg:p-16 text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <TrendingUp className="h-4 w-4" />
                  Start Your Journey
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Transform Your Future?</h3>
                <p className="text-primary-foreground/90 mb-8 max-w-3xl mx-auto text-lg lg:text-xl leading-relaxed">
                  Whether you're looking for your next career opportunity or searching for exceptional talent, 
                  we're here to help you achieve your goals with personalized, expert guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                    <Link to="/submit-cv">
                      Find Your Next Role
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                    <Link to="/contact">
                      Contact Our Team
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;