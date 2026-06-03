-- Phase 7a — Base prestataires (réutilisée par la Phase 8 annuaire de services).

-- Lecture publique des fonctions utilitaires par anon dans les policies :
-- is_admin n'est appelée que dans des policies restreintes TO authenticated (voir plus bas),
-- donc pas besoin de re-grant à anon.

-- ===== provider_profiles (1-1 avec profiles) =====
CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  trades TEXT[] DEFAULT '{}',
  quartier TEXT,
  city TEXT DEFAULT 'Dakar',
  geo GEOGRAPHY(Point, 4326),
  languages TEXT[] DEFAULT '{}',
  trust_score NUMERIC DEFAULT 0,
  jobs_done INTEGER DEFAULT 0,
  response_rate NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_provider_geo ON provider_profiles USING GIST (geo);
CREATE INDEX IF NOT EXISTS idx_provider_verified ON provider_profiles(is_verified);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Empêche un prestataire d'auto-valider son profil (is_verified réservé admin)
CREATE OR REPLACE FUNCTION public.guard_provider_verify()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified AND NOT public.is_admin() THEN
    NEW.is_verified := OLD.is_verified;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_provider_verify ON provider_profiles;
CREATE TRIGGER on_provider_verify BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_provider_verify();
REVOKE EXECUTE ON FUNCTION public.guard_provider_verify() FROM anon, authenticated, PUBLIC;

CREATE POLICY "providers_public_read" ON provider_profiles
  FOR SELECT TO anon, authenticated USING (is_verified = true);
CREATE POLICY "providers_self_all" ON provider_profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "providers_admin_all" ON provider_profiles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===== provider_services =====
CREATE TABLE IF NOT EXISTS provider_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  trade TEXT NOT NULL,
  title TEXT NOT NULL,
  base_price INTEGER,
  price_unit TEXT DEFAULT 'forfait',   -- heure|jour|forfait
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE POLICY "provider_services_public_read" ON provider_services
  FOR SELECT TO anon, authenticated
  USING (provider_id IN (SELECT id FROM provider_profiles WHERE is_verified));
CREATE POLICY "provider_services_self_all" ON provider_services
  FOR ALL TO authenticated USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());

-- ===== portfolio_items =====
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_portfolio_provider ON portfolio_items(provider_id);
CREATE POLICY "portfolio_public_read" ON portfolio_items
  FOR SELECT TO anon, authenticated
  USING (provider_id IN (SELECT id FROM provider_profiles WHERE is_verified));
CREATE POLICY "portfolio_self_all" ON portfolio_items
  FOR ALL TO authenticated USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());

-- ===== certifications =====
CREATE TABLE IF NOT EXISTS certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  issuer TEXT,
  proof_url TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_certifications_provider ON certifications(provider_id);
CREATE POLICY "certifications_public_read" ON certifications
  FOR SELECT TO anon, authenticated
  USING (provider_id IN (SELECT id FROM provider_profiles WHERE is_verified));
CREATE POLICY "certifications_self_all" ON certifications
  FOR ALL TO authenticated USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());

-- ===== reviews (note après intervention ; clients réels — durci en 7b) =====
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  work_order_id UUID,    -- FK ajoutée en 7b
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_client_insert" ON reviews
  FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
