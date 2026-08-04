-- 060 — Badge de fraîcheur sur les annonces.
--
-- search_listings triait déjà par published_at mais ne le RENVOYAIT pas :
-- l'interface n'avait aucun moyen d'afficher « Nouveau » ou « Récent ».
--
-- On expose la date ET la fraîcheur calculée. La règle vit ici, pas dans les
-- écrans : un seul endroit décide de ce qui est « nouveau », et la liste, la
-- carte et la fiche s'y accordent forcément.
--   nouveau : publiée il y a moins de 48 h
--   recent  : publiée il y a moins de 7 jours
--   NULL    : au-delà, ou jamais publiée
DROP FUNCTION IF EXISTS public.search_listings(double precision, double precision, double precision, text, integer, integer, text);

CREATE FUNCTION public.search_listings(
  p_lat double precision DEFAULT NULL, p_lng double precision DEFAULT NULL,
  p_radius_km double precision DEFAULT 25, p_type text DEFAULT NULL,
  p_max_rent integer DEFAULT NULL, p_min_rooms integer DEFAULT NULL, p_city text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, title text, type text, rent_fcfa integer, charges_fcfa integer,
  rooms integer, area_m2 integer, quartier text, city text, photos text[],
  is_verified boolean, distance_km double precision, lat double precision, lng double precision,
  published_at timestamptz, fraicheur text
)
LANGUAGE sql STABLE SET search_path TO 'public' AS $$
  SELECT l.id, l.title, l.type, l.rent_fcfa, l.charges_fcfa, l.rooms, l.area_m2, l.quartier, l.city,
         l.photos, l.is_verified,
         CASE WHEN l.geo IS NOT NULL AND p_lat IS NOT NULL
              THEN ST_Distance(l.geo, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)/1000.0 END AS distance_km,
         ST_Y(l.geo::geometry) AS lat, ST_X(l.geo::geometry) AS lng,
         l.published_at,
         CASE
           WHEN l.published_at IS NULL THEN NULL
           WHEN l.published_at > now() - interval '48 hours' THEN 'nouveau'
           WHEN l.published_at > now() - interval '7 days'   THEN 'recent'
         END AS fraicheur
  FROM listings l
  WHERE l.status = 'published'
    AND (p_type IS NULL OR p_type = '' OR l.type = p_type)
    AND (p_max_rent IS NULL OR l.rent_fcfa <= p_max_rent)
    AND (p_min_rooms IS NULL OR l.rooms >= p_min_rooms)
    AND (p_city IS NULL OR p_city = '' OR l.city ILIKE '%'||p_city||'%')
    AND (p_lat IS NULL OR l.geo IS NULL OR ST_DWithin(l.geo, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km*1000))
  ORDER BY l.is_verified DESC, l.published_at DESC NULLS LAST LIMIT 100;
$$;
