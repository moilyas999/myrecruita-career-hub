import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail, Phone, MapPin, FileText, Briefcase, MessageSquare, Users, Sparkles } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

type SubmissionType = 'cv' | 'job_application' | 'contact' | 'career_partner' | 'employer_job' | 'talent_request' | 'default';

interface SubmissionConfig {
  icon: typeof CheckCircle;
  title: string;
  message: string;
  nextSteps: string[];
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
}

const submissionConfigs: Record<SubmissionType, SubmissionConfig> = {
  cv: {
    icon: FileText,
    title: "CV Submitted Successfully!",
    message: "Your CV is now with our recruitment team. We'll review your profile and match you with suitable opportunities.",
    nextSteps: [
      "Our team reviews your CV within 24 hours",
      "We identify roles matching your experience",
      "A recruiter contacts you with opportunities"
    ],
    primaryAction: { label: "Explore Available Roles", href: "/explore-roles" },
    secondaryAction: { label: "Career Partner Services", href: "/career-partner" }
  },
  job_application: {
    icon: Briefcase,
    title: "Application Submitted!",
    message: "Your application has been received. Our team will review it and get back to you shortly.",
    nextSteps: [
      "Recruiter reviews your application",
      "We assess your fit for the role",
      "You'll hear back within 48 hours"
    ],
    primaryAction: { label: "Browse More Jobs", href: "/explore-roles" },
    secondaryAction: { label: "Track Applications", href: "/my-applications" }
  },
  contact: {
    icon: MessageSquare,
    title: "Message Received!",
    message: "Thank you for reaching out. A member of our team will respond to your inquiry promptly.",
    nextSteps: [
      "Your message is logged in our system",
      "Relevant team member is assigned",
      "Response within 2 hours (business hours)"
    ],
    primaryAction: { label: "Browse Jobs", href: "/explore-roles" },
    secondaryAction: { label: "Learn About Us", href: "/about" }
  },
  career_partner: {
    icon: Users,
    title: "Career Partner Request Received!",
    message: "We're excited to help you with your career journey. Our career experts will be in touch soon.",
    nextSteps: [
      "Career specialist reviews your request",
      "Personalized consultation scheduled",
      "Tailored career guidance provided"
    ],
    primaryAction: { label: "Explore Jobs", href: "/explore-roles" },
    secondaryAction: { label: "Submit Your CV", href: "/submit-cv" }
  },
  employer_job: {
    icon: Sparkles,
    title: "Job Posted Successfully!",
    message: "Your vacancy is now with our team. We'll start sourcing candidates immediately.",
    nextSteps: [
      "Our recruiters review the role",
      "We source matching candidates",
      "Shortlist delivered within 5 days"
    ],
    primaryAction: { label: "View Featured Talent", href: "/featured-talent" },
    secondaryAction: { label: "Post Another Job", href: "/post-job" }
  },
  talent_request: {
    icon: Users,
    title: "Talent Request Received!",
    message: "We've received your interest in this candidate. Our team will arrange an introduction.",
    nextSteps: [
      "We verify candidate availability",
      "Candidate is briefed about your interest",
      "Introduction arranged within 24 hours"
    ],
    primaryAction: { label: "Browse More Talent", href: "/featured-talent" },
    secondaryAction: { label: "Post a Job", href: "/post-job" }
  },
  default: {
    icon: CheckCircle,
    title: "Thank You!",
    message: "We've received your submission. A member of our team will be in touch shortly.",
    nextSteps: [
      "Your submission is being processed",
      "Relevant team is notified",
      "We'll respond as soon as possible"
    ],
    primaryAction: { label: "Return to Homepage", href: "/" },
    secondaryAction: { label: "Explore Available Roles", href: "/explore-roles" }
  }
};

const ThankYou = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const submissionType = (searchParams.get('type') as SubmissionType) || 'default';
  const config = submissionConfigs[submissionType] || submissionConfigs.default;
  const Icon = config.icon;

  useSEO({
    title: "Thank You | MyRecruita",
    description: "Thank you for your submission. We'll be in touch shortly.",
    canonical: `${window.location.origin}/thank-you`
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center p-8 shadow-card-lg overflow-hidden relative">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <CardContent className="pt-6">
            {/* Success Animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              <div className="relative w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center">
                <Icon className="h-12 w-12 text-accent" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {config.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              {config.message}
            </p>

            {/* What happens next */}
            <Card className="bg-secondary/50 p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold mb-4 text-center">What Happens Next?</h2>
              <div className="space-y-3">
                {config.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="bg-muted/50 p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Contact Us Anytime</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background">
                  <Mail className="h-5 w-5 text-accent" />
                  <div className="text-center">
                    <p className="font-medium text-xs text-muted-foreground">Email</p>
                    <a 
                      href="mailto:help@myrecruita.com" 
                      className="text-accent hover:underline font-medium"
                    >
                      help@myrecruita.com
                    </a>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background">
                  <Phone className="h-5 w-5 text-accent" />
                  <div className="text-center">
                    <p className="font-medium text-xs text-muted-foreground">Phone</p>
                    <a 
                      href="tel:+442080584490" 
                      className="text-accent hover:underline font-medium"
                    >
                      +44 208 058 4490
                    </a>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background">
                  <MapPin className="h-5 w-5 text-accent" />
                  <div className="text-center">
                    <p className="font-medium text-xs text-muted-foreground">Office</p>
                    <span className="font-medium">Barking, IG11</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Continue exploring while we process your submission:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to={config.primaryAction.href}>
                    {config.primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link to={config.secondaryAction.href}>
                    {config.secondaryAction.label}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Response Time */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Response time: <strong className="text-foreground">Within 2 hours during business hours</strong>
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
