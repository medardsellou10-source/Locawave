-- Migration 074 — Espace admin, étape 8 : le journal et les réglages.
--
-- Deux dernières briques : chercher dans l'historique des actions admin, et
-- actionner les interrupteurs de la plateforme.
--
-- Un interrupteur qui n'éteint rien serait pire qu'absent : il donnerait
-- l'illusion du contrôle. Chacun est donc lu à l'endroit qui l'applique —
-- reglage_actif() est accessible à tous les rôles, mais ne rend qu'un booléen,
-- jamais le contenu de la table.

-- ============================================================
-- 1) Lire un interrupteur, de partout
-- ============================================================
CREATE OR REPLACE FUNCTION public.reglage_actif(p_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
  -- Réglage absent = fonctionnalité active : une plateforme ne doit pas
  -- s'éteindre parce qu'une ligne manque.
  SELECT COALESCE(
    (SELECT (value ->> 'enabled')::BOOLEAN FROM admin_settings WHERE key = p_key),
    TRUE
  );
$fn$;
GRANT EXECUTE ON FUNCTION public.reglage_actif(TEXT) TO anon, authenticated;

-- Le mode maintenance a sa propre fonction, et ce n'est pas une coquetterie.
-- reglage_actif() répond « cette fonctionnalité marche-t-elle ? » et retombe sur
-- OUI quand la ligne manque. Pour la maintenance, la question est inversée
-- (« l'application est-elle coupée ? ») et le repli sûr aussi : ligne absente =
-- pas de maintenance. Passer par reglage_actif() aurait mis toute la plateforme
-- à l'arrêt le jour où cette ligne disparaîtrait.
CREATE OR REPLACE FUNCTION public.mode_maintenance()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
  SELECT COALESCE(
    (SELECT (value ->> 'enabled')::BOOLEAN FROM admin_settings WHERE key = 'maintenance_mode'),
    FALSE
  );
$fn$;
GRANT EXECUTE ON FUNCTION public.mode_maintenance() TO anon, authenticated;

-- ============================================================
-- 2) Modifier un interrupteur
-- ============================================================
-- Le mode maintenance coupe l'accès à tout le monde : il est réservé au
-- super-admin. Les autres réglages suffisent à un administrateur.
CREATE OR REPLACE FUNCTION public.admin_set_setting(
  p_key    TEXT,
  p_active BOOLEAN,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_avant JSONB;
  v_label TEXT;
  v_apres JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  IF p_key = 'maintenance_mode' AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Le mode maintenance est réservé au super-admin.';
  END IF;

  SELECT value, label INTO v_avant, v_label FROM admin_settings WHERE key = p_key;
  IF v_label IS NULL THEN
    RAISE EXCEPTION 'Réglage inconnu : %', p_key;
  END IF;

  v_apres := jsonb_build_object('enabled', p_active);
  IF p_key = 'maintenance_mode' THEN
    v_apres := v_apres || jsonb_build_object('message', COALESCE(p_message, ''));
  END IF;

  UPDATE admin_settings
  SET value = v_apres, updated_by = auth.uid(), updated_at = NOW()
  WHERE key = p_key;

  PERFORM public.admin_log_action(
    'reglage.' || CASE WHEN p_active THEN 'active' ELSE 'desactive' END,
    'setting', p_key,
    format('%s : %s', v_label, CASE WHEN p_active THEN 'activé' ELSE 'désactivé' END),
    v_avant, v_apres
  );

  RETURN jsonb_build_object('message',
    format('%s %s.', v_label, CASE WHEN p_active THEN 'activé' ELSE 'désactivé' END));
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_set_setting(TEXT, BOOLEAN, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_setting(TEXT, BOOLEAN, TEXT) TO authenticated;

-- ============================================================
-- 3) Les réglages et les administrateurs, pour la page
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_settings_view()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
DECLARE
  v JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  SELECT jsonb_build_object(
    'reglages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'cle', s.key, 'libelle', s.label, 'description', s.description,
        'actif', COALESCE((s.value ->> 'enabled')::BOOLEAN, TRUE),
        'message', s.value ->> 'message',
        'modifie_le', s.updated_at, 'modifie_par', p.full_name
      ) ORDER BY s.key)
      FROM admin_settings s LEFT JOIN profiles p ON p.id = s.updated_by
    ), '[]'::jsonb),
    'administrateurs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', a.profile_id, 'nom', p.full_name, 'email', a.email,
        'super', a.is_super, 'note', a.note,
        'nomme_le', a.granted_at, 'nomme_par', g.full_name,
        'revoque_le', a.revoked_at
      ) ORDER BY a.is_super DESC, a.granted_at)
      FROM platform_admins a
      LEFT JOIN profiles p ON p.id = a.profile_id
      LEFT JOIN profiles g ON g.id = a.granted_by
    ), '[]'::jsonb),
    'je_suis_super', public.is_super_admin()
  ) INTO v;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_settings_view() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_settings_view() TO authenticated;

-- ============================================================
-- 4) Le journal, cherchable
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_journal(
  p_search TEXT DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_du     DATE DEFAULT NULL,
  p_au     DATE DEFAULT NULL,
  p_limit  INT  DEFAULT 50,
  p_offset INT  DEFAULT 0
)
RETURNS TABLE (
  id          UUID,
  action      TEXT,
  resume      TEXT,
  admin_email TEXT,
  admin_nom   TEXT,
  cible_type  TEXT,
  cible_id    TEXT,
  avant       JSONB,
  apres       JSONB,
  ip          TEXT,
  au_moment   TIMESTAMPTZ,
  total       BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
DECLARE
  v_du DATE := COALESCE(p_du, '1970-01-01'::DATE);
  v_au DATE := COALESCE(p_au, CURRENT_DATE);
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  RETURN QUERY
  WITH filtre AS (
    SELECT a.id, a.action, a.summary AS resume, a.admin_email, p.full_name AS admin_nom,
           a.target_type AS cible_type, a.target_id AS cible_id,
           a.before_state AS avant, a.after_state AS apres, a.ip, a.at AS au_moment
    FROM admin_actions a
    LEFT JOIN profiles p ON p.id = a.admin_id
    WHERE a.at >= v_du AND a.at < (v_au + 1)::TIMESTAMPTZ
      AND (p_action IS NULL OR p_action = '' OR a.action LIKE p_action || '%')
      AND (
        p_search IS NULL OR p_search = ''
        OR a.summary     ILIKE '%' || p_search || '%'
        OR a.admin_email ILIKE '%' || p_search || '%'
        OR a.action      ILIKE '%' || p_search || '%'
        OR a.target_id   = p_search
      )
  )
  SELECT f.*, COUNT(*) OVER () AS total
  FROM filtre f
  ORDER BY f.au_moment DESC
  LIMIT GREATEST(1, LEAST(p_limit, 200))
  OFFSET GREATEST(0, p_offset);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_journal(TEXT, TEXT, DATE, DATE, INT, INT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_journal(TEXT, TEXT, DATE, DATE, INT, INT) TO authenticated;

-- ============================================================
-- 5) L'interrupteur des rappels coupe vraiment les rappels
-- ============================================================
-- « Rappels WhatsApp : désactivés » doit vouloir dire qu'aucun rappel ne part.
-- On ne touche pas au corps des fonctions d'envoi — elles sont longues et
-- éprouvées — mais à la commande des tâches qui les déclenchent : la condition
-- est évaluée AVANT l'appel, donc rien ne s'exécute quand l'interrupteur est
-- fermé. Le garde-fou reste lisible depuis la page « Base & sécurité », qui
-- affiche la commande de chaque tâche.
DO $do$
DECLARE
  j RECORD;
BEGIN
  FOR j IN SELECT jobid, jobname FROM cron.job
           WHERE jobname IN ('lw_rent_reminders', 'lw_escalating_reminders')
  LOOP
    PERFORM cron.alter_job(
      j.jobid,
      command => format(
        'SELECT public.%I() WHERE public.reglage_actif(''whatsapp_reminders'');',
        CASE j.jobname
          WHEN 'lw_rent_reminders' THEN 'run_rent_reminders'
          ELSE 'run_escalating_reminders'
        END)
    );
  END LOOP;
END
$do$;
