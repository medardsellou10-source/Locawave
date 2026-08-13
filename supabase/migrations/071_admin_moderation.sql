-- Migration 071 — Espace admin, étape 5 : annonces, prestataires, identités, avis.
--
-- Quatre files d'attente réunies en une page, et quatre décisions. Ce sont les
-- gestes qui engagent la confiance : un prestataire vérifié est affiché comme
-- tel aux clients, une annonce publiée est visible du public.
--
-- Les décisions écrivent dans admin_actions (la console) ET dans audit_log (le
-- module Confiance, que le reste de l'application lit déjà).

-- ============================================================
-- 1) Un avis se masque, il ne se supprime pas
-- ============================================================
-- Supprimer l'avis d'un client effacerait sa parole sans trace. On le masque :
-- il disparaît du public, reste lisible en console, et le motif est conservé.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden_at     TIMESTAMPTZ;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden_by     UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (hidden_at IS NULL OR public.is_admin());

-- ============================================================
-- 2) admin_moderation — les quatre files
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_moderation()
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
    'kyc', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', k.id, 'profil_id', k.profile_id, 'nom', p.full_name, 'role', p.role,
        'type', k.doc_type, 'chemin', k.doc_url, 'depose_le', k.created_at
      ) ORDER BY k.created_at)
      FROM kyc_documents k JOIN profiles p ON p.id = k.profile_id
      WHERE k.status = 'pending'
    ), '[]'::jsonb),

    'prestataires', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', pp.id,
        'nom', COALESCE(pp.display_name, p.full_name),
        'metiers', pp.trades,
        'ville', pp.city,
        'quartier', pp.quartier,
        'verifie', pp.is_verified,
        'kyc', p.kyc_status,
        'missions', pp.jobs_done,
        'note', pp.trust_score,
        'cree_le', pp.created_at
      ) ORDER BY pp.is_verified, pp.created_at)
      FROM provider_profiles pp JOIN profiles p ON p.id = pp.id
    ), '[]'::jsonb),

    'annonces', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', l.id, 'titre', l.title, 'statut', l.status, 'verifiee', l.is_verified,
        'loyer', l.rent_fcfa, 'ville', l.city, 'quartier', l.quartier,
        'photos', COALESCE(array_length(l.photos, 1), 0),
        'publiee_le', l.published_at, 'creee_le', l.created_at,
        'depubliee_par', l.depublished_by, 'depubliee_le', l.depublished_at,
        'bien_rattache', l.property_id IS NOT NULL,
        'org', o.name, 'org_id', o.id,
        'proprietaire', pr.full_name,
        'proprietaire_kyc', pr.kyc_status,
        'candidatures', (SELECT COUNT(*) FROM applications a WHERE a.listing_id = l.id)
      ) ORDER BY l.created_at DESC)
      FROM listings l
      LEFT JOIN organizations o ON o.id = l.org_id
      LEFT JOIN profiles pr ON pr.id = l.owner_id
    ), '[]'::jsonb),

    'avis', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id, 'note', r.rating, 'commentaire', r.comment, 'le', r.created_at,
        'prestataire', COALESCE(pp.display_name, 'Prestataire'),
        'prestataire_id', r.provider_id,
        'client', cp.full_name,
        'masque', r.hidden_at IS NOT NULL,
        'motif_masquage', r.hidden_reason
      ) ORDER BY r.created_at DESC)
      FROM (SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50) r
      LEFT JOIN provider_profiles pp ON pp.id = r.provider_id
      LEFT JOIN profiles cp ON cp.id = r.client_id
    ), '[]'::jsonb),

    'compteurs', jsonb_build_object(
      'kyc_attente',          (SELECT COUNT(*) FROM kyc_documents WHERE status = 'pending'),
      'prestataires_attente', (SELECT COUNT(*) FROM provider_profiles WHERE NOT is_verified),
      'annonces_publiees',    (SELECT COUNT(*) FROM listings WHERE status = 'published'),
      'avis_masques',         (SELECT COUNT(*) FROM reviews WHERE hidden_at IS NOT NULL)
    )
  ) INTO v;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_moderation() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_moderation() TO authenticated;

-- ============================================================
-- 3) Décider d'une pièce d'identité
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_decide_kyc(
  p_id      UUID,
  p_valider BOOLEAN,
  p_note    TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_profil UUID;
  v_nom    TEXT;
  v_avant  TEXT;
  v_statut TEXT := CASE WHEN p_valider THEN 'verified' ELSE 'rejected' END;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  -- Un refus sans motif n'apprend rien à celui qui l'a subi.
  IF NOT p_valider AND (p_note IS NULL OR btrim(p_note) = '') THEN
    RAISE EXCEPTION 'Un refus demande un motif.';
  END IF;

  SELECT k.profile_id, k.status, p.full_name INTO v_profil, v_avant, v_nom
  FROM kyc_documents k JOIN profiles p ON p.id = k.profile_id
  WHERE k.id = p_id;

  IF v_profil IS NULL THEN
    RAISE EXCEPTION 'Pièce introuvable';
  END IF;

  -- Le trigger sync_kyc_status répercute la décision sur profiles.kyc_status.
  UPDATE kyc_documents
  SET status = v_statut, note = p_note, reviewed_by = auth.uid(), reviewed_at = NOW()
  WHERE id = p_id;

  INSERT INTO audit_log (entity, entity_id, action, actor_id, payload)
  VALUES ('kyc_documents', p_id, v_statut, auth.uid(),
          jsonb_build_object('profile_id', v_profil, 'note', p_note));

  PERFORM public.admin_log_action(
    CASE WHEN p_valider THEN 'kyc.validee' ELSE 'kyc.refusee' END,
    'profile', v_profil::TEXT,
    format('Pièce d''identité de %s %s%s', v_nom,
           CASE WHEN p_valider THEN 'validée' ELSE 'refusée' END,
           COALESCE(' — ' || p_note, '')),
    jsonb_build_object('statut', v_avant),
    jsonb_build_object('statut', v_statut)
  );

  RETURN jsonb_build_object('message',
    CASE WHEN p_valider
      THEN format('Identité de %s vérifiée.', v_nom)
      ELSE format('Pièce de %s refusée. Le motif lui est visible.', v_nom)
    END);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_decide_kyc(UUID, BOOLEAN, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_decide_kyc(UUID, BOOLEAN, TEXT) TO authenticated;

-- ============================================================
-- 4) Vérifier un prestataire
-- ============================================================
-- Règle produit : un prestataire affiché doit être vérifié. On refuse donc de
-- le marquer vérifié tant que son identité ne l'est pas — sinon le badge
-- promettrait au client quelque chose que personne n'a contrôlé.
CREATE OR REPLACE FUNCTION public.admin_set_provider_verified(
  p_id      UUID,
  p_verifie BOOLEAN,
  p_motif   TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_nom   TEXT;
  v_avant BOOLEAN;
  v_kyc   TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  SELECT COALESCE(pp.display_name, p.full_name), pp.is_verified, p.kyc_status
  INTO v_nom, v_avant, v_kyc
  FROM provider_profiles pp JOIN profiles p ON p.id = pp.id
  WHERE pp.id = p_id;

  IF v_nom IS NULL THEN
    RAISE EXCEPTION 'Prestataire introuvable';
  END IF;

  IF p_verifie AND v_kyc <> 'verified' THEN
    RAISE EXCEPTION 'Identité non vérifiée : validez d''abord sa pièce d''identité.';
  END IF;

  UPDATE provider_profiles SET is_verified = p_verifie, updated_at = NOW() WHERE id = p_id;

  INSERT INTO audit_log (entity, entity_id, action, actor_id, payload)
  VALUES ('provider_profiles', p_id,
          CASE WHEN p_verifie THEN 'verified' ELSE 'unverified' END,
          auth.uid(), jsonb_build_object('motif', p_motif));

  PERFORM public.admin_log_action(
    CASE WHEN p_verifie THEN 'prestataire.verifie' ELSE 'prestataire.deverifie' END,
    'provider', p_id::TEXT,
    format('%s %s%s', v_nom,
           CASE WHEN p_verifie THEN 'vérifié' ELSE 'retiré des prestataires vérifiés' END,
           COALESCE(' — ' || p_motif, '')),
    jsonb_build_object('verifie', v_avant),
    jsonb_build_object('verifie', p_verifie)
  );

  RETURN jsonb_build_object('message',
    CASE WHEN p_verifie
      THEN format('%s est vérifié : il apparaît désormais dans l''annuaire public.', v_nom)
      ELSE format('%s n''apparaît plus dans l''annuaire public.', v_nom)
    END);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_set_provider_verified(UUID, BOOLEAN, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_provider_verified(UUID, BOOLEAN, TEXT) TO authenticated;

-- ============================================================
-- 5) Dépublier / republier une annonce
-- ============================================================
-- listings.depublished_by n'acceptait que 'system' et 'owner'. Une dépublication
-- décidée en console est une troisième cause, et il faut pouvoir la distinguer :
-- l'annonce n'a pas été retirée par son propriétaire ni par une règle
-- automatique, mais par une décision humaine, qui a un motif et un auteur.
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_depublished_by_check;
ALTER TABLE listings ADD CONSTRAINT listings_depublished_by_check
  CHECK (depublished_by IS NULL OR depublished_by IN ('system', 'owner', 'admin'));

CREATE OR REPLACE FUNCTION public.admin_set_listing_published(
  p_id     UUID,
  p_publier BOOLEAN,
  p_motif  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_titre TEXT;
  v_avant TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  -- Retirer l'annonce de quelqu'un sans dire pourquoi, ce n'est pas modérer.
  IF NOT p_publier AND (p_motif IS NULL OR btrim(p_motif) = '') THEN
    RAISE EXCEPTION 'Une dépublication demande un motif.';
  END IF;

  SELECT title, status INTO v_titre, v_avant FROM listings WHERE id = p_id;
  IF v_titre IS NULL THEN
    RAISE EXCEPTION 'Annonce introuvable';
  END IF;

  IF p_publier THEN
    UPDATE listings
    SET status = 'published', published_at = COALESCE(published_at, NOW()),
        depublished_by = NULL, depublished_at = NULL, updated_at = NOW()
    WHERE id = p_id;
  ELSE
    UPDATE listings
    SET status = 'draft', depublished_by = 'admin', depublished_at = NOW(), updated_at = NOW()
    WHERE id = p_id;
  END IF;

  PERFORM public.admin_log_action(
    CASE WHEN p_publier THEN 'annonce.republiee' ELSE 'annonce.depubliee' END,
    'listing', p_id::TEXT,
    format('« %s » %s%s', v_titre,
           CASE WHEN p_publier THEN 'republiée' ELSE 'dépubliée' END,
           COALESCE(' — ' || p_motif, '')),
    jsonb_build_object('statut', v_avant),
    jsonb_build_object('statut', CASE WHEN p_publier THEN 'published' ELSE 'draft' END)
  );

  RETURN jsonb_build_object('message',
    CASE WHEN p_publier
      THEN format('« %s » est de nouveau visible du public.', v_titre)
      ELSE format('« %s » n''est plus visible du public.', v_titre)
    END);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_set_listing_published(UUID, BOOLEAN, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_listing_published(UUID, BOOLEAN, TEXT) TO authenticated;

-- ============================================================
-- 6) Masquer / rétablir un avis
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_set_review_hidden(
  p_id     UUID,
  p_masquer BOOLEAN,
  p_motif  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_note INT;
  v_presta TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  IF p_masquer AND (p_motif IS NULL OR btrim(p_motif) = '') THEN
    RAISE EXCEPTION 'Masquer un avis demande un motif.';
  END IF;

  SELECT r.rating, COALESCE(pp.display_name, 'Prestataire') INTO v_note, v_presta
  FROM reviews r LEFT JOIN provider_profiles pp ON pp.id = r.provider_id
  WHERE r.id = p_id;

  IF v_note IS NULL THEN
    RAISE EXCEPTION 'Avis introuvable';
  END IF;

  UPDATE reviews
  SET hidden_at = CASE WHEN p_masquer THEN NOW() ELSE NULL END,
      hidden_by = CASE WHEN p_masquer THEN auth.uid() ELSE NULL END,
      hidden_reason = CASE WHEN p_masquer THEN p_motif ELSE NULL END
  WHERE id = p_id;

  PERFORM public.admin_log_action(
    CASE WHEN p_masquer THEN 'avis.masque' ELSE 'avis.retabli' END,
    'review', p_id::TEXT,
    format('Avis %s/5 sur %s %s%s', v_note, v_presta,
           CASE WHEN p_masquer THEN 'masqué' ELSE 'rétabli' END,
           COALESCE(' — ' || p_motif, '')),
    jsonb_build_object('masque', NOT p_masquer),
    jsonb_build_object('masque', p_masquer)
  );

  RETURN jsonb_build_object('message',
    CASE WHEN p_masquer
      THEN 'Avis masqué. Il reste lisible ici, avec son motif.'
      ELSE 'Avis rétabli.'
    END);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_set_review_hidden(UUID, BOOLEAN, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_review_hidden(UUID, BOOLEAN, TEXT) TO authenticated;
