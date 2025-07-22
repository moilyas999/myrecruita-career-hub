import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Target, Award, Heart, ArrowRight, CheckCircle } from "lucide-react";
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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">About Us</h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            We didn't set out to be just another recruitment agency — we built MyRecruita to raise the standard of what recruitment should be.
          </p>
          <div className="w-24 h-1 bg-accent mx-auto mb-12"></div>
          
          <div className="max-w-5xl mx-auto text-left space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              With a foundation rooted in professional services, MyRecruita was born out of two distinct but powerful journeys. One of our founders spent several years in audit at Grant Thornton, before launching Kingsley Hart, a specialist finance and accountancy recruitment firm. The other brings deep expertise from the healthcare recruitment space, having supported some of the UK's leading providers through complex hiring demands.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Together, we combined our backgrounds, insight and networks to build a multi-sector recruitment company that actually understands both sides of the hiring table — from candidate experience to client delivery.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Starting in finance, MyRecruita now recruits across Tech, Legal, HR, Finance, Healthcare, and Executive roles — with a growing presence across the UK and beyond.
            </p>
            
            <p className="text-xl font-semibold text-foreground text-center mt-8">
              We're not generalists. We're specialists who scale.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="mb-16 shadow-card-lg">
          <CardContent className="p-8 lg:p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6">
              To redefine what great recruitment feels like — for both candidates and employers.
            </p>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6">
              We exist to bridge the gap between high-calibre talent and forward-thinking organisations, by offering tailored, relationship-led recruitment that goes beyond just filling a role.
            </p>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6">
              At MyRecruita, we believe job searches shouldn't be overwhelming, and hiring shouldn't be hit-or-miss. That's why we focus on real conversations, sector expertise, and a deep understanding of people — to deliver matches that actually make sense.
            </p>
            <p className="text-lg font-semibold text-foreground max-w-4xl mx-auto leading-relaxed">
              Because people deserve careers they're proud of. And businesses deserve teams that drive results.
            </p>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6 shadow-card animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
              <CardContent className="pt-6">
                <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do and define who we are as an organization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <value.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">{value.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced professionals dedicated to your success, bringing together expertise from across industries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardHeader>
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-center">{member.name}</CardTitle>
                  <p className="text-center text-accent font-semibold">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-center">{member.description}</p>
                  <div>
                    <p className="text-sm font-semibold mb-2">Specialties:</p>
                    <div className="space-y-1">
                      {member.specialties.map((specialty, specialtyIndex) => (
                        <div key={specialtyIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-accent" />
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
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Whether you're looking for your next career opportunity or searching for exceptional talent, 
              we're here to help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link to="/submit-cv">
                  Find Your Next Role
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/contact">
                  Contact Our Team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;