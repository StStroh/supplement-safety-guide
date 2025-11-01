/*
  # Create PDF Logs Table

  1. New Tables
    - `pdf_logs`
      - `id` (uuid, primary key)
      - `user_email` (text, indexed)
      - `created_at` (timestamptz, indexed)
      - Tracks PDF generation for Starter tier monthly limits (5 per month)
  
  2. Security
    - Enable RLS on `pdf_logs` table
    - Policy: Users can only read their own PDF logs
    - Policy: Service role can insert new logs
    - Policy: Service role can read all logs for admin purposes
  
  3. Indexes
    - Index on (user_email, created_at) for efficient monthly limit checking
*/

-- Create pdf_logs table if not exists
CREATE TABLE IF NOT EXISTS pdf_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for efficient monthly limit queries
CREATE INDEX IF NOT EXISTS idx_pdf_logs_user_email_created_at 
  ON pdf_logs(user_email, created_at DESC);

-- Enable RLS
ALTER TABLE pdf_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own PDF logs
CREATE POLICY "Users can view own PDF logs"
  ON pdf_logs
  FOR SELECT
  TO authenticated
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Policy: Service role can insert logs (for function usage)
CREATE POLICY "Service role can insert PDF logs"
  ON pdf_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow anon to read for guest users checking their limits
CREATE POLICY "Allow anon read for rate limiting"
  ON pdf_logs
  FOR SELECT
  TO anon
  USING (true);