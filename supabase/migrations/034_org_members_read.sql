-- Correctif audit : les membres (manager/viewer) ne pouvaient pas lire leur
-- organisation (policy existante limitée à owner_id=auth.uid()), ce qui bloquait
-- tous leurs dashboards (org jamais chargée). On ajoute une policy SELECT membres.
CREATE POLICY "members_read_org" ON organizations
  FOR SELECT USING (id = (SELECT org_id FROM users WHERE id = auth.uid()));
