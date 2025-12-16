import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Upload,
  Loader2,
  Download,
  Trash2
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  cv_file_url: string | null;
}

const MyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useSEO({
    title: 'My Profile | MyRecruita',
    description: 'Update your profile information and manage your CV on MyRecruita.',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } else if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } else {
      toast.success('Profile updated successfully');
      setProfile(prev => prev ? { ...prev, ...formData } : null);
    }

    setSaving(false);
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingCV(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.user_id}-cv-${Date.now()}.${fileExt}`;
      const filePath = `user-cvs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ cv_file_url: urlData.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, cv_file_url: urlData.publicUrl } : null);
      toast.success('CV uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      toast.error('Failed to upload CV');
    } finally {
      setUploadingCV(false);
    }
  };

  const handleRemoveCV = async () => {
    if (!profile?.cv_file_url) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ cv_file_url: null })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to remove CV');
    } else {
      setProfile(prev => prev ? { ...prev, cv_file_url: null } : null);
      toast.success('CV removed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Update your personal information and CV
          </p>
        </div>

        {/* Profile Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Keep your details up to date for job applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  className="pl-10"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+44 7123 456789"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* CV Management */}
        <Card>
          <CardHeader>
            <CardTitle>CV / Resume</CardTitle>
            <CardDescription>
              Upload your CV to use when applying for jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.cv_file_url ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-accent" />
                    <div>
                      <p className="font-medium">Your CV</p>
                      <p className="text-sm text-muted-foreground">
                        Currently uploaded
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={profile.cv_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveCV}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Want to replace your CV?
                  </p>
                  <Label htmlFor="cv-upload-replace" className="cursor-pointer">
                    <Button variant="outline" asChild disabled={uploadingCV}>
                      <span>
                        {uploadingCV ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload New CV
                          </>
                        )}
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="cv-upload-replace"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCVUpload}
                    className="hidden"
                    disabled={uploadingCV}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No CV uploaded yet
                </p>
                <Label htmlFor="cv-upload" className="cursor-pointer">
                  <Button asChild disabled={uploadingCV}>
                    <span>
                      {uploadingCV ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload CV
                        </>
                      )}
                    </span>
                  </Button>
                </Label>
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCVUpload}
                  className="hidden"
                  disabled={uploadingCV}
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Accepted formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
