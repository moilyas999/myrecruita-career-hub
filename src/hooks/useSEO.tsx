import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string[];
  noindex?: boolean;
  schema?: object;
}

export const useSEO = ({ 
  title = "MyRecruita | Specialist Recruitment in Finance, IT & Law",
  description = "APSCo-accredited recruitment specialists connecting top talent with leading employers in Finance, IT, Legal, HR and Executive sectors across the UK.",
  canonical,
  ogImage = "/images/apsco-logo.png",
  keywords = [],
  noindex = false,
  schema
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    // Update or create canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonical);
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', canonical);
        document.head.appendChild(canonicalLink);
      }
    }

    // Update Open Graph tags with comprehensive social media optimization
    const updateOGTag = (property: string, content: string) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (ogTag) {
        ogTag.setAttribute('content', content);
      } else {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        ogTag.setAttribute('content', content);
        document.head.appendChild(ogTag);
      }
    };

    updateOGTag('og:title', title);
    updateOGTag('og:description', description);
    updateOGTag('og:image', ogImage);
    updateOGTag('og:type', 'article');
    updateOGTag('og:site_name', 'MyRecruita');
    updateOGTag('og:locale', 'en_GB');
    updateOGTag('og:image:width', '1200');
    updateOGTag('og:image:height', '630');
    if (canonical) updateOGTag('og:url', canonical);

    // Update Twitter tags with enhanced metadata
    const updateTwitterTag = (name: string, content: string) => {
      let twitterTag = document.querySelector(`meta[name="${name}"]`);
      if (twitterTag) {
        twitterTag.setAttribute('content', content);
      } else {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', name);
        twitterTag.setAttribute('content', content);
        document.head.appendChild(twitterTag);
      }
    };

    updateTwitterTag('twitter:title', title);
    updateTwitterTag('twitter:description', description);
    updateTwitterTag('twitter:image', ogImage);
    updateTwitterTag('twitter:card', 'summary_large_image');
    updateTwitterTag('twitter:site', '@MyRecruita');
    updateTwitterTag('twitter:creator', '@MyRecruita');

    // Additional SEO meta tags
    const updateMetaTag = (name: string, content: string) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (metaTag) {
        metaTag.setAttribute('content', content);
      } else {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', name);
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    };

    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('author', 'MyRecruita');
    updateMetaTag('theme-color', '#1e3a8a');
    
    // Add keywords if provided
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }
    
    // Inject structured data if provided
    if (schema) {
      injectStructuredData(schema, 'page-schema');
    }

  }, [title, description, canonical, ogImage, keywords, noindex, schema]);
};

// Helper function to create job schema
export const createJobSchema = (job: any) => {
  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "MyRecruita",
      "value": job.reference_id
    },
    "datePosted": job.created_at,
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "MyRecruita",
      "sameAs": window.location.origin
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location
      }
    },
    "industry": job.sector
  };
};

// Helper function to inject structured data
export const injectStructuredData = (schema: object, id: string) => {
  // Remove existing schema with same id
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  // Add new schema
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};