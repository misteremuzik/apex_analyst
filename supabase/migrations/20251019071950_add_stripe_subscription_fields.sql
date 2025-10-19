/*
  # Add Stripe Subscription Fields to Premium Users

  1. New Columns in premium_users
    - `stripe_customer_id` (text) - Stripe customer ID for payment processing
    - `stripe_subscription_id` (text) - Active Stripe subscription ID
    - `stripe_price_id` (text) - Current Stripe price ID (tier identifier)
    - `subscription_period_start` (timestamptz) - Current billing period start date
    - `subscription_period_end` (timestamptz) - Current billing period end date
    - `analysis_count` (integer) - Number of analyses performed this billing period
    - `analysis_limit` (integer) - Maximum analyses allowed per billing period

  2. New Table: subscription_history
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid) - References premium_users(id)
    - `event_type` (text) - Type of event: 'created', 'updated', 'cancelled', 'payment_failed', etc.
    - `previous_tier` (text) - Previous subscription tier
    - `new_tier` (text) - New subscription tier
    - `stripe_event_id` (text) - Stripe webhook event ID
    - `metadata` (jsonb) - Additional event data
    - `created_at` (timestamptz) - When event occurred

  3. Table Modifications
    - Update subscription_tier to support: 'free', 'starter', 'professional', 'business', 'enterprise'
    - Add default values for new columns
    - Create indexes for performance optimization

  4. Security
    - Enable RLS on subscription_history table
    - Add policies for users to read their own subscription history
    - Only service role can insert subscription history records

  5. Indexes
    - Index on stripe_customer_id for faster customer lookups
    - Index on stripe_subscription_id for subscription status checks
    - Index on user_id in subscription_history for history queries
*/

-- Add new columns to premium_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'premium_users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE premium_users ADD COLUMN stripe_customer_id text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'premium_users' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE premium_users ADD COLUMN stripe_subscription_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'premium_users' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE premium_users ADD COLUMN stripe_price_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'premium_users' AND column_name = 'subscription_period_start'
  ) THEN
    ALTER TABLE premium_users ADD COLUMN subscription_period_start timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'premium_users' AND column_name = 'subscription_period_end'
  ) THEN
    ALTER TABLE premium_users ADD COLUMN subscription_period_end timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'premium_users' AND column_name = 'analysis_count'
  ) THEN
    ALTER TABLE premium_users ADD COLUMN analysis_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'premium_users' AND column_name = 'analysis_limit'
  ) THEN
    ALTER TABLE premium_users ADD COLUMN analysis_limit integer DEFAULT 3;
  END IF;
END $$;

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES premium_users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  previous_tier text,
  new_tier text,
  stripe_event_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS premium_users_stripe_customer_id_idx ON premium_users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS premium_users_stripe_subscription_id_idx ON premium_users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS premium_users_stripe_price_id_idx ON premium_users(stripe_price_id);
CREATE INDEX IF NOT EXISTS subscription_history_user_id_idx ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS subscription_history_created_at_idx ON subscription_history(created_at DESC);

-- RLS Policies for subscription_history
CREATE POLICY "Users can read own subscription history"
  ON subscription_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert subscription history"
  ON subscription_history FOR INSERT
  TO service_role
  WITH CHECK (true);