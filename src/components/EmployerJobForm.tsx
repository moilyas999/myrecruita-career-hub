import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmployerJobFormProps {
  isCompact?: boolean;
}

const EmployerJobForm = ({ isCompact = false }: EmployerJobFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
      
      // Send admin notification
      try {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            title: 'New Employer Job Submission',
            message: `${formData.companyName} submitted a job: ${formData.jobTitle}`,
            category: 'employer_job_submission',
            link: '/admin?tab=employer-jobs',
            targetRoles: ['admin', 'account_manager'],
          }
        });
      } catch (notificationError) {
        console.log('Admin notification failed (non-critical):', notificationError);
      }
      
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
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{isCompact ? "Post a Job" : "Submit Your Job Requirements"}</CardTitle>
        {!isCompact && (
          <p className="text-muted-foreground">
            Provide details about your role and we'll connect you with suitable candidates.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`grid grid-cols-1 ${!isCompact ? 'md:grid-cols-2' : ''} gap-4`}>
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

          <div className={`grid grid-cols-1 ${!isCompact ? 'md:grid-cols-2' : ''} gap-4`}>
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

          <div className={`grid grid-cols-1 ${!isCompact ? 'md:grid-cols-2' : ''} gap-4`}>
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
              rows={isCompact ? 3 : 4}
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </div>

          {!isCompact && (
            <div>
              <Label htmlFor="jobSpec">Upload Job Specification (Optional)</Label>
              <div className="mt-2">
                <label htmlFor="jobSpec" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {formData.jobSpec ? (
                        <span className="font-semibold text-foreground">{formData.jobSpec.name}</span>
                      ) : (
                        "Click to upload"
                      )}
                    </p>
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
          )}

          <Button 
            type="submit" 
            size={isCompact ? "default" : "lg"}
            disabled={isSubmitting || !formData.companyName || !formData.contactName || !formData.email || !formData.phone || !formData.jobTitle || !formData.sector || !formData.location || !formData.jobDescription}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Job Requirements"}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployerJobForm;