-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'MyRecruita Team',
  category_id UUID REFERENCES public.blog_categories(id),
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog tags table
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog post tags junction table
CREATE TABLE public.blog_post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, tag_id)
);

-- Enable RLS on all blog tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
CREATE POLICY "Blog categories are viewable by everyone" 
ON public.blog_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage blog categories" 
ON public.blog_categories 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS Policies for blog_posts
CREATE POLICY "Published blog posts are viewable by everyone" 
ON public.blog_posts 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS Policies for blog_tags
CREATE POLICY "Blog tags are viewable by everyone" 
ON public.blog_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage blog tags" 
ON public.blog_tags 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS Policies for blog_post_tags
CREATE POLICY "Blog post tags are viewable by everyone" 
ON public.blog_post_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage blog post tags" 
ON public.blog_post_tags 
FOR ALL 
USING (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON public.blog_tags(slug);

-- Insert some default categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Career Advice', 'career-advice', 'Tips and guidance for career development'),
('Industry Insights', 'industry-insights', 'Latest trends and insights from various industries'),
('Interview Tips', 'interview-tips', 'Helpful advice for job interviews'),
('Recruitment News', 'recruitment-news', 'Latest news and updates from the recruitment world'),
('Company Culture', 'company-culture', 'Insights into workplace culture and best practices');

-- Insert some default tags
INSERT INTO public.blog_tags (name, slug) VALUES
('Remote Work', 'remote-work'),
('Career Growth', 'career-growth'),
('Job Search', 'job-search'),
('Professional Development', 'professional-development'),
('Workplace Tips', 'workplace-tips'),
('Technology', 'technology'),
('Finance', 'finance'),
('Marketing', 'marketing'),
('Leadership', 'leadership'),
('Networking', 'networking');