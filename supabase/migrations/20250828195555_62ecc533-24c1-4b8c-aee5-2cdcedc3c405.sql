-- Update the employer branding blog post to use the new hero image without logos
UPDATE blog_posts 
SET featured_image_url = '/images/employer-branding-social-hero-new.jpg' 
WHERE slug = 'employer-branding-social-media-2025';