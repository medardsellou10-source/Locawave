-- 054 — Les buckets de médias passent en privé.
--
-- Constat : les buckets `chantier` et `reports` étaient publics, avec une
-- politique SELECT ouverte à PUBLIC (donc anon) et sans aucune restriction :
--   chantier_storage_select_all : USING (bucket_id = 'chantier')
--   reports_storage_select_all  : USING (bucket_id = 'reports')
-- Les photos de chantier de tous les clients étaient donc lisibles par quiconque
-- possédait ou devinait l'URL. Pour un produit dont la proposition centrale est
-- la traçabilité et la preuve, c'est une contradiction autant qu'une fuite.
--
-- L'application signe désormais les URLs à l'affichage (src/lib/storage.ts).
-- L'ancienne forme « URL publique complète stockée dans media_urls » reste
-- lisible : storagePath() en réextrait le chemin, donc aucune migration de
-- données n'est nécessaire.
--
-- ATTENTION : un objet déjà servi publiquement peut rester quelques minutes
-- dans le cache CDN après cette migration (vérifié : l'URL nue renvoyait encore
-- 200 depuis le cache, alors qu'un appel avec paramètre anti-cache renvoyait
-- déjà 400). Surtout, tout fichier ayant été public doit être considéré comme
-- potentiellement déjà copié : passer le bucket en privé protège l'avenir, pas
-- le passé.

UPDATE storage.buckets SET public = false WHERE id IN ('chantier', 'reports');

-- ═══ chantier ═══
-- Chemin : <user_id de l'auteur>/<horodatage>.<ext>
-- Lisible par les parties du chantier sur lequel cet auteur intervient :
-- le propriétaire, le prestataire, les membres de l'organisation, les admins.
DROP POLICY IF EXISTS chantier_storage_select_all ON storage.objects;
CREATE POLICY chantier_storage_select_parties ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'chantier'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text   -- ses propres dépôts
      OR public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.construction_projects cp
        WHERE ((storage.foldername(name))[1] IN (cp.owner_id::text, cp.provider_id::text))
          AND (
            cp.owner_id = auth.uid()
            OR cp.provider_id = auth.uid()
            OR cp.org_id = (SELECT u.org_id FROM public.users u WHERE u.id = auth.uid())
          )
      )
    )
  );

-- ═══ reports ═══
-- Chemin : incidents/<lease_id>/<horodatage>.<ext>
-- Lisible par l'organisation qui gère le bail et par le locataire concerné.
DROP POLICY IF EXISTS reports_storage_select_all ON storage.objects;
CREATE POLICY reports_storage_select_parties ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'reports'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.leases l
        WHERE l.id::text = (storage.foldername(name))[2]
          AND (
            l.org_id = (SELECT u.org_id FROM public.users u WHERE u.id = auth.uid())
            OR l.tenant_id IN (SELECT t.id FROM public.tenants t WHERE t.profile_id = auth.uid())
          )
      )
    )
  );
