-- Phase 8a (fix) — search_providers renvoie aussi lat/lng pour l'affichage carte.
DROP FUNCTION IF EXISTS public.search_providers(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT);
CREATE OR REPLACE FUNCTION public.search_providers(
  p_lat DOUBLE PRECISION DEFAULT NULL, p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_km DOUBLE PRECISION DEFAULT 10, p_trade TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, display_name TEXT, bio TEXT, trades TEXT[], quartier TEXT, city TEXT,
  trust_score NUMERIC, jobs_done INTEGER, distance_km DOUBLE PRECISION,
  lat DOUBLE PRECISION, lng DOUBLE PRECISION)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT pp.id, pp.display_name, pp.bio, pp.trades, pp.quartier, pp.city, pp.trust_score, pp.jobs_done,
         CASE WHEN pp.geo IS NOT NULL AND p_lat IS NOT NULL
              THEN ST_Distance(pp.geo, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000.0 END AS distance_km,
         ST_Y(pp.geo::geometry) AS lat, ST_X(pp.geo::geometry) AS lng
  FROM provider_profiles pp
  WHERE pp.is_verified
    AND (p_trade IS NULL OR p_trade = '' OR EXISTS (SELECT 1 FROM unnest(pp.trades) t WHERE t ILIKE '%' || p_trade || '%'))
    AND (p_lat IS NULL OR pp.geo IS NULL OR ST_DWithin(pp.geo, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000))
  ORDER BY pp.trust_score DESC NULLS LAST, distance_km ASC NULLS LAST LIMIT 100;
$$;
GRANT EXECUTE ON FUNCTION public.search_providers(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT) TO anon, authenticated;
