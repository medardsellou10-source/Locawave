-- 059 — Une annonce publiée doit être rattachée à un bien.
--
-- CONSTAT, découvert en testant la migration 058
-- Une annonce existante (« Bel apartement à Yoff », 1 200 000 FCFA) portait
-- property_id = NULL, zéro photo et aucune coordonnée GPS — et elle était
-- PUBLIQUEMENT VISIBLE.
--
-- La synchronisation d'occupation introduite en 058 part de units.property_id :
-- une annonce orpheline lui échappe totalement et peut rester publiée
-- indéfiniment, même si le bien correspondant est occupé. C'était précisément
-- le trou que 058 était censée boucher.
--
-- On exige donc le rattachement dès la publication. Les brouillons restent
-- libres, pour ne pas bloquer une saisie en cours.
--
-- Traitement de l'existant : l'annonce orpheline a été repassée en `draft`
-- plutôt que supprimée — le propriétaire n'a qu'à la compléter et republier.
CREATE OR REPLACE FUNCTION public.valider_publication_annonce()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'published' THEN
    IF NEW.property_id IS NULL THEN
      RAISE EXCEPTION 'Publication impossible : rattachez cette annonce à l''un de vos biens.'
        USING ERRCODE = 'check_violation';
    END IF;
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

-- Remise en conformité de l'existant (idempotent).
UPDATE public.listings
   SET status = 'draft', updated_at = now()
 WHERE status = 'published'
   AND (property_id IS NULL OR geo IS NULL OR photos IS NULL OR cardinality(photos) = 0);
