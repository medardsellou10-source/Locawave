-- Phase 8b — Réservations récurrentes de services (ex. ménage chaque samedi).

CREATE TABLE IF NOT EXISTS recurring_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES provider_services(id) ON DELETE SET NULL,
  title TEXT,
  frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly','biweekly','monthly')),
  weekday INTEGER CHECK (weekday BETWEEN 0 AND 6),  -- 0 = dimanche
  amount_fcfa INTEGER,
  active BOOLEAN DEFAULT TRUE,
  next_run DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE recurring_bookings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_recurring_client ON recurring_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_provider ON recurring_bookings(provider_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON recurring_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "recurring_client_all" ON recurring_bookings
  FOR ALL TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY "recurring_provider_select" ON recurring_bookings
  FOR SELECT TO authenticated USING (provider_id = auth.uid());

-- Génère les occurrences dues (work_orders home_service, séquestre held) pour
-- toutes les réservations actives arrivées à échéance. Idempotent par jour.
-- Appelable par cron (pg_cron) ou manuellement.
CREATE OR REPLACE FUNCTION public.generate_due_bookings()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; n INTEGER := 0;
BEGIN
  FOR r IN SELECT * FROM recurring_bookings WHERE active AND (next_run IS NULL OR next_run <= CURRENT_DATE) LOOP
    INSERT INTO work_orders (incident_id, property_id, client_id, provider_id, type, description, amount_fcfa, status, escrow_status)
    VALUES (NULL, NULL, r.client_id, r.provider_id, 'home_service',
            COALESCE(r.title, 'Service récurrent'), r.amount_fcfa, 'assigned',
            CASE WHEN r.amount_fcfa IS NOT NULL THEN 'held' ELSE 'none' END);
    UPDATE recurring_bookings SET next_run =
      CASE r.frequency
        WHEN 'weekly' THEN CURRENT_DATE + 7
        WHEN 'biweekly' THEN CURRENT_DATE + 14
        ELSE CURRENT_DATE + 30 END
    WHERE id = r.id;
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.generate_due_bookings() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_due_bookings() TO authenticated;
