-- 058 — Intégrité des annonces : une annonce ne survit pas à l'occupation du bien.
--
-- CONSTAT
-- `units.status` porte l'occupation, `listings.status` porte la publication, et
-- RIEN ne les reliait. Un bien passé « loué » gardait son annonce visible
-- indéfiniment. C'est la faute qui coûte le plus cher en confiance : un
-- chercheur de logement appelle pour un bien déjà pris.
--
-- Vérifié sur les données réelles au moment d'écrire cette migration :
-- « Studio meublé Plateau » était publiée alors que son unique unité était
-- louée. L'incohérence n'était pas théorique.
--
-- RÈGLE, VOLONTAIREMENT ASYMÉTRIQUE
--   • DÉPUBLICATION AUTOMATIQUE dès qu'un bien n'a plus aucune unité vacante.
--     Immédiate, par trigger — pas de tâche planifiée qui laisserait une fenêtre
--     pendant laquelle l'annonce reste visible à tort.
--   • AUCUNE REPUBLICATION AUTOMATIQUE. Qu'une unité redevienne vacante ne
--     ressuscite pas une vieille annonce : prix, photos et disponibilité ont pu
--     changer entre-temps. C'est au propriétaire de republier sciemment.

CREATE OR REPLACE FUNCTION public.sync_listings_sur_occupation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_vacantes int;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_vacantes
  FROM units u
  WHERE u.property_id = NEW.property_id AND u.status = 'vacant';

  IF v_vacantes = 0 THEN
    UPDATE listings
       SET status = 'rented', updated_at = now()
     WHERE property_id = NEW.property_id AND status = 'published';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_listings_occupation ON public.units;
CREATE TRIGGER trg_sync_listings_occupation
  AFTER UPDATE OF status ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.sync_listings_sur_occupation();

-- ─── Conditions de publication ───
-- Une contrainte CHECK ne suffirait pas : on veut un message lisible côté
-- application, et la règle ne s'applique qu'à l'état « published » — un
-- brouillon doit rester librement modifiable pendant la saisie.
CREATE OR REPLACE FUNCTION public.valider_publication_annonce()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'published' THEN
    IF NEW.photos IS NULL OR cardinality(NEW.photos) = 0 THEN
      RAISE EXCEPTION 'Publication impossible : ajoutez au moins une photo du bien.'
        USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.geo IS NULL THEN
      RAISE EXCEPTION 'Publication impossible : l''adresse doit être localisée sur la carte.'
        USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.published_at IS NULL THEN
      NEW.published_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_valider_publication ON public.listings;
CREATE TRIGGER trg_valider_publication
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.valider_publication_annonce();

-- ─── Anti-doublon ───
-- Renvoie les annonces publiées du même type à moins de `p_rayon_m` du point
-- donné. Sert à PRÉVENIR avant publication ; on n'interdit pas, car deux
-- logements distincts partagent légitimement une adresse (immeuble, résidence).
CREATE OR REPLACE FUNCTION public.annonces_similaires(
  p_geo geography, p_type text, p_exclure uuid DEFAULT NULL, p_rayon_m int DEFAULT 40
)
RETURNS TABLE (id uuid, title text, rent_fcfa int, distance_m int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT l.id, l.title, l.rent_fcfa,
         ROUND(ST_Distance(l.geo, p_geo))::int AS distance_m
  FROM listings l
  WHERE l.status = 'published'
    AND l.geo IS NOT NULL
    AND (p_exclure IS NULL OR l.id <> p_exclure)
    AND l.type = p_type
    AND ST_DWithin(l.geo, p_geo, p_rayon_m)
  ORDER BY 4
  LIMIT 5;
$$;
REVOKE ALL ON FUNCTION public.annonces_similaires(geography, text, uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.annonces_similaires(geography, text, uuid, int) TO authenticated;
