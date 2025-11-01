/*
  # Add Webhook Fields to Profiles Table

  1. Changes
    - Add `user_email` column (redundant with email but requested for webhook consistency)
    - Add `stripe_customer` column (alias for stripe_customer_id)
    - Add `sub_status` column to track subscription status
    - Add `current_period_end` column to track subscription period
  
  2. Notes
    - user_email is kept in sync with email column
    - stripe_customer mirrors stripe_customer_id for webhook compatibility
    - sub_status tracks: active, past_due, canceled, trialing, incomplete, unpaid
    - current_period_end stores when the current subscription period ends
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sub_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sub_status text DEFAULT 'inactive';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_period_end timestamptz;
  END IF;
END $$;

-- Sync existing data
UPDATE profiles 
SET user_email = email 
WHERE user_email IS NULL;

UPDATE profiles 
SET stripe_customer = stripe_customer_id 
WHERE stripe_customer IS NULL AND stripe_customer_id IS NOT NULL;

-- Create trigger to keep user_email in sync with email
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_user_email_trigger ON profiles;
CREATE TRIGGER sync_user_email_trigger
  BEFORE INSERT OR UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email();

-- Create trigger to keep stripe_customer in sync with stripe_customer_id
CREATE OR REPLACE FUNCTION sync_stripe_customer()
RETURNS TRIGGER AS $$
BEGIN
  NEW.stripe_customer = NEW.stripe_customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_stripe_customer_trigger ON profiles;
CREATE TRIGGER sync_stripe_customer_trigger
  BEFORE INSERT OR UPDATE OF stripe_customer_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_stripe_customer();

-- Add indexes for webhook lookups
CREATE INDEX IF NOT EXISTS profiles_user_email_idx ON profiles(user_email);
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx ON profiles(stripe_customer);
CREATE INDEX IF NOT EXISTS profiles_sub_status_idx ON profiles(sub_status);
