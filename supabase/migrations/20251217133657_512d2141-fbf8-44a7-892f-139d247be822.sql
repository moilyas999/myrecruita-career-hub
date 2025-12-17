-- Add CV scoring columns to cv_submissions table
ALTER TABLE public.cv_submissions
ADD COLUMN IF NOT EXISTS cv_score INTEGER,
ADD COLUMN IF NOT EXISTS cv_score_breakdown JSONB,
ADD COLUMN IF NOT EXISTS scored_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.cv_submissions.cv_score IS 'Overall CV quality score (0-100)';
COMMENT ON COLUMN public.cv_submissions.cv_score_breakdown IS 'Detailed scoring breakdown by category';
COMMENT ON COLUMN public.cv_submissions.scored_at IS 'Timestamp when CV was scored by AI';