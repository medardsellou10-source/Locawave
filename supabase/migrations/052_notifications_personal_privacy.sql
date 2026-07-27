-- 052 — Correctif de confidentialité sur les notifications.
--
-- Constaté en test live : connecté en propriétaire, la cloche affichait
-- « Votre point mensuel », le résumé destiné au locataire (« Régularisez pour
-- préserver votre score de ponctualité »).
--
-- L'ancienne politique était :
--   org_id = mon_org OR profile_id = auth.uid()
-- Le premier terme suffisait à rendre lisible n'importe quelle notification de
-- l'organisation, y compris celles adressées nominativement à un locataire.
--
-- Règle retenue : une notification portant un profile_id est un message
-- personnel, lisible par son seul destinataire. Les notifications de
-- l'organisation (profile_id IS NULL) restent visibles par ses membres.
DROP POLICY IF EXISTS notif_org_read   ON public.notifications;
DROP POLICY IF EXISTS notif_org_update ON public.notifications;

CREATE POLICY notif_read ON public.notifications
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR (profile_id IS NULL
        AND org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid()))
  );

CREATE POLICY notif_update ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    OR (profile_id IS NULL
        AND org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid()))
  );
