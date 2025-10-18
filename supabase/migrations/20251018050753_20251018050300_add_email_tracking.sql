/*
  # Add Email Tracking to Consultation Leads

  1. Changes
    - Add `email_sent` (boolean) - Tracks if confirmation email was successfully sent
    - Add `email_sent_at` (timestamptz) - Timestamp when email was sent
    - Add `email_error` (text) - Stores any error message if email failed to send

  2. Indexes
    - Index on `email_sent` for querying unsent leads

  3. Notes
    - Default email_sent to false for new records
    - Allows tracking email delivery status for follow-up and debugging
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultation_leads' AND column_name = 'email_sent'
  ) THEN
    ALTER TABLE consultation_leads ADD COLUMN email_sent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultation_leads' AND column_name = 'email_sent_at'
  ) THEN
    ALTER TABLE consultation_leads ADD COLUMN email_sent_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultation_leads' AND column_name = 'email_error'
  ) THEN
    ALTER TABLE consultation_leads ADD COLUMN email_error text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS consultation_leads_email_sent_idx ON consultation_leads(email_sent) WHERE email_sent = false;
