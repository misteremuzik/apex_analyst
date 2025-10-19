/*
  # Create Consultation Leads Table

  1. New Tables
    - `consultation_leads`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `email` (text) - User's email address
      - `analysis_id` (uuid) - Foreign key to website_analyses table
      - `website_url` (text) - The website URL being analyzed
      - `overall_score` (integer) - Overall score at time of submission
      - `created_at` (timestamptz) - When lead was captured

  2. Security
    - Enable RLS on `consultation_leads` table
    - Add policy for anyone to insert leads
    - Add policy to prevent public reading (protect user privacy)
    
  3. Indexes
    - Index on `email` for lookups
    - Index on `created_at` for sorting leads
*/

CREATE TABLE IF NOT EXISTS consultation_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  analysis_id uuid REFERENCES website_analyses(id) ON DELETE SET NULL,
  website_url text,
  overall_score integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert consultation leads"
  ON consultation_leads FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS consultation_leads_email_idx ON consultation_leads(email);
CREATE INDEX IF NOT EXISTS consultation_leads_created_at_idx ON consultation_leads(created_at DESC);