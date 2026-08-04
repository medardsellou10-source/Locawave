-- 061 — La dépublication automatique doit épargner les annonces anticipées.
--
-- DÉFAUT DE LA 058, trouvé en la testant
-- Elle dépubliait dès qu'un bien n'avait plus d'unité vacante, sans regarder
-- `available_from`. Or cette colonne existe précisément pour annoncer un
-- logement libre à une date future : un bailleur qui publie en mars pour une
-- libération en juin voyait son annonce disparaître au premier changement
-- d'occupation. La règle « anti-annonce périmée » créait une annonce perdue.
--
-- RÈGLE AFFINÉE
-- On ne dépublie que si le bien est plein ET que l'annonce ne porte pas de
-- disponibilité future. Une annonce anticipée survit jusqu'à sa date ; passée
-- cette date sans unité libre, elle redevient dépubliable au prochain
-- changement d'occupation.
--
-- Vérifié : annonce disponible dans 90 jours → conservée ; annonce à
-- disponibilité immédiate → dépubliée. Les deux au même changement d'unité.
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
     WHERE property_id = NEW.property_id
       AND status = 'published'
       AND (available_from IS NULL OR available_from <= CURRENT_DATE);
  END IF;

  RETURN NEW;
END $$;
