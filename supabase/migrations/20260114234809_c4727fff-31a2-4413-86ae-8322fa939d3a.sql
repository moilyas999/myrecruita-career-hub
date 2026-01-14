-- ============================================================================
-- CV Matching System v2.0 - Match History & Analytics Tables
-- ============================================================================

-- Table to store match session history
CREATE TABLE cv_match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  job_description TEXT NOT NULL,
  parsed_requirements JSONB,
  weights_used JSONB DEFAULT '{"skills": 40, "experience": 25, "seniority": 20, "location": 15}'::jsonb,
  filters_applied JSONB DEFAULT '{}'::jsonb,
  total_candidates_evaluated INTEGER DEFAULT 0,
  algo_prescreened_count INTEGER DEFAULT 0,
  ai_analyzed_count INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  matched_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table to store individual match results
CREATE TABLE cv_match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_history_id UUID NOT NULL REFERENCES cv_match_history(id) ON DELETE CASCADE,
  cv_id UUID NOT NULL REFERENCES cv_submissions(id) ON DELETE CASCADE,
  
  -- Scoring stages
  algorithmic_score INTEGER,
  ai_score INTEGER,
  final_score INTEGER NOT NULL,
  
  -- Detailed breakdown
  skills_matched TEXT[] DEFAULT '{}',
  skills_missing TEXT[] DEFAULT '{}',
  skills_partial TEXT[] DEFAULT '{}',
  
  -- AI analysis
  fit_concerns TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  interview_questions TEXT[] DEFAULT '{}',
  ai_explanation TEXT,
  
  -- Advanced signals
  overqualification_risk TEXT,
  career_trajectory_fit TEXT,
  salary_expectation_fit TEXT,
  
  -- Outcome tracking (for ML feedback loop)
  shortlisted BOOLEAN DEFAULT false,
  shortlisted_at TIMESTAMPTZ,
  submitted_to_client BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  outcome TEXT CHECK (outcome IN ('placed', 'client_rejected', 'candidate_withdrew', 'offer_declined', 'pending', 'not_progressed')),
  outcome_at TIMESTAMPTZ,
  outcome_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent duplicate entries for same CV in same match session
  UNIQUE(match_history_id, cv_id)
);

-- Create indexes for performance
CREATE INDEX idx_match_history_job ON cv_match_history(job_id);
CREATE INDEX idx_match_history_matched_by ON cv_match_history(matched_by);
CREATE INDEX idx_match_history_created ON cv_match_history(created_at DESC);
CREATE INDEX idx_match_results_cv ON cv_match_results(cv_id);
CREATE INDEX idx_match_results_history ON cv_match_results(match_history_id);
CREATE INDEX idx_match_results_score ON cv_match_results(final_score DESC);
CREATE INDEX idx_match_results_outcome ON cv_match_results(outcome) WHERE outcome IS NOT NULL;
CREATE INDEX idx_match_results_shortlisted ON cv_match_results(shortlisted) WHERE shortlisted = true;

-- Enable RLS
ALTER TABLE cv_match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_match_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cv_match_history
CREATE POLICY "Admins can view all match history"
  ON cv_match_history FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert match history"
  ON cv_match_history FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()) AND matched_by = auth.uid());

CREATE POLICY "Admins can update their own match history"
  ON cv_match_history FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for cv_match_results
CREATE POLICY "Admins can view all match results"
  ON cv_match_results FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert match results"
  ON cv_match_results FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update match results"
  ON cv_match_results FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Function to get match success rate by recruiter
CREATE OR REPLACE FUNCTION get_match_success_rate(recruiter_id UUID, days_back INTEGER DEFAULT 90)
RETURNS TABLE (
  total_matches BIGINT,
  placements BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT mr.id) as total_matches,
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.outcome = 'placed') as placements,
    ROUND(
      COUNT(DISTINCT mr.id) FILTER (WHERE mr.outcome = 'placed')::NUMERIC / 
      NULLIF(COUNT(DISTINCT mr.id) FILTER (WHERE mr.outcome IS NOT NULL), 0) * 100, 
      2
    ) as success_rate
  FROM cv_match_results mr
  JOIN cv_match_history mh ON mr.match_history_id = mh.id
  WHERE mh.matched_by = recruiter_id
    AND mh.created_at > now() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get top performing skill combinations
CREATE OR REPLACE FUNCTION get_successful_skill_patterns(min_placements INTEGER DEFAULT 3)
RETURNS TABLE (
  skill_combination TEXT[],
  placements BIGINT,
  avg_final_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.skills_matched as skill_combination,
    COUNT(*) as placements,
    ROUND(AVG(mr.final_score)::NUMERIC, 1) as avg_final_score
  FROM cv_match_results mr
  WHERE mr.outcome = 'placed'
    AND array_length(mr.skills_matched, 1) > 0
  GROUP BY mr.skills_matched
  HAVING COUNT(*) >= min_placements
  ORDER BY placements DESC, avg_final_score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;