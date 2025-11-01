/*
  # Add Temporary Password Fields for Post-Payment Access

  1. Changes to `profiles` table
    - Add `temp_password` field to store auto-generated passwords
    - Add `password_set_at` timestamp to track when password was created
    - These fields enable instant access after Stripe payment without email dependency

  2. Security
    - Password is cleared after first successful login
    - Only accessible via authenticated serverless functions
    - Temporary storage only (cleared on use)

  3. Purpose
    - Solve the "broken email" problem by providing credentials directly on success page
    - Enable instant content access after payment
    - Remove dependency on email delivery for initial login
*/

-- Add temporary password fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'temp_password'
  ) THEN
    ALTER TABLE profiles ADD COLUMN temp_password text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'password_set_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN password_set_at timestamptz;
  END IF;
END $$;

-- Add index for faster temp password lookups
CREATE INDEX IF NOT EXISTS idx_profiles_temp_password ON profiles(temp_password) WHERE temp_password IS NOT NULL;

-- Add comment to document the purpose
COMMENT ON COLUMN profiles.temp_password IS 'Temporary auto-generated password for post-payment access. Cleared after first login.';
COMMENT ON COLUMN profiles.password_set_at IS 'Timestamp when temp_password was generated. Used to expire old passwords.';