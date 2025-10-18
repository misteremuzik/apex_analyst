/*
  # Premium Users and Authentication Schema

  1. New Tables
    - `premium_users`
      - `id` (uuid, primary key) - References auth.users(id)
      - `email` (text) - User's email address
      - `subscription_status` (text) - Status: 'trial', 'active', 'cancelled', 'expired'
      - `subscription_tier` (text) - Tier: 'free', 'premium'
      - `trial_ends_at` (timestamptz) - When trial period ends
      - `subscribed_at` (timestamptz) - When user subscribed to premium
      - `cancelled_at` (timestamptz) - When user cancelled subscription
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `user_analyses`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid) - References auth.users(id) or premium_users(id)
      - `analysis_id` (uuid) - References website_analyses(id)
      - `created_at` (timestamptz) - When association was created

  2. Table Modifications
    - Add `user_id` column to `website_analyses` table for tracking ownership
    - Add `is_premium_feature` column to track which features require premium access

  3. Security
    - Enable RLS on `premium_users` table
    - Enable RLS on `user_analyses` table
    - Add policies for authenticated users to read their own premium status
    - Add policies for authenticated users to view their own analyses
    - Add policies for authenticated users to create analyses
    - Update existing policies on website_analyses to handle authenticated users

  4. Indexes
    - Index on `user_id` in website_analyses for faster user lookups
    - Index on `email` in premium_users for faster email lookups
    - Index on `subscription_status` for filtering active users
*/

-- Add user_id column to existing website_analyses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'website_analyses' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE website_analyses ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create premium_users table
CREATE TABLE IF NOT EXISTS premium_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  subscription_status text NOT NULL DEFAULT 'free',
  subscription_tier text NOT NULL DEFAULT 'free',
  trial_ends_at timestamptz,
  subscribed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;

-- Create user_analyses junction table
CREATE TABLE IF NOT EXISTS user_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES website_analyses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, analysis_id)
);

ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for premium_users table
CREATE POLICY "Users can read own premium status"
  ON premium_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own premium data"
  ON premium_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for user_analyses table
CREATE POLICY "Users can read own analyses"
  ON user_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create analysis associations"
  ON user_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update website_analyses policies for authenticated users
CREATE POLICY "Authenticated users can insert their analyses"
  ON website_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can read their analyses"
  ON website_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes
CREATE INDEX IF NOT EXISTS website_analyses_user_id_idx ON website_analyses(user_id);
CREATE INDEX IF NOT EXISTS premium_users_email_idx ON premium_users(email);
CREATE INDEX IF NOT EXISTS premium_users_subscription_status_idx ON premium_users(subscription_status);
CREATE INDEX IF NOT EXISTS user_analyses_user_id_idx ON user_analyses(user_id);
CREATE INDEX IF NOT EXISTS user_analyses_analysis_id_idx ON user_analyses(analysis_id);

-- Function to automatically create premium_users entry when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.premium_users (id, email, subscription_status, subscription_tier)
  VALUES (new.id, new.email, 'free', 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create premium_users entry
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
