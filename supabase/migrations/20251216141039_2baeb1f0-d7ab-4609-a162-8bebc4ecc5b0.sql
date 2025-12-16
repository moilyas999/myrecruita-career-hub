-- Create user_profiles table for job seekers
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  cv_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Add user_id column to job_applications (nullable for backward compatibility)
ALTER TABLE public.job_applications 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id column to cv_submissions (nullable for backward compatibility)
ALTER TABLE public.cv_submissions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies for job_applications to allow users to view their own applications
CREATE POLICY "Users can view their own applications"
ON public.job_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Update RLS policies for cv_submissions to allow users to view their own submissions
CREATE POLICY "Users can view their own CV submissions"
ON public.cv_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup - creates a profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profile on user signup
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_signup();