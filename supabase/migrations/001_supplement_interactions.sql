/*
  # Supplement-Drug Interaction Database

  1. New Tables
    - `supplement_interactions`
      - `id` (uuid, primary key)
      - `rx` (text) - Prescription medication name
      - `supplement` (text) - Supplement name
      - `risk` (text) - Risk level: Low, Moderate, High
      - `mechanism` (text) - How the interaction occurs
      - `clinical_note` (text) - Clinical observations
      - `advice` (text) - Recommended action
      - `citation_title` (text) - Research citation title
      - `citation_source` (text) - Source type
      - `citation_year` (integer) - Publication year
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `supplement_interactions` table
    - Add policies for public read access (anyone can check interactions)
    - Add policies for authenticated admin users to manage data
*/

-- Create supplement_interactions table
CREATE TABLE IF NOT EXISTS supplement_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rx text NOT NULL,
  supplement text NOT NULL,
  risk text NOT NULL CHECK (risk IN ('Low', 'Moderate', 'High')),
  mechanism text NOT NULL,
  clinical_note text DEFAULT '',
  advice text NOT NULL,
  citation_title text DEFAULT '',
  citation_source text DEFAULT '',
  citation_year integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_rx ON supplement_interactions(rx);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_supplement ON supplement_interactions(supplement);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_risk ON supplement_interactions(risk);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_rx_supplement ON supplement_interactions(rx, supplement);

-- Enable Row Level Security
ALTER TABLE supplement_interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read supplement interactions (public data for safety)
CREATE POLICY "Anyone can read supplement interactions"
  ON supplement_interactions
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert interactions
CREATE POLICY "Authenticated users can insert interactions"
  ON supplement_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update interactions
CREATE POLICY "Authenticated users can update interactions"
  ON supplement_interactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete interactions
CREATE POLICY "Authenticated users can delete interactions"
  ON supplement_interactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial data
INSERT INTO supplement_interactions (rx, supplement, risk, mechanism, clinical_note, advice, citation_title, citation_source, citation_year)
VALUES
  (
    'Warfarin',
    'Fish Oil (Omega-3)',
    'Moderate',
    'Additive anticoagulant effect',
    'Higher bleeding risk ≥3 g/day EPA+DHA',
    'Use ≤1 g/day; monitor INR',
    'Omega-3 and bleeding risk on VKAs',
    'peer-reviewed review',
    2017
  ),
  (
    'Warfarin',
    'Garlic',
    'High',
    'Antiplatelet/anticoagulant',
    'Reports of elevated INR/bleeding',
    'Avoid; monitor INR if unavoidable',
    'Garlic-warfarin interactions',
    'case reports',
    2006
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_supplement_interactions_updated_at ON supplement_interactions;
CREATE TRIGGER update_supplement_interactions_updated_at
  BEFORE UPDATE ON supplement_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
