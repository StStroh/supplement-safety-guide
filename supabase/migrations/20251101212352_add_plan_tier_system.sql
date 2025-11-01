/*
  # Add Plan Tier System

  1. Changes
    - Add `plan` column to profiles table with default 'starter'
    - Add `stripe_customer_id` column for Stripe integration
    - Add `stripe_subscription_id` column to track active subscription
    - Add index on stripe_customer_id for faster lookups
    
  2. Security
    - Users can read their own plan via existing RLS policies
    - Only service role can update plan (via webhook functions)
*/

-- Add plan tier column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plan TEXT NOT NULL DEFAULT 'starter';
  END IF;
END $$;

-- Add Stripe customer ID column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;
END $$;

-- Add Stripe subscription ID column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
  END IF;
END $$;

-- Create index for faster Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON profiles(stripe_customer_id);

-- Add check constraint for valid plan values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'profiles_plan_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check 
    CHECK (plan IN ('starter', 'pro', 'premium'));
  END IF;
END $$;
