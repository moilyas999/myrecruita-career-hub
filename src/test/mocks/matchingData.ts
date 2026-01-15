import type { MatchResult, MatchCandidate, MatchResponse, MatchWeights } from '@/components/admin/cv-matching/types';

// Factory functions for creating test data

export function createMockCandidate(overrides: Partial<MatchCandidate> = {}): MatchCandidate {
  return {
    id: 'cv-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    job_title: 'Senior Financial Analyst',
    sector: 'Accounting & Finance',
    location: 'London',
    years_experience: 8,
    cv_score: 85,
    cv_file_url: 'https://example.com/cv.pdf',
    seniority_level: 'senior',
    ...overrides,
  };
}

export function createMockMatchResult(overrides: Partial<MatchResult> = {}): MatchResult {
  return {
    cv_id: 'cv-123',
    algorithmic_score: 82,
    ai_score: 89,
    final_score: 87,
    skills_matched: ['Excel', 'VBA', 'Financial Modeling', 'SAP'],
    skills_missing: ['Python'],
    skills_partial: ['Power BI'],
    explanation: 'Strong candidate with excellent financial modeling experience.',
    strengths: [
      '10 years of relevant experience in financial services',
      'CPA certified with Big 4 background',
    ],
    fit_concerns: [
      'May be overqualified based on salary expectations',
    ],
    interview_questions: [
      'What interests you about a lateral move at this level?',
      'How do you see this role fitting your career path?',
    ],
    overqualification_risk: 'low',
    career_trajectory_fit: 'good',
    salary_expectation_fit: 'within',
    candidate: createMockCandidate(),
    ...overrides,
  };
}

export function createMockMatchResponse(overrides: Partial<MatchResponse> = {}): MatchResponse {
  return {
    matches: [
      createMockMatchResult(),
      createMockMatchResult({ cv_id: 'cv-456', final_score: 75 }),
    ],
    total_evaluated: 50,
    filters_applied: {},
    message: undefined,
    match_history_id: 'history-123',
    parsed_requirements: {
      job_title: 'Financial Analyst',
      required_skills: ['Excel', 'Financial Modeling', 'VBA'],
      preferred_skills: ['Python', 'Power BI'],
      min_experience: 5,
      max_experience: 10,
      seniority_level: 'mid',
      location: 'London',
      sector: 'Accounting & Finance',
    },
    ...overrides,
  };
}

export function createMockWeights(overrides: Partial<MatchWeights> = {}): MatchWeights {
  return {
    skills: 40,
    experience: 25,
    seniority: 20,
    location: 15,
    ...overrides,
  };
}

// Edge cases for testing
export const emptyMatchResponse: MatchResponse = {
  matches: [],
  total_evaluated: 0,
  filters_applied: {},
  message: 'No candidates found matching your criteria.',
};

export const highScoreCandidate = createMockMatchResult({
  final_score: 95,
  algorithmic_score: 92,
  ai_score: 97,
  overqualification_risk: 'none',
  career_trajectory_fit: 'excellent',
});

export const lowScoreCandidate = createMockMatchResult({
  final_score: 45,
  algorithmic_score: 42,
  ai_score: 48,
  skills_matched: ['Excel'],
  skills_missing: ['VBA', 'Financial Modeling', 'SAP', 'Python'],
  fit_concerns: [
    'Limited experience in the required sector',
    'Missing key technical skills',
    'Career trajectory not aligned with role requirements',
  ],
  overqualification_risk: 'none',
  career_trajectory_fit: 'poor',
});
