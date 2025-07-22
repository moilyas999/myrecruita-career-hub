import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PostJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    jobTitle: '',
    jobDescription: '',
    requirements: '',
    salary: '',
    location: '',
    jobType: '',
    sector: '',
    jobSpec: null as File | null
  });

  const sectors = [
    'Technology',
    'Finance',
    'Healthcare',
    'Legal',
    'Education',
    'Marketing',
    'Sales',
    'Engineering',
    'Human Resources',
    'Operations',
    'Other'
  ];

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Temporary',
    'Permanent',
    'Freelance',
    'Remote',
    'Hybrid'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('txt')) {
        toast.error("Please upload a PDF, DOC, or TXT file");
        return;
      }
      setFormData(prev => ({ ...prev, jobSpec: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let jobSpecUrl = null;

      if (formData.jobSpec) {
        const fileExt = formData.jobSpec.name.split('.').pop();
        const fileName = `job-spec-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('job-specifications')
          .upload(fileName, formData.jobSpec);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error("Failed to upload job specification");
          return;
        }

        jobSpecUrl = uploadData.path;
      }

      const { error } = await supabase
        .from('employer_job_submissions')
        .insert({
          company_name: formData.companyName,
          contact_name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
          job_title: formData.jobTitle,
          job_description: formData.jobDescription,
          location: formData.location,
          sector: formData.sector,
          job_spec_file_url: jobSpecUrl
        });

      if (error) {
        console.error('Database error:', error);
        toast.error("Failed to submit job posting");
        return;
      }

      toast.success("Job posting submitted successfully!");
      navigate('/thank-you');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("An error occurred while submitting your job posting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.companyName && 
                     formData.contactName && 
                     formData.contactEmail && 
                     formData.jobTitle && 
                     formData.jobDescription && 
                     formData.sector;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Hiring Top Talent?
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
            Submit Vacancy Now
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Partner with MyRecruita to find exceptional candidates across Technology, Finance, Healthcare, Legal, and Executive Search. Our expert team will match you with top-tier talent that drives your business forward.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">Job Details</CardTitle>
              <CardDescription>
                Provide us with details about your vacancy and we'll find the perfect candidates for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Your company name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email Address *</Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="your.email@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="+44 123 456 7890"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Job Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector *</Label>
                      <Select value={formData.sector} onValueChange={(value) => handleSelectChange('sector', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector} value={sector}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select value={formData.jobType} onValueChange={(value) => handleSelectChange('jobType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., London, UK or Remote"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input
                        id="salary"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        placeholder="e.g., £50,000 - £70,000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description *</Label>
                    <Textarea
                      id="jobDescription"
                      name="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleInputChange}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Key Requirements</Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      placeholder="List the essential skills, qualifications, and experience required..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Job Specification (Optional)</h3>
                  <div className="space-y-2">
                    <Label htmlFor="jobSpec">Upload Job Specification</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <input
                        id="jobSpec"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                      />
                      <Label htmlFor="jobSpec" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, or TXT (max. 10MB)
                        </p>
                      </Label>
                      {formData.jobSpec && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{formData.jobSpec.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Job Posting"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Why Choose MyRecruita?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Expert Sector Knowledge:</strong> Specialized recruiters across Technology, Finance, Healthcare, Legal, and Executive Search
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Quality Over Quantity:</strong> We focus on finding the right candidates, not just filling quotas
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Fast Turnaround:</strong> Our extensive network allows us to present qualified candidates quickly
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Partnership Approach:</strong> We work as an extension of your team to understand your unique needs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our recruitment specialists are here to help you find the perfect candidates for your role.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="https://calendly.com/myrecruita" target="_blank" rel="noopener noreferrer">
                    Book a Consultation
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;