import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle, ArrowRight, FileText, Users, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

const SubmitCV = () => {
  const { toast } = useToast();
  
  useSEO({
    title: "Submit Your CV | Join Top Finance, IT & Legal Jobs | MyRecruita",
    description: "Send us your CV to be considered for roles in Finance, IT, and Law. MyRecruita helps professionals get hired faster.",
    canonical: `${window.location.origin}/submit-cv`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    cv: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        cv: file
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload file URL placeholder - in production, implement file upload to Supabase Storage
      const cvFileUrl = formData.cv ? `cv_files/${formData.cv.name}` : null;

      const { error } = await supabase
        .from('cv_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cv_file_url: cvFileUrl,
          message: formData.message
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit CV. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitted(true);
      toast({
        title: "CV Submitted Successfully!",
        description: "We'll review your profile and be in touch within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Users,
      title: "Expert Review",
      description: "Our recruitment specialists will review your CV within 24 hours"
    },
    {
      icon: Award,
      title: "Matched Opportunities",
      description: "We'll match you with relevant positions that fit your experience"
    },
    {
      icon: FileText,
      title: "Career Guidance",
      description: "Receive personalized advice to enhance your career prospects"
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center p-8 shadow-card-lg">
            <CardContent>
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">CV Submitted Successfully!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for submitting your CV. Our team will review your profile and contact you within 24 hours with relevant opportunities.
              </p>
              
              <div className="bg-secondary/50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-lg mb-4">What happens next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                    <span>Our recruitment team reviews your CV</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                    <span>We match you with suitable opportunities</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                    <span>We contact you with relevant positions</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  While you wait, explore more opportunities or enhance your career prospects:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link to="/jobs">
                      Explore Available Roles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/career-partner">
                      Visit Your Career Partner
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Submit Your CV</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take the first step towards your next career opportunity. Submit your CV and let our experts match you with the perfect role.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
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

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+44 123 456 7890"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cv">Upload CV *</Label>
                    <div className="mt-2">
                      <label htmlFor="cv" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            {formData.cv ? (
                              <span className="font-semibold text-foreground">{formData.cv.name}</span>
                            ) : (
                              <>
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (MAX. 5MB)</p>
                        </div>
                        <input
                          id="cv"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Message (Optional)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell us about your career goals, preferred roles, or any specific requirements..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.phone || !formData.cv}
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit CV"}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting your CV, you agree to our terms and privacy policy. 
                    Your information will be sent to zuhair@myrecruita.com.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Why Submit Your CV?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{benefit.title}</h4>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground shadow-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-primary-foreground/90 text-sm mb-4">
                  Our career experts are here to help you succeed. Get personalized support for your job search.
                </p>
                <Button asChild variant="secondary" size="sm" className="w-full">
                  <Link to="/career-partner">
                    Visit Your Career Partner
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="font-semibold">24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="font-semibold text-accent">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Clients:</span>
                    <span className="font-semibold">500+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitCV;