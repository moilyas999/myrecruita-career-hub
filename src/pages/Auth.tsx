import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Linkedin, Wand2, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useSEO } from '@/hooks/useSEO';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');

  // Magic link state
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useSEO({
    title: 'Login or Sign Up | MyRecruita',
    description: 'Create an account or login to track your job applications and manage your profile on MyRecruita.',
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (adminProfile) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    };
    checkSession();
  }, [navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getErrorMessage = (error: any): string => {
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('rate limit') || message.includes('too many requests') || message.includes('email rate limit exceeded')) {
      return 'Too many attempts. Please wait a few minutes before trying again.';
    }
    if (message.includes('invalid email') || message.includes('invalid_email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('email not confirmed')) {
      return 'Please confirm your email address first.';
    }
    if (message.includes('signups not allowed') || message.includes('signup_disabled')) {
      return 'New signups are currently disabled. Please try again later.';
    }
    if (message.includes('user not found')) {
      return 'No account found with this email. Please sign up first.';
    }
    if (message.includes('otp_expired') || message.includes('token has expired')) {
      return 'This code has expired. Please request a new one.';
    }
    if (message.includes('otp_invalid') || message.includes('invalid token') || message.includes('token is invalid')) {
      return 'Invalid code. Please check and try again.';
    }
    
    return error?.message || 'An unexpected error occurred. Please try again.';
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(magicLinkEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        toast.error(getErrorMessage(error));
        return;
      }

      setMagicLinkSent(true);
      setResendCooldown(60);
      toast.success('Check your email! We sent you a magic link and a 6-digit code.');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: magicLinkEmail,
        token: otpCode,
        type: 'email',
      });

      if (error) {
        const errorMsg = getErrorMessage(error);
        toast.error(errorMsg);
        
        // Clear OTP if invalid or expired so user can try again
        if (error.message?.toLowerCase().includes('expired') || error.message?.toLowerCase().includes('invalid')) {
          setOtpCode('');
        }
        return;
      }

      toast.success('Welcome!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        const errorMsg = getErrorMessage(error);
        toast.error(errorMsg);
        
        // If rate limited, set a longer cooldown
        if (error.message?.toLowerCase().includes('rate limit') || error.message?.toLowerCase().includes('too many')) {
          setResendCooldown(300); // 5 minutes
        }
        return;
      }

      setOtpCode(''); // Clear old code
      setResendCooldown(60);
      toast.success('New code sent! Check your email.');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const resetMagicLinkFlow = () => {
    setShowMagicLink(false);
    setMagicLinkSent(false);
    setMagicLinkEmail('');
    setOtpCode('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (rememberMe) {
        localStorage.setItem('supabase.auth.rememberMe', 'true');
      }

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupFullName,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please login instead.');
          setActiveTab('login');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Account created! Please check your email to verify your account.');
    } catch (error: any) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      toast.error('Failed to sign in with LinkedIn');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome to MyRecruita
          </h1>
          <p className="text-muted-foreground">
            Your career journey starts here. Login or create an account to track your applications.
          </p>
        </div>

        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                {showMagicLink ? (
                  // Magic Link Flow
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={resetMagicLinkFlow}
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to password login
                    </button>

                    {!magicLinkSent ? (
                      // Step 1: Enter email
                      <form onSubmit={handleMagicLink} className="space-y-4">
                        <div className="text-center mb-4">
                          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Wand2 className="h-6 w-6 text-accent" />
                          </div>
                          <h3 className="font-semibold text-lg">Sign in with Magic Link</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            We'll send you a link and a code to sign in instantly
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="magic-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="magic-email"
                              type="email"
                              placeholder="your@email.com"
                              value={magicLinkEmail}
                              onChange={(e) => setMagicLinkEmail(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Magic Link
                            </>
                          )}
                        </Button>
                      </form>
                    ) : (
                      // Step 2: Enter OTP code
                      <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="text-center mb-4">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="font-semibold text-lg">Check your email</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            We sent a magic link to <strong>{magicLinkEmail}</strong>
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Click the link in your email, or enter the 6-digit code below:
                          </p>
                        </div>

                        <div className="flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={otpCode}
                            onChange={(value) => setOtpCode(value)}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>

                        <Button type="submit" variant="accent" className="w-full" disabled={isLoading || otpCode.length !== 6}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            'Verify Code'
                          )}
                        </Button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={resendCooldown > 0 || isLoading}
                            className="text-sm text-accent hover:underline disabled:text-muted-foreground disabled:no-underline"
                          >
                            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setMagicLinkSent(false);
                            setOtpCode('');
                          }}
                          className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
                        >
                          Use a different email
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  // Password Login Flow
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                        Remember me
                      </Label>
                    </div>

                    <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setShowMagicLink(true)}
                      className="w-full text-sm text-accent hover:underline flex items-center justify-center gap-1"
                    >
                      <Wand2 className="h-4 w-4" />
                      Sign in with Magic Link instead
                    </button>

                    <div className="relative my-6">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                        or continue with
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white border-[#0A66C2] hover:border-[#004182]"
                      onClick={handleLinkedInLogin}
                      disabled={isLoading}
                    >
                      <Linkedin className="mr-2 h-4 w-4" />
                      Continue with LinkedIn
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                      or continue with
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white border-[#0A66C2] hover:border-[#004182]"
                    onClick={handleLinkedInLogin}
                    disabled={isLoading}
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    Continue with LinkedIn
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By signing up, you agree to our{' '}
                    <Link to="/privacy" className="underline hover:text-accent">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link to="/terms" className="underline hover:text-accent">
                      Terms of Service
                    </Link>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Mail className="h-5 w-5 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Track all your applications</p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="h-5 w-5 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Save your CV for quick apply</p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="h-5 w-5 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Secure & private</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
