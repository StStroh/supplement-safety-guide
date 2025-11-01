/*
  # Fix Plan Tiers - Add Premium Support

  1. Changes
    - Update profiles_plan_check constraint to allow 'premium' instead of 'expert'
    - This aligns the database with the pricing configuration which uses 'premium'
  
  2. Security
    - Maintains existing RLS policies
    - Only modifies the check constraint values
*/

-- Drop old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Add new constraint with correct plan names
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check 
  CHECK (plan = ANY (ARRAY['starter'::text, 'pro'::text, 'premium'::text]));
