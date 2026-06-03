-- Phase 8a — Messagerie intégrée + recherche de prestataires par proximité (PostGIS).

-- ===== messages : conversation 1-1 (demandeur ↔ prestataire) =====
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

-- Seuls les deux interlocuteurs voient/écrivent
CREATE POLICY "messages_participants_select" ON messages
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "messages_sender_insert" ON messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Temps réel
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;

-- ===== Recherche prestataires : proximité + métier, classés réputation puis distance =====
CREATE OR REPLACE FUNCTION public.search_providers(
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_km DOUBLE PRECISION DEFAULT 10,
  p_trade TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID, display_name TEXT, bio TEXT, trades TEXT[], quartier TEXT, city TEXT,
  trust_score NUMERIC, jobs_done INTEGER, distance_km DOUBLE PRECISION
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT pp.id, pp.display_name, pp.bio, pp.trades, pp.quartier, pp.city,
         pp.trust_score, pp.jobs_done,
         CASE WHEN pp.geo IS NOT NULL AND p_lat IS NOT NULL
              THEN ST_Distance(pp.geo, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000.0
         END AS distance_km
  FROM provider_profiles pp
  WHERE pp.is_verified
    AND (p_trade IS NULL OR p_trade = '' OR EXISTS (
          SELECT 1 FROM unnest(pp.trades) t WHERE t ILIKE '%' || p_trade || '%'))
    AND (p_lat IS NULL OR pp.geo IS NULL OR
         ST_DWithin(pp.geo, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000))
  ORDER BY pp.trust_score DESC NULLS LAST, distance_km ASC NULLS LAST
  LIMIT 100;
$$;
GRANT EXECUTE ON FUNCTION public.search_providers(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT) TO anon, authenticated;
