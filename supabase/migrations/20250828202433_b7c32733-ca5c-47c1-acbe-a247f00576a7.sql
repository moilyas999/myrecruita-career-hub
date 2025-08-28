-- Add APSCo membership announcement blog post
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image_url,
  author_name,
  meta_title,
  meta_description,
  is_published,
  published_at,
  category_id
) VALUES (
  'MyRecruita Ltd Achieves APSCo Membership — Setting a New Standard in Recruitment Excellence',
  'myrecruita-achieves-apsco-membership-2025',
  'MyRecruita Ltd is proud to announce its official membership with APSCo UK, showcasing our commitment to professional, ethical, and high-quality recruitment services.',
  'We are proud to share that MyRecruita Ltd has been officially accredited as a member of APSCo (The Association of Professional Staffing Companies), the leading professional body representing recruitment organisations across the UK and internationally.

This membership is more than just a badge — it represents our commitment to excellence, ethics, and industry-leading standards in recruitment.

What is APSCo?

APSCo (The Association of Professional Staffing Companies) is a globally recognised trade body that represents only the highest-quality recruitment firms. Members must meet strict criteria, follow a robust code of conduct, and consistently demonstrate professionalism in client and candidate dealings.

Being APSCo approved means MyRecruita stands alongside the UK most trusted and compliant recruitment businesses.

Benefits of APSCo Membership for Our Clients and Candidates

Industry Excellence
By joining APSCo, MyRecruita is recognised as part of a select group of professional recruitment businesses that meet the highest standards in the industry.

Strict Code of Conduct
Clients and candidates can be confident that our services follow APSCo rigorous code of conduct — ensuring integrity and compliance every step of the way.

Enhanced Client Confidence
Businesses working with MyRecruita gain peace of mind knowing we are fully aligned with the latest best practices, legal compliance, and ethical standards.

Candidate Protection
We are committed to protecting candidate rights, ensuring fairness, transparency, and respect in every recruitment journey.

Ongoing Improvement
Through APSCo, we gain access to continuous training, resources, and updates that allow us to stay ahead of industry changes and deliver even better results.

Why This Matters

In today competitive job market, recruitment agencies need to demonstrate more than just results — they must also show integrity, accountability, and long-term commitment to clients and candidates alike.

Becoming APSCo approved signals that MyRecruita is not just another recruitment agency — we are a trusted partner who goes above and beyond to provide reliable, compliant, and ethical recruitment solutions.

Final Word from Our Leadership

"Joining APSCo is a proud milestone for MyRecruita. It proves our dedication to raising the standards in recruitment and providing clients and candidates with the assurance that they are working with a trusted, professional partner."

Call to Action

Whether you are a business looking for exceptional talent or a candidate seeking your next career move, partner with an APSCo-approved agency you can trust.

Get in touch with MyRecruita today and experience recruitment done right.',
  '/images/apsco-membership-announcement-hero.jpg',
  'MyRecruita Team',
  'MyRecruita Achieves APSCo Membership | Professional Recruitment Standards',
  'MyRecruita Ltd officially joins APSCo UK, demonstrating commitment to excellence, ethics, and professional recruitment standards. Learn about our accreditation.',
  true,
  now(),
  (SELECT id FROM blog_categories WHERE slug = 'recruitment-trends' LIMIT 1)
);