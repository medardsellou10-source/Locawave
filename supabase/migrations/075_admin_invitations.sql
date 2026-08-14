-- Migration 075 — L'accès à la console ne s'obtient que par invitation.
--
-- Jusqu'ici, nommer un administrateur supposait d'ouvrir la fiche d'un compte
-- qui existait déjà. Pour inviter quelqu'un d'extérieur, il fallait passer par
-- la base. Cette migration donne le geste manquant : le fondateur crée une
-- invitation, la transmet par le canal de son choix, et elle vaut accès — une
-- fois, pour une seule personne, et pas au-delà de sa date.
--
-- Ce qui est stocké : l'EMPREINTE du jeton, jamais le jeton. Une fuite de la
-- base ne donne donc aucune invitation utilisable. Le jeton clair n'existe qu'une
-- fois, dans la réponse à sa création — s'il est perdu, on en refait un.

CREATE TABLE IF NOT EXISTS admin_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  TEXT NOT NULL UNIQUE,
  -- Facultatif. Posé, il verrouille l'invitation sur une adresse : même
  -- interceptée, elle ne servira à personne d'autre.
  email       TEXT,
  note        TEXT,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  used_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  revoked_at  TIMESTAMPTZ,
  revoked_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);
ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_admin_invit_hash ON admin_invitations(token_hash);

-- Lecture réservée aux administrateurs. Aucune policy d'écriture : tout passe
-- par les fonctions ci-dessous, qui vérifient elles-mêmes les droits.
DROP POLICY IF EXISTS "admin_invitations_select" ON admin_invitations;
CREATE POLICY "admin_invitations_select" ON admin_invitations
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- Créer une invitation
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_create_invitation(
  p_email  TEXT DEFAULT NULL,
  p_heures INT  DEFAULT 48,
  p_note   TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $fn$
DECLARE
  v_token TEXT;
  v_id    UUID;
  v_exp   TIMESTAMPTZ;
BEGIN
  -- Donner l'accès à toute la plateforme est le geste le plus lourd de la
  -- console : il reste au seul super-admin.
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Seul un super-admin peut inviter un administrateur.';
  END IF;
  IF p_heures < 1 OR p_heures > 720 THEN
    RAISE EXCEPTION 'Durée de validité hors limites (1 heure à 30 jours).';
  END IF;

  -- 32 octets tirés au hasard : deviner ce jeton n'est pas une stratégie.
  v_token := encode(gen_random_bytes(32), 'hex');
  v_exp   := NOW() + (p_heures || ' hours')::INTERVAL;

  INSERT INTO admin_invitations (token_hash, email, note, created_by, expires_at)
  VALUES (encode(sha256(v_token::BYTEA), 'hex'),
          NULLIF(btrim(lower(p_email)), ''), p_note, auth.uid(), v_exp)
  RETURNING id INTO v_id;

  PERFORM public.admin_log_action(
    'invitation.creee', 'invitation', v_id::TEXT,
    format('Invitation d''administrateur créée%s, valable %s h',
           COALESCE(' pour ' || p_email, ''), p_heures),
    NULL,
    jsonb_build_object('email', p_email, 'expire_le', v_exp)
  );

  -- Le jeton clair ne repassera jamais par ici.
  RETURN jsonb_build_object(
    'id', v_id,
    'jeton', v_token,
    'expire_le', v_exp,
    'email', p_email
  );
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_create_invitation(TEXT, INT, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_invitation(TEXT, INT, TEXT) TO authenticated;

-- ============================================================
-- Révoquer une invitation
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_revoke_invitation(p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_utilisee TIMESTAMPTZ;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Seul un super-admin peut révoquer une invitation.';
  END IF;

  SELECT used_at INTO v_utilisee FROM admin_invitations WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation introuvable';
  END IF;
  -- Révoquer une invitation déjà consommée ne retirerait rien : l'accès existe
  -- désormais dans platform_admins, c'est là qu'il faut aller le reprendre.
  IF v_utilisee IS NOT NULL THEN
    RAISE EXCEPTION 'Invitation déjà utilisée : retirez l''accès depuis la fiche du compte.';
  END IF;

  UPDATE admin_invitations
  SET revoked_at = NOW(), revoked_by = auth.uid()
  WHERE id = p_id AND revoked_at IS NULL;

  PERFORM public.admin_log_action(
    'invitation.revoquee', 'invitation', p_id::TEXT,
    'Invitation d''administrateur révoquée avant usage'
  );

  RETURN jsonb_build_object('message', 'Invitation révoquée. Le lien ne vaut plus rien.');
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_invitation(UUID) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_revoke_invitation(UUID) TO authenticated;

-- ============================================================
-- Accepter une invitation
-- ============================================================
-- Appelée par la personne invitée, une fois connectée à SON compte : c'est ce
-- qui garantit qu'on sait exactement à qui l'accès est donné.
CREATE OR REPLACE FUNCTION public.admin_accept_invitation(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_inv    admin_invitations%ROWTYPE;
  v_email  TEXT;
  v_nom    TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Connectez-vous d''abord à votre compte.';
  END IF;
  IF p_token IS NULL OR btrim(p_token) = '' THEN
    RAISE EXCEPTION 'Lien d''invitation incomplet.';
  END IF;

  SELECT * INTO v_inv FROM admin_invitations
  WHERE token_hash = encode(sha256(btrim(p_token)::BYTEA), 'hex');

  -- Un seul message pour « inconnue », « expirée », « déjà servie » et
  -- « révoquée » : détailler renseignerait qui cherche à deviner.
  IF NOT FOUND
     OR v_inv.revoked_at IS NOT NULL
     OR v_inv.used_at IS NOT NULL
     OR v_inv.expires_at < NOW() THEN
    RAISE EXCEPTION 'Cette invitation n''est pas valable.';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  IF v_inv.email IS NOT NULL AND lower(COALESCE(v_email, '')) <> v_inv.email THEN
    RAISE EXCEPTION 'Cette invitation est réservée à une autre adresse email.';
  END IF;

  SELECT full_name INTO v_nom FROM profiles WHERE id = auth.uid();

  INSERT INTO platform_admins (profile_id, email, is_super, note, granted_by, granted_at, revoked_at)
  VALUES (auth.uid(), v_email, FALSE,
          COALESCE(v_inv.note, 'Entré par invitation'),
          v_inv.created_by, NOW(), NULL)
  ON CONFLICT (profile_id) DO UPDATE
    SET revoked_at = NULL, granted_at = NOW(), granted_by = EXCLUDED.granted_by;

  UPDATE admin_invitations
  SET used_at = NOW(), used_by = auth.uid()
  WHERE id = v_inv.id;

  -- Journalisé après coup : l'appelant est administrateur depuis la ligne
  -- précédente, admin_log_action l'accepte donc.
  PERFORM public.admin_log_action(
    'invitation.acceptee', 'profile', auth.uid()::TEXT,
    format('%s (%s) est entré dans la console par invitation', COALESCE(v_nom, '?'), COALESCE(v_email, '?')),
    jsonb_build_object('invitation', v_inv.id),
    jsonb_build_object('est_admin', TRUE)
  );

  RETURN jsonb_build_object(
    'message', 'Accès accordé. Bienvenue dans la console.',
    'nom', v_nom
  );
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_accept_invitation(TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_accept_invitation(TEXT) TO authenticated;

-- ============================================================
-- Lister les invitations
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_invitations_list()
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

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', i.id,
    'email', i.email,
    'note', i.note,
    'creee_le', i.created_at,
    'creee_par', c.full_name,
    'expire_le', i.expires_at,
    'utilisee_le', i.used_at,
    'utilisee_par', u.full_name,
    'revoquee_le', i.revoked_at,
    'etat', CASE
      WHEN i.used_at IS NOT NULL    THEN 'utilisee'
      WHEN i.revoked_at IS NOT NULL THEN 'revoquee'
      WHEN i.expires_at < NOW()     THEN 'expiree'
      ELSE 'en_attente'
    END
  ) ORDER BY i.created_at DESC), '[]'::jsonb)
  INTO v
  FROM admin_invitations i
  LEFT JOIN profiles c ON c.id = i.created_by
  LEFT JOIN profiles u ON u.id = i.used_by;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_invitations_list() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_invitations_list() TO authenticated;
