-- Clean up blog post content by removing excess hashtags and asterisks
UPDATE blog_posts SET content = REPLACE(REPLACE(REPLACE(content, '### ', ''), '## ', ''), '# ', '') WHERE content LIKE '%##%' OR content LIKE '%###%' OR content LIKE '%#%';

-- Remove excess asterisks from content
UPDATE blog_posts SET content = REPLACE(REPLACE(REPLACE(content, '**', ''), '***', ''), '****', '') WHERE content LIKE '%**%' OR content LIKE '%***%' OR content LIKE '%****%';