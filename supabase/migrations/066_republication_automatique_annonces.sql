-- 066 — Republication automatique des annonces quand une unité redevient libre.
--
-- La migration 058 dépubliait automatiquement mais ne republiait JAMAIS, au
-- motif qu'une annonce ressuscitée peut porter un prix, des photos ou une
-- disponibilité périmés. Décision du porteur du projet : republier.
--
-- La réserve reste fondée, on la traite au lieu de l'ignorer : on ne republie
-- QUE ce que le système avait lui-même dépublié. Une annonce retirée
-- volontairement par le propriétaire ne remonte jamais toute seule — sinon on
-- lui reprendrait la main sur sa propre vitrine.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS depublished_by text
    CHECK (depublished_by IS NULL OR depublished_by IN ('system', 'owner')),
  ADD COLUMN IF NOT EXISTS depublished_at timestamptz;

COMMENT ON COLUMN public.listings.depublished_by IS
  'Qui a dépublié : ''system'' (bien devenu occupé, republiable) ou ''owner'' (retrait volontaire, jamais republié automatiquement).';

-- Les annonces déjà en 'rented' l'ont été par le trigger de la 058 : elles sont
-- donc republiables. Aucune n'avait été retirée à la main à ce stade.
UPDATE public.listings
   SET depublished_by = 'system', depublished_at = COALESCE(depublished_at, updated_at)
 WHERE status = 'rented' AND depublished_by IS NULL;

-- ─── Dépublication et republication pilotées par l'occupation ───
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
    -- Plus aucune unité libre : on retire l'annonce de la vitrine.
    UPDATE listings
       SET status = 'rented', depublished_by = 'system',
           depublished_at = now(), updated_at = now()
     WHERE property_id = NEW.property_id AND status = 'published';
  ELSE
    -- Une unité s'est libérée : on remet en ligne ce que le système avait
    -- retiré, jamais ce que le propriétaire a retiré lui-même.
    UPDATE listings
       SET status = 'published', depublished_by = NULL,
           depublished_at = NULL, updated_at = now()
     WHERE property_id = NEW.property_id
       AND status = 'rented'
       AND depublished_by = 'system'
       -- Une annonce republiée doit rester publiable : la règle de la 058 exige
       -- photo et coordonnées. Sans elles, on la laisse hors ligne plutôt que de
       -- faire échouer la libération de l'unité par une exception.
       AND photos IS NOT NULL AND cardinality(photos) > 0
       AND geo IS NOT NULL;
  END IF;

  RETURN NEW;
END $$;

-- ─── Retrait volontaire : marquer l'annonce comme non republiable ───
-- Le propriétaire dépublie depuis l'écran Annonces (status -> 'rented'). Sans
-- ce marquage, sa décision serait annulée à la première unité qui se libère.
CREATE OR REPLACE FUNCTION public.marquer_depublication_manuelle()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'rented' AND OLD.status = 'published'
     AND NEW.depublished_by IS NOT DISTINCT FROM OLD.depublished_by THEN
    -- Le trigger système renseigne depublished_by dans la même instruction ;
    -- si le champ n'a pas bougé, le retrait vient d'un humain.
    NEW.depublished_by := 'owner';
    NEW.depublished_at := now();
  END IF;

  -- Republication manuelle : on efface la trace pour repartir propre.
  IF NEW.status = 'published' AND OLD.status <> 'published' THEN
    NEW.depublished_by := NULL;
    NEW.depublished_at := NULL;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_depublication_manuelle ON public.listings;
CREATE TRIGGER trg_depublication_manuelle
  BEFORE UPDATE OF status ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.marquer_depublication_manuelle();

-- Vérifié après application, sur deux annonces du même bien :
--   dépubliée par le système + photo + GPS -> republiée automatiquement
--   dépubliée par le propriétaire          -> reste hors ligne
--   dépubliée par le système, sans photo   -> reste hors ligne
-- Constaté au passage : vider les photos d'une annonce PUBLIÉE est refusé par
-- la règle de la 058. C'est cohérent — il faut dépublier d'abord.
