-- Phase 9a — Marketplace locative : annonces (listings) + recherches sauvegardées.

CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'appartement' CHECK (type IN ('appartement','chambre','maison','studio','bureau')),
  title TEXT NOT NULL,
  description TEXT,
  rent_fcfa INTEGER NOT NULL,
  charges_fcfa INTEGER DEFAULT 0,
  deposit_fcfa INTEGER DEFAULT 0,
  rooms INTEGER,
  area_m2 INTEGER,
  quartier TEXT,
  city TEXT DEFAULT 'Dakar',
  geo GEOGRAPHY(Point, 4326),
  available_from DATE,
  photos TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,    -- badge "Vérifié par Locawave" (propriétaire KYC)
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','rented')),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_geo ON listings USING GIST (geo);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Recherche publique : annonces publiées
CREATE POLICY "listings_public_read" ON listings
  FOR SELECT TO anon, authenticated USING (status = 'published');
-- Propriétaire : gère ses annonces
CREATE POLICY "listings_owner_all" ON listings
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  criteria JSONB NOT NULL DEFAULT '{}',
  alert_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE POLICY "saved_searches_self_all" ON saved_searches
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Recherche d'annonces : filtres + proximité, dispo en temps réel
CREATE OR REPLACE FUNCTION public.search_listings(
  p_lat DOUBLE PRECISION DEFAULT NULL, p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_km DOUBLE PRECISION DEFAULT 25, p_type TEXT DEFAULT NULL,
  p_max_rent INTEGER DEFAULT NULL, p_min_rooms INTEGER DEFAULT NULL, p_city TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, title TEXT, type TEXT, rent_fcfa INTEGER, charges_fcfa INTEGER,
  rooms INTEGER, area_m2 INTEGER, quartier TEXT, city TEXT, photos TEXT[], is_verified BOOLEAN,
  distance_km DOUBLE PRECISION, lat DOUBLE PRECISION, lng DOUBLE PRECISION)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT l.id, l.title, l.type, l.rent_fcfa, l.charges_fcfa, l.rooms, l.area_m2, l.quartier, l.city,
         l.photos, l.is_verified,
         CASE WHEN l.geo IS NOT NULL AND p_lat IS NOT NULL
              THEN ST_Distance(l.geo, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)/1000.0 END AS distance_km,
         ST_Y(l.geo::geometry) AS lat, ST_X(l.geo::geometry) AS lng
  FROM listings l
  WHERE l.status = 'published'
    AND (p_type IS NULL OR p_type = '' OR l.type = p_type)
    AND (p_max_rent IS NULL OR l.rent_fcfa <= p_max_rent)
    AND (p_min_rooms IS NULL OR l.rooms >= p_min_rooms)
    AND (p_city IS NULL OR p_city = '' OR l.city ILIKE '%'||p_city||'%')
    AND (p_lat IS NULL OR l.geo IS NULL OR
         ST_DWithin(l.geo, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km*1000))
  ORDER BY l.is_verified DESC, l.published_at DESC NULLS LAST
  LIMIT 100;
$$;
GRANT EXECUTE ON FUNCTION public.search_listings(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, INTEGER, INTEGER, TEXT) TO anon, authenticated;
