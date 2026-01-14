/**
 * Validation utilities for CV parsing
 * Zod schemas and data validation for extracted CV data
 */

// ============================================================================
// Zod-like Schema Validation (Deno-compatible)
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  confidence: number; // 0-100
  originalValue: unknown;
  cleanedValue: unknown;
  issues: string[];
}

// ============================================================================
// Email Validation
// ============================================================================

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const COMMON_EMAIL_TYPOS: Record<string, string> = {
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'yahoo.con': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'outlook.con': 'outlook.com',
  'outlook.co': 'outlook.com',
};

export function validateEmail(email: unknown): FieldValidation {
  const issues: string[] = [];
  let confidence = 100;
  
  if (typeof email !== 'string') {
    return {
      field: 'email',
      isValid: false,
      confidence: 0,
      originalValue: email,
      cleanedValue: null,
      issues: ['Email is not a string']
    };
  }

  let cleaned = email.trim().toLowerCase();
  
  // Fix common typos
  for (const [typo, fix] of Object.entries(COMMON_EMAIL_TYPOS)) {
    if (cleaned.endsWith(typo)) {
      cleaned = cleaned.replace(typo, fix);
      issues.push(`Fixed typo: ${typo} -> ${fix}`);
      confidence -= 5;
    }
  }

  // Validate format
  if (!EMAIL_REGEX.test(cleaned)) {
    return {
      field: 'email',
      isValid: false,
      confidence: 0,
      originalValue: email,
      cleanedValue: cleaned,
      issues: ['Invalid email format', ...issues]
    };
  }

  // Check for suspicious patterns
  if (cleaned.includes('..')) {
    issues.push('Email contains consecutive dots');
    confidence -= 10;
  }
  
  if (cleaned.startsWith('.') || cleaned.includes('.@')) {
    issues.push('Email has dot in invalid position');
    confidence -= 15;
  }

  return {
    field: 'email',
    isValid: true,
    confidence: Math.max(0, confidence),
    originalValue: email,
    cleanedValue: cleaned,
    issues
  };
}

// ============================================================================
// Phone Validation & Normalization
// ============================================================================

const PHONE_PATTERNS = {
  UK: /^(?:\+44|0044|0)?\s*[1-9]\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/,
  US: /^(?:\+1|1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
  INTL: /^\+?[1-9]\d{6,14}$/,
  GENERIC: /^[\d\s().+-]{7,20}$/
};

export function validatePhone(phone: unknown): FieldValidation {
  const issues: string[] = [];
  let confidence = 100;

  if (typeof phone !== 'string') {
    return {
      field: 'phone',
      isValid: false,
      confidence: 0,
      originalValue: phone,
      cleanedValue: null,
      issues: ['Phone is not a string']
    };
  }

  const original = phone;
  let cleaned = phone.trim();

  // Remove common noise
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Extract just digits for validation
  const digitsOnly = cleaned.replace(/\D/g, '');

  if (digitsOnly.length < 7) {
    return {
      field: 'phone',
      isValid: false,
      confidence: 0,
      originalValue: original,
      cleanedValue: cleaned,
      issues: ['Phone number too short (less than 7 digits)']
    };
  }

  if (digitsOnly.length > 15) {
    issues.push('Phone number unusually long');
    confidence -= 20;
  }

  // Check against patterns
  let matchedPattern = false;
  for (const [name, pattern] of Object.entries(PHONE_PATTERNS)) {
    if (pattern.test(cleaned) || pattern.test(digitsOnly)) {
      matchedPattern = true;
      break;
    }
  }

  if (!matchedPattern) {
    issues.push('Phone does not match known formats');
    confidence -= 15;
  }

  // Normalize to E.164-like format if possible
  let normalized = cleaned;
  if (digitsOnly.startsWith('44') && digitsOnly.length === 12) {
    normalized = `+${digitsOnly}`;
  } else if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
    normalized = `+${digitsOnly}`;
  } else if (digitsOnly.length === 10 && !digitsOnly.startsWith('0')) {
    // Assume US number
    normalized = `+1${digitsOnly}`;
  } else if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    // UK format starting with 0
    normalized = `+44${digitsOnly.substring(1)}`;
  }

  return {
    field: 'phone',
    isValid: true,
    confidence: Math.max(0, confidence),
    originalValue: original,
    cleanedValue: normalized,
    issues
  };
}

// ============================================================================
// Name Validation
// ============================================================================

const TITLE_PREFIXES = /^(mr\.?|mrs\.?|ms\.?|miss|dr\.?|prof\.?|sir|dame)\s+/i;

export function validateName(name: unknown): FieldValidation {
  const issues: string[] = [];
  let confidence = 100;

  if (typeof name !== 'string') {
    return {
      field: 'name',
      isValid: false,
      confidence: 0,
      originalValue: name,
      cleanedValue: null,
      issues: ['Name is not a string']
    };
  }

  let cleaned = name.trim();

  // Remove titles
  if (TITLE_PREFIXES.test(cleaned)) {
    cleaned = cleaned.replace(TITLE_PREFIXES, '');
    issues.push('Removed title prefix');
    confidence -= 5;
  }

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Title case
  cleaned = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Validation checks
  if (cleaned.length < 2) {
    return {
      field: 'name',
      isValid: false,
      confidence: 0,
      originalValue: name,
      cleanedValue: cleaned,
      issues: ['Name too short']
    };
  }

  if (cleaned.length > 100) {
    issues.push('Name unusually long');
    confidence -= 20;
  }

  // Check for suspicious characters
  if (/[0-9]/.test(cleaned)) {
    issues.push('Name contains numbers');
    confidence -= 30;
  }

  if (/[@#$%^&*()+=\[\]{};:"|<>?/\\]/.test(cleaned)) {
    issues.push('Name contains special characters');
    confidence -= 30;
  }

  // Check for single-word name
  if (!cleaned.includes(' ')) {
    issues.push('Name appears to be single word (no surname)');
    confidence -= 10;
  }

  return {
    field: 'name',
    isValid: true,
    confidence: Math.max(0, confidence),
    originalValue: name,
    cleanedValue: cleaned,
    issues
  };
}

// ============================================================================
// URL/LinkedIn Validation
// ============================================================================

const LINKEDIN_REGEX = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;

export function extractLinkedIn(text: string): string | null {
  const match = text.match(LINKEDIN_REGEX);
  if (match) {
    return `https://linkedin.com/in/${match[1]}`;
  }
  return null;
}

// ============================================================================
// Text Quality Validation
// ============================================================================

export interface TextQualityResult {
  isValid: boolean;
  charCount: number;
  wordCount: number;
  specialCharRatio: number;
  hasMinimumContent: boolean;
  issues: string[];
}

export function validateTextQuality(text: string, minChars = 200, minWords = 30): TextQualityResult {
  const issues: string[] = [];
  
  const charCount = text.length;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Calculate special character ratio
  const specialChars = text.replace(/[a-zA-Z0-9\s]/g, '').length;
  const specialCharRatio = charCount > 0 ? specialChars / charCount : 0;

  const hasMinimumContent = charCount >= minChars && wordCount >= minWords;

  if (charCount < minChars) {
    issues.push(`Text too short: ${charCount} chars (need ${minChars}+)`);
  }

  if (wordCount < minWords) {
    issues.push(`Too few words: ${wordCount} words (need ${minWords}+)`);
  }

  if (specialCharRatio > 0.3) {
    issues.push(`High special character ratio: ${(specialCharRatio * 100).toFixed(1)}%`);
  }

  // Check for binary/garbage content
  const controlChars = (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
  if (controlChars > 10) {
    issues.push(`Contains ${controlChars} control characters (possible binary content)`);
  }

  return {
    isValid: hasMinimumContent && specialCharRatio <= 0.5 && controlChars <= 10,
    charCount,
    wordCount,
    specialCharRatio,
    hasMinimumContent,
    issues
  };
}

// ============================================================================
// Extracted Data Validation Schema
// ============================================================================

export interface ExtractedDataValidation {
  isValid: boolean;
  overallConfidence: number;
  fields: Record<string, FieldValidation>;
  criticalMissing: string[];
  warnings: string[];
}

export function validateExtractedData(data: Record<string, unknown>): ExtractedDataValidation {
  const fields: Record<string, FieldValidation> = {};
  const criticalMissing: string[] = [];
  const warnings: string[] = [];

  // Validate critical fields
  if (data.name) {
    fields.name = validateName(data.name);
    if (!fields.name.isValid) {
      criticalMissing.push('name');
    }
  } else {
    criticalMissing.push('name');
  }

  if (data.email) {
    fields.email = validateEmail(data.email);
    if (!fields.email.isValid) {
      warnings.push('Invalid email format');
    }
  } else {
    criticalMissing.push('email');
  }

  if (data.phone) {
    fields.phone = validatePhone(data.phone);
    if (!fields.phone.isValid) {
      warnings.push('Invalid phone format');
    }
  } else {
    warnings.push('Phone number not found');
  }

  // Calculate overall confidence
  const validatedFields = Object.values(fields);
  const overallConfidence = validatedFields.length > 0
    ? validatedFields.reduce((sum, f) => sum + f.confidence, 0) / validatedFields.length
    : 0;

  return {
    isValid: criticalMissing.length === 0,
    overallConfidence,
    fields,
    criticalMissing,
    warnings
  };
}

// ============================================================================
// Sector Validation
// ============================================================================

const VALID_SECTORS = [
  'Finance',
  'Technology',
  'Healthcare',
  'Legal',
  'Engineering',
  'Marketing',
  'Human Resources',
  'Sales',
  'Operations',
  'Other'
];

export function normalizeSector(sector: unknown): string {
  if (typeof sector !== 'string') return 'Other';
  
  const normalized = sector.trim();
  const found = VALID_SECTORS.find(
    s => s.toLowerCase() === normalized.toLowerCase()
  );
  
  return found || 'Other';
}

// ============================================================================
// Seniority Level Validation
// ============================================================================

const SENIORITY_LEVELS = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP',
  'C-Level',
  'Executive'
];

export function normalizeSeniority(seniority: unknown): string {
  if (typeof seniority !== 'string') return 'Mid-Level';
  
  const normalized = seniority.trim();
  const found = SENIORITY_LEVELS.find(
    s => s.toLowerCase() === normalized.toLowerCase()
  );
  
  return found || 'Mid-Level';
}

// ============================================================================
// Years Experience Validation
// ============================================================================

export function validateYearsExperience(years: unknown): number {
  if (typeof years === 'number') {
    return Math.max(0, Math.min(50, Math.round(years)));
  }
  
  if (typeof years === 'string') {
    const parsed = parseInt(years, 10);
    if (!isNaN(parsed)) {
      return Math.max(0, Math.min(50, parsed));
    }
  }
  
  return 0;
}
