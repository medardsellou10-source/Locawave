-- Migration 073 — Espace admin, étape 7 : la salle des machines.
--
-- « Contrôler tout le code » : ce que la base sait d'elle-même, montré tel quel.
-- Tables et RLS, policies, fonctions à privilèges, extensions, buckets de
-- stockage, tâches planifiées et leurs derniers passages, migrations appliquées.
--
-- Lecture seule, sans exception. Une console qui laisserait exécuter du SQL
-- arbitraire ne serait plus une console d'administration mais une porte
-- dérobée : le jour où la session d'un admin fuite, elle donne la base entière.

CREATE OR REPLACE FUNCTION public.admin_system()
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
    -- ===== Tables : RLS activée ? combien de policies ? combien de lignes ? =====
    -- Une table sans RLS est ouverte à quiconque a la clé anon. Une table AVEC
    -- RLS mais SANS policy est l'inverse : verrouillée pour tout le monde.
    -- Les deux méritent d'être vues.
    'tables', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'nom', t.relname,
        'rls', t.relrowsecurity,
        'policies', (SELECT COUNT(*) FROM pg_policy po WHERE po.polrelid = t.oid),
        -- Comptage exact, et non reltuples : celui-ci vaut -1 tant que la table
        -- n'a pas été ANALYZE, ce qui afficherait « 0 ligne » sur des tables
        -- pleines. Une console qui ment sur les volumes ne sert à rien.
        'lignes', (xpath('/row/c/text()',
                    query_to_xml(format('SELECT COUNT(*) AS c FROM public.%I', t.relname),
                                 false, true, '')))[1]::TEXT::BIGINT,
        'taille', pg_size_pretty(pg_total_relation_size(t.oid)),
        'extension', EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = t.oid AND d.deptype = 'e')
      ) ORDER BY t.relname)
      FROM pg_class t JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public' AND t.relkind = 'r'
    ), '[]'::jsonb),

    -- ===== Fonctions SECURITY DEFINER =====
    -- Elles s'exécutent avec les droits de leur propriétaire : sans search_path
    -- figé, un schéma malveillant peut détourner ce qu'elles appellent.
    'fonctions_privilegiees', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'nom', p.proname,
        'search_path_fige', p.proconfig IS NOT NULL
          AND EXISTS (SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'),
        'executable_par_anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
        -- PostGIS installe ses propres fonctions à privilèges, sans search_path
        -- figé, et nous n'avons pas à les corriger. Les signaler comme les
        -- nôtres donnerait une alerte qu'on ne peut pas éteindre.
        'extension', EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
      ) ORDER BY p.proname)
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.prosecdef
    ), '[]'::jsonb),

    -- ===== Stockage =====
    'buckets', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'nom', b.id,
        'public', b.public,
        'fichiers', (SELECT COUNT(*) FROM storage.objects o WHERE o.bucket_id = b.id)
      ) ORDER BY b.id)
      FROM storage.buckets b
    ), '[]'::jsonb),

    -- ===== Tâches planifiées =====
    'cron', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'nom', j.jobname,
        'planification', j.schedule,
        'active', j.active,
        'commande', j.command,
        'dernier_passage', (
          SELECT jsonb_build_object('statut', r.status, 'le', r.start_time,
                                    'duree_s', EXTRACT(EPOCH FROM (r.end_time - r.start_time)),
                                    'message', r.return_message)
          FROM cron.job_run_details r
          WHERE r.jobid = j.jobid
          ORDER BY r.start_time DESC LIMIT 1
        ),
        'echecs_7j', (
          SELECT COUNT(*) FROM cron.job_run_details r
          WHERE r.jobid = j.jobid AND r.status <> 'succeeded'
            AND r.start_time > NOW() - INTERVAL '7 days'
        )
      ) ORDER BY j.jobname)
      FROM cron.job j
    ), '[]'::jsonb),

    -- ===== Migrations appliquées =====
    'migrations', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('version', m.version, 'nom', m.name)
             ORDER BY m.version DESC)
      FROM (SELECT version, name FROM supabase_migrations.schema_migrations
            ORDER BY version DESC LIMIT 30) m
    ), '[]'::jsonb),

    'extensions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('nom', e.extname, 'version', e.extversion,
                                          'schema', ne.nspname) ORDER BY e.extname)
      FROM pg_extension e JOIN pg_namespace ne ON ne.oid = e.extnamespace
    ), '[]'::jsonb),

    'compteurs', jsonb_build_object(
      'tables',            (SELECT COUNT(*) FROM pg_class t JOIN pg_namespace n ON n.oid = t.relnamespace
                             WHERE n.nspname = 'public' AND t.relkind = 'r'
                               AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = t.oid AND d.deptype = 'e')),
      'sans_rls',          (SELECT COUNT(*) FROM pg_class t JOIN pg_namespace n ON n.oid = t.relnamespace
                             WHERE n.nspname = 'public' AND t.relkind = 'r' AND NOT t.relrowsecurity
                               AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = t.oid AND d.deptype = 'e')),
      'rls_sans_policy',   (SELECT COUNT(*) FROM pg_class t JOIN pg_namespace n ON n.oid = t.relnamespace
                             WHERE n.nspname = 'public' AND t.relkind = 'r' AND t.relrowsecurity
                               AND NOT EXISTS (SELECT 1 FROM pg_policy po WHERE po.polrelid = t.oid)),
      'policies',          (SELECT COUNT(*) FROM pg_policy po JOIN pg_class c ON c.oid = po.polrelid
                             JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public'),
      'definer_sans_path', (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                             WHERE n.nspname = 'public' AND p.prosecdef
                               AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
                               AND NOT (p.proconfig IS NOT NULL
                                        AND EXISTS (SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'))),
      'buckets_publics',   (SELECT COUNT(*) FROM storage.buckets WHERE public),
      'cron_actives',      (SELECT COUNT(*) FROM cron.job WHERE active),
      'cron_en_echec_7j',  (SELECT COUNT(DISTINCT r.jobid) FROM cron.job_run_details r
                             WHERE r.status <> 'succeeded' AND r.start_time > NOW() - INTERVAL '7 days'),
      'migrations',        (SELECT COUNT(*) FROM supabase_migrations.schema_migrations),
      'taille_base',       pg_size_pretty(pg_database_size(current_database()))
    ),
    'lu_le', NOW()
  ) INTO v;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_system() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_system() TO authenticated;

-- ============================================================
-- Alignement trouvé par cette page même, dès sa première lecture
-- ============================================================
-- Trois fonctions de trigger gardaient EXECUTE pour anon et authenticated.
-- Elles ne sont pas appelables par l'API (PostgREST n'expose pas les fonctions
-- qui retournent `trigger`), donc le risque réel est nul — mais le projet s'est
-- donné la règle de révoquer ces droits (migrations 020 et 053), et une règle
-- qu'on n'applique qu'aux fonctions dont on se souvient n'en est plus une.
REVOKE EXECUTE ON FUNCTION public.activer_abonnement() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_listings_sur_occupation() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, PUBLIC;
