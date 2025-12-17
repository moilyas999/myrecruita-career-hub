import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  adminRole: string | null;
  loading: boolean;
  isAdminLoading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  createAdminUser: (email: string, password: string, role?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  const checkAdminStatus = async (userId: string) => {
    setIsAdminLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      setIsAdmin(!error && !!data);
      setAdminRole(data?.role || null);
    } catch (error) {
      setIsAdmin(false);
      setAdminRole(null);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin using setTimeout to avoid deadlock
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsAdminLoading(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdminLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error: error.message };
      }
      
      // Set session persistence based on remember me
      if (rememberMe) {
        localStorage.setItem('supabase.auth.rememberMe', 'true');
      } else {
        localStorage.removeItem('supabase.auth.rememberMe');
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/admin`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const createAdminUser = async (email: string, password: string, role: string = 'admin') => {
    try {
      // First create the user account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        return { error: signUpError.message };
      }
      
      if (data.user) {
        // Add the user to admin_profiles table
        const { error: adminError } = await supabase
          .from('admin_profiles')
          .insert({
            user_id: data.user.id,
            email: email,
            role: role
          });
        
        if (adminError) {
          return { error: 'Failed to create admin profile: ' + adminError.message };
        }
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setAdminRole(null);
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      adminRole,
      loading,
      isAdminLoading,
      signIn,
      signUp,
      signOut,
      createAdminUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}