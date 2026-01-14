/**
 * Duplicate detection for CV imports
 * Checks for existing CVs with matching email or similar names
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// ============================================================================
// Types
// ============================================================================

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchType: 'none' | 'email_exact' | 'name_similar' | 'phone_exact';
  existingId?: string;
  existingName?: string;
  existingEmail?: string;
  confidence: number;
  message?: string;
}

export interface DuplicateCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

// ============================================================================
// String Similarity (Levenshtein Distance)
// ============================================================================

function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[s1.length][s2.length];
}

function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;
  const distance = levenshteinDistance(str1, str2);
  return Math.round((1 - distance / maxLen) * 100);
}

// ============================================================================
// Name Normalization
// ============================================================================

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// ============================================================================
// Duplicate Check Functions
// ============================================================================

export async function checkForDuplicates(
  supabase: SupabaseClient,
  email: string,
  name: string,
  phone?: string
): Promise<DuplicateCheckResult> {
  try {
    // Check for exact email match first (most reliable)
    if (email) {
      const { data: emailMatches, error: emailError } = await supabase
        .from('cv_submissions')
        .select('id, name, email, phone, created_at')
        .eq('email', email.toLowerCase())
        .limit(1);

      if (!emailError && emailMatches && emailMatches.length > 0) {
        const match = emailMatches[0];
        return {
          isDuplicate: true,
          matchType: 'email_exact',
          existingId: match.id,
          existingName: match.name,
          existingEmail: match.email,
          confidence: 100,
          message: `Exact email match found: ${match.email} (submitted ${new Date(match.created_at).toLocaleDateString()})`
        };
      }
    }

    // Check for exact phone match
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      if (normalizedPhone.length >= 7) {
        const { data: phoneMatches, error: phoneError } = await supabase
          .from('cv_submissions')
          .select('id, name, email, phone, created_at')
          .not('phone', 'is', null);

        if (!phoneError && phoneMatches) {
          for (const match of phoneMatches) {
            if (match.phone && normalizePhone(match.phone) === normalizedPhone) {
              return {
                isDuplicate: true,
                matchType: 'phone_exact',
                existingId: match.id,
                existingName: match.name,
                existingEmail: match.email,
                confidence: 95,
                message: `Exact phone match found: ${match.phone} (${match.name})`
              };
            }
          }
        }
      }
    }

    // Check for similar names (fuzzy match)
    if (name) {
      const normalizedInputName = normalizeName(name);
      
      // Get recent submissions to check for name similarity
      const { data: recentSubmissions, error: recentError } = await supabase
        .from('cv_submissions')
        .select('id, name, email, phone, created_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (!recentError && recentSubmissions) {
        for (const submission of recentSubmissions) {
          const normalizedExistingName = normalizeName(submission.name);
          const similarity = calculateSimilarity(normalizedInputName, normalizedExistingName);
          
          // 90%+ similarity is very likely the same person
          if (similarity >= 90) {
            return {
              isDuplicate: true,
              matchType: 'name_similar',
              existingId: submission.id,
              existingName: submission.name,
              existingEmail: submission.email,
              confidence: similarity,
              message: `Similar name found: "${submission.name}" (${similarity}% match)`
            };
          }
        }
      }
    }

    return {
      isDuplicate: false,
      matchType: 'none',
      confidence: 0
    };

  } catch (error) {
    console.error('[DuplicateCheck] Error checking for duplicates:', error);
    // Don't block import on duplicate check failure
    return {
      isDuplicate: false,
      matchType: 'none',
      confidence: 0,
      message: 'Duplicate check failed - proceeding with import'
    };
  }
}

// ============================================================================
// Batch Duplicate Check
// ============================================================================

export interface BatchDuplicateResult {
  filePath: string;
  duplicateCheck: DuplicateCheckResult;
}

export async function checkBatchForDuplicates(
  supabase: SupabaseClient,
  candidates: Array<{ filePath: string; email: string; name: string; phone?: string }>
): Promise<Map<string, DuplicateCheckResult>> {
  const results = new Map<string, DuplicateCheckResult>();
  
  for (const candidate of candidates) {
    const result = await checkForDuplicates(
      supabase,
      candidate.email,
      candidate.name,
      candidate.phone
    );
    results.set(candidate.filePath, result);
  }
  
  return results;
}

// ============================================================================
// Merge Suggestion
// ============================================================================

export interface MergeSuggestion {
  action: 'skip' | 'update' | 'create_new';
  reason: string;
  existingId?: string;
}

export function suggestMergeAction(duplicateResult: DuplicateCheckResult): MergeSuggestion {
  if (!duplicateResult.isDuplicate) {
    return {
      action: 'create_new',
      reason: 'No duplicate found'
    };
  }

  if (duplicateResult.matchType === 'email_exact') {
    return {
      action: 'update',
      reason: `Update existing record for ${duplicateResult.existingEmail}`,
      existingId: duplicateResult.existingId
    };
  }

  if (duplicateResult.matchType === 'phone_exact') {
    return {
      action: 'update',
      reason: `Update existing record with matching phone for ${duplicateResult.existingName}`,
      existingId: duplicateResult.existingId
    };
  }

  if (duplicateResult.matchType === 'name_similar' && duplicateResult.confidence >= 95) {
    return {
      action: 'update',
      reason: `High confidence name match (${duplicateResult.confidence}%) - update ${duplicateResult.existingName}`,
      existingId: duplicateResult.existingId
    };
  }

  // For lower confidence name matches, let user decide
  return {
    action: 'skip',
    reason: `Possible duplicate: ${duplicateResult.existingName} (${duplicateResult.confidence}% match)`,
    existingId: duplicateResult.existingId
  };
}
