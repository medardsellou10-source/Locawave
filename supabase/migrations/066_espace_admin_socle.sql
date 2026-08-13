-- Migration 066 — Espace admin : le socle.
--
-- Objectif : une console d'administration de la plateforme, visible du seul
-- compte fondateur, invisible (404) pour tous les autres.
--
-- Cette migration apporte quatre choses :
--   1. platform_admins — la liste courte des comptes autorisés à entrer.
--   2. La fermeture de deux escalades de privilèges bien réelles : aujourd'hui
--      n'importe quel compte connecté peut se donner role='admin' et se marquer
--      kyc_status='verified' sur sa propre ligne profiles.
--   3. admin_actions — le journal de tout ce qui est fait depuis l'espace admin.
--   4. admin_settings — les réglages globaux (interrupteurs de la plateforme).
--
-- Modèle d'accès retenu :
--   * LECTURES  : fonctions SECURITY DEFINER gardées par is_admin(), appelées
--                 avec la session de l'admin (aucune clé service_role en jeu).
--   * ÉCRITURES : route handlers serveur, après requireAdmin(), via service_role,
--                 et systématiquement tracées dans admin_actions.

-- ============================================================
-- 1) platform_admins — qui a le droit d'entrer
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_admins (
  profile_id  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email       TEXT,
  is_super    BOOLEAN NOT NULL DEFAULT FALSE,   -- super = peut nommer/révoquer un admin
  note        TEXT,
  granted_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at  TIMESTAMPTZ
);
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Un admin voit la liste ; un compte ordinaire ne voit rien (la requête renvoie
-- simplement zéro ligne, sans révéler l'existence de la table côté produit).
DROP POLICY IF EXISTS "platform_admins_select" ON platform_admins;
CREATE POLICY "platform_admins_select" ON platform_admins
  FOR SELECT USING (profile_id = auth.uid() OR public.is_admin());

-- Aucune policy INSERT/UPDATE/DELETE, volontairement : la liste ne se modifie
-- que par service_role (espace admin, super-admin) ou en SQL direct. Personne
-- ne peut donc s'auto-nommer administrateur via l'API.

-- ============================================================
-- 2) is_admin() ne dépend plus de profiles.role
-- ============================================================
-- Avant : is_admin() = (profiles.role = 'admin'), et profiles.role était
-- modifiable par le titulaire du compte → auto-promotion possible.
-- Après : l'appartenance à platform_admins fait seule autorité.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE profile_id = auth.uid() AND revoked_at IS NULL
  );
$fn$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE profile_id = auth.uid() AND revoked_at IS NULL AND is_super
  );
$fn$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- ============================================================
-- 3) Fermeture des escalades de privilèges sur profiles
-- ============================================================
-- La policy "profiles_update_own_or_admin" autorise chacun à modifier SA ligne,
-- toutes colonnes comprises — donc role et kyc_status. On ne touche pas à la
-- policy (elle reste utile pour les champs de profil), on retire le droit au
-- niveau colonne, ce que la RLS ne sait pas exprimer.
REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;

GRANT INSERT (id, full_name, phone, avatar_url, country, geo)
  ON public.profiles TO authenticated;
GRANT UPDATE (full_name, phone, avatar_url, country, geo, updated_at)
  ON public.profiles TO authenticated;

-- Les fonctions internes (handle_new_user, sync_kyc_status) sont SECURITY DEFINER
-- et appartiennent à postgres : elles continuent d'écrire role et kyc_status.
-- Le back-office admin passe par service_role, qui garde tous ses droits.

-- Deuxième porte : le rôle demandé à l'inscription arrive par user_metadata.
-- 'admin' y était accepté — une simple inscription API suffisait donc.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'owner');
BEGIN
  -- 'admin' n'est JAMAIS attribuable à l'inscription : il ne s'obtient que par
  -- ajout dans platform_admins.
  IF v_role NOT IN ('owner','tenant','provider','seeker') THEN
    v_role := 'owner';
  END IF;
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Utilisateur'),
    v_role,
    NEW.phone
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- ============================================================
-- 4) admin_actions — journal des actions de l'espace admin
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_actions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_email  TEXT,
  action       TEXT NOT NULL,          -- ex. 'compte.role_modifie', 'org.essai_prolonge'
  target_type  TEXT,                   -- profile | organization | listing | payment | …
  target_id    TEXT,
  summary      TEXT,                   -- phrase lisible, en français
  before_state JSONB,
  after_state  JSONB,
  ip           TEXT,
  user_agent   TEXT,
  -- clock_timestamp() et non NOW() : NOW() renvoie l'heure de début de
  -- transaction, donc deux actions d'une même transaction porteraient la même
  -- heure et ne s'ordonneraient plus. Un journal doit dater l'événement.
  at           TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_admin_actions_at ON admin_actions(at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);

-- Lecture admin seule ; écriture par service_role uniquement (aucune policy
-- INSERT) ; ni UPDATE ni DELETE : le journal est en ajout seul.
DROP POLICY IF EXISTS "admin_actions_select_admin" ON admin_actions;
CREATE POLICY "admin_actions_select_admin" ON admin_actions
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- 5) admin_settings — réglages globaux de la plateforme
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL DEFAULT '{}'::jsonb,
  label       TEXT NOT NULL,
  description TEXT,
  updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_settings_select_admin" ON admin_settings;
CREATE POLICY "admin_settings_select_admin" ON admin_settings
  FOR SELECT USING (public.is_admin());

INSERT INTO admin_settings (key, value, label, description) VALUES
  ('maintenance_mode', '{"enabled": false, "message": ""}'::jsonb,
   'Mode maintenance', 'Coupe l''accès à l''application pour tout le monde sauf les administrateurs.'),
  ('signups_open', '{"enabled": true}'::jsonb,
   'Inscriptions ouvertes', 'Autorise la création de nouveaux comptes.'),
  ('listings_public', '{"enabled": true}'::jsonb,
   'Annonces publiques', 'Affiche la marketplace aux visiteurs non connectés.'),
  ('whatsapp_reminders', '{"enabled": true}'::jsonb,
   'Rappels WhatsApp', 'Envoi automatique des rappels de loyer.'),
  ('psp_enabled', '{"enabled": true}'::jsonb,
   'Paiement en ligne', 'Génération des liens de paiement Wave / Orange Money.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 6) admin_overview() — les chiffres de la plateforme, en un appel
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_overview()
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
    'comptes', jsonb_build_object(
      'total',        (SELECT COUNT(*) FROM profiles),
      'proprietaires',(SELECT COUNT(*) FROM profiles WHERE role = 'owner'),
      'locataires',   (SELECT COUNT(*) FROM profiles WHERE role = 'tenant'),
      'prestataires', (SELECT COUNT(*) FROM profiles WHERE role = 'provider'),
      'chercheurs',   (SELECT COUNT(*) FROM profiles WHERE role = 'seeker'),
      'nouveaux_30j', (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '30 days'),
      'actifs_7j',    (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '7 days')
    ),
    'organisations', jsonb_build_object(
      'total',          (SELECT COUNT(*) FROM organizations),
      'essai',          (SELECT COUNT(*) FROM organizations WHERE plan = 'trial'),
      'payantes',       (SELECT COUNT(*) FROM organizations WHERE plan <> 'trial'),
      'essai_expire',   (SELECT COUNT(*) FROM organizations
                          WHERE plan = 'trial' AND plan_expires_at IS NOT NULL AND plan_expires_at < NOW()),
      'essai_bientot',  (SELECT COUNT(*) FROM organizations
                          WHERE plan = 'trial' AND plan_expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'),
      'par_plan',       (SELECT COALESCE(jsonb_object_agg(plan, n), '{}'::jsonb)
                          FROM (SELECT plan, COUNT(*) n FROM organizations GROUP BY plan) t)
    ),
    'parc', jsonb_build_object(
      'biens',        (SELECT COUNT(*) FROM properties),
      'lots',         (SELECT COUNT(*) FROM units),
      'baux_actifs',  (SELECT COUNT(*) FROM leases WHERE status = 'active'),
      'annonces',     (SELECT COUNT(*) FROM listings WHERE status = 'published')
    ),
    'argent', jsonb_build_object(
      'encaisse_30j',   (SELECT COALESCE(SUM(amount_fcfa),0) FROM payments WHERE paid_at > NOW() - INTERVAL '30 days'),
      'encaisse_total', (SELECT COALESCE(SUM(amount_fcfa),0) FROM payments),
      'impayes_fcfa',   (SELECT COALESCE(SUM(amount_fcfa),0) FROM rent_schedules
                          WHERE status <> 'paid' AND due_date < CURRENT_DATE),
      'impayes_nb',     (SELECT COUNT(*) FROM rent_schedules WHERE status <> 'paid' AND due_date < CURRENT_DATE),
      'commissions',    (SELECT COALESCE(SUM(amount_fcfa),0) FROM commissions),
      'abo_encaisse',   (SELECT COALESCE(SUM(amount_fcfa),0) FROM subscription_payments WHERE status = 'paid')
    ),
    'confiance', jsonb_build_object(
      'kyc_attente',         (SELECT COUNT(*) FROM kyc_documents WHERE status = 'pending'),
      'prestataires_attente',(SELECT COUNT(*) FROM provider_profiles WHERE NOT is_verified),
      'litiges_ouverts',     (SELECT COUNT(*) FROM disputes WHERE status NOT IN ('resolved','closed')),
      'incidents_ouverts',   (SELECT COUNT(*) FROM incidents WHERE status <> 'resolved'),
      'candidatures',        (SELECT COUNT(*) FROM applications WHERE status = 'pending')
    ),
    'systeme', jsonb_build_object(
      -- On ne compte que NOS tables : celles installées par une extension
      -- (PostGIS et son spatial_ref_sys) ne nous appartiennent pas, et une
      -- alerte qui ne s'éteint jamais ne sert à rien.
      'tables',           (SELECT COUNT(*) FROM pg_class c
                            JOIN pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relkind = 'r'
                              AND NOT EXISTS (SELECT 1 FROM pg_depend d
                                              WHERE d.objid = c.oid AND d.deptype = 'e')),
      'tables_sans_rls',  (SELECT COUNT(*) FROM pg_class c
                            JOIN pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
                              AND NOT EXISTS (SELECT 1 FROM pg_depend d
                                              WHERE d.objid = c.oid AND d.deptype = 'e')),
      'admins',           (SELECT COUNT(*) FROM platform_admins WHERE revoked_at IS NULL),
      'actions_admin_7j', (SELECT COUNT(*) FROM admin_actions WHERE at > NOW() - INTERVAL '7 days'),
      'audit_7j',         (SELECT COUNT(*) FROM audit_log WHERE at > NOW() - INTERVAL '7 days'),
      'notifs_echec_7j',  (SELECT COUNT(*) FROM notifications
                            WHERE delivery_status = 'failed' AND created_at > NOW() - INTERVAL '7 days')
    ),
    'genere_le', NOW()
  ) INTO v;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_overview() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_overview() TO authenticated;

-- ============================================================
-- 7) Le compte fondateur
-- ============================================================
INSERT INTO platform_admins (profile_id, email, is_super, note)
SELECT u.id, u.email, TRUE, 'Compte fondateur — accès total'
FROM auth.users u
WHERE lower(u.email) = 'medardsellou10@gmail.com'
ON CONFLICT (profile_id) DO UPDATE
  SET is_super = TRUE, revoked_at = NULL, email = EXCLUDED.email;
