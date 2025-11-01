/*
  # Add Checks Remaining Field for Usage Tracking

  1. Changes to `profiles` table
    - Add `checks_remaining` field to track monthly interaction checks
    - Default values: Starter=5, Professional/Premium=999999 (unlimited)
    - Resets monthly based on subscription cycle

  2. Purpose
    - Track usage limits for Starter tier users
    - Display remaining checks on dashboard
    - Trigger upgrade prompts when exhausted
*/

-- Add checks_remaining field to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'checks_remaining'
  ) THEN
    ALTER TABLE profiles ADD COLUMN checks_remaining integer DEFAULT 5;
  END IF;
END $$;

-- Set appropriate defaults based on plan
UPDATE profiles 
SET checks_remaining = CASE 
  WHEN plan = 'starter' THEN 5
  WHEN plan IN ('professional', 'pro', 'premium', 'enterprise') THEN 999999
  ELSE 5
END
WHERE checks_remaining IS NULL OR checks_remaining = 5;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_checks_remaining ON profiles(checks_remaining);

-- Add comment
COMMENT ON COLUMN profiles.checks_remaining IS 'Number of interaction checks remaining this billing period. Starter=5, Pro/Premium=unlimited(999999).';