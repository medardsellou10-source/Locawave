-- 063 — Stockage des documents générés (quittances, contrats de bail).
--
-- CONSTAT
-- @react-pdf/renderer figure dans package.json depuis l'origine mais n'est
-- importé NULLE PART. La route dite « receipts/generate » ne génère rien : elle
-- renvoie du JSON. En base : 5 quittances, 0 pdf_url renseigné. L'écran
-- locataire affichait « Disponible » sans aucun fichier derrière, parce que le
-- lien de téléchargement était conditionné à `pdf_url`, toujours NULL.
--
-- La promesse « quittances PDF automatiques » — présente dans le produit ET
-- dans la campagne — n'a donc jamais produit un seul fichier.
--
-- CHOIX : CE BUCKET EST PRIVÉ
-- Contrairement à `listings` (062), public parce qu'une photo d'annonce
-- s'adresse à des visiteurs anonymes. Ici c'est l'inverse : une quittance nomme
-- un locataire, un montant et une adresse ; un bail contient des références de
-- pièce d'identité. L'accès passe par des URLs signées à durée limitée.
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Chemin : <org_id>/<type>/<fichier>.pdf
--
-- Lisible par les membres de l'organisation émettrice, par le locataire
-- concerné, et par les admins. Le rattachement au locataire est vérifié en
-- remontant receipts -> payments -> rent_schedules -> leases -> tenants :
-- on ne fait PAS confiance à une convention de nommage de fichier pour décider
-- d'un droit d'accès.
DROP POLICY IF EXISTS documents_select ON storage.objects;
CREATE POLICY documents_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = (SELECT u.org_id::text FROM users u WHERE u.id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM receipts r
        JOIN payments p ON p.id = r.payment_id
        JOIN rent_schedules s ON s.id = p.rent_schedule_id
        JOIN leases l ON l.id = s.lease_id
        JOIN tenants t ON t.id = l.tenant_id
        WHERE t.profile_id = auth.uid()
          AND r.pdf_url LIKE '%' || name
      )
    )
  );

-- Seul le service (génération côté serveur) écrit ici : un client n'a aucune
-- raison de déposer lui-même un document officiel.
DROP POLICY IF EXISTS documents_insert ON storage.objects;
CREATE POLICY documents_insert ON storage.objects
  FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'documents');
