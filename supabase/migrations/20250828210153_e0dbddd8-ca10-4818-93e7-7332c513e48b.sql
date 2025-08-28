UPDATE blog_posts 
SET excerpt = REPLACE(excerpt, 'MyRecruita Ltd', 'MyRecruita')
WHERE excerpt LIKE '%MyRecruita Ltd%';

UPDATE blog_posts 
SET content = REPLACE(content, 'MyRecruita Ltd', 'MyRecruita')
WHERE content LIKE '%MyRecruita Ltd%';

UPDATE blog_posts 
SET title = REPLACE(title, 'MyRecruita Ltd', 'MyRecruita')
WHERE title LIKE '%MyRecruita Ltd%';