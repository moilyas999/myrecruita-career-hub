import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, User, Linkedin, MessageSquare, CheckCircle, Calendar, Upload, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CareerPartner = () => {
  const { toast } = useToast();
  const [cvFormData, setCvFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cv: null as File | null,
    message: ""
  });
  const [sessionFormData, setSessionFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    preferredTime: "",
    message: ""
  });

  const services = [
    {
      icon: FileText,
      title: "Free CV Review",
      description: "Get expert feedback on your CV with actionable recommendations for improvement.",
      features: ["Professional formatting review", "Content optimization", "ATS compatibility check", "Industry-specific advice"],
      price: "Free",
      cta: "Get CV Review"
    },
    {
      icon: User,
      title: "Tailored CV Enhancement",
      description: "Professional CV rewrite and optimization service for maximum impact.",
      features: ["Complete CV rewrite", "Keyword optimization", "Achievement highlighting", "Cover letter template"],
      price: "From £99",
      cta: "Enhance My CV"
    },
    {
      icon: Linkedin,
      title: "LinkedIn Profile Audit",
      description: "Optimize your LinkedIn presence to attract recruiters and opportunities.",
      features: ["Profile optimization", "Headline improvement", "Summary enhancement", "Skills & endorsements"],
      price: "From £79",
      cta: "Optimize LinkedIn"
    },
    {
      icon: MessageSquare,
      title: "Mock Interview Sessions",
      description: "Practice interviews with expert feedback to boost your confidence.",
      features: ["1-on-1 video sessions", "Industry-specific questions", "Detailed feedback", "Performance analysis"],
      price: "From £149",
      cta: "Book Interview Prep"
    }
  ];

  const handleCvSubmit = () => {
    toast({
      title: "CV Enhancement Request Sent!",
      description: "We'll review your CV and contact you within 24 hours.",
    });
    setCvFormData({ name: "", email: "", phone: "", cv: null, message: "" });
  };

  const handleSessionRequest = () => {
    toast({
      title: "Session Request Sent!",
      description: "We'll contact you within 2 hours to schedule your session.",
    });
    setSessionFormData({ name: "", email: "", phone: "", service: "", preferredTime: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Your Career Partner
          </h1>
          <p className="text-xl text-accent font-semibold mb-4">
            Your Journey, Our Mission
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transform your career prospects with our comprehensive suite of professional development services. 
            From CV enhancement to interview preparation, we're here to guide you every step of the way.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <service.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <p className="text-sm font-semibold text-accent">{service.price}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{service.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {service.title === "Free CV Review" || service.title === "Tailored CV Enhancement" ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        {service.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{service.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cv-name">Full Name</Label>
                          <Input
                            id="cv-name"
                            value={cvFormData.name}
                            onChange={(e) => setCvFormData({...cvFormData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cv-email">Email</Label>
                          <Input
                            id="cv-email"
                            type="email"
                            value={cvFormData.email}
                            onChange={(e) => setCvFormData({...cvFormData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cv-phone">Phone Number</Label>
                          <Input
                            id="cv-phone"
                            value={cvFormData.phone}
                            onChange={(e) => setCvFormData({...cvFormData, phone: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cv-file">Upload Current CV</Label>
                          <div className="mt-2">
                            <label htmlFor="cv-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
                              <div className="flex flex-col items-center">
                                <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {cvFormData.cv ? cvFormData.cv.name : "Click to upload CV"}
                                </p>
                              </div>
                              <input
                                id="cv-file"
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setCvFormData({...cvFormData, cv: file});
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cv-message">Additional Information</Label>
                          <Textarea
                            id="cv-message"
                            value={cvFormData.message}
                            onChange={(e) => setCvFormData({...cvFormData, message: e.target.value})}
                            placeholder="Tell us about your career goals or specific areas you'd like us to focus on..."
                            rows={3}
                          />
                        </div>
                        <Button 
                          onClick={handleCvSubmit}
                          disabled={!cvFormData.name || !cvFormData.email || !cvFormData.phone}
                          className="w-full"
                        >
                          Submit CV for Review
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        {service.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book Your {service.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="session-name">Full Name</Label>
                          <Input
                            id="session-name"
                            value={sessionFormData.name}
                            onChange={(e) => setSessionFormData({...sessionFormData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="session-email">Email</Label>
                          <Input
                            id="session-email"
                            type="email"
                            value={sessionFormData.email}
                            onChange={(e) => setSessionFormData({...sessionFormData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="session-phone">Phone Number</Label>
                          <Input
                            id="session-phone"
                            value={sessionFormData.phone}
                            onChange={(e) => setSessionFormData({...sessionFormData, phone: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="session-service">Service Type</Label>
                          <Select value={sessionFormData.service} onValueChange={(value) => setSessionFormData({...sessionFormData, service: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="linkedin">LinkedIn Profile Audit</SelectItem>
                              <SelectItem value="interview">Mock Interview Session</SelectItem>
                              <SelectItem value="career">Career Coaching</SelectItem>
                              <SelectItem value="consultation">15-min Consultation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="session-time">Preferred Time</Label>
                          <Select value={sessionFormData.preferredTime} onValueChange={(value) => setSessionFormData({...sessionFormData, preferredTime: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                              <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                              <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="session-message">Additional Details</Label>
                          <Textarea
                            id="session-message"
                            value={sessionFormData.message}
                            onChange={(e) => setSessionFormData({...sessionFormData, message: e.target.value})}
                            placeholder="Tell us about your goals or specific areas you'd like to focus on..."
                            rows={3}
                          />
                        </div>
                        <Button 
                          onClick={handleSessionRequest}
                          disabled={!sessionFormData.name || !sessionFormData.email || !sessionFormData.phone || !sessionFormData.service}
                          className="w-full"
                        >
                          Request Session
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process Section */}
        <Card className="mb-12 shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How It Works</CardTitle>
            <p className="text-muted-foreground">Our streamlined process to accelerate your career success</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Submit Request", description: "Choose your service and submit your requirements" },
                { step: "2", title: "Expert Review", description: "Our specialists analyze your materials or schedule your session" },
                { step: "3", title: "Personalized Action", description: "Receive tailored recommendations or attend your session" },
                { step: "4", title: "Ongoing Support", description: "Get continued guidance as you implement improvements" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-accent text-accent-foreground shadow-card">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-xl font-semibold mb-2">Enhance My CV</h3>
              <p className="mb-6 opacity-90">
                Get professional CV enhancement to stand out from the competition
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-accent hover:bg-white/90">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>CV Enhancement Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Full Name" />
                    <Input type="email" placeholder="Email Address" />
                    <Input placeholder="Phone Number" />
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload your current CV</p>
                    </div>
                    <Button className="w-full">Submit CV Enhancement Request</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground shadow-card">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-xl font-semibold mb-2">Book My Session</h3>
              <p className="mb-6 opacity-90">
                Schedule a personalized consultation with our career experts
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary">
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book Your Session</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Full Name" />
                    <Input type="email" placeholder="Email Address" />
                    <Input placeholder="Phone Number" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">15-min Consultation</SelectItem>
                        <SelectItem value="cv">CV Review Session</SelectItem>
                        <SelectItem value="interview">Interview Preparation</SelectItem>
                        <SelectItem value="linkedin">LinkedIn Optimization</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea placeholder="Tell us about your goals..." rows={3} />
                    <Button className="w-full">Request Session</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareerPartner;