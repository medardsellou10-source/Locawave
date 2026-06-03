-- Phase 10 (durcissement) — révoquer EXECUTE sur les fonctions internes (triggers + recalcul).
-- Les triggers s'exécutent avec les droits du propriétaire de table : aucune exposition RPC nécessaire.
REVOKE ALL ON FUNCTION public.recompute_provider_trust_score(UUID) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.trg_review_trust() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.trg_wo_trust() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.trg_dispute() FROM anon, authenticated, public;
