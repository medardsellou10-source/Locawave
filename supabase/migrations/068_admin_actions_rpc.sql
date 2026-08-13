-- Migration 068 — Espace admin : les écritures passent par la base, pas par une clé.
--
-- Première version : les actions admin passaient par service_role côté serveur.
-- Deux raisons d'en sortir :
--   * ça fait dépendre toute la console d'un secret d'environnement — absent,
--     la console échoue avec un message incompréhensible ;
--   * la garde vivait dans le code Next, donc loin de la donnée qu'elle protège.
--
-- Ici, chaque action est une fonction SECURITY DEFINER qui revérifie elle-même
-- les droits et journalise. Le route handler n'est plus qu'un passe-plat, et
-- même appelée autrement, la fonction tient ses garde-fous.
--
-- Garde-fous communs : jamais sur son propre compte, jamais sur un compte
-- administrateur sauf si l'on est super-admin, jamais sur un super-admin.

-- ============================================================
-- Journal : écrire dans admin_actions sans service_role
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_log_action(
  p_action      TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id   TEXT DEFAULT NULL,
  p_summary     TEXT DEFAULT NULL,
  p_before      JSONB DEFAULT NULL,
  p_after       JSONB DEFAULT NULL,
  p_ip          TEXT DEFAULT NULL,
  p_user_agent  TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  -- PostgREST expose les en-têtes de la requête à la base : une action déclenchée
  -- depuis une fonction SQL sait donc d'où elle vient, sans que l'appelant ait à
  -- le lui dire.
  p_ip := COALESCE(p_ip,
    split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1));
  p_user_agent := COALESCE(p_user_agent,
    current_setting('request.headers', true)::json ->> 'user-agent');

  INSERT INTO admin_actions (
    admin_id, admin_email, action, target_type, target_id,
    summary, before_state, after_state, ip, user_agent
  )
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    p_action, p_target_type, p_target_id,
    p_summary, p_before, p_after, p_ip, p_user_agent
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_log_action(TEXT,TEXT,TEXT,TEXT,JSONB,JSONB,TEXT,TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_log_action(TEXT,TEXT,TEXT,TEXT,JSONB,JSONB,TEXT,TEXT) TO authenticated;

-- ============================================================
-- Garde partagée : ai-je le droit de toucher à ce compte ?
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_assert_can_target(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_cible_admin  BOOLEAN;
  v_cible_super  BOOLEAN;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_id = auth.uid() THEN
    RAISE EXCEPTION 'Impossible d''agir sur son propre compte depuis la console.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_id) THEN
    RAISE EXCEPTION 'Compte introuvable';
  END IF;

  SELECT EXISTS (SELECT 1 FROM platform_admins WHERE profile_id = p_id AND revoked_at IS NULL),
         EXISTS (SELECT 1 FROM platform_admins WHERE profile_id = p_id AND revoked_at IS NULL AND is_super)
    INTO v_cible_admin, v_cible_super;

  IF v_cible_super THEN
    RAISE EXCEPTION 'Un compte super-admin ne se modifie pas depuis la console.';
  END IF;

  IF v_cible_admin AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Ce compte est administrateur : action réservée au super-admin.';
  END IF;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_assert_can_target(UUID) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_assert_can_target(UUID) TO authenticated;

-- ============================================================
-- Changer le rôle d'un compte
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_set_account_role(p_id UUID, p_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_avant TEXT;
  v_nom   TEXT;
BEGIN
  PERFORM public.admin_assert_can_target(p_id);

  -- 'admin' n'est pas un rôle de profil : l'accès console vit dans platform_admins.
  IF p_role NOT IN ('owner','tenant','provider','seeker') THEN
    RAISE EXCEPTION 'Rôle inconnu : %', p_role;
  END IF;

  SELECT role, full_name INTO v_avant, v_nom FROM profiles WHERE id = p_id;

  IF v_avant = p_role THEN
    RETURN jsonb_build_object('message', 'Ce rôle est déjà celui du compte.');
  END IF;

  UPDATE profiles SET role = p_role, updated_at = NOW() WHERE id = p_id;

  PERFORM public.admin_log_action(
    'compte.role_modifie', 'profile', p_id::TEXT,
    format('Rôle de %s : %s → %s', v_nom, v_avant, p_role),
    jsonb_build_object('role', v_avant),
    jsonb_build_object('role', p_role)
  );

  RETURN jsonb_build_object(
    'message',
    format('%s est désormais « %s ». Le changement d''espace prendra effet à sa prochaine connexion.', v_nom, p_role)
  );
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_set_account_role(UUID, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_account_role(UUID, TEXT) TO authenticated;

-- ============================================================
-- Suspendre / réactiver un compte
-- ============================================================
-- Supabase Auth refuse la connexion et le rafraîchissement de jeton tant que
-- banned_until est dans le futur. On coupe aussi les sessions ouvertes, sinon le
-- compte reste actif jusqu'à l'expiration de son jeton — « suspendu » doit
-- vouloir dire suspendu tout de suite.
CREATE OR REPLACE FUNCTION public.admin_set_account_suspension(p_id UUID, p_suspendre BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_nom TEXT;
BEGIN
  PERFORM public.admin_assert_can_target(p_id);
  SELECT full_name INTO v_nom FROM profiles WHERE id = p_id;

  IF p_suspendre THEN
    UPDATE auth.users SET banned_until = NOW() + INTERVAL '100 years' WHERE id = p_id;
    DELETE FROM auth.sessions WHERE user_id = p_id;
  ELSE
    UPDATE auth.users SET banned_until = NULL WHERE id = p_id;
  END IF;

  PERFORM public.admin_log_action(
    CASE WHEN p_suspendre THEN 'compte.suspendu' ELSE 'compte.reactive' END,
    'profile', p_id::TEXT,
    format('Compte de %s %s', v_nom, CASE WHEN p_suspendre THEN 'suspendu' ELSE 'réactivé' END),
    jsonb_build_object('suspendu', NOT p_suspendre),
    jsonb_build_object('suspendu', p_suspendre)
  );

  RETURN jsonb_build_object(
    'message',
    CASE WHEN p_suspendre
      THEN format('%s est déconnecté et ne peut plus se connecter. Rien n''a été supprimé.', v_nom)
      ELSE format('%s peut de nouveau se connecter.', v_nom)
    END
  );
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_set_account_suspension(UUID, BOOLEAN) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_account_suspension(UUID, BOOLEAN) TO authenticated;

-- ============================================================
-- Nommer / révoquer un administrateur (super-admin seulement)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_set_platform_admin(p_id UUID, p_accorder BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_nom   TEXT;
  v_avant BOOLEAN;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Seul un super-admin nomme ou révoque un administrateur.';
  END IF;

  PERFORM public.admin_assert_can_target(p_id);

  SELECT full_name INTO v_nom FROM profiles WHERE id = p_id;
  v_avant := EXISTS (SELECT 1 FROM platform_admins WHERE profile_id = p_id AND revoked_at IS NULL);

  IF p_accorder THEN
    INSERT INTO platform_admins (profile_id, email, is_super, granted_by, granted_at, revoked_at)
    VALUES (p_id, (SELECT email FROM auth.users WHERE id = p_id), FALSE, auth.uid(), NOW(), NULL)
    ON CONFLICT (profile_id) DO UPDATE
      SET revoked_at = NULL, granted_by = auth.uid(), granted_at = NOW();
  ELSE
    UPDATE platform_admins SET revoked_at = NOW() WHERE profile_id = p_id;
  END IF;

  PERFORM public.admin_log_action(
    CASE WHEN p_accorder THEN 'admin.nomme' ELSE 'admin.revoque' END,
    'profile', p_id::TEXT,
    format('%s %s', v_nom,
      CASE WHEN p_accorder THEN 'devient administrateur de la plateforme'
           ELSE 'n''est plus administrateur' END),
    jsonb_build_object('est_admin', v_avant),
    jsonb_build_object('est_admin', p_accorder)
  );

  RETURN jsonb_build_object(
    'message',
    CASE WHEN p_accorder
      THEN format('%s a maintenant accès à la console.', v_nom)
      ELSE format('%s n''a plus accès à la console.', v_nom)
    END
  );
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_set_platform_admin(UUID, BOOLEAN) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_platform_admin(UUID, BOOLEAN) TO authenticated;
