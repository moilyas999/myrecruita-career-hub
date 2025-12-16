-- Add new columns to cv_submissions for AI-powered job matching
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS experience_summary TEXT;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS ai_profile JSONB;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS seniority_level TEXT;