-- 064 — Correction d'une régression que j'ai introduite en migration 057.
--
-- CONSTAT
-- En réécrivant generate_due_bookings() pour l'aligner sur payment_state, la
-- migration 057 a repris tel quel `COALESCE(r.interval_days, 30)`. Cette colonne
-- N'EXISTE PAS sur recurring_bookings. Les colonnes réelles sont :
--   id, client_id, provider_id, service_id, title, frequency, weekday,
--   amount_fcfa, active, next_run, created_at, updated_at
-- L'interface écrit `frequency` ('weekly' | 'biweekly' | 'monthly'), jamais
-- interval_days.
--
-- MESURÉ dans cron.job_run_details :
--   2026-08-04  succeeded  (avant la migration 057)
--   2026-08-05  failed  ERROR: record "r" has no field "interval_days"
--   2026-08-06  failed  idem
--
-- L'erreur avorte la transaction : l'INSERT dans work_orders est annulé ET
-- next_run n'avance pas. La même réservation ré-échoue donc indéfiniment.
-- Aucune mission récurrente n'était créée, alors que l'écran confirmait
-- « Réservation récurrente créée ».
--
-- POURQUOI C'EST PASSÉ INAPERÇU
-- PL/pgSQL ne résout les champs d'un RECORD qu'à l'exécution du corps de boucle.
-- Tant qu'aucune réservation n'était échue, la boucle ne s'exécutait pas et la
-- tâche était marquée « succeeded ». Un test sur table vide ne pouvait rien
-- détecter — c'est exactement ce que faisait le test d'origine.
CREATE OR REPLACE FUNCTION public.generate_due_bookings()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_count int := 0; v_jours int;
BEGIN
  FOR r IN SELECT * FROM recurring_bookings
           WHERE active AND (next_run IS NULL OR next_run <= CURRENT_DATE) LOOP

    -- La périodicité est stockée en toutes lettres, pas en nombre de jours.
    v_jours := CASE r.frequency
                 WHEN 'weekly'   THEN 7
                 WHEN 'biweekly' THEN 14
                 WHEN 'monthly'  THEN 30
                 ELSE 30
               END;

    INSERT INTO work_orders (incident_id, property_id, client_id, provider_id, type,
                             description, amount_fcfa, status, payment_state)
    VALUES (NULL, NULL, r.client_id, r.provider_id, 'home_service',
            COALESCE(r.title, 'Service récurrent'), r.amount_fcfa, 'assigned', 'not_due');

    UPDATE recurring_bookings
       SET next_run = CURRENT_DATE + (v_jours || ' days')::interval,
           updated_at = now()
     WHERE id = r.id;

    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END $$;
REVOKE ALL ON FUNCTION public.generate_due_bookings() FROM PUBLIC, anon, authenticated;

-- Vérifié après application, sur une ligne RÉELLEMENT échue (« Ménage
-- hebdomadaire (démo) », frequency='weekly', next_run bloqué au 2026-08-05) :
--   generate_due_bookings() -> 1
--   la mission apparaît dans work_orders
--   next_run passe au 2026-08-13, soit CURRENT_DATE + 7
