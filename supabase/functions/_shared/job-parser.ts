/**
 * Job Description Parser
 * 
 * AI-powered extraction of structured job requirements from free-text descriptions.
 * Ensures consistent interpretation regardless of how job descriptions are written.
 */

import { callAI, AITool } from './ai-client.ts';

// ============================================================================
// Types
// ============================================================================

export interface SkillRequirement {
  skill: string;
  importance: 'critical' | 'preferred' | 'nice-to-have';
  normalized_skill?: string; // After taxonomy normalization
}

export interface ParsedJobRequirements {
  title: string;
  seniority_level: 'Entry Level' | 'Junior' | 'Mid-Level' | 'Senior' | 'Lead' | 'Manager' | 'Director' | 'VP' | 'C-Level' | 'Executive';
  required_skills: SkillRequirement[];
  years_experience: { min: number; max: number | null };
  location: {
    city?: string;
    region?: string;
    country?: string;
    remote_ok: boolean;
    hybrid_ok: boolean;
  };
  sector: string;
  certifications_required: string[];
  education_requirement: string;
  key_responsibilities: string[];
  deal_breakers: string[];
  salary_range?: { min?: number; max?: number; currency?: string };
  contract_type?: 'permanent' | 'contract' | 'temp' | 'part-time';
}

// ============================================================================
// Job Parsing Tool Schema
// ============================================================================

function getJobParsingToolSchema(): AITool {
  return {
    type: 'function',
    function: {
      name: 'extract_job_requirements',
      description: 'Extract structured requirements from a job description',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The job title being recruited for'
          },
          seniority_level: {
            type: 'string',
            enum: ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Manager', 'Director', 'VP', 'C-Level', 'Executive'],
            description: 'Expected seniority level for this role'
          },
          required_skills: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                skill: { type: 'string', description: 'The skill name' },
                importance: { 
                  type: 'string', 
                  enum: ['critical', 'preferred', 'nice-to-have'],
                  description: 'How important this skill is for the role'
                }
              },
              required: ['skill', 'importance']
            },
            description: 'List of required skills with importance levels'
          },
          years_experience: {
            type: 'object',
            properties: {
              min: { type: 'integer', description: 'Minimum years of experience required' },
              max: { type: 'integer', description: 'Maximum years (null if no upper limit)' }
            },
            required: ['min']
          },
          location: {
            type: 'object',
            properties: {
              city: { type: 'string', description: 'City if specified' },
              region: { type: 'string', description: 'Region or area (e.g., Midlands, South East)' },
              country: { type: 'string', description: 'Country (default UK)' },
              remote_ok: { type: 'boolean', description: 'Whether remote work is accepted' },
              hybrid_ok: { type: 'boolean', description: 'Whether hybrid work is accepted' }
            },
            required: ['remote_ok', 'hybrid_ok']
          },
          sector: {
            type: 'string',
            description: 'The industry sector (e.g., Finance, Technology, Healthcare)'
          },
          certifications_required: {
            type: 'array',
            items: { type: 'string' },
            description: 'Required certifications (e.g., ACA, ACCA, CPA, PMP)'
          },
          education_requirement: {
            type: 'string',
            description: 'Minimum education level required'
          },
          key_responsibilities: {
            type: 'array',
            items: { type: 'string' },
            description: 'Main responsibilities of the role (top 5-7)'
          },
          deal_breakers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Absolute requirements that candidates must have (e.g., "must have CPA", "no visa sponsorship")'
          },
          salary_range: {
            type: 'object',
            properties: {
              min: { type: 'number', description: 'Minimum salary' },
              max: { type: 'number', description: 'Maximum salary' },
              currency: { type: 'string', description: 'Currency (default GBP)' }
            }
          },
          contract_type: {
            type: 'string',
            enum: ['permanent', 'contract', 'temp', 'part-time'],
            description: 'Type of employment contract'
          }
        },
        required: [
          'title', 'seniority_level', 'required_skills', 'years_experience',
          'location', 'sector', 'certifications_required', 'education_requirement',
          'key_responsibilities', 'deal_breakers'
        ],
        additionalProperties: false
      }
    }
  };
}

// ============================================================================
// System Prompt
// ============================================================================

const JOB_PARSING_SYSTEM_PROMPT = `You are an expert recruitment consultant specializing in analyzing job descriptions.

Your task is to extract structured requirements from job descriptions with high accuracy.

GUIDELINES:
1. For skills, identify importance levels:
   - "critical": Must-have skills explicitly stated as required
   - "preferred": Mentioned as desirable or advantageous
   - "nice-to-have": Mentioned but not emphasized

2. For experience years:
   - If stated as "5+ years", set min=5, max=null
   - If stated as "3-5 years", set min=3, max=5
   - If not specified, infer from seniority level

3. For location:
   - Extract city/region if mentioned
   - Set remote_ok/hybrid_ok based on explicit mentions
   - Default to UK if country not specified

4. For deal_breakers:
   - Include absolute requirements like specific certifications
   - Include visa/sponsorship requirements if mentioned
   - Include mandatory qualifications

5. Be thorough but accurate - extract only what is stated or clearly implied.`;

// ============================================================================
// Main Parser Function
// ============================================================================

export async function parseJobDescription(
  jobDescription: string,
  apiKey: string
): Promise<{ requirements: ParsedJobRequirements; raw_response?: unknown }> {
  if (!jobDescription || jobDescription.trim().length < 50) {
    throw new Error('Job description must be at least 50 characters');
  }

  const tool = getJobParsingToolSchema();
  
  const response = await callAI({
    systemPrompt: JOB_PARSING_SYSTEM_PROMPT,
    userPrompt: `Extract structured requirements from this job description:\n\n${jobDescription}`,
    tools: [tool],
    toolChoice: { type: 'function', function: { name: 'extract_job_requirements' } },
    apiKey,
  });

  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall || toolCall.function.name !== 'extract_job_requirements') {
    console.error('Unexpected AI response:', JSON.stringify(response));
    throw new Error('Failed to parse job description');
  }

  const requirements = JSON.parse(toolCall.function.arguments) as ParsedJobRequirements;
  
  return {
    requirements,
    raw_response: response
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function extractCriticalSkills(requirements: ParsedJobRequirements): string[] {
  return requirements.required_skills
    .filter(s => s.importance === 'critical')
    .map(s => s.normalized_skill || s.skill);
}

export function extractAllSkills(requirements: ParsedJobRequirements): string[] {
  return requirements.required_skills.map(s => s.normalized_skill || s.skill);
}

export function hasMatchingDealBreakers(
  candidateProfile: { certifications?: string[]; education_level?: string },
  requirements: ParsedJobRequirements
): { passes: boolean; failures: string[] } {
  const failures: string[] = [];
  
  // Check certifications
  const candidateCerts = (candidateProfile.certifications || []).map(c => c.toLowerCase());
  for (const reqCert of requirements.certifications_required) {
    const normalizedReq = reqCert.toLowerCase();
    const hasCert = candidateCerts.some(c => 
      c.includes(normalizedReq) || normalizedReq.includes(c)
    );
    if (!hasCert) {
      failures.push(`Missing certification: ${reqCert}`);
    }
  }
  
  return {
    passes: failures.length === 0,
    failures
  };
}
