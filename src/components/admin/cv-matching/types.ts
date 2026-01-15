// CV Matching Tool Types - v2.0

export interface MatchCandidate {
  id: string;
  name: string;
  email: string;
  job_title: string | null;
  sector: string | null;
  location: string | null;
  years_experience: number | null;
  cv_score: number | null;
  cv_file_url: string | null;
  seniority_level?: string | null;
}

export interface MatchResult {
  cv_id: string;
  algorithmic_score: number;
  ai_score: number;
  final_score: number;
  
  // Skills Analysis
  skills_matched: string[];
  skills_missing: string[];
  skills_partial: string[];
  
  // AI Insights
  explanation: string;
  strengths: string[];
  fit_concerns: string[];
  interview_questions: string[];
  
  // Advanced Signals
  overqualification_risk: string;
  career_trajectory_fit: string;
  salary_expectation_fit: string;
  
  candidate: MatchCandidate;
}

export interface MatchResponse {
  matches: MatchResult[];
  total_evaluated: number;
  filters_applied: Record<string, unknown>;
  message?: string;
  match_history_id?: string;
  parsed_requirements?: {
    job_title: string;
    required_skills: string[];
    preferred_skills: string[];
    min_experience: number;
    max_experience: number | null;
    seniority_level: string;
    location: string | null;
    sector: string | null;
  };
}

export interface MatchWeights {
  skills: number;
  experience: number;
  seniority: number;
  location: number;
}

export const DEFAULT_WEIGHTS: MatchWeights = {
  skills: 40,
  experience: 25,
  seniority: 20,
  location: 15,
};

export const WEIGHT_PRESETS: Record<string, { name: string; weights: MatchWeights; description: string }> = {
  balanced: {
    name: "Balanced",
    weights: { skills: 40, experience: 25, seniority: 20, location: 15 },
    description: "Equal emphasis on all factors",
  },
  technical: {
    name: "Technical Role",
    weights: { skills: 55, experience: 20, seniority: 15, location: 10 },
    description: "Skills-heavy for technical positions",
  },
  leadership: {
    name: "Leadership",
    weights: { skills: 25, experience: 25, seniority: 40, location: 10 },
    description: "Experience & seniority for management roles",
  },
  remote: {
    name: "Remote-First",
    weights: { skills: 45, experience: 30, seniority: 25, location: 0 },
    description: "Ignore location for remote positions",
  },
  local: {
    name: "Local Only",
    weights: { skills: 35, experience: 25, seniority: 15, location: 25 },
    description: "Higher location weight for on-site roles",
  },
};

export const SECTORS = [
  "Accounting & Finance",
  "Banking",
  "Financial Services",
  "Insurance",
  "Technology",
  "Healthcare",
  "Legal",
  "Human Resources",
  "Marketing",
  "Sales",
  "Operations",
  "Other",
];

export const LOCATIONS = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Liverpool",
  "Bristol",
  "Edinburgh",
  "Glasgow",
  "Cardiff",
  "Remote",
];
