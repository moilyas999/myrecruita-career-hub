import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

const Contact = () => {
  const { toast } = useToast();
  
  useSEO({
    title: "Contact MyRecruita | Specialist Recruitment Support",
    description: "Need support or want to discuss hiring? Contact the MyRecruita team for help with jobs or talent acquisition.",
    canonical: `${window.location.origin}/contact`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    inquiryType: ""
  });

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email and we'll respond within 2 hours",
      contact: "zuhair@myrecruita.com",
      action: "mailto:zuhair@myrecruita.com"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our team during business hours",
      contact: "+44 (0) 123 456 7890",
      action: "tel:+441234567890"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Meet us at our office in the heart of London",
      contact: "123 Business District, London EC1A 1AA",
      action: "#"
    },
    {
      icon: Clock,
      title: "Business Hours",
      description: "We're available when you need us most",
      contact: "Mon-Fri: 9AM-6PM, Sat: 10AM-2PM",
      action: "#"
    }
  ];

  const inquiryTypes = [
    { value: "job-seeker", label: "I'm looking for a job", icon: Users },
    { value: "employer", label: "I'm hiring talent", icon: Briefcase },
    { value: "career-support", label: "I need career support", icon: MessageSquare },
    { value: "partnership", label: "Business partnership", icon: Users },
    { value: "other", label: "Other inquiry", icon: MessageSquare }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 2 hours during business hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
        inquiryType: ""
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Get In Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to take the next step in your career journey or find exceptional talent? 
            We're here to help and would love to hear from you.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="text-center p-6 shadow-card hover:shadow-card-lg transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <method.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                {method.action.startsWith('#') ? (
                  <p className="text-sm font-medium text-primary">{method.contact}</p>
                ) : (
                  <a href={method.action} className="text-sm font-medium text-primary hover:text-accent transition-colors">
                    {method.contact}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+44 123 456 7890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Your company name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inquiryType">How can we help you? *</Label>
                    <Select value={formData.inquiryType} onValueChange={(value) => setFormData({...formData, inquiryType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Please provide details about your inquiry. The more information you provide, the better we can assist you."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.message || !formData.inquiryType}
                    className="w-full"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    We respect your privacy. Your information will be sent to zuhair@myrecruita.com and used only to respond to your inquiry.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:zuhair@myrecruita.com" className="text-sm text-muted-foreground hover:text-accent">
                      zuhair@myrecruita.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+441234567890" className="text-sm text-muted-foreground hover:text-accent">
                      +44 (0) 123 456 7890
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-sm text-muted-foreground">Within 2 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Frequently Asked</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">How quickly do you respond?</h4>
                  <p className="text-xs text-muted-foreground">We respond to all inquiries within 2 hours during business hours.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Do you charge candidates?</h4>
                  <p className="text-xs text-muted-foreground">No, our recruitment services are completely free for job seekers.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">What industries do you cover?</h4>
                  <p className="text-xs text-muted-foreground">We work across all sectors including Technology, Finance, Marketing, and more.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Do you offer remote positions?</h4>
                  <p className="text-xs text-muted-foreground">Yes, we have many remote and hybrid opportunities available.</p>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="bg-primary text-primary-foreground shadow-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Office Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-90">Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Saturday</span>
                    <span>10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-primary-foreground/20">
                  <p className="text-xs opacity-90">
                    For urgent matters outside office hours, please email us and we'll respond first thing the next business day.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section (Placeholder) */}
        <Card className="mt-12 shadow-card">
          <CardContent className="p-0">
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">123 Business District, London EC1A 1AA</p>
                <p className="text-sm text-muted-foreground">Interactive map would be integrated here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;