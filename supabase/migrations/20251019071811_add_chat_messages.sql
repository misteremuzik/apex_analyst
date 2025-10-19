/*
  # Add Chat Messages Table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `analysis_id` (uuid) - Foreign key to website_analyses table
      - `role` (text) - Message role: 'user' or 'assistant'
      - `content` (text) - Message content
      - `sources` (jsonb) - Array of helpful online resources/links
      - `created_at` (timestamptz) - When message was created

  2. Security
    - Enable RLS on `chat_messages` table
    - Add policy for anyone to insert messages
    - Add policy for anyone to read messages
    
  3. Indexes
    - Index on `analysis_id` for faster lookups
    - Index on `created_at` for sorting messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES website_analyses(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS chat_messages_analysis_id_idx ON chat_messages(analysis_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at ASC);