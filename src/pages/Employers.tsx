import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowRight, Briefcase, Users, Star, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

const Employers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useSEO({
    title: "Hire Top Talent | Employer Services | MyRecruita",
    description: "Find exceptional candidates for Finance, IT, and Legal roles. Submit your job requirements and access our talent pool.",
    canonical: `${window.location.origin}/employers`
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    jobTitle: "",
    jobDescription: "",
    sector: "",
    location: "",
    jobSpec: null as File | null
  });

  const sectors = [
    { value: "finance", label: "Finance" },
    { value: "it", label: "IT & Technology" },
    { value: "legal", label: "Legal" },
    { value: "healthcare", label: "Healthcare" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "hr", label: "Human Resources" },
    { value: "other", label: "Other" }
  ];

  const benefits = [
    {
      icon: Users,
      title: "Access to Top Talent",
      description: "Connect with pre-screened professionals across Finance, IT, and Legal sectors"
    },
    {
      icon: Target,
      title: "Targeted Matching",
      description: "Our experts match your requirements with the most suitable candidates"
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "All candidates are thoroughly vetted to ensure they meet your standards"
    },
    {
      icon: Briefcase,
      title: "Industry Expertise",
      description: "Specialized recruiters with deep knowledge in your industry"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setFormData({
        ...formData,
        jobSpec: file
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let jobSpecUrl = null;
      
      // Upload job spec file to Supabase Storage if provided
      if (formData.jobSpec) {
        const fileExt = formData.jobSpec.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `employer-uploads/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cv-uploads')
          .upload(filePath, formData.jobSpec);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload job specification. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Get the file URL
        const { data: { publicUrl } } = supabase.storage
          .from('cv-uploads')
          .getPublicUrl(filePath);
        
        jobSpecUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('employer_job_submissions')
        .insert({
          company_name: formData.companyName,
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          job_title: formData.jobTitle,
          job_description: formData.jobDescription,
          sector: formData.sector,
          location: formData.location,
          job_spec_file_url: jobSpecUrl
        })
        .select();

      if (error) {
        console.error('Insert error:', error);
        toast({
          title: "Error",
          description: `Failed to submit job posting: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Job posting submitted successfully:', data);
      toast({
        title: "Job Posting Submitted!",
        description: "We'll review your requirements and contact you within 24 hours.",
      });
      
      // Redirect to thank you page
      navigate('/thank-you');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit job posting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Hire Top Talent</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Access our pool of exceptional candidates across Finance, IT, and Legal sectors. 
            Let our specialists find the perfect match for your organization.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center p-4 shadow-card">
              <CardContent className="pt-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Submit Your Job Requirements</CardTitle>
                <p className="text-muted-foreground">
                  Provide details about your role and we'll connect you with suitable candidates.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your.email@company.com"
                      />
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Senior Software Developer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sector">Sector *</Label>
                      <Select value={formData.sector} onValueChange={(value) => setFormData({...formData, sector: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.value} value={sector.value}>
                              {sector.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. London, Remote, Hybrid"
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobDescription">Job Description *</Label>
                    <Textarea
                      id="jobDescription"
                      name="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Describe the role, responsibilities, requirements, and any other relevant details..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobSpec">Upload Job Specification (Optional)</Label>
                    <div className="mt-2">
                      <label htmlFor="jobSpec" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            {formData.jobSpec ? (
                              <span className="font-semibold text-foreground">{formData.jobSpec.name}</span>
                            ) : (
                              <>
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (MAX. 10MB)</p>
                        </div>
                        <input
                          id="jobSpec"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting || !formData.companyName || !formData.contactName || !formData.email || !formData.phone || !formData.jobTitle || !formData.sector || !formData.location || !formData.jobDescription}
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Job Requirements"}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our terms and privacy policy. 
                    Your information will be sent to zuhair@myrecruita.com.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Why Choose MyRecruita?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Expert Screening</h4>
                  <p className="text-xs text-muted-foreground">All candidates are thoroughly vetted to meet your specific requirements.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Fast Turnaround</h4>
                  <p className="text-xs text-muted-foreground">Receive qualified candidate profiles within 48 hours of your submission.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">No Upfront Costs</h4>
                  <p className="text-xs text-muted-foreground">Pay only when you successfully hire through our service.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Ongoing Support</h4>
                  <p className="text-xs text-muted-foreground">Dedicated support throughout the hiring process and beyond.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground shadow-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-primary-foreground/90 text-sm mb-4">
                  Our recruitment specialists are here to discuss your hiring needs and recommend the best approach.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-90">Email:</span>
                    <span>zuhair@myrecruita.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Phone:</span>
                    <span>+44 203 8685 510</span>
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

export default Employers;