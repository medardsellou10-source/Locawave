-- Phase 3 — Espace locataire : relie une fiche tenant à un compte auth (profiles)
-- et ouvre un accès EN LECTURE strictement limité au bail du locataire.

-- 1) Lien fiche contact ⇄ compte auth invité
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_profile ON tenants(profile_id);

-- 2) Helpers SECURITY DEFINER : renvoient les ids autorisés du locataire courant.
--    Definer => contournent la RLS pour le calcul, évitant toute récursion de policy.
CREATE OR REPLACE FUNCTION public.tenant_lease_ids()
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT l.id FROM leases l
  JOIN tenants t ON t.id = l.tenant_id
  WHERE t.profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.tenant_unit_ids()
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT l.unit_id FROM leases l
  JOIN tenants t ON t.id = l.tenant_id
  WHERE t.profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.tenant_property_ids()
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT u.property_id FROM units u
  WHERE u.id IN (
    SELECT l.unit_id FROM leases l
    JOIN tenants t ON t.id = l.tenant_id
    WHERE t.profile_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.tenant_schedule_ids()
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT rs.id FROM rent_schedules rs
  WHERE rs.lease_id IN (
    SELECT l.id FROM leases l
    JOIN tenants t ON t.id = l.tenant_id
    WHERE t.profile_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.tenant_payment_ids()
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT p.id FROM payments p
  WHERE p.rent_schedule_id IN (
    SELECT rs.id FROM rent_schedules rs
    WHERE rs.lease_id IN (
      SELECT l.id FROM leases l
      JOIN tenants t ON t.id = l.tenant_id
      WHERE t.profile_id = auth.uid()
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION
  public.tenant_lease_ids(), public.tenant_unit_ids(), public.tenant_property_ids(),
  public.tenant_schedule_ids(), public.tenant_payment_ids()
  FROM anon, PUBLIC;

-- 3) Policies SELECT additionnelles (s'ajoutent en OR aux policies org-isolation).
--    Le locataire ne voit QUE ce qui touche son bail, et uniquement en lecture.
CREATE POLICY "tenant_reads_self" ON tenants
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "tenant_reads_lease" ON leases
  FOR SELECT USING (id IN (SELECT public.tenant_lease_ids()));
CREATE POLICY "tenant_reads_unit" ON units
  FOR SELECT USING (id IN (SELECT public.tenant_unit_ids()));
CREATE POLICY "tenant_reads_property" ON properties
  FOR SELECT USING (id IN (SELECT public.tenant_property_ids()));
CREATE POLICY "tenant_reads_schedule" ON rent_schedules
  FOR SELECT USING (id IN (SELECT public.tenant_schedule_ids()));
CREATE POLICY "tenant_reads_payment" ON payments
  FOR SELECT USING (id IN (SELECT public.tenant_payment_ids()));
CREATE POLICY "tenant_reads_receipt" ON receipts
  FOR SELECT USING (payment_id IN (SELECT public.tenant_payment_ids()));
