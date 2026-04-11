CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'solo', 'pro', 'agence')),
  plan_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  referral_code TEXT UNIQUE,
  wave_number TEXT,
  om_number TEXT,
  address TEXT,
  logo_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners_see_own_org" ON organizations
  FOR ALL USING (owner_id = auth.uid());
