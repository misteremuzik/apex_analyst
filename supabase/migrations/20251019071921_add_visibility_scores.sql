/*
  # Add AEO Visibility Scores to Website Analyses

  1. Table Modifications
    - Add `aeo_overall_score` (numeric) - Overall Answer Engine Optimization score (0-100)
    - Add `snippet_optimization_score` (integer) - Score for snippet optimization (0-10)
    - Add `crawlability_score` (integer) - Score for crawlability (0-10)
    - Add `featured_snippet_ready_score` (integer) - Featured snippet readiness (0-10)
    - Add `pages_analyzed` (integer) - Number of pages analyzed
    - Add `aeo_schemas_count` (integer) - Count of AEO-compliant schemas detected
    - Add `total_issues` (integer) - Total number of issues found
    - Add `ai_model_access` (text) - AI model accessibility score (e.g., "3/3")
    - Add `visibility_metrics` (jsonb) - Detailed breakdown of visibility analysis

  2. Security
    - Maintain existing RLS policies
    - Premium users can access visibility scores

  3. Notes
    - Visibility scores are premium features based on AEO analysis
    - Scores help determine how well a website is optimized for AI search engines
    - Based on Answer Engine Optimization best practices
*/

-- Add visibility score columns to website_analyses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'aeo_overall_score'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN aeo_overall_score numeric(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'snippet_optimization_score'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN snippet_optimization_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'crawlability_score'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN crawlability_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'featured_snippet_ready_score'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN featured_snippet_ready_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'pages_analyzed'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN pages_analyzed integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'aeo_schemas_count'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN aeo_schemas_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'total_issues'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN total_issues integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'ai_model_access'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN ai_model_access text DEFAULT '0/3';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'visibility_metrics'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN visibility_metrics jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create indexes for visibility score queries
CREATE INDEX IF NOT EXISTS website_analyses_aeo_overall_score_idx ON website_analyses(aeo_overall_score);
CREATE INDEX IF NOT EXISTS website_analyses_total_issues_idx ON website_analyses(total_issues);