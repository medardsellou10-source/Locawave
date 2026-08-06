-- 065 — L'état « Envoi WhatsApp » cesse de mentir.
--
-- CONSTAT
-- Le badge « Envoi WhatsApp : Actif — Passerelle configurée : les messages
-- partent vers les locataires » était piloté par `vault_configured`, que
-- automation_health() calculait ainsi :
--     EXISTS(SELECT 1 FROM vault.decrypted_secrets WHERE name='service_role_key')
--
-- Ce secret sert au Bearer des rapports mensuel et annuel. Il n'a AUCUN rapport
-- avec Twilio, dont les identifiants (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
-- WHATSAPP_FROM) sont lus dans l'environnement des Edge Functions.
--
-- Conséquence : renseigner ce secret aurait fait passer le badge au vert alors
-- que zéro message ne serait parti — d'autant que la migration 051 a retiré
-- toutes les tâches planifiées qui appelaient WhatsApp.
--
-- MESURÉ : 13 notifications en base, 100 % en canal `inapp`. Aucune n'a jamais
-- eu un autre canal.
--
-- PRINCIPE RETENU
-- Ne pas déduire un état d'envoi d'une configuration. Le SQL ne peut pas voir
-- les variables d'environnement des Edge Functions ; en revanche il peut
-- constater ce qui est RÉELLEMENT parti. On rapporte donc un fait observable.
CREATE OR REPLACE FUNCTION public.automation_health()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, extensions AS $$
DECLARE
  v_vault_service_key boolean;
  v_wa_dernier timestamptz;
  v_wa_30j int;
  v_last_ok timestamptz;
  v_last_401 timestamptz;
  v_jobs jsonb;
BEGIN
  -- Renommé : ce champ dit désormais ce qu'il mesure — la clé de service.
  SELECT EXISTS(SELECT 1 FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    INTO v_vault_service_key;

  -- État WhatsApp fondé sur des envois constatés, pas sur une configuration.
  SELECT max(created_at), count(*) FILTER (WHERE created_at > now() - interval '30 days')
    INTO v_wa_dernier, v_wa_30j
  FROM notifications
  WHERE channel = 'whatsapp' AND delivery_status = 'sent';

  SELECT max(created) INTO v_last_ok
  FROM net._http_response WHERE status_code BETWEEN 200 AND 299;
  SELECT max(created) INTO v_last_401
  FROM net._http_response WHERE status_code = 401;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'job', j.jobname, 'schedule', j.schedule, 'active', j.active,
           'last_run', d.start_time, 'last_status', d.status) ORDER BY j.jobname), '[]'::jsonb)
    INTO v_jobs
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT start_time, status FROM cron.job_run_details r
    WHERE r.jobid = j.jobid ORDER BY start_time DESC LIMIT 1
  ) d ON true
  WHERE j.jobname LIKE 'lw_%' OR j.jobname LIKE 'generate_%';

  RETURN jsonb_build_object(
    'vault_service_key', v_vault_service_key,
    -- Conservé pour compatibilité, mais aligné sur la réalité WhatsApp afin
    -- qu'un ancien appelant n'affiche plus « Actif » à tort.
    'vault_configured', (v_wa_30j > 0),
    'whatsapp_operational', (v_wa_30j > 0),
    'whatsapp_last_sent', v_wa_dernier,
    'whatsapp_sent_30d', v_wa_30j,
    'last_success', v_last_ok,
    'last_401', v_last_401,
    'jobs', v_jobs
  );
END $$;

REVOKE ALL ON FUNCTION public.automation_health() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.automation_health() TO authenticated;
