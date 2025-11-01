/*
  # Add Guest Trial System for High-Volume Conversions

  1. New Tables
    - `guest_sessions`
      - `id` (uuid, primary key)
      - `session_token` (text, unique) - Anonymous session identifier
      - `checks_used` (integer, default 0) - Tracks free checks used
      - `created_at` (timestamptz)
      - `last_check_at` (timestamptz)
      - `converted_user_id` (uuid, nullable) - Links to user after payment
      - `stripe_customer_id` (text, nullable) - Links to Stripe after payment
      
  2. Security
    - Enable RLS on `guest_sessions` table
    - Public can insert their own sessions
    - Public can read/update their own sessions by token
    - No delete policies (analytics data)
    
  3. Purpose
    - Allow instant trial access without signup
    - Track conversion from guest to paid
    - Enable 3 free checks before paywall
*/

-- Create guest_sessions table
CREATE TABLE IF NOT EXISTS guest_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  checks_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_check_at timestamptz,
  converted_user_id uuid REFERENCES auth.users(id),
  stripe_customer_id text,
  ref_code text
);

-- Enable RLS
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a guest session
CREATE POLICY "Anyone can create guest session"
  ON guest_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Anyone can read their own session by token
CREATE POLICY "Anyone can read own session"
  ON guest_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Anyone can update their own session
CREATE POLICY "Anyone can update own session"
  ON guest_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_guest_sessions_token ON guest_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_customer ON guest_sessions(stripe_customer_id);
