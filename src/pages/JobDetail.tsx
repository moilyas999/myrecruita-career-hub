import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Clock, Building2, Phone, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JobDetail = () => {
  const { jobId } = useParams();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  // Mock job data - in real app, this would be fetched based on jobId
  const job = {
    id: jobId || "MR-2025-001",
    title: "Senior Software Engineer",
    company: "TechCorp Solutions",
    location: "London, UK",
    sector: "Technology",
    type: "Full-time",
    salary: "£70,000 - £90,000",
    posted: "2 days ago",
    description: "We are seeking an experienced Senior Software Engineer to join our innovative development team. You'll be responsible for designing and implementing scalable solutions using modern technologies.",
    requirements: [
      "5+ years of experience in software development",
      "Strong proficiency in React, Node.js, and TypeScript",
      "Experience with cloud platforms (AWS/Azure)",
      "Knowledge of microservices architecture",
      "Excellent problem-solving and communication skills",
      "Bachelor's degree in Computer Science or related field"
    ],
    responsibilities: [
      "Lead the development of complex web applications",
      "Collaborate with cross-functional teams to define project requirements",
      "Mentor junior developers and conduct code reviews",
      "Architect scalable and maintainable software solutions",
      "Stay current with emerging technologies and best practices",
      "Participate in agile development processes"
    ],
    benefits: [
      "Competitive salary package",
      "25 days holiday plus bank holidays",
      "Flexible working arrangements",
      "Professional development budget",
      "Health and dental insurance",
      "Company pension scheme",
      "Modern office with excellent facilities"
    ]
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleApply = () => {
    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      setIsApplying(false);
      toast({
        title: "Application Submitted!",
        description: "We'll be in touch within 24 hours to discuss your application.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 1000);
  };

  const handleCallRequest = () => {
    toast({
      title: "Call Request Sent!",
      description: "Our team will contact you within 2 hours to discuss this opportunity.",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
        </div>

        {/* Job Header */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-4">{job.title}</CardTitle>
                <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Building2 className="h-4 w-4" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Posted {job.posted}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-6">
                  <Badge variant="secondary">{job.sector}</Badge>
                  <Badge variant="outline">{job.type}</Badge>
                  <Badge className="bg-accent text-accent-foreground">{job.salary}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ref: {job.id}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">{job.description}</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Apply Now
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for {job.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Cover Message (Optional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Tell us why you're interested in this role..."
                  />
                </div>
                <Button 
                  onClick={handleApply} 
                  disabled={isApplying || !formData.name || !formData.email || !formData.phone}
                  className="w-full"
                >
                  {isApplying ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="lg" onClick={handleCallRequest} className="w-full">
            <Phone className="mr-2 h-4 w-4" />
            Call MyRecruita to get this job
          </Button>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Requirements */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Key Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{resp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle>Benefits & Perks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Similar Jobs CTA */}
        <Card className="bg-secondary/50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Interested in Similar Roles?</h3>
            <p className="text-muted-foreground mb-6">
              Explore more opportunities in {job.sector} or submit your CV to be matched with relevant positions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/jobs">Browse More Jobs</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/submit-cv">Submit Your CV</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetail;