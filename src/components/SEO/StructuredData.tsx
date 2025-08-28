import { useEffect } from 'react';

interface StructuredDataProps {
  data: object;
  id: string;
}

export const StructuredData = ({ data, id }: StructuredDataProps) => {
  useEffect(() => {
    // Remove existing script with same id
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data, id]);

  return null;
};

// Common Schema Generators
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MyRecruita",
  "alternateName": ["MyRecruita Ltd", "My Recruita"],
  "description": "APSCo-accredited specialist recruitment agency for Finance, IT, Legal, HR and Executive sectors in the UK",
  "url": "https://myrecruita.com",
  "logo": "https://myrecruita.com/images/apsco-logo.png",
  "image": "https://myrecruita.com/images/apsco-logo.png",
  "foundingDate": "2020",
  "memberOf": {
    "@type": "Organization",
    "name": "APSCo (Association of Professional Staffing Companies)",
    "url": "https://uk.apsco.org"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+44 208 058 4490",
      "contactType": "Customer Service",
      "areaServed": "GB",
      "availableLanguage": "English"
    },
    {
      "@type": "ContactPoint",
      "email": "help@myrecruita.com",
      "contactType": "Customer Support",
      "areaServed": "GB"
    },
    {
      "@type": "ContactPoint",
      "email": "careers@myrecruita.com",
      "contactType": "Recruitment",
      "areaServed": "GB"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Office 124, Barking Enterprise Centre",
    "addressLocality": "Barking",
    "postalCode": "IG11",
    "addressCountry": "GB"
  },
  "sameAs": [
    "https://linkedin.com/company/myrecruita",
    "https://uk.apsco.org/discover-apsco/recruitment-members/myrecruita-ltd"
  ],
  "serviceArea": {
    "@type": "Country",
    "name": "United Kingdom"
  },
  "knowsAbout": [
    "Finance Recruitment",
    "IT Recruitment", 
    "Legal Recruitment",
    "HR Recruitment",
    "Executive Search",
    "Talent Acquisition",
    "Career Development"
  ]
});

export const generateLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://myrecruita.com/#organization",
  "name": "MyRecruita",
  "description": "Professional recruitment services specializing in Finance, IT, Legal, and Executive roles across the UK",
  "url": "https://myrecruita.com",
  "telephone": "+44 208 058 4490",
  "email": "help@myrecruita.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Office 124, Barking Enterprise Centre",
    "addressLocality": "Barking",
    "postalCode": "IG11",
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 51.5444,
    "longitude": 0.0757
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "paymentAccepted": ["Cash", "Credit Card", "Invoice"],
  "currenciesAccepted": "GBP",
  "priceRange": "££"
});

export const generateJobPostingSchema = (job: any) => ({
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": job.title,
  "description": job.description,
  "identifier": {
    "@type": "PropertyValue",
    "name": "MyRecruita Job Reference",
    "value": job.reference_id
  },
  "datePosted": job.created_at,
  "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "MyRecruita",
    "sameAs": "https://myrecruita.com",
    "logo": "https://myrecruita.com/images/apsco-logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": job.location,
      "addressCountry": "GB"
    }
  },
  "industry": job.sector,
  "qualifications": job.requirements,
  "jobBenefits": job.benefits,
  "workHours": "Full-time",
  "url": `https://myrecruita.com/jobs/${job.id}`
});

export const generateBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});

export const generateArticleSchema = (post: any) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "description": post.meta_description || post.excerpt,
  "image": post.featured_image_url ? `https://myrecruita.com${post.featured_image_url}` : "https://myrecruita.com/images/apsco-logo.png",
  "author": {
    "@type": "Organization",
    "name": "MyRecruita",
    "url": "https://myrecruita.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "MyRecruita",
    "logo": {
      "@type": "ImageObject",
      "url": "https://myrecruita.com/images/apsco-logo.png"
    }
  },
  "datePublished": post.published_at || post.created_at,
  "dateModified": post.updated_at,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://myrecruita.com/blog/${post.slug}`
  },
  "keywords": [
    "recruitment",
    "jobs",
    "careers", 
    "hiring",
    "UK employment",
    "talent acquisition"
  ],
  "articleSection": "Recruitment",
  "inLanguage": "en-GB"
});

export const generateFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const generateServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Professional Recruitment Services",
  "description": "Specialist recruitment and talent acquisition services for Finance, IT, Legal, HR and Executive roles",
  "provider": {
    "@type": "Organization",
    "name": "MyRecruita",
    "url": "https://myrecruita.com"
  },
  "serviceType": "Recruitment and Staffing",
  "areaServed": {
    "@type": "Country",
    "name": "United Kingdom"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Recruitment Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Finance Recruitment"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "IT Recruitment"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Legal Recruitment"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Executive Search"
        }
      }
    ]
  }
});