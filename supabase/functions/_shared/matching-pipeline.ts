/**
 * Two-Stage CV Matching Pipeline
 * 
 * Stage 1: Fast algorithmic pre-screening (filters 500+ candidates to top ~50)
 * Stage 2: Deep AI analysis (detailed evaluation of pre-qualified candidates)
 */

import { parseJobDescription, type ParsedJobRequirements } from './job-parser.ts';
import { matchSkillSets, combineSkills, type SkillMatchResult } from './skills-taxonomy.ts';
import { matchLocation, type LocationMatch } from './location-service.ts';
import {
  type CandidateProfile,
  type PreScreeningScore,
  type MatchWeights,
  type EnrichedMatchResult,
  DEFAULT_WEIGHTS,
  compareSeniority,
  matchExperience,
} from './matching-types.ts';
import { callAI } from './ai-client.ts';

// ============================================================================
// Stage 1: Algorithmic Pre-Screening
// ============================================================================

export function preScreenCandidate(
  candidate: CandidateProfile,
  requirements: ParsedJobRequirements,
  weights: MatchWeights = DEFAULT_WEIGHTS
): PreScreeningScore {
  const dealBreakerFailures: string[] = [];
  
  // Extract candidate skills from all sources
  const candidateSkills = combineSkills(
    candidate.ai_profile?.hard_skills,
    candidate.ai_profile?.soft_skills,
    candidate.skills
  );
  
  // Add certifications as skills too
  if (candidate.ai_profile?.certifications) {
    candidateSkills.push(...candidate.ai_profile.certifications);
  }
  
  // 1. Match skills
  const skillMatchResult = matchSkillSets(candidateSkills, requirements.required_skills);
  const skillScore = skillMatchResult.percentage;
  
  // Check for critical skill deal-breakers
  const criticalSkillsMissing = requirements.required_skills
    .filter(s => s.importance === 'critical')
    .filter(s => skillMatchResult.missing.includes(s.skill));
  
  if (criticalSkillsMissing.length > 0) {
    dealBreakerFailures.push(`Missing critical skills: ${criticalSkillsMissing.map(s => s.skill).join(', ')}`);
  }
  
  // 2. Match experience
  const candidateExperience = candidate.years_experience || 
                              candidate.ai_profile?.experience_years || 0;
  const expMatch = matchExperience(candidateExperience, requirements.years_experience);
  const experienceScore = expMatch.score;
  
  // 3. Match seniority
  const candidateSeniority = candidate.seniority_level || 
                             candidate.ai_profile?.seniority || null;
  const seniorityMatch = compareSeniority(candidateSeniority, requirements.seniority_level);
  const seniorityScore = seniorityMatch.score;
  
  // 4. Match location
  const locationMatch = matchLocation(
    candidate.location,
    requirements.location
  );
  const locationScore = locationMatch.score;
  
  if (!locationMatch.is_compatible) {
    dealBreakerFailures.push(`Location incompatible: ${locationMatch.reason}`);
  }
  
  // 5. Check certification requirements
  const candidateCerts = (candidate.ai_profile?.certifications || []).map(c => c.toLowerCase());
  for (const reqCert of requirements.certifications_required) {
    const hasCert = candidateCerts.some(c => 
      c.includes(reqCert.toLowerCase()) || reqCert.toLowerCase().includes(c)
    );
    if (!hasCert) {
      // Check if it's in their skills
      const hasInSkills = candidateSkills.some(s => 
        s.toLowerCase().includes(reqCert.toLowerCase())
      );
      if (!hasInSkills) {
        dealBreakerFailures.push(`Missing required certification: ${reqCert}`);
      }
    }
  }
  
  // Calculate weighted total score
  const totalWeight = weights.skills + weights.experience + weights.seniority + weights.location;
  const totalScore = Math.round(
    (skillScore * weights.skills +
     experienceScore * weights.experience +
     seniorityScore * weights.seniority +
     locationScore * weights.location) / totalWeight
  );
  
  // Determine if candidate passes pre-screening
  // Must have: score >= 40, no more than 1 deal-breaker, compatible location
  const passesPreScreen = 
    totalScore >= 40 && 
    dealBreakerFailures.length <= 1 &&
    locationMatch.is_compatible;
  
  return {
    candidateId: candidate.id,
    skillScore,
    experienceScore,
    seniorityScore,
    locationScore,
    totalScore,
    passesPreScreen,
    dealBreakerFailures,
    skillMatchResult,
    locationMatch,
  };
}

export function runPreScreening(
  candidates: CandidateProfile[],
  requirements: ParsedJobRequirements,
  weights: MatchWeights = DEFAULT_WEIGHTS,
  maxForAI: number = 50
): { passed: Array<{ candidate: CandidateProfile; score: PreScreeningScore }>; failed: number } {
  const scores = candidates.map(c => ({
    candidate: c,
    score: preScreenCandidate(c, requirements, weights)
  }));
  
  // Filter and sort by score
  const passed = scores
    .filter(s => s.score.passesPreScreen)
    .sort((a, b) => b.score.totalScore - a.score.totalScore)
    .slice(0, maxForAI);
  
  return {
    passed,
    failed: scores.filter(s => !s.score.passesPreScreen).length
  };
}

// ============================================================================
// Stage 2: Deep AI Analysis
// ============================================================================

const AI_ANALYSIS_SYSTEM_PROMPT = `You are an expert senior recruitment consultant performing detailed candidate assessments.

Your task is to deeply analyze each candidate against the job requirements and provide:
1. A refined match score (0-100) based on holistic fit
2. Specific strengths for this particular role
3. Potential concerns or gaps
4. Tailored interview questions to probe key areas
5. Risk assessment for overqualification, career fit, and salary expectations

SCORING GUIDELINES:
- 90-100: Exceptional match, hire immediately
- 80-89: Strong match, prioritize for interview
- 70-79: Good match, worth interviewing
- 60-69: Moderate match, consider if pipeline is thin
- 50-59: Weak match, significant gaps
- Below 50: Poor match, do not progress

Be specific and actionable in your assessments. Reference exact skills, experiences, and requirements.`;

function buildAIAnalysisPrompt(
  candidates: Array<{ candidate: CandidateProfile; score: PreScreeningScore }>,
  requirements: ParsedJobRequirements,
  jobDescription: string
): string {
  const candidateSections = candidates.map(({ candidate, score }, i) => {
    const profile = candidate.ai_profile || {};
    return `
### Candidate ${i + 1} (ID: ${candidate.id})
**Pre-Screen Score**: ${score.totalScore}/100
**Name**: ${candidate.name}
**Current Role**: ${candidate.job_title || 'Not specified'}
**Location**: ${candidate.location || 'Not specified'} (Match: ${score.locationMatch.reason})
**Experience**: ${candidate.years_experience || profile.experience_years || 0} years
**Seniority**: ${candidate.seniority_level || profile.seniority || 'Not specified'}

**Skills Matched**: ${score.skillMatchResult.matched.map(m => m.requiredSkill).join(', ') || 'None'}
**Skills Missing**: ${score.skillMatchResult.missing.join(', ') || 'None'}
**Skills Partial**: ${score.skillMatchResult.partial.map(m => m.requiredSkill).join(', ') || 'None'}

**Key Achievements**: ${(profile.key_achievements || []).slice(0, 3).join(' | ') || 'Not specified'}
**Career Progression**: ${profile.career_progression || 'Not specified'}
**Industries**: ${(profile.industries || []).join(', ') || 'Not specified'}
**Education**: ${profile.education ? `${profile.education.level} in ${profile.education.field}` : candidate.education_level || 'Not specified'}
**Certifications**: ${(profile.certifications || []).join(', ') || 'None listed'}
**Ideal Roles**: ${(profile.ideal_roles || []).join(', ') || 'Not specified'}

**Summary**: ${profile.summary_for_matching || 'No summary available'}

${score.dealBreakerFailures.length > 0 ? `**Concerns**: ${score.dealBreakerFailures.join('; ')}` : ''}
`;
  }).join('\n---\n');

  return `## Job Requirements Summary
**Title**: ${requirements.title}
**Seniority**: ${requirements.seniority_level}
**Location**: ${requirements.location.city || requirements.location.region || 'Flexible'} (Remote: ${requirements.location.remote_ok ? 'Yes' : 'No'})
**Experience Required**: ${requirements.years_experience.min}${requirements.years_experience.max ? `-${requirements.years_experience.max}` : '+'} years
**Sector**: ${requirements.sector}

**Critical Skills**: ${requirements.required_skills.filter(s => s.importance === 'critical').map(s => s.skill).join(', ')}
**Preferred Skills**: ${requirements.required_skills.filter(s => s.importance === 'preferred').map(s => s.skill).join(', ')}
**Required Certifications**: ${requirements.certifications_required.join(', ') || 'None specified'}
**Deal Breakers**: ${requirements.deal_breakers.join(', ') || 'None specified'}

## Full Job Description
${jobDescription}

## Candidates to Analyze (Pre-Screened)
${candidateSections}

Analyze each candidate and provide detailed assessments with the requested information.`;
}

function getAIAnalysisToolSchema() {
  return {
    type: 'function' as const,
    function: {
      name: 'submit_detailed_analysis',
      description: 'Submit detailed analysis for all pre-screened candidates',
      parameters: {
        type: 'object',
        properties: {
          analyses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                cv_id: { type: 'string', description: 'Candidate ID' },
                match_score: { type: 'integer', description: 'Refined match score 0-100' },
                explanation: { type: 'string', description: '2-3 sentence explanation of the score' },
                skills_matched: { type: 'array', items: { type: 'string' } },
                skills_missing: { type: 'array', items: { type: 'string' } },
                skills_partial: { type: 'array', items: { type: 'string' } },
                strengths: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'Top 3-4 specific strengths for this role'
                },
                fit_concerns: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'Potential concerns or gaps to probe'
                },
                interview_questions: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: '2-3 tailored interview questions'
                },
                overqualification_risk: { 
                  type: 'string',
                  enum: ['none', 'low', 'medium', 'high'],
                  description: 'Risk that candidate is overqualified'
                },
                career_trajectory_fit: { 
                  type: 'string',
                  enum: ['poor', 'moderate', 'good', 'excellent'],
                  description: 'How well role fits their career trajectory'
                },
                salary_expectation_fit: { 
                  type: 'string',
                  enum: ['below', 'within', 'above', 'unknown'],
                  description: 'Expected salary vs role budget'
                }
              },
              required: [
                'cv_id', 'match_score', 'explanation', 'skills_matched', 'skills_missing',
                'strengths', 'fit_concerns', 'interview_questions',
                'overqualification_risk', 'career_trajectory_fit', 'salary_expectation_fit'
              ]
            }
          }
        },
        required: ['analyses']
      }
    }
  };
}

export async function runDeepAIAnalysis(
  candidates: Array<{ candidate: CandidateProfile; score: PreScreeningScore }>,
  requirements: ParsedJobRequirements,
  jobDescription: string,
  apiKey: string
): Promise<{ analyses: EnrichedMatchResult[]; error?: string }> {
  if (candidates.length === 0) {
    return { analyses: [] };
  }

  const userPrompt = buildAIAnalysisPrompt(candidates, requirements, jobDescription);
  
  try {
    const response = await callAI({
      systemPrompt: AI_ANALYSIS_SYSTEM_PROMPT,
      userPrompt,
      tools: [getAIAnalysisToolSchema()],
      toolChoice: { type: 'function', function: { name: 'submit_detailed_analysis' } },
      apiKey,
    });

    const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'submit_detailed_analysis') {
      console.error('Unexpected AI response:', JSON.stringify(response));
      return { analyses: [], error: 'Failed to parse AI analysis results' };
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Enrich with candidate data and calculate final scores
    const enrichedAnalyses: EnrichedMatchResult[] = result.analyses.map((analysis: any) => {
      const candidateData = candidates.find(c => c.candidate.id === analysis.cv_id);
      if (!candidateData) return null;
      
      const { candidate, score: preScore } = candidateData;
      
      // Calculate final score (weighted average of algorithmic and AI scores)
      const algorithmicScore = preScore.totalScore;
      const aiScore = analysis.match_score;
      const finalScore = Math.round(algorithmicScore * 0.3 + aiScore * 0.7);
      
      return {
        cv_id: analysis.cv_id,
        algorithmic_score: algorithmicScore,
        ai_score: aiScore,
        final_score: finalScore,
        skills_matched: analysis.skills_matched || [],
        skills_missing: analysis.skills_missing || [],
        skills_partial: analysis.skills_partial || [],
        explanation: analysis.explanation,
        strengths: analysis.strengths || [],
        fit_concerns: analysis.fit_concerns || [],
        interview_questions: analysis.interview_questions || [],
        overqualification_risk: analysis.overqualification_risk || 'unknown',
        career_trajectory_fit: analysis.career_trajectory_fit || 'unknown',
        salary_expectation_fit: analysis.salary_expectation_fit || 'unknown',
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          job_title: candidate.job_title,
          sector: candidate.sector,
          location: candidate.location,
          years_experience: candidate.years_experience,
          cv_score: candidate.cv_score,
          cv_file_url: candidate.cv_file_url,
        }
      };
    }).filter(Boolean);
    
    return { analyses: enrichedAnalyses };
  } catch (error) {
    console.error('AI analysis error:', error);
    return { 
      analyses: [], 
      error: error instanceof Error ? error.message : 'AI analysis failed' 
    };
  }
}

// ============================================================================
// Full Pipeline
// ============================================================================

export interface PipelineResult {
  matches: EnrichedMatchResult[];
  stats: {
    totalCandidates: number;
    preScreenedCount: number;
    aiAnalyzedCount: number;
    processingTimeMs: number;
  };
  parsedRequirements: ParsedJobRequirements | null;
  error?: string;
}

export async function runFullMatchingPipeline(
  candidates: CandidateProfile[],
  jobDescription: string,
  weights: MatchWeights = DEFAULT_WEIGHTS,
  maxResults: number = 25,
  apiKey: string
): Promise<PipelineResult> {
  const startTime = Date.now();
  
  // Stage 0: Parse job description
  let parsedRequirements: ParsedJobRequirements | null = null;
  try {
    const parseResult = await parseJobDescription(jobDescription, apiKey);
    parsedRequirements = parseResult.requirements;
  } catch (error) {
    console.error('Job parsing failed, using fallback:', error);
    // If parsing fails, we'll fall back to the old single-stage approach
    return {
      matches: [],
      stats: {
        totalCandidates: candidates.length,
        preScreenedCount: 0,
        aiAnalyzedCount: 0,
        processingTimeMs: Date.now() - startTime
      },
      parsedRequirements: null,
      error: 'Failed to parse job requirements'
    };
  }
  
  // Stage 1: Algorithmic pre-screening
  const maxForAI = Math.min(maxResults * 2, 50); // AI analyze 2x what we need, max 50
  const preScreenResult = runPreScreening(candidates, parsedRequirements, weights, maxForAI);
  
  // Stage 2: Deep AI analysis on pre-screened candidates
  const aiResult = await runDeepAIAnalysis(
    preScreenResult.passed,
    parsedRequirements,
    jobDescription,
    apiKey
  );
  
  // Sort by final score and limit results
  const sortedMatches = aiResult.analyses
    .sort((a, b) => b.final_score - a.final_score)
    .slice(0, maxResults);
  
  return {
    matches: sortedMatches,
    stats: {
      totalCandidates: candidates.length,
      preScreenedCount: preScreenResult.passed.length,
      aiAnalyzedCount: aiResult.analyses.length,
      processingTimeMs: Date.now() - startTime
    },
    parsedRequirements,
    error: aiResult.error
  };
}
