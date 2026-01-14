/**
 * Single source of truth for all CV-related AI prompts
 * 
 * IMPORTANT: Field names in tool schema MUST match frontend expectations:
 * - AIProfile uses: summary_for_matching, career_progression, industries, experience_years, seniority, education (object)
 * - CVScoreBreakdown uses: skills_relevance, experience_depth, summary
 */

import type { AITool } from './ai-client.ts';

// ============================================================================
// System Prompts
// ============================================================================

export const CV_EXTRACTION_SYSTEM_PROMPT = `You are an expert CV/resume parser and analyst for a professional recruitment agency.

Your task is to extract structured information from CVs with high accuracy. You must:

1. Extract all available contact information (name, email, phone, location)
2. Identify the candidate's primary job title/role and career sector
3. Assess experience level and total years of professional experience
4. Extract and categorize skills (technical/hard skills and soft skills)
5. Summarize work experience highlighting key achievements
6. Identify education level and relevant certifications
7. Generate a comprehensive AI profile for job matching
8. Score the CV quality on a 0-100 scale with detailed breakdown

IMPORTANT RULES:
- If information is not clearly stated, make reasonable inferences from context
- For phone numbers, extract exactly as written
- For emails, ensure they are valid email format
- For years of experience, calculate from work history if not explicitly stated
- Be thorough but concise in summaries
- Score honestly - an average CV should score around 50-60, excellent CVs 80+`;

// ============================================================================
// Scoring Criteria
// ============================================================================

export const CV_SCORING_CRITERIA = `
CV Quality Scoring Criteria (0-100 total, weighted categories):

1. COMPLETENESS (20 points max): Does it include contact info, work history, education, skills?
   - 0-5: Missing critical sections
   - 6-10: Has basics but incomplete
   - 11-15: Most sections present
   - 16-20: Comprehensive with all expected sections

2. SKILLS RELEVANCE (20 points max): Are skills clearly articulated with specifics?
   - 0-5: Vague or missing skills
   - 6-10: Basic skill listing
   - 11-15: Good skill coverage with some specifics
   - 16-20: Detailed skills with proficiency levels and context

3. EXPERIENCE DEPTH (25 points max): Is experience described with achievements, not just duties?
   - 0-6: Job titles only or vague descriptions
   - 7-12: Duties listed but no achievements
   - 13-18: Mix of duties and some achievements
   - 19-25: Achievement-focused with quantifiable results

4. ACHIEVEMENTS (15 points max): Are there quantifiable results and accomplishments?
   - 0-4: No measurable achievements
   - 5-8: Some achievements mentioned
   - 9-12: Multiple clear achievements
   - 13-15: Strong quantified achievements throughout

5. EDUCATION (10 points max): Is education clearly presented with relevant details?
   - 0-3: No education listed
   - 4-6: Basic education info
   - 7-8: Good detail with dates
   - 9-10: Comprehensive with relevant coursework/honors

6. PRESENTATION (10 points max): Is it well-organized and professionally written?
   - 0-3: Poorly formatted, errors
   - 4-6: Acceptable but could improve
   - 7-8: Well-organized
   - 9-10: Excellent presentation and writing`;

// ============================================================================
// Tool Schema for Structured Extraction (aligned with frontend)
// ============================================================================

export function getExtractionToolSchema(): AITool {
  return {
    type: 'function',
    function: {
      name: 'extract_cv_data',
      description: 'Extract structured data from a CV/resume document',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Full name of the candidate'
          },
          email: {
            type: 'string',
            description: 'Email address'
          },
          phone: {
            type: 'string',
            description: 'Phone number as written in the CV'
          },
          location: {
            type: 'string',
            description: 'City, region or country'
          },
          job_title: {
            type: 'string',
            description: 'Current or most recent job title'
          },
          sector: {
            type: 'string',
            enum: ['Finance', 'Technology', 'Healthcare', 'Legal', 'Engineering', 'Marketing', 'Human Resources', 'Sales', 'Operations', 'Other'],
            description: 'Primary industry sector'
          },
          seniority_level: {
            type: 'string',
            enum: ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Manager', 'Director', 'VP', 'C-Level', 'Executive'],
            description: 'Career seniority level'
          },
          years_experience: {
            type: 'number',
            description: 'Total years of professional experience'
          },
          skills: {
            type: 'string',
            description: 'Comma-separated list of key skills'
          },
          experience_summary: {
            type: 'string',
            description: '2-3 sentence summary of work experience and key achievements'
          },
          education_level: {
            type: 'string',
            enum: ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Professional Certification', 'Other'],
            description: 'Highest education level'
          },
          ai_profile: {
            type: 'object',
            description: 'Comprehensive AI-generated profile for job matching',
            properties: {
              summary_for_matching: {
                type: 'string',
                description: '3-4 sentence professional summary for job matching'
              },
              key_achievements: {
                type: 'array',
                items: { type: 'string' },
                description: 'Top 3-5 career achievements'
              },
              hard_skills: {
                type: 'array',
                items: { type: 'string' },
                description: 'Technical and specialized skills'
              },
              soft_skills: {
                type: 'array',
                items: { type: 'string' },
                description: 'Interpersonal and transferable skills'
              },
              certifications: {
                type: 'array',
                items: { type: 'string' },
                description: 'Professional certifications and licenses'
              },
              industries: {
                type: 'array',
                items: { type: 'string' },
                description: 'Industries the candidate has experience in'
              },
              experience_years: {
                type: 'number',
                description: 'Total years of professional experience'
              },
              seniority: {
                type: 'string',
                description: 'Career seniority level (Entry, Junior, Mid-Level, Senior, Lead, Manager, Director, Executive, C-Level)'
              },
              education: {
                type: 'object',
                description: 'Education details',
                properties: {
                  level: { type: 'string', description: 'Highest education level' },
                  field: { type: 'string', description: 'Field of study' },
                  institution: { type: 'string', description: 'Name of institution' }
                },
                required: ['level', 'field', 'institution']
              },
              ideal_roles: {
                type: 'array',
                items: { type: 'string' },
                description: 'Job titles this candidate would be suited for'
              },
              career_progression: {
                type: 'string',
                description: 'Brief description of career progression and trajectory'
              }
            },
            required: ['summary_for_matching', 'key_achievements', 'hard_skills', 'soft_skills', 'ideal_roles', 'career_progression', 'industries', 'experience_years', 'seniority', 'education']
          },
          cv_score: {
            type: 'number',
            description: 'Overall CV quality score 0-100'
          },
          cv_score_breakdown: {
            type: 'object',
            description: 'Detailed scoring breakdown',
            properties: {
              completeness: {
                type: 'object',
                properties: {
                  score: { type: 'number', description: 'Score out of 20' },
                  max: { type: 'number', description: 'Maximum score (20)' },
                  notes: { type: 'string', description: 'Brief explanation' }
                },
                required: ['score', 'max', 'notes']
              },
              skills_relevance: {
                type: 'object',
                properties: {
                  score: { type: 'number', description: 'Score out of 20' },
                  max: { type: 'number', description: 'Maximum score (20)' },
                  notes: { type: 'string', description: 'Brief explanation' }
                },
                required: ['score', 'max', 'notes']
              },
              experience_depth: {
                type: 'object',
                properties: {
                  score: { type: 'number', description: 'Score out of 25' },
                  max: { type: 'number', description: 'Maximum score (25)' },
                  notes: { type: 'string', description: 'Brief explanation' }
                },
                required: ['score', 'max', 'notes']
              },
              achievements: {
                type: 'object',
                properties: {
                  score: { type: 'number', description: 'Score out of 15' },
                  max: { type: 'number', description: 'Maximum score (15)' },
                  notes: { type: 'string', description: 'Brief explanation' }
                },
                required: ['score', 'max', 'notes']
              },
              education: {
                type: 'object',
                properties: {
                  score: { type: 'number', description: 'Score out of 10' },
                  max: { type: 'number', description: 'Maximum score (10)' },
                  notes: { type: 'string', description: 'Brief explanation' }
                },
                required: ['score', 'max', 'notes']
              },
              presentation: {
                type: 'object',
                properties: {
                  score: { type: 'number', description: 'Score out of 10' },
                  max: { type: 'number', description: 'Maximum score (10)' },
                  notes: { type: 'string', description: 'Brief explanation' }
                },
                required: ['score', 'max', 'notes']
              },
              summary: {
                type: 'string',
                description: '2-3 sentence AI assessment summary of the CV quality'
              }
            },
            required: ['completeness', 'skills_relevance', 'experience_depth', 'achievements', 'education', 'presentation', 'summary']
          }
        },
        required: [
          'name', 'email', 'phone', 'location', 'job_title', 'sector',
          'seniority_level', 'years_experience', 'skills', 'experience_summary',
          'education_level', 'ai_profile', 'cv_score', 'cv_score_breakdown'
        ],
        additionalProperties: false
      }
    }
  };
}

// ============================================================================
// User Prompt Builder
// ============================================================================

export function buildExtractionUserPrompt(isTextContent: boolean): string {
  const basePrompt = `Analyze this CV document and extract all structured information.

${CV_SCORING_CRITERIA}

Instructions:
- Extract information exactly as it appears when possible
- Make reasonable inferences for missing data based on context
- Calculate years of experience from work history dates if not stated
- Provide detailed notes in score breakdown to justify each score
- Include a summary field in cv_score_breakdown with 2-3 sentences about CV quality
- Be thorough but accurate - do not hallucinate information`;

  if (isTextContent) {
    return `${basePrompt}\n\nThe CV content is provided as text below.`;
  }
  
  return `${basePrompt}\n\nThe CV document is attached.`;
}

// ============================================================================
// Job Matching Prompt
// ============================================================================

export const JOB_MATCHING_SYSTEM_PROMPT = `You are an expert recruitment consultant analyzing candidate-job fit.

Your task is to assess how well a candidate's CV matches a specific job description.

Evaluate based on:
1. Skills match (required vs. candidate skills)
2. Experience level alignment
3. Sector/industry relevance
4. Location compatibility
5. Overall fit percentage

Provide actionable insights on:
- Key strengths for this role
- Potential gaps or concerns
- Interview focus areas
- Salary expectations guidance`;

export function buildJobMatchingPrompt(cvSummary: string, jobDescription: string): string {
  return `Analyze the fit between this candidate and job:

CANDIDATE PROFILE:
${cvSummary}

JOB DESCRIPTION:
${jobDescription}

Provide a match assessment with percentage score and detailed analysis.`;
}
