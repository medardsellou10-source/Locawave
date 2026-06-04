-- Phase 16 — Automatisation propre : marquage des retards + crons dédoublonnés + auth via Vault.
--
-- Action utilisateur unique : ajouter dans Supabase Vault un secret nommé `service_role_key`
-- (Dashboard → Project Settings → Vault) contenant la clé service_role. Les tâches cron la lisent
-- via vault.decrypted_secrets pour autoriser l'appel des edge functions. Sans ce secret, les
-- rappels ne partent pas (mais aucun double envoi), et le marquage des retards (SQL) fonctionne.

-- 1) Balayage robuste des échéances en retard (SQL pur, lancé par cron)
CREATE OR REPLACE FUNCTION public.mark_overdue_schedules() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  UPDATE rent_schedules
     SET status = 'late', updated_at = now()
   WHERE status = 'pending' AND due_date < CURRENT_DATE;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.mark_overdue_schedules() FROM anon, authenticated, public;

-- 2) Dédoublonnage : retirer les anciennes tâches http_post (placeholders + doublons)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT jobname FROM cron.job WHERE jobname = ANY (ARRAY[
    'locawave-reminder-j5','locawave-reminder-j0','locawave-reminder-j3-late',
    'locawave-alert-landlord','locawave-lease-expiry','locawave-monthly-report',
    'reminder-j5','reminder-j0','reminder-j3-late','alert-landlord-late',
    'check-lease-expiry','monthly-report','annual-report',
    'lw_reminder_j5','lw_reminder_j0','lw_reminder_j3_late','lw_alert_landlord',
    'lw_lease_expiry','lw_monthly_report','lw_annual_report','lw_mark_overdue'
  ]) LOOP
    PERFORM cron.unschedule(r.jobname);
  END LOOP;
END $$;

-- 3) Helper : commande d'appel d'une edge function avec Bearer lu depuis Vault
CREATE OR REPLACE FUNCTION public.lw_edge_command(fn text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT format(
    $cmd$SELECT net.http_post(url := %L, headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'), '')), body := '{}'::jsonb);$cmd$,
    'https://jgrmltfyktitfffbfhcx.supabase.co/functions/v1/' || fn
  )
$$;
REVOKE ALL ON FUNCTION public.lw_edge_command(text) FROM anon, authenticated, public;

-- 4) Set unique de tâches propres
SELECT cron.schedule('lw_mark_overdue',    '30 6 * * *', $$SELECT public.mark_overdue_schedules();$$);
SELECT cron.schedule('lw_reminder_j5',     '0 8 * * *',  public.lw_edge_command('reminder-j5'));
SELECT cron.schedule('lw_reminder_j0',     '0 10 * * *', public.lw_edge_command('reminder-j0'));
SELECT cron.schedule('lw_reminder_j3_late','0 10 * * *', public.lw_edge_command('reminder-j3-late'));
SELECT cron.schedule('lw_alert_landlord',  '0 9 * * 1',  public.lw_edge_command('alert-landlord-late'));
SELECT cron.schedule('lw_lease_expiry',    '0 8 * * *',  public.lw_edge_command('check-lease-expiry'));
SELECT cron.schedule('lw_monthly_report',  '0 7 1 * *',  public.lw_edge_command('monthly-report'));
SELECT cron.schedule('lw_annual_report',   '0 6 1 1 *',  public.lw_edge_command('annual-report'));
