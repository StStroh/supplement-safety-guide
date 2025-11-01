/*
  # Fix Profile Creation During Signup

  1. Changes
    - Add trigger to auto-create profile when user signs up
    - Add service role policy to allow auto-insertion
    - Ensure profiles are created immediately on auth.users insert

  2. Security
    - Keep existing RLS policies
    - Add system-level trigger for profile creation
    - Users can still only read/update their own profiles
*/

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan, stripe_customer_id)
  VALUES (
    NEW.id,
    NEW.email,
    'starter',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add policy to allow service role to insert profiles (for trigger)
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Update existing authenticated insert policy to be more permissive
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');
