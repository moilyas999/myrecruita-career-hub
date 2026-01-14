-- Create parse_analytics table for CV parsing metrics and debugging
CREATE TABLE IF NOT EXISTS public.parse_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  correlation_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  text_length INTEGER NOT NULL DEFAULT 0,
  parse_time_ms INTEGER NOT NULL DEFAULT 0,
  ai_model TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  extraction_method TEXT NOT NULL DEFAULT 'ai',
  extracted_fields JSONB DEFAULT '[]'::jsonb,
  confidence_scores JSONB DEFAULT '{}'::jsonb,
  errors TEXT[] DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',
  retry_count INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for correlation_id lookups
CREATE INDEX IF NOT EXISTS idx_parse_analytics_correlation_id ON public.parse_analytics(correlation_id);

-- Add index for created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_parse_analytics_created_at ON public.parse_analytics(created_at DESC);

-- Add extraction tracking columns to cv_submissions
ALTER TABLE public.cv_submissions 
ADD COLUMN IF NOT EXISTS extraction_confidence NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS extraction_method TEXT DEFAULT 'ai',
ADD COLUMN IF NOT EXISTS parse_correlation_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS potential_duplicate_of UUID REFERENCES public.cv_submissions(id) DEFAULT NULL;

-- Enable RLS on parse_analytics
ALTER TABLE public.parse_analytics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins to read parse analytics
CREATE POLICY "Admins can view parse analytics" 
ON public.parse_analytics 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Allow service role to insert parse analytics (edge functions)
CREATE POLICY "Service role can insert parse analytics"
ON public.parse_analytics
FOR INSERT
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.parse_analytics IS 'Stores CV parsing metrics and logs for debugging and analytics';
COMMENT ON COLUMN public.parse_analytics.correlation_id IS 'Unique ID linking logs across the parsing pipeline';
COMMENT ON COLUMN public.parse_analytics.extraction_method IS 'ai, fallback, or ai_with_fallback';