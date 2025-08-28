-- Add Finance Recruitment category
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Finance Recruitment', 'finance-recruitment', 'Strategies and insights for hiring top finance and fintech professionals')
ON CONFLICT (slug) DO NOTHING;

-- Add new tags for finance post
INSERT INTO public.blog_tags (name, slug) VALUES
('Finance', 'finance'),
('Fintech', 'fintech'),
('Compliance', 'compliance'),
('Hybrid Work', 'hybrid-work'),
('Upskilling', 'upskilling')
ON CONFLICT (slug) DO NOTHING;