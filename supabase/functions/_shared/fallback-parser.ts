/**
 * Fallback regex-based parser for CV extraction
 * Used when AI extraction fails or for validation
 */

// ============================================================================
// Types
// ============================================================================

export interface FallbackExtractionResult {
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedIn: string | null;
  location: string | null;
  extractionMethod: 'fallback';
  confidence: number;
  fieldsExtracted: string[];
}

// ============================================================================
// Email Extraction
// ============================================================================

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function extractEmail(text: string): string | null {
  const matches = text.match(EMAIL_REGEX);
  if (!matches || matches.length === 0) return null;
  
  // Filter out common false positives
  const validEmails = matches.filter(email => {
    const lower = email.toLowerCase();
    // Skip file extensions that look like emails
    if (lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return false;
    }
    // Skip version numbers
    if (/\d+\.\d+\.\d+/.test(email)) {
      return false;
    }
    return true;
  });
  
  return validEmails.length > 0 ? validEmails[0].toLowerCase() : null;
}

// ============================================================================
// Phone Extraction
// ============================================================================

const PHONE_PATTERNS = [
  // International format
  /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
  // UK format
  /(?:0|\+?44)\s*\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
  // US format
  /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  // Generic with separators
  /\d{3,4}[-.\s]\d{3,4}[-.\s]\d{3,4}/g,
  // Continuous digits (fallback)
  /(?<!\d)(?:0|\+?\d{1,3})?\d{9,12}(?!\d)/g
];

const PHONE_KEYWORDS = ['phone', 'tel', 'mobile', 'cell', 'contact'];

export function extractPhone(text: string): string | null {
  // First, try to find phone numbers near phone keywords
  const lines = text.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (PHONE_KEYWORDS.some(kw => lowerLine.includes(kw))) {
      for (const pattern of PHONE_PATTERNS) {
        const matches = line.match(pattern);
        if (matches && matches.length > 0) {
          const phone = matches[0].trim();
          const digitsOnly = phone.replace(/\D/g, '');
          if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
            return phone;
          }
        }
      }
    }
  }
  
  // Then try all patterns on full text
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const phone = match.trim();
        const digitsOnly = phone.replace(/\D/g, '');
        // Valid phone numbers are typically 7-15 digits
        if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
          // Avoid dates and years
          if (!/^(19|20)\d{2}$/.test(digitsOnly) && !/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(phone)) {
            return phone;
          }
        }
      }
    }
  }
  
  return null;
}

// ============================================================================
// LinkedIn Extraction
// ============================================================================

const LINKEDIN_PATTERNS = [
  /https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi,
  /linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi,
  /linkedin:\s*([a-zA-Z0-9-]+)/gi
];

export function extractLinkedIn(text: string): string | null {
  for (const pattern of LINKEDIN_PATTERNS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const match = matches[0];
      const usernameMatch = match.match(/in\/([a-zA-Z0-9-]+)/i);
      if (usernameMatch) {
        return `https://linkedin.com/in/${usernameMatch[1]}`;
      }
    }
  }
  return null;
}

// ============================================================================
// Name Extraction
// ============================================================================

const NAME_KEYWORDS = ['name', 'curriculum vitae', 'cv', 'resume', 'profile'];
const TITLE_PATTERNS = /^(mr\.?|mrs\.?|ms\.?|miss|dr\.?|prof\.?|sir|dame)\s+/i;

export function extractName(text: string): string | null {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) return null;
  
  // Strategy 1: First non-empty line that looks like a name (common CV format)
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(TITLE_PATTERNS, '').trim();
    
    // Skip if too long or too short
    if (cleaned.length < 3 || cleaned.length > 60) continue;
    
    // Skip if contains obvious non-name content
    if (/@|http|www\.|\.com|\.co\.uk|phone|email|tel:|mobile:|address:/i.test(cleaned)) continue;
    
    // Skip if mostly numbers
    const digitRatio = (cleaned.match(/\d/g) || []).length / cleaned.length;
    if (digitRatio > 0.3) continue;
    
    // Check if it looks like a name (2-4 capitalized words)
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 5) {
      const allCapitalized = words.every(w => /^[A-Z][a-zA-Z'-]*$/.test(w));
      if (allCapitalized) {
        return cleaned;
      }
    }
  }
  
  // Strategy 2: Look for "Name:" pattern
  for (const line of lines.slice(0, 20)) {
    const nameMatch = line.match(/^name\s*:\s*(.+)$/i);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      if (name.length >= 3 && name.length <= 60) {
        return name;
      }
    }
  }
  
  // Strategy 3: First substantial line after CV/Resume keyword
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const lowerLine = lines[i].toLowerCase();
    if (NAME_KEYWORDS.some(kw => lowerLine.includes(kw))) {
      // Check next few lines
      for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
        const candidate = lines[j].replace(TITLE_PATTERNS, '').trim();
        if (candidate.length >= 3 && candidate.length <= 60) {
          if (!/[@|http|www\.|\.com|phone|email|tel:|mobile:]/i.test(candidate)) {
            return candidate;
          }
        }
      }
    }
  }
  
  return null;
}

// ============================================================================
// Location Extraction
// ============================================================================

const UK_CITIES = [
  'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'liverpool',
  'edinburgh', 'bristol', 'sheffield', 'newcastle', 'cardiff', 'nottingham',
  'cambridge', 'oxford', 'reading', 'southampton', 'leicester', 'coventry'
];

const LOCATION_PATTERNS = [
  /(?:location|based in|located in|city|address)\s*[:\-]?\s*([^,\n]+)/gi,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s*(?:UK|United Kingdom|England|Scotland|Wales)/gi,
  /[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}/gi // UK postcode
];

export function extractLocation(text: string): string | null {
  // Try explicit location patterns
  for (const pattern of LOCATION_PATTERNS) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0].replace(/^(location|based in|located in|city|address)\s*[:\-]?\s*/i, '').trim();
    }
  }
  
  // Try to find known UK cities
  const lowerText = text.toLowerCase();
  for (const city of UK_CITIES) {
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(lowerText)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  return null;
}

// ============================================================================
// Main Fallback Extraction
// ============================================================================

export function extractWithFallback(text: string): FallbackExtractionResult {
  const fieldsExtracted: string[] = [];
  let confidence = 0;
  
  const email = extractEmail(text);
  if (email) {
    fieldsExtracted.push('email');
    confidence += 30;
  }
  
  const phone = extractPhone(text);
  if (phone) {
    fieldsExtracted.push('phone');
    confidence += 20;
  }
  
  const name = extractName(text);
  if (name) {
    fieldsExtracted.push('name');
    confidence += 30;
  }
  
  const linkedIn = extractLinkedIn(text);
  if (linkedIn) {
    fieldsExtracted.push('linkedIn');
    confidence += 10;
  }
  
  const location = extractLocation(text);
  if (location) {
    fieldsExtracted.push('location');
    confidence += 10;
  }
  
  return {
    name,
    email,
    phone,
    linkedIn,
    location,
    extractionMethod: 'fallback',
    confidence: Math.min(100, confidence),
    fieldsExtracted
  };
}

// ============================================================================
// Merge AI and Fallback Results
// ============================================================================

export interface MergeOptions {
  preferAI: boolean;
  requireEmail: boolean;
  requireName: boolean;
}

export function mergeExtractions(
  aiData: Record<string, unknown> | null,
  fallbackData: FallbackExtractionResult,
  options: MergeOptions = { preferAI: true, requireEmail: true, requireName: true }
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...aiData };
  
  // Fill in missing fields from fallback
  if (!result.email && fallbackData.email) {
    result.email = fallbackData.email;
    result._emailSource = 'fallback';
  }
  
  if (!result.phone && fallbackData.phone) {
    result.phone = fallbackData.phone;
    result._phoneSource = 'fallback';
  }
  
  if (!result.name && fallbackData.name) {
    result.name = fallbackData.name;
    result._nameSource = 'fallback';
  }
  
  if (!result.location && fallbackData.location) {
    result.location = fallbackData.location;
    result._locationSource = 'fallback';
  }
  
  // Track extraction method
  result._extractionMethod = aiData ? 'ai_with_fallback' : 'fallback_only';
  result._fallbackConfidence = fallbackData.confidence;
  result._fallbackFieldsExtracted = fallbackData.fieldsExtracted;
  
  return result;
}
