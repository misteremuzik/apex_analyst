/*
  # Add Performance Metrics to Website Analyses

  1. Table Modifications
    - Add `performance_score` (integer) - Overall performance score from PageSpeed Insights (0-100)
    - Add `performance_metrics` (jsonb) - Detailed performance metrics including:
      - First Contentful Paint (FCP)
      - Largest Contentful Paint (LCP)
      - Total Blocking Time (TBT)
      - Cumulative Layout Shift (CLS)
      - Speed Index
      - Time to Interactive (TTI)
      - Core Web Vitals scores
      - Desktop vs Mobile breakdown
    - Add `seo_score` (integer) - SEO score from PageSpeed Insights (0-100)
    - Add `best_practices_score` (integer) - Best practices score (0-100)
    - Add `performance_analyzed_at` (timestamptz) - When performance analysis was completed

  2. Notes
    - Performance metrics are considered premium features
    - These scores complement the existing AI readiness analysis
    - Data sourced from Google PageSpeed Insights API
*/

-- Add performance metrics columns to website_analyses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'performance_score'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN performance_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'performance_metrics'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN performance_metrics jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'seo_score'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN seo_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'best_practices_score'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN best_practices_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'performance_analyzed_at'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN performance_analyzed_at timestamptz;
  END IF;
END $$;

-- Create index for performance queries
CREATE INDEX IF NOT EXISTS website_analyses_performance_score_idx ON website_analyses(performance_score);