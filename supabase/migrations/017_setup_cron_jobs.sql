-- ═══════════════════════════════════════════════════════════════
-- pg_cron jobs pour les automatisations Locawave
-- À exécuter dans Supabase SQL Editor après déploiement des Edge Functions
-- Tous les crons en UTC (WAT = UTC+0, pas de décalage)
-- ═══════════════════════════════════════════════════════════════

-- Activer l'extension pg_cron (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ─── Workflow 1 : Rappel J-5 — tous les jours à 8h UTC ─────
SELECT cron.schedule(
  'locawave-reminder-j5',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/reminder-j5',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{}'::jsonb
  );
  $$
);

-- ─── Workflow 2 : Rappel J0 impayé — tous les jours à 10h UTC ─────
SELECT cron.schedule(
  'locawave-reminder-j0',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/reminder-j0',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{}'::jsonb
  );
  $$
);

-- ─── Workflow 3 : Rappel J+3 retard — tous les jours à 10h UTC ─────
SELECT cron.schedule(
  'locawave-reminder-j3-late',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/reminder-j3-late',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{}'::jsonb
  );
  $$
);

-- ─── Workflow 4 : Alerte propriétaire J+7 — tous les lundis à 9h UTC ─────
SELECT cron.schedule(
  'locawave-alert-landlord',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/alert-landlord-late',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{}'::jsonb
  );
  $$
);

-- ─── Alerte fin de bail — tous les jours à 8h UTC ─────
SELECT cron.schedule(
  'locawave-lease-expiry',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/check-lease-expiry',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{}'::jsonb
  );
  $$
);

-- ─── Rapport mensuel — le 1er de chaque mois à 7h UTC ─────
SELECT cron.schedule(
  'locawave-monthly-report',
  '0 7 1 * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/monthly-report',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
    body := '{}'::jsonb
  );
  $$
);
