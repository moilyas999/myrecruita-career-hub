/**
 * Skills Normalization & Taxonomy
 * 
 * Maps equivalent skills to canonical forms for accurate matching.
 * Handles synonyms, abbreviations, and variations in skill naming.
 */

// ============================================================================
// Skill Synonyms Map - Comprehensive Recruitment Industry Taxonomy
// ============================================================================

const SKILL_SYNONYMS: Record<string, string[]> = {
  // Accounting & Finance Qualifications
  'aca': ['aca qualified', 'icaew', 'chartered accountant', 'institute of chartered accountants'],
  'acca': ['acca qualified', 'association of chartered certified accountants'],
  'cima': ['cima qualified', 'chartered institute of management accountants'],
  'cpa': ['cpa qualified', 'certified public accountant'],
  'aicpa': ['american institute of cpas'],
  'aat': ['aat qualified', 'association of accounting technicians'],
  'cfa': ['cfa charterholder', 'chartered financial analyst'],
  'fca': ['fca qualified', 'fellow chartered accountant'],
  
  // Finance Skills
  'financial modeling': ['financial modelling', 'fin modeling', 'financial models', 'financial planning models'],
  'financial analysis': ['fin analysis', 'financial analytics', 'financial reporting analysis'],
  'management accounts': ['management accounting', 'mgmt accounts', 'management reporting'],
  'statutory accounts': ['statutory reporting', 'year-end accounts', 'annual accounts'],
  'budgeting': ['budget management', 'budgetary control', 'budget planning', 'budget preparation'],
  'forecasting': ['financial forecasting', 'forecast modeling', 'revenue forecasting'],
  'month-end close': ['month end', 'month-end', 'period close', 'month end close'],
  'year-end close': ['year end', 'year-end', 'annual close', 'year end close'],
  'audit': ['auditing', 'internal audit', 'external audit', 'audit preparation'],
  'consolidation': ['group consolidation', 'group accounts', 'consolidations'],
  'vat': ['vat returns', 'value added tax', 'vat compliance'],
  'corporation tax': ['corp tax', 'corporate tax', 'ct600'],
  'payroll': ['payroll processing', 'payroll management', 'paye'],
  
  // Technology
  'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020'],
  'typescript': ['ts', 'type script'],
  'react': ['reactjs', 'react.js', 'react js'],
  'react native': ['rn', 'react-native'],
  'angular': ['angularjs', 'angular.js', 'angular 2', 'angular 4', 'angular 8', 'angular 12'],
  'vue': ['vuejs', 'vue.js', 'vue js', 'vue 2', 'vue 3'],
  'node': ['nodejs', 'node.js', 'node js'],
  'python': ['py', 'python3', 'python 3'],
  'java': ['java8', 'java 8', 'java11', 'java 11', 'java17', 'java 17'],
  'c#': ['csharp', 'c sharp', 'dotnet', '.net'],
  'sql': ['sql server', 'mssql', 'mysql', 'postgresql', 'postgres', 'tsql', 't-sql'],
  'aws': ['amazon web services', 'amazon aws'],
  'azure': ['microsoft azure', 'ms azure'],
  'gcp': ['google cloud', 'google cloud platform'],
  'docker': ['containers', 'containerization', 'docker containers'],
  'kubernetes': ['k8s', 'kube'],
  'ci/cd': ['cicd', 'ci cd', 'continuous integration', 'continuous deployment'],
  'git': ['github', 'gitlab', 'bitbucket', 'version control'],
  'agile': ['scrum', 'kanban', 'agile methodology', 'agile methodologies'],
  'devops': ['dev ops', 'development operations'],
  
  // ERP & Business Systems
  'sap': ['sap erp', 'sap s/4hana', 'sap s4hana', 'sap fico'],
  'oracle': ['oracle erp', 'oracle financials', 'oracle cloud'],
  'netsuite': ['oracle netsuite', 'net suite'],
  'sage': ['sage 50', 'sage 200', 'sage intacct', 'sage accounts'],
  'xero': ['xero accounting'],
  'quickbooks': ['quick books', 'qb', 'quickbooks online'],
  'dynamics': ['microsoft dynamics', 'dynamics 365', 'd365', 'dynamics nav', 'dynamics gp'],
  'workday': ['work day', 'workday hcm', 'workday financials'],
  
  // Data & Analytics
  'excel': ['microsoft excel', 'ms excel', 'spreadsheets', 'excel advanced'],
  'power bi': ['powerbi', 'power-bi', 'pbi'],
  'tableau': ['tableau desktop', 'tableau server'],
  'data analysis': ['data analytics', 'data analyst', 'data analytics'],
  'sql reporting': ['ssrs', 'sql server reporting services'],
  'vlookup': ['lookup functions', 'hlookup', 'xlookup', 'index match'],
  'pivot tables': ['pivots', 'pivot table'],
  'macros': ['excel macros', 'vba', 'excel vba'],
  
  // Soft Skills
  'communication': ['communications', 'communication skills', 'verbal communication', 'written communication'],
  'leadership': ['team leadership', 'people leadership', 'staff leadership', 'leading teams'],
  'stakeholder management': ['stakeholder engagement', 'managing stakeholders', 'stakeholder relations'],
  'problem solving': ['problem-solving', 'analytical thinking', 'critical thinking'],
  'time management': ['time-management', 'prioritization', 'meeting deadlines'],
  'team player': ['teamwork', 'collaboration', 'collaborative', 'works well with others'],
  'attention to detail': ['detail oriented', 'detail-oriented', 'meticulous', 'accuracy'],
  'presentation': ['presentation skills', 'presenting', 'board presentations'],
  'project management': ['pm', 'programme management', 'program management'],
  
  // Industry-Specific
  'fmcg': ['fast moving consumer goods', 'consumer goods'],
  'fsi': ['financial services industry', 'banking and finance'],
  'insurance': ['general insurance', 'life insurance', 'insurance sector'],
  'banking': ['retail banking', 'investment banking', 'commercial banking'],
  'private equity': ['pe', 'pe backed', 'pe-backed'],
  'venture capital': ['vc', 'vc backed'],
  'real estate': ['property', 'commercial property', 'residential property'],
  'healthcare': ['health care', 'medical', 'nhs', 'pharma', 'pharmaceutical'],
  'manufacturing': ['production', 'factory', 'industrial'],
  'retail': ['high street', 'ecommerce', 'e-commerce'],
  'professional services': ['consultancy', 'consulting', 'advisory'],
  
  // Recruitment-Specific
  'business partnering': ['bp', 'finance business partnering', 'hr business partnering'],
  'commercial finance': ['commercial accounting', 'commercial analysis'],
  'fp&a': ['fpa', 'financial planning and analysis', 'financial planning & analysis'],
  'ifrs': ['international financial reporting standards', 'ifrs 9', 'ifrs 16'],
  'uk gaap': ['gaap', 'frs 102'],
  'sox': ['sarbanes oxley', 'sox compliance', 'sox controls'],
  'internal controls': ['internal control', 'controls', 'control framework'],
};

// ============================================================================
// Normalization Functions
// ============================================================================

/**
 * Normalize a skill to its canonical form
 */
export function normalizeSkill(skill: string): string {
  const normalized = skill.toLowerCase().trim();
  
  // Check if it's already a canonical skill
  if (SKILL_SYNONYMS[normalized]) {
    return normalized;
  }
  
  // Check if it matches any synonym
  for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    if (synonyms.some(s => s === normalized || normalized.includes(s) || s.includes(normalized))) {
      return canonical;
    }
  }
  
  // Return original if no match found
  return normalized;
}

/**
 * Normalize an array of skills
 */
export function normalizeSkills(skills: string[]): string[] {
  const normalized = skills.map(normalizeSkill);
  // Remove duplicates that may have emerged from normalization
  return [...new Set(normalized)];
}

/**
 * Get all synonyms for a skill (including the skill itself)
 */
export function getSkillSynonyms(skill: string): string[] {
  const normalized = normalizeSkill(skill);
  const synonyms = SKILL_SYNONYMS[normalized] || [];
  return [normalized, ...synonyms];
}

// ============================================================================
// Skill Matching Functions
// ============================================================================

export type MatchLevel = 'exact' | 'synonym' | 'partial' | 'none';

export interface SkillMatch {
  candidateSkill: string;
  requiredSkill: string;
  matchLevel: MatchLevel;
  score: number; // 0-100
}

/**
 * Calculate how well a candidate skill matches a required skill
 */
export function matchSkill(candidateSkill: string, requiredSkill: string): SkillMatch {
  const normalizedCandidate = normalizeSkill(candidateSkill);
  const normalizedRequired = normalizeSkill(requiredSkill);
  
  // Exact match after normalization
  if (normalizedCandidate === normalizedRequired) {
    return {
      candidateSkill,
      requiredSkill,
      matchLevel: 'exact',
      score: 100
    };
  }
  
  // Check if they resolve to the same canonical skill
  const candidateSynonyms = getSkillSynonyms(candidateSkill).map(s => s.toLowerCase());
  const requiredSynonyms = getSkillSynonyms(requiredSkill).map(s => s.toLowerCase());
  
  const hasOverlap = candidateSynonyms.some(cs => 
    requiredSynonyms.some(rs => cs === rs || cs.includes(rs) || rs.includes(cs))
  );
  
  if (hasOverlap) {
    return {
      candidateSkill,
      requiredSkill,
      matchLevel: 'synonym',
      score: 90
    };
  }
  
  // Partial match (one contains the other)
  if (normalizedCandidate.includes(normalizedRequired) || normalizedRequired.includes(normalizedCandidate)) {
    return {
      candidateSkill,
      requiredSkill,
      matchLevel: 'partial',
      score: 60
    };
  }
  
  // No match
  return {
    candidateSkill,
    requiredSkill,
    matchLevel: 'none',
    score: 0
  };
}

/**
 * Match candidate skills against a list of required skills
 * Returns matched, partially matched, and missing skills
 */
export interface SkillMatchResult {
  matched: SkillMatch[];
  partial: SkillMatch[];
  missing: string[];
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
}

export function matchSkillSets(
  candidateSkills: string[],
  requiredSkills: Array<{ skill: string; importance: 'critical' | 'preferred' | 'nice-to-have' }>
): SkillMatchResult {
  const matched: SkillMatch[] = [];
  const partial: SkillMatch[] = [];
  const missing: string[] = [];
  
  // Weight by importance
  const weights = {
    'critical': 3,
    'preferred': 2,
    'nice-to-have': 1
  };
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  for (const required of requiredSkills) {
    const weight = weights[required.importance];
    maxPossibleScore += 100 * weight;
    
    let bestMatch: SkillMatch | null = null;
    
    for (const candidateSkill of candidateSkills) {
      const match = matchSkill(candidateSkill, required.skill);
      
      if (!bestMatch || match.score > bestMatch.score) {
        bestMatch = match;
      }
      
      if (match.score === 100) break; // Perfect match found
    }
    
    if (bestMatch && bestMatch.score >= 60) {
      if (bestMatch.matchLevel === 'exact' || bestMatch.matchLevel === 'synonym') {
        matched.push(bestMatch);
      } else {
        partial.push(bestMatch);
      }
      totalScore += bestMatch.score * weight;
    } else {
      missing.push(required.skill);
    }
  }
  
  return {
    matched,
    partial,
    missing,
    totalScore,
    maxPossibleScore,
    percentage: maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0
  };
}

// ============================================================================
// Bulk Processing
// ============================================================================

/**
 * Extract and normalize skills from a comma-separated string
 */
export function parseSkillsString(skillsString: string | null): string[] {
  if (!skillsString) return [];
  
  return skillsString
    .split(/[,;|]/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(normalizeSkill);
}

/**
 * Combine hard and soft skills into a single normalized array
 */
export function combineSkills(
  hardSkills: string[] | null | undefined,
  softSkills: string[] | null | undefined,
  skillsString: string | null | undefined
): string[] {
  const all: string[] = [];
  
  if (hardSkills) all.push(...hardSkills);
  if (softSkills) all.push(...softSkills);
  if (skillsString) all.push(...parseSkillsString(skillsString));
  
  return normalizeSkills(all);
}
