-- 051 — Retrait des tâches planifiées inopérantes.
--
-- Constat mesuré avant suppression : sur les 10 derniers jours, 100 % des
-- réponses enregistrées dans net._http_response sont en 401, aucune en 2xx.
-- Ces tâches appellent des Edge Functions via net.http_post avec un Bearer issu
-- du Vault non renseigné. cron.job_run_details les marquait « succeeded » parce
-- que la mise en file de la requête réussit — l'appel HTTP, lui, échouait.
--
-- Elles sont désormais remplacées par des tâches SQL natives, sans dépendance
-- externe :
--   lw_reminder_j5 / j0 / j3_late → lw_rent_reminders + lw_escalating_reminders
--   lw_lease_expiry               → lw_lease_expiry_alerts
--   lw_alert_landlord             → lw_weekly_digest
--
-- lw_monthly_report et lw_annual_report sont CONSERVÉS : ils n'ont pas encore
-- d'équivalent natif. Ils restent inopérants tant que le secret Vault n'est pas
-- renseigné, et l'écran Paramètres les affiche explicitement « À configurer »
-- au lieu de « OK ».
DO $$
DECLARE j text;
BEGIN
  FOREACH j IN ARRAY ARRAY['lw_reminder_j5','lw_reminder_j0','lw_reminder_j3_late',
                           'lw_lease_expiry','lw_alert_landlord'] LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = j) THEN
      PERFORM cron.unschedule(j);
    END IF;
  END LOOP;
END $$;
