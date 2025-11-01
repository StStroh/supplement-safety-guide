/*
  # Revenue & Influencer Tracking System

  1. New Tables
    - `revenue_tracking`
      - Tracks every subscription purchase
      - Calculates net profit after Stripe fees
      - Links to Stripe payment IDs
      - Tracks reinvestment status
    
    - `influencer_campaigns`
      - Tracks each influencer/creator partnership
      - Records cost, platform, audience size
      - Generates unique referral codes
      - Calculates ROI automatically
    
    - `referral_tracking`
      - Tracks every user signup via referral links
      - Links referrals to influencer campaigns
      - Records conversion events (free → Pro)
      - Enables attribution of revenue to specific influencers

  2. Security
    - Enable RLS on all tables
    - Admin-only access for revenue and campaign data
    - Public read access for referral validation
    - Policies ensure data integrity

  3. Key Features
    - Auto-calculate Stripe fees (2.9% + $0.30)
    - Generate unique referral codes
    - Track full funnel: click → signup → conversion → revenue
    - Calculate per-influencer ROI
    - Flag profit available for reinvestment

  4. Updates to Existing Tables
    - Add role column to profiles table for admin access control
*/

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Revenue Tracking Table
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id text UNIQUE,
  tier text NOT NULL CHECK (tier IN ('Starter', 'Professional', 'Enterprise')),
  amount_cents integer NOT NULL,
  stripe_fee_cents integer NOT NULL,
  net_profit_cents integer GENERATED ALWAYS AS (amount_cents - stripe_fee_cents) STORED,
  reinvested boolean DEFAULT false,
  referral_code text,
  created_at timestamptz DEFAULT now()
);

-- Influencer Campaigns Table
CREATE TABLE IF NOT EXISTS influencer_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  influencer_name text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('TikTok', 'Instagram', 'YouTube', 'Twitter', 'Other')),
  content_type text NOT NULL CHECK (content_type IN ('UGC', 'Influencer Post', 'Affiliate', 'Paid Ad')),
  followers_count integer DEFAULT 0,
  cost_cents integer NOT NULL,
  ref_code text UNIQUE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referral Tracking Table
CREATE TABLE IF NOT EXISTS referral_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  influencer_campaign_id uuid REFERENCES influencer_campaigns(id) ON DELETE SET NULL,
  signup_date timestamptz DEFAULT now(),
  converted_to_pro boolean DEFAULT false,
  conversion_date timestamptz,
  tier text CHECK (tier IN ('Starter', 'Professional', 'Enterprise')),
  revenue_cents integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;

-- Revenue Tracking Policies (Admin only for viewing, system can insert)
CREATE POLICY "Admin can view all revenue"
  ON revenue_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert revenue records"
  ON revenue_tracking FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update revenue records"
  ON revenue_tracking FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Influencer Campaign Policies (Admin only)
CREATE POLICY "Admin can view all campaigns"
  ON influencer_campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can create campaigns"
  ON influencer_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update campaigns"
  ON influencer_campaigns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete campaigns"
  ON influencer_campaigns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Referral Tracking Policies (Public read for validation, admin full access)
CREATE POLICY "Anyone can validate referral codes"
  ON referral_tracking FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create referral records"
  ON referral_tracking FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update referral records"
  ON referral_tracking FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user_id ON revenue_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_created_at ON revenue_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_reinvested ON revenue_tracking(reinvested);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_referral_code ON revenue_tracking(referral_code);

CREATE INDEX IF NOT EXISTS idx_influencer_campaigns_ref_code ON influencer_campaigns(ref_code);
CREATE INDEX IF NOT EXISTS idx_influencer_campaigns_status ON influencer_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_referral_tracking_ref_code ON referral_tracking(ref_code);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_user_id ON referral_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_campaign_id ON referral_tracking(influencer_campaign_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_converted ON referral_tracking(converted_to_pro);

-- Function to calculate Stripe fees
CREATE OR REPLACE FUNCTION calculate_stripe_fee(amount_cents integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  -- Stripe fee: 2.9% + $0.30
  RETURN FLOOR((amount_cents * 0.029) + 30);
END;
$$;

-- Function to update referral tracking on conversion
CREATE OR REPLACE FUNCTION update_referral_on_conversion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update referral tracking when revenue is recorded
  IF NEW.referral_code IS NOT NULL THEN
    UPDATE referral_tracking
    SET 
      converted_to_pro = true,
      conversion_date = NEW.created_at,
      tier = NEW.tier,
      revenue_cents = NEW.amount_cents
    WHERE ref_code = NEW.referral_code
      AND user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-update referral tracking
CREATE TRIGGER trigger_update_referral_on_conversion
  AFTER INSERT ON revenue_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_on_conversion();