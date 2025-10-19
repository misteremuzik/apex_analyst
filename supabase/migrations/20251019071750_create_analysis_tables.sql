/*
  # AI Readiness Checker Database Schema

  1. New Tables
    - `website_analyses`
      - `id` (uuid, primary key) - Unique identifier for each analysis
      - `url` (text) - The website URL being analyzed
      - `status` (text) - Analysis status: 'pending', 'analyzing', 'completed', 'failed'
      - `overall_score` (integer) - Overall AI readiness score (0-100)
      - `structured_data_score` (integer) - Schema markup score
      - `structured_data_details` (jsonb) - Detailed findings
      - `mobile_friendly_score` (integer) - Mobile-friendliness score
      - `mobile_friendly_details` (jsonb) - Detailed findings
      - `accessibility_score` (integer) - Accessibility score
      - `accessibility_details` (jsonb) - Detailed findings
      - `content_quality_score` (integer) - Content quality score
      - `content_quality_details` (jsonb) - Detailed findings
      - `technical_seo_score` (integer) - Technical SEO score
      - `technical_seo_details` (jsonb) - Detailed findings
      - `privacy_score` (integer) - Privacy compliance score
      - `privacy_details` (jsonb) - Detailed findings
      - `recommendations` (jsonb) - Array of prioritized recommendations
      - `created_at` (timestamptz) - When analysis was created
      - `completed_at` (timestamptz) - When analysis was completed

  2. Security
    - Enable RLS on `website_analyses` table
    - Add policy for anyone to insert new analyses
    - Add policy for anyone to read analyses (public results)
    
  3. Indexes
    - Index on `url` for faster lookups
    - Index on `created_at` for sorting recent analyses
*/

CREATE TABLE IF NOT EXISTS website_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  overall_score integer DEFAULT 0,
  structured_data_score integer DEFAULT 0,
  structured_data_details jsonb DEFAULT '{}'::jsonb,
  mobile_friendly_score integer DEFAULT 0,
  mobile_friendly_details jsonb DEFAULT '{}'::jsonb,
  accessibility_score integer DEFAULT 0,
  accessibility_details jsonb DEFAULT '{}'::jsonb,
  content_quality_score integer DEFAULT 0,
  content_quality_details jsonb DEFAULT '{}'::jsonb,
  technical_seo_score integer DEFAULT 0,
  technical_seo_details jsonb DEFAULT '{}'::jsonb,
  privacy_score integer DEFAULT 0,
  privacy_details jsonb DEFAULT '{}'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE website_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analyses"
  ON website_analyses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read analyses"
  ON website_analyses FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS website_analyses_url_idx ON website_analyses(url);
CREATE INDEX IF NOT EXISTS website_analyses_created_at_idx ON website_analyses(created_at DESC);