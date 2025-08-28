-- First, let's check if we need to add new categories and tags
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Recruitment Trends', 'recruitment-trends', 'Latest trends and insights shaping the recruitment industry')
ON CONFLICT (slug) DO NOTHING;

-- Add new tags
INSERT INTO public.blog_tags (name, slug) VALUES
('Hiring', 'hiring'),
('UK', 'uk'),
('AI', 'ai'),
('Remote Work', 'remote-work'),
('Employer Branding', 'employer-branding'),
('Diversity', 'diversity')
ON CONFLICT (slug) DO NOTHING;