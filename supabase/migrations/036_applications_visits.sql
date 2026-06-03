-- Phase 9b — Candidatures + visites sur les annonces.

CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  documents TEXT[] DEFAULT '{}',
  tenant_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (listing_id, applicant_id)
);
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_applications_listing ON applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);

CREATE POLICY "applications_applicant_all" ON applications
  FOR ALL TO authenticated USING (applicant_id = auth.uid()) WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "applications_owner_manage" ON applications
  FOR ALL TO authenticated
  USING (listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid()))
  WITH CHECK (listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid()));

CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  mode TEXT NOT NULL DEFAULT 'onsite' CHECK (mode IN ('onsite','video')),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','done','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_visits_listing ON visits(listing_id);

CREATE POLICY "visits_applicant_all" ON visits
  FOR ALL TO authenticated USING (applicant_id = auth.uid()) WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "visits_owner_manage" ON visits
  FOR ALL TO authenticated
  USING (listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid()))
  WITH CHECK (listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid()));
