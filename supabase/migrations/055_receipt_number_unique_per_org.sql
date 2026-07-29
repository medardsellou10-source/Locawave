-- 055 — Numérotation des quittances : unicité par organisation.
--
-- Bug constaté en test réel d'encaissement GeniusPay : le paiement était bien
-- créé et l'échéance passée à « paid », mais AUCUNE quittance n'était générée.
--
-- Cause : `receipt_number` était contraint unique GLOBALEMENT
-- (receipts_receipt_number_key) alors que le numéro était calculé à partir d'un
-- comptage PAR ORGANISATION. Les données montraient déjà la collision :
--   LW-2026-0001 -> Mamadou Diallo Immobilier
--   LW-2026-0002 -> Medard Mike Immobilier
-- Medard Mike ayant 1 quittance, le calcul produisait LW-2026-0002 — déjà pris
-- par l'autre organisation. L'insertion échouait, et l'erreur était ignorée par
-- l'Edge Function : l'encaissement se terminait « avec succès », sans quittance.
--
-- En production, cela se déclenche dès que deux bailleurs encaissent.
--
-- Correction : unicité sur (org_id, receipt_number). Chaque bailleur a sa propre
-- série LW-AAAA-NNNN repartant de 0001 — ce qui est aussi ce qu'on attend d'une
-- numérotation de quittances : séquentielle et propre à l'émetteur.
ALTER TABLE public.receipts DROP CONSTRAINT IF EXISTS receipts_receipt_number_key;
DROP INDEX IF EXISTS public.receipts_receipt_number_key;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_receipts_org_number
  ON public.receipts (org_id, receipt_number);

-- Attribution du prochain numéro, à l'épreuve des accès concurrents.
-- Deux raisons de ne plus calculer ce numéro côté application :
--   1. le verrou consultatif sérialise les émissions simultanées d'une même
--      organisation (deux encaissements en parallèle ne peuvent plus produire
--      le même numéro) ;
--   2. le numéro dérive du MAXIMUM réel et non d'un comptage de lignes — un
--      comptage se décale dès qu'une quittance est supprimée.
CREATE OR REPLACE FUNCTION public.next_receipt_number(p_org uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_annee text := to_char(now(), 'YYYY');
  v_max   int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_org::text, 0));

  SELECT COALESCE(MAX(NULLIF(regexp_replace(receipt_number, '^LW-\d{4}-', ''), '')::int), 0)
    INTO v_max
  FROM receipts
  WHERE org_id = p_org AND receipt_number LIKE 'LW-' || v_annee || '-%';

  RETURN 'LW-' || v_annee || '-' || lpad((v_max + 1)::text, 4, '0');
END $$;

-- Appelée uniquement par l'Edge Function d'encaissement (clé service_role) :
-- aucun client authentifié n'a besoin de réserver un numéro de quittance.
REVOKE ALL ON FUNCTION public.next_receipt_number(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_receipt_number(uuid) TO service_role;
