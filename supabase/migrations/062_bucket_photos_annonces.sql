-- 062 — Stockage des photos d'annonces.
--
-- CONSTAT
-- Le formulaire de publication n'avait AUCUN champ photo : toutes les annonces
-- existantes ont photos = {}. La migration 058 exige au moins une photo pour
-- publier — sans bucket ni téléversement, la publication devenait impossible.
-- C'est une régression que 058 a introduite et que celle-ci répare.
--
-- CHOIX ASSUMÉ : CE BUCKET EST PUBLIC
-- Contrairement à `chantier` et `reports`, passés en privé en 054. Ce n'est pas
-- une incohérence. Une photo de chantier documente un contrat privé entre deux
-- parties ; une photo d'annonce est faite pour être vue par n'importe quel
-- chercheur de logement, y compris non connecté. La rendre privée obligerait à
-- signer des URLs pour des visiteurs anonymes — un non-sens.
--
-- En revanche l'écriture reste réservée aux comptes authentifiés, et chacun
-- n'écrit que dans son propre dossier.
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Lecture publique : c'est l'objet même d'une annonce.
DROP POLICY IF EXISTS listings_storage_select ON storage.objects;
CREATE POLICY listings_storage_select ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'listings');

-- Écriture : chacun dépose uniquement sous <son user_id>/…
DROP POLICY IF EXISTS listings_storage_insert ON storage.objects;
CREATE POLICY listings_storage_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS listings_storage_delete ON storage.objects;
CREATE POLICY listings_storage_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'listings'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );
