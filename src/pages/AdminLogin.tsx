import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'login' | 'forgot-password' | 'reset-sent';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [resetEmail, setResetEmail] = useState('');
  const { user, isAdmin, loading, isAdminLoading, signIn } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect if already logged in as admin
  useEffect(() => {
    if (!loading && !isAdminLoading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, isAdminLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(email.toLowerCase(), password, rememberMe);
    
    if (error) {
      toast.error(error);
      setIsSubmitting(false);
    } else {
      toast.success('Signed in successfully');
      // Navigation will happen via useEffect when isAdmin becomes true
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use custom edge function to send email via Resend
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          email: resetEmail.toLowerCase(),
          type: 'password_reset',
          redirectUrl: `${window.location.origin}/auth?type=recovery`,
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setViewMode('reset-sent');
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth state
  if (loading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {viewMode === 'login' && 'MyRecruita Admin'}
            {viewMode === 'forgot-password' && 'Reset Password'}
            {viewMode === 'reset-sent' && 'Check Your Email'}
          </CardTitle>
          <CardDescription>
            {viewMode === 'login' && 'Access the admin dashboard'}
            {viewMode === 'forgot-password' && "Enter your email to receive a reset link"}
            {viewMode === 'reset-sent' && 'We sent you a password reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('forgot-password');
                    setResetEmail(email);
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {viewMode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </button>

              <div className="text-center my-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="h-6 w-6 text-accent" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          )}

          {viewMode === 'reset-sent' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to <strong>{resetEmail}</strong>.
                Check your inbox and click the link to reset your password.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewMode('forgot-password');
                  }}
                  className="w-full"
                >
                  Try again
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setViewMode('login');
                    setResetEmail('');
                  }}
                  className="w-full"
                >
                  Back to login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}