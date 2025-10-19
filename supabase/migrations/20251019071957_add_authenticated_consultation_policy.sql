/*
  # Add Consultation Leads Policy for Authenticated Users

  1. Changes
    - Add INSERT policy for authenticated users to create consultation leads
    - Add SELECT policy for authenticated users to read consultation leads
  
  2. Security
    - Authenticated users can insert their own consultation leads
    - Authenticated users can read consultation leads
*/

-- Add policy for authenticated users to insert consultation leads
CREATE POLICY "Authenticated users can insert consultation leads"
  ON consultation_leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add policy for authenticated users to select consultation leads  
CREATE POLICY "Authenticated users can select consultation leads"
  ON consultation_leads FOR SELECT
  TO authenticated
  USING (true);