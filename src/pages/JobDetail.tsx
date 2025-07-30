import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Clock, Building2, Phone, Mail, CheckCircle, Loader2, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSEO, createJobSchema, injectStructuredData } from "@/hooks/useSEO";

const JobDetail = () => {
  const { referenceId, jobId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);
  const [job, setJob] = useState<any>(null);

  // Dynamic SEO based on job data
  useSEO({
    title: job ? `${job.title} in ${job.location} | Careers in ${job.sector} | MyRecruita` : "Job Details | MyRecruita",
    description: job ? `Apply for ${job.title} in ${job.location}. MyRecruita connects professionals in ${job.sector} with top employers. Immediate openings.` : "View job details and apply directly with MyRecruita.",
    canonical: `${window.location.origin}/roles/${referenceId || jobId}`
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    cv: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [referenceId, jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const jobRef = referenceId || jobId;
      
      if (!jobRef) {
        setNotFound(true);
        return;
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('reference_id', jobRef)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load job details. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        setNotFound(true);
        return;
      }

      setJob(data);
      
      // Update SEO and structured data for the job
      if (data) {
        const jobSchema = createJobSchema(data);
        injectStructuredData(jobSchema, "job-schema");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load job details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setFormData({
        ...formData,
        cv: file
      });
    }
  };

  const handleApply = async () => {
    if (!job || !formData.cv) return;
    
    setIsApplying(true);
    setIsUploading(true);
    
    try {
      // Upload CV file to Supabase Storage
      const fileExt = formData.cv.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `job-applications/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(filePath, formData.cv);

      if (uploadError) {
        toast({
          title: "Upload Error",
          description: "Failed to upload CV. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(false);

      // Get the file URL
      const { data: { publicUrl } } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(filePath);

      // Submit application with CV URL
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          cv_file_url: publicUrl
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit application. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Application Submitted!",
        description: "We'll be in touch within 24 hours to discuss your application.",
      });
      
      // Redirect to thank you page
      navigate('/thank-you');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
      setIsUploading(false);
    }
  };

  const handleCallRequest = () => {
    toast({
      title: "Call Request Sent!",
      description: "Our team will contact you within 2 hours to discuss this opportunity.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading job details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link to="/explore-roles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Link>
            </Button>
          </div>
          <Card className="text-center p-8">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">Job Not Found</h3>
              <p className="text-muted-foreground mb-4">
                This job posting is no longer available or does not exist.
              </p>
              <Button asChild>
                <Link to="/explore-roles">Browse All Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/explore-roles">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-6">
                  <Badge variant="secondary">{job.sector}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ref: {job.reference_id}</p>
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
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cv">Upload CV *</Label>
                  <div className="mt-2">
                    <label htmlFor="cv" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {formData.cv ? (
                          <>
                            <FileText className="w-8 h-8 mb-2 text-accent" />
                            <p className="mb-2 text-sm text-foreground font-semibold">{formData.cv.name}</p>
                            <p className="text-xs text-muted-foreground">Click to change file</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (MAX. 5MB)</p>
                          </>
                        )}
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
                  disabled={isApplying || isUploading || !formData.name || !formData.email || !formData.phone || !formData.cv}
                  className="w-full"
                >
                  {isUploading ? "Uploading CV..." : isApplying ? "Submitting..." : "Submit Application"}
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
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Requirements */}
          {job.requirements && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">{job.requirements}</div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">{job.benefits}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Similar Jobs CTA */}
        <Card className="bg-secondary/50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Interested in Similar Roles?</h3>
            <p className="text-muted-foreground mb-6">
              Explore more opportunities in {job.sector} or submit your CV to be matched with relevant positions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/explore-roles">Browse More Jobs</Link>
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