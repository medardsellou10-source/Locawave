-- Phase 18 — Automatisation pilotable et autonome.
--
-- Objectif : les rappels de loyer fonctionnent SANS dépendance externe (ni Twilio,
-- ni secret Vault). Ils sont calculés et distribués directement en base, dans un
-- centre de notifications interne. WhatsApp devient une amélioration optionnelle.
--
-- Contenu : réglages par organisation · notifications in-app · état de santé réel
-- des automatisations · moteur de rappels natif · déclencheur manuel.

-- ═══ 1) Réglages d'automatisation par organisation ═══
CREATE TABLE IF NOT EXISTS org_automation_settings (
  org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  reminder_before_days INTEGER NOT NULL DEFAULT 5 CHECK (reminder_before_days BETWEEN 1 AND 15),
  reminder_on_due BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_late_days INTEGER NOT NULL DEFAULT 3 CHECK (reminder_late_days BETWEEN 1 AND 30),
  alert_landlord BOOLEAN NOT NULL DEFAULT TRUE,
  channel_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
  channel_inapp BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE org_automation_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON org_automation_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY oas_org_all ON org_automation_settings FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

INSERT INTO org_automation_settings (org_id)
SELECT id FROM organizations ON CONFLICT (org_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.trg_org_automation_defaults() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO org_automation_settings (org_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_org_automation_defaults ON organizations;
CREATE TRIGGER on_org_automation_defaults AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.trg_org_automation_defaults();
REVOKE ALL ON FUNCTION public.trg_org_automation_defaults() FROM anon, authenticated, public;

-- ═══ 2) Centre de notifications interne ═══
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  channel TEXT NOT NULL DEFAULT 'inapp',
  delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending','sent','failed','skipped')),
  dedupe_key TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notif_org ON notifications(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_profile ON notifications(profile_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_dedupe ON notifications(dedupe_key) WHERE dedupe_key IS NOT NULL;

CREATE POLICY notif_org_read ON notifications FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()) OR profile_id = auth.uid());
CREATE POLICY notif_org_update ON notifications FOR UPDATE TO authenticated
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()) OR profile_id = auth.uid())
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()) OR profile_id = auth.uid());

-- ═══ 3) État de santé réel des automatisations ═══
CREATE OR REPLACE FUNCTION public.automation_health()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_vault boolean; v_last_ok timestamptz; v_last_401 timestamptz; v_jobs jsonb;
BEGIN
  SELECT EXISTS(SELECT 1 FROM vault.decrypted_secrets WHERE name = 'service_role_key') INTO v_vault;
  SELECT max(created) INTO v_last_ok  FROM net._http_response WHERE status_code BETWEEN 200 AND 299;
  SELECT max(created) INTO v_last_401 FROM net._http_response WHERE status_code = 401;

  SELECT jsonb_agg(jsonb_build_object(
           'job', j.jobname, 'schedule', j.schedule, 'active', j.active,
           'last_run', d.last_run, 'last_status', d.last_status
         ) ORDER BY j.jobname) INTO v_jobs
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT max(end_time) AS last_run,
           (array_agg(status ORDER BY end_time DESC NULLS LAST))[1] AS last_status
    FROM cron.job_run_details r WHERE r.jobid = j.jobid
  ) d ON true
  WHERE j.jobname LIKE 'lw\_%' OR j.jobname = 'generate_due_bookings_daily';

  RETURN jsonb_build_object(
    'vault_configured', v_vault, 'last_success', v_last_ok,
    'last_unauthorized', v_last_401, 'jobs', COALESCE(v_jobs, '[]'::jsonb));
END $$;
GRANT EXECUTE ON FUNCTION public.automation_health() TO authenticated;
REVOKE ALL ON FUNCTION public.automation_health() FROM anon;

-- ═══ 4) Formatage FCFA (espace comme séparateur, format français) ═══
CREATE OR REPLACE FUNCTION public.lw_fcfa(n numeric) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT replace(replace(to_char(n, 'FM999G999G999'), ',', ' '), '.', ' ')
$$;
REVOKE ALL ON FUNCTION public.lw_fcfa(numeric) FROM anon, authenticated, public;

-- ═══ 5) Moteur de rappels natif (aucune authentification externe requise) ═══
CREATE OR REPLACE FUNCTION public.run_rent_reminders()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r RECORD;
  v_created integer := 0;
  v_msg text; v_title text; v_kind text; v_tpl text; v_jours text;
BEGIN
  FOR r IN
    SELECT s.id, s.org_id, s.amount_fcfa, s.due_date,
           t.first_name, t.profile_id,
           p.name AS property_name, u.unit_number,
           org.wave_number, o.reminder_before_days, o.reminder_late_days,
           CASE
             WHEN s.due_date = CURRENT_DATE + o.reminder_before_days THEN 'reminder_j5'
             WHEN s.due_date = CURRENT_DATE AND o.reminder_on_due THEN 'reminder_j0'
             WHEN s.due_date = CURRENT_DATE - o.reminder_late_days THEN 'reminder_j3_late'
           END AS tpl_type
    FROM rent_schedules s
    JOIN leases l   ON l.id = s.lease_id
    JOIN tenants t  ON t.id = l.tenant_id
    LEFT JOIN units u      ON u.id = l.unit_id
    LEFT JOIN properties p ON p.id = u.property_id
    JOIN org_automation_settings o ON o.org_id = s.org_id
    JOIN organizations org ON org.id = s.org_id
    WHERE s.status IN ('pending','late')
      AND ( s.due_date = CURRENT_DATE + o.reminder_before_days
         OR (s.due_date = CURRENT_DATE AND o.reminder_on_due)
         OR s.due_date = CURRENT_DATE - o.reminder_late_days )
  LOOP
    v_kind := r.tpl_type;
    CONTINUE WHEN v_kind IS NULL;

    SELECT message_template INTO v_tpl FROM notification_templates
     WHERE org_id = r.org_id AND type = v_kind AND is_active LIMIT 1;

    IF v_tpl IS NULL THEN
      -- Modèle explicitement désactivé par le propriétaire : on ne notifie pas.
      CONTINUE WHEN EXISTS (SELECT 1 FROM notification_templates
                             WHERE org_id = r.org_id AND type = v_kind AND NOT is_active);
      v_tpl := CASE v_kind
        WHEN 'reminder_j5' THEN 'Bonjour {prenom}, votre loyer de {montant} FCFA pour {bien} est dû dans {jours} jours (le {date}). Wave : {wave_number}. Merci.'
        WHEN 'reminder_j0' THEN 'Bonjour {prenom}, votre loyer de {montant} FCFA pour {bien} est dû aujourd''hui. Wave : {wave_number}. Merci.'
        ELSE 'Bonjour {prenom}, votre loyer de {montant} FCFA pour {bien} est en retard depuis le {date}. Merci de régulariser.'
      END;
    END IF;

    v_jours := CASE v_kind
      WHEN 'reminder_j5' THEN r.reminder_before_days::text
      WHEN 'reminder_j3_late' THEN r.reminder_late_days::text ELSE '0' END;

    v_msg := replace(v_tpl, '{prenom}', COALESCE(r.first_name, ''));
    v_msg := replace(v_msg, '{montant}', public.lw_fcfa(r.amount_fcfa));
    v_msg := replace(v_msg, '{bien}', trim(COALESCE(r.property_name,'') || ' ' || COALESCE(r.unit_number,'')));
    v_msg := replace(v_msg, '{date}', to_char(r.due_date, 'DD/MM/YYYY'));
    v_msg := replace(v_msg, '{jours}', v_jours);
    v_msg := replace(v_msg, '{wave_number}', COALESCE(r.wave_number, ''));
    v_msg := replace(v_msg, '{tel_proprietaire}', COALESCE(r.wave_number, ''));

    v_title := CASE v_kind
      WHEN 'reminder_j5' THEN 'Loyer à échoir — ' || COALESCE(r.first_name,'locataire')
      WHEN 'reminder_j0' THEN 'Loyer dû aujourd''hui — ' || COALESCE(r.first_name,'locataire')
      ELSE 'Loyer en retard — ' || COALESCE(r.first_name,'locataire') END;

    INSERT INTO notifications (org_id, kind, title, body, link, channel, delivery_status, dedupe_key)
    VALUES (r.org_id, v_kind, v_title, v_msg, '/dashboard/payments', 'inapp', 'sent',
            v_kind || ':' || r.id::text || ':' || CURRENT_DATE::text)
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    IF FOUND THEN v_created := v_created + 1; END IF;

    IF r.profile_id IS NOT NULL THEN
      INSERT INTO notifications (org_id, profile_id, kind, title, body, link, channel, delivery_status, dedupe_key)
      VALUES (r.org_id, r.profile_id, v_kind, 'Rappel de loyer', v_msg, '/locataire', 'inapp', 'sent',
              v_kind || ':t:' || r.id::text || ':' || CURRENT_DATE::text)
      ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    END IF;
  END LOOP;

  RETURN v_created;
END $$;
REVOKE ALL ON FUNCTION public.run_rent_reminders() FROM anon, authenticated, public;

-- ═══ 6) Déclencheur manuel depuis l'application (« Tester maintenant ») ═══
CREATE OR REPLACE FUNCTION public.trigger_rent_reminders()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;
  RETURN public.run_rent_reminders();
END $$;
GRANT EXECUTE ON FUNCTION public.trigger_rent_reminders() TO authenticated;
REVOKE ALL ON FUNCTION public.trigger_rent_reminders() FROM anon;

-- ═══ 7) Tâche quotidienne native ═══
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'lw_rent_reminders') THEN
    PERFORM cron.unschedule('lw_rent_reminders');
  END IF;
END $$;
SELECT cron.schedule('lw_rent_reminders', '0 7 * * *', $$SELECT public.run_rent_reminders();$$);

-- ═══ 8) Durcissement des droits ═══
-- REVOKE ... FROM anon est inopérant tant que PUBLIC détient EXECUTE (anon en hérite).
-- On révoque PUBLIC d'abord, puis on n'accorde qu'au rôle authenticated.
REVOKE ALL ON FUNCTION public.automation_health() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.automation_health() TO authenticated;
REVOKE ALL ON FUNCTION public.trigger_rent_reminders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_rent_reminders() TO authenticated;
