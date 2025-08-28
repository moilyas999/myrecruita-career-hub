// SEO Utility Functions

export interface SEOConfig {
  siteName: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  siteUrl: string;
  defaultImage: string;
  twitterHandle: string;
  locale: string;
}

export const seoConfig: SEOConfig = {
  siteName: 'MyRecruita',
  defaultTitle: 'MyRecruita | Specialist Recruitment in Finance, IT & Law',
  titleTemplate: '%s | MyRecruita',
  defaultDescription: 'APSCo-accredited recruitment specialists connecting top talent with leading employers in Finance, IT, Legal, HR and Executive sectors across the UK.',
  siteUrl: 'https://myrecruita.com',
  defaultImage: '/images/apsco-logo.png',
  twitterHandle: '@MyRecruita',
  locale: 'en_GB'
};

export const generatePageTitle = (title?: string): string => {
  if (!title) return seoConfig.defaultTitle;
  if (title === seoConfig.siteName) return seoConfig.defaultTitle;
  return seoConfig.titleTemplate.replace('%s', title);
};

export const generateCanonicalUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${seoConfig.siteUrl}${cleanPath}`;
};

export const generateImageUrl = (imagePath?: string): string => {
  if (!imagePath) return `${seoConfig.siteUrl}${seoConfig.defaultImage}`;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${seoConfig.siteUrl}${cleanPath}`;
};

// SEO-friendly URL slug generator
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Extract keywords from content
export const extractKeywords = (content: string, maxKeywords: number = 10): string[] => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

// Generate meta description from content
export const generateMetaDescription = (content: string, maxLength: number = 155): string => {
  const cleanContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  if (cleanContent.length <= maxLength) return cleanContent;

  const truncated = cleanContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? `${truncated.substring(0, lastSpace)}...`
    : `${truncated}...`;
};

// Validate SEO requirements
export interface SEOValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export const validateSEO = (data: {
  title?: string;
  description?: string;
  h1?: string;
  content?: string;
  images?: Array<{src: string; alt: string}>;
}): SEOValidation => {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!data.title) {
    issues.push('Missing page title');
  } else {
    if (data.title.length > 60) {
      warnings.push('Title too long (over 60 characters)');
    }
    if (data.title.length < 30) {
      warnings.push('Title too short (under 30 characters)');
    }
  }

  // Description validation
  if (!data.description) {
    issues.push('Missing meta description');
  } else {
    if (data.description.length > 160) {
      warnings.push('Meta description too long (over 160 characters)');
    }
    if (data.description.length < 120) {
      warnings.push('Meta description too short (under 120 characters)');
    }
  }

  // H1 validation
  if (!data.h1) {
    issues.push('Missing H1 tag');
  } else if (data.title && data.h1 !== data.title && !data.h1.includes(data.title.split('|')[0].trim())) {
    warnings.push('H1 should be similar to page title for better SEO');
  }

  // Content validation
  if (!data.content) {
    issues.push('Missing content');
  } else {
    const wordCount = data.content.split(/\s+/).length;
    if (wordCount < 300) {
      warnings.push('Content too short (under 300 words)');
    }
  }

  // Image alt text validation
  if (data.images) {
    const missingAlt = data.images.filter(img => !img.alt || img.alt.trim() === '');
    if (missingAlt.length > 0) {
      issues.push(`${missingAlt.length} images missing alt text`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings
  };
};

// Internal linking suggestions
export const generateInternalLinks = (currentPage: string, allPages: string[]): string[] => {
  const relevancyMap: Record<string, string[]> = {
    '/': ['/jobs', '/about', '/employers', '/submit-cv'],
    '/jobs': ['/submit-cv', '/about', '/contact'],
    '/about': ['/contact', '/jobs', '/employers'],
    '/employers': ['/post-job', '/contact', '/featured-talent'],
    '/submit-cv': ['/jobs', '/career-partner', '/contact'],
    '/contact': ['/about', '/jobs', '/employers'],
    '/blog': ['/about', '/jobs', '/employers'],
    '/post-job': ['/employers', '/contact', '/featured-talent'],
    '/career-partner': ['/submit-cv', '/about', '/contact'],
    '/featured-talent': ['/employers', '/post-job', '/contact']
  };

  return relevancyMap[currentPage] || [];
};

// Generate structured data for different page types
export const getPageSchema = (pageType: string, pageData: any) => {
  const baseUrl = seoConfig.siteUrl;
  
  switch (pageType) {
    case 'homepage':
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": seoConfig.siteName,
        "url": baseUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/jobs?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
      
    case 'contact':
      return {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact MyRecruita",
        "description": "Get in touch with MyRecruita for recruitment services",
        "url": `${baseUrl}/contact`
      };
      
    case 'about':
      return {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About MyRecruita", 
        "description": "Learn about MyRecruita's mission and expertise in recruitment",
        "url": `${baseUrl}/about`
      };
      
    default:
      return null;
  }
};

// Performance optimization suggestions
export const getPerformanceSuggestions = (metrics: {
  loadTime?: number;
  imageCount?: number;
  scriptCount?: number;
  cssCount?: number;
}): string[] => {
  const suggestions: string[] = [];
  
  if (metrics.loadTime && metrics.loadTime > 3000) {
    suggestions.push('Page load time over 3 seconds - consider image optimization');
  }
  
  if (metrics.imageCount && metrics.imageCount > 10) {
    suggestions.push('High number of images - implement lazy loading');
  }
  
  if (metrics.scriptCount && metrics.scriptCount > 5) {
    suggestions.push('Too many scripts - consider bundling and minification');
  }
  
  if (metrics.cssCount && metrics.cssCount > 3) {
    suggestions.push('Multiple CSS files - consider combining and minifying');
  }
  
  return suggestions;
};

// Content strategy keywords by sector
export const sectorKeywords = {
  finance: [
    'finance jobs uk',
    'accounting careers',
    'financial analyst roles',
    'investment banking jobs',
    'audit positions uk',
    'treasury jobs london',
    'risk management careers',
    'financial planning jobs'
  ],
  it: [
    'it jobs uk',
    'software developer roles',
    'cybersecurity jobs',
    'data analyst positions',
    'cloud engineer careers',
    'devops jobs london',
    'python developer uk',
    'tech recruitment'
  ],
  legal: [
    'legal jobs uk',
    'solicitor positions',
    'barrister careers',
    'paralegal jobs',
    'legal counsel roles',
    'compliance jobs uk',
    'contract lawyer positions',
    'litigation careers'
  ],
  hr: [
    'hr jobs uk',
    'human resources careers',
    'hr manager positions',
    'talent acquisition jobs',
    'hr business partner roles',
    'people operations uk',
    'hr advisor careers',
    'employee relations jobs'
  ]
};

export const generateKeywordSuggestions = (sector: keyof typeof sectorKeywords): string[] => {
  return sectorKeywords[sector] || [];
};