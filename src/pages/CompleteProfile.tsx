import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Phone } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    avatar_url: string | null;
    phone: string;
  } | null>(null);
  
  const [phone, setPhone] = useState('');

  useSEO({
    title: 'Complete Your Profile | MyRecruita',
    description: 'Complete your profile to get the most out of MyRecruita'
  });

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('full_name, email, avatar_url, phone')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
        return;
      }

      // If profile is already complete, redirect to dashboard
      if (profileData?.phone) {
        navigate('/dashboard');
        return;
      }

      setProfile(profileData);
      setIsLoading(false);
    };

    checkProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ phone })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setIsSaving(false);
      return;
    }

    toast.success('Profile completed successfully!');
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <CardTitle className="text-2xl">Welcome, {profile?.full_name?.split(' ')[0] || 'there'}!</CardTitle>
              <CardDescription className="text-base mt-2">
                Please add your phone number to complete your profile
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+44 7XXX XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => navigate('/dashboard')}
              >
                Skip for now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;
