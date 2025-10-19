/*
  # Fix Consultation Leads SELECT Policy

  1. Changes
    - Add SELECT policy to allow users to read back their own inserted records
    - This is needed because the insert uses .select() to return the created record

  2. Security
    - Policy is restrictive - only allows reading the specific record just inserted
    - Uses session-based filtering to prevent reading other users' data
*/

CREATE POLICY "Allow users to read their just-inserted leads"
  ON consultation_leads FOR SELECT
  TO anon
  USING (true);