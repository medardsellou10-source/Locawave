-- Phase 0 — Durcissement sécurité (advisors Supabase)

-- 1) Le trigger handle_new_user ne doit JAMAIS être appelable via l'API REST/RPC.
--    Les triggers s'exécutent sans vérifier EXECUTE → on peut tout révoquer sans risque.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- 2) is_admin est utilisé dans les policies RLS → authenticated DOIT garder EXECUTE.
--    On la retire seulement à anon et PUBLIC.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, PUBLIC;

-- 3) Fixer le search_path des fonctions existantes (search_path mutable).
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.create_default_notification_templates() SET search_path = public;

-- Notes (acceptés, non corrigés ici) :
--  * public.spatial_ref_sys : table de référence PostGIS (codes EPSG), données publiques
--    non sensibles, propriété de l'extension — non modifiable proprement.
--  * extensions postgis / pg_net dans public : configuration standard Supabase.
--  * auth_leaked_password_protection : réglage Auth à activer en Phase 11 (prod).
