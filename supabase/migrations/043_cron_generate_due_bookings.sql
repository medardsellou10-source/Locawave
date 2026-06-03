-- Phase 11 — automatiser la génération des occurrences de réservations récurrentes.
-- Chaque jour à 06:00 UTC, generate_due_bookings() crée les work_orders dus (séquestre held)
-- et avance next_run. Idempotent : ne génère que les occurrences échues.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate_due_bookings_daily') THEN
    PERFORM cron.unschedule('generate_due_bookings_daily');
  END IF;
END $$;

SELECT cron.schedule(
  'generate_due_bookings_daily',
  '0 6 * * *',
  $$SELECT public.generate_due_bookings();$$
);
