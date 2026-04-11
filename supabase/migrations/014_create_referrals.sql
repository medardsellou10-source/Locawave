CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  referee_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
  reward_applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrer_sees_own" ON referrals
  FOR ALL USING (referrer_org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
