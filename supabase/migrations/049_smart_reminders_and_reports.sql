-- 049 — Relances progressives, rapport hebdomadaire, alerte fin de bail,
-- score de ponctualité et rappel intelligent.
-- Tout est natif SQL : aucune dépendance à une passerelle externe.

-- ═══ Score de ponctualité du locataire (0-100) ═══
-- Basé sur l'historique réel : échéances payées à temps / en retard.
CREATE OR REPLACE FUNCTION public.tenant_punctuality(p_tenant uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_total int; v_late int; v_paid int; v_score int;
BEGIN
  SELECT count(*) FILTER (WHERE s.status IN ('paid','late')),
         count(*) FILTER (WHERE s.status = 'late'),
         count(*) FILTER (WHERE s.status = 'paid')
    INTO v_total, v_late, v_paid
  FROM rent_schedules s
  JOIN leases l ON l.id = s.lease_id
  WHERE l.tenant_id = p_tenant;

  IF COALESCE(v_total,0) = 0 THEN
    RETURN jsonb_build_object('score', NULL, 'total', 0, 'late', 0,
                              'label', 'Historique insuffisant');
  END IF;

  v_score := GREATEST(0, ROUND(100.0 * v_paid / v_total));
  RETURN jsonb_build_object(
    'score', v_score, 'total', v_total, 'late', v_late,
    'label', CASE WHEN v_score >= 90 THEN 'Excellent payeur'
                  WHEN v_score >= 70 THEN 'Payeur fiable'
                  WHEN v_score >= 50 THEN 'Irrégulier'
                  ELSE 'À risque' END);
END $$;
-- REVOKE FROM anon seul est inopérant tant que PUBLIC détient EXECUTE : anon en hérite.
REVOKE ALL ON FUNCTION public.tenant_punctuality(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_punctuality(uuid) TO authenticated;

-- ═══ Relances progressives + rappel intelligent ═══
-- Escalade J+3 / J+7 / J+15 avec un ton croissant ; les excellents payeurs
-- (score >= 90) ne reçoivent pas la première relance — on ne harcèle personne.
CREATE OR REPLACE FUNCTION public.run_escalating_reminders()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r RECORD; v_created int := 0; v_days int; v_title text; v_body text; v_score int;
BEGIN
  FOR r IN
    SELECT s.id, s.org_id, s.amount_fcfa, s.due_date,
           t.id AS tenant_id, t.first_name, t.profile_id,
           p.name AS property_name, u.unit_number,
           (CURRENT_DATE - s.due_date) AS retard
    FROM rent_schedules s
    JOIN leases l   ON l.id = s.lease_id
    JOIN tenants t  ON t.id = l.tenant_id
    LEFT JOIN units u      ON u.id = l.unit_id
    LEFT JOIN properties p ON p.id = u.property_id
    WHERE s.status = 'late'
      AND (CURRENT_DATE - s.due_date) IN (3, 7, 15)
  LOOP
    v_days := r.retard;
    v_score := (public.tenant_punctuality(r.tenant_id)->>'score')::int;

    -- Rappel intelligent : on épargne la 1re relance aux excellents payeurs.
    CONTINUE WHEN v_days = 3 AND COALESCE(v_score, 0) >= 90;

    v_title := CASE v_days
      WHEN 3  THEN 'Retard de 3 jours — ' || COALESCE(r.first_name,'locataire')
      WHEN 7  THEN 'Retard d''une semaine — ' || COALESCE(r.first_name,'locataire')
      ELSE 'Retard de 15 jours — action requise' END;

    v_body := CASE v_days
      WHEN 3 THEN format('Le loyer de %s FCFA pour %s (échéance du %s) n''est pas encore réglé. Un rappel amical a été envoyé.',
                    public.lw_fcfa(r.amount_fcfa),
                    trim(COALESCE(r.property_name,'') || ' ' || COALESCE(r.unit_number,'')),
                    to_char(r.due_date,'DD/MM/YYYY'))
      WHEN 7 THEN format('Une semaine de retard sur %s FCFA (%s). Il est conseillé de contacter %s directement.',
                    public.lw_fcfa(r.amount_fcfa),
                    trim(COALESCE(r.property_name,'') || ' ' || COALESCE(r.unit_number,'')),
                    COALESCE(r.first_name,'le locataire'))
      ELSE format('15 jours de retard sur %s FCFA (%s). Envisagez une mise en demeure ou une médiation.',
                    public.lw_fcfa(r.amount_fcfa),
                    trim(COALESCE(r.property_name,'') || ' ' || COALESCE(r.unit_number,''))) END;

    -- L'index unique sur dedupe_key est partiel : le prédicat doit être répété ici.
    INSERT INTO notifications (org_id, kind, title, body, link, channel, delivery_status, dedupe_key)
    VALUES (r.org_id, 'reminder_j3_late', v_title, v_body, '/dashboard/payments', 'inapp', 'sent',
            'escalate:' || v_days || ':' || r.id::text)
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    IF FOUND THEN v_created := v_created + 1; END IF;

    IF r.profile_id IS NOT NULL THEN
      INSERT INTO notifications (org_id, profile_id, kind, title, body, link, channel, delivery_status, dedupe_key)
      VALUES (r.org_id, r.profile_id, 'reminder_j3_late', 'Loyer en retard',
              format('Votre loyer de %s FCFA (échéance du %s) est en retard de %s jours. Merci de régulariser.',
                     public.lw_fcfa(r.amount_fcfa), to_char(r.due_date,'DD/MM/YYYY'), v_days),
              '/locataire', 'inapp', 'sent', 'escalate:t:' || v_days || ':' || r.id::text)
      ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    END IF;
  END LOOP;
  RETURN v_created;
END $$;
REVOKE ALL ON FUNCTION public.run_escalating_reminders() FROM PUBLIC, anon, authenticated;

-- ═══ Alerte fin de bail à 90 / 60 / 30 jours ═══
CREATE OR REPLACE FUNCTION public.run_lease_expiry_alerts()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_created int := 0; v_j int;
BEGIN
  FOR r IN
    SELECT l.id, l.org_id, l.end_date, l.rent_fcfa,
           t.first_name, t.last_name, p.name AS property_name, u.unit_number,
           (l.end_date - CURRENT_DATE) AS jours
    FROM leases l
    JOIN tenants t ON t.id = l.tenant_id
    LEFT JOIN units u      ON u.id = l.unit_id
    LEFT JOIN properties p ON p.id = u.property_id
    WHERE l.status = 'active' AND (l.end_date - CURRENT_DATE) IN (90, 60, 30)
  LOOP
    v_j := r.jours;
    INSERT INTO notifications (org_id, kind, title, body, link, channel, delivery_status, dedupe_key)
    VALUES (r.org_id, 'lease_expiry',
            format('Bail à échéance dans %s jours — %s %s', v_j, COALESCE(r.first_name,''), COALESCE(r.last_name,'')),
            format('Le bail de %s (%s) se termine le %s. Anticipez le renouvellement ou la remise en location.',
                   trim(COALESCE(r.first_name,'') || ' ' || COALESCE(r.last_name,'')),
                   trim(COALESCE(r.property_name,'') || ' ' || COALESCE(r.unit_number,'')),
                   to_char(r.end_date,'DD/MM/YYYY')),
            '/dashboard/leases/' || r.id::text, 'inapp', 'sent',
            'lease_exp:' || v_j || ':' || r.id::text)
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    IF FOUND THEN v_created := v_created + 1; END IF;
  END LOOP;
  RETURN v_created;
END $$;
REVOKE ALL ON FUNCTION public.run_lease_expiry_alerts() FROM PUBLIC, anon, authenticated;

-- ═══ Rapport hebdomadaire au propriétaire ═══
CREATE OR REPLACE FUNCTION public.run_weekly_digest()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_created int := 0;
BEGIN
  FOR r IN
    SELECT o.id AS org_id,
      (SELECT COALESCE(sum(pa.amount_fcfa),0) FROM payments pa
        WHERE pa.org_id = o.id AND pa.paid_at >= CURRENT_DATE - 7) AS encaisse,
      (SELECT count(*) FROM payments pa
        WHERE pa.org_id = o.id AND pa.paid_at >= CURRENT_DATE - 7) AS nb_paiements,
      (SELECT count(*) FROM rent_schedules s
        WHERE s.org_id = o.id AND s.status = 'late') AS nb_retards,
      (SELECT COALESCE(sum(s.amount_fcfa),0) FROM rent_schedules s
        WHERE s.org_id = o.id AND s.status = 'late') AS montant_retard,
      (SELECT count(*) FROM incidents i
        WHERE i.org_id = o.id AND i.status <> 'resolved') AS incidents_ouverts
    FROM organizations o
  LOOP
    -- Une semaine sans rien à signaler ne génère pas de notification.
    CONTINUE WHEN r.nb_paiements = 0 AND r.nb_retards = 0 AND r.incidents_ouverts = 0;

    INSERT INTO notifications (org_id, kind, title, body, link, channel, delivery_status, dedupe_key)
    VALUES (r.org_id, 'weekly_report', 'Votre semaine en un coup d''œil',
            format('%s paiement(s) encaissé(s) pour %s FCFA · %s loyer(s) en retard (%s FCFA) · %s incident(s) ouvert(s).',
                   r.nb_paiements, public.lw_fcfa(r.encaisse), r.nb_retards,
                   public.lw_fcfa(r.montant_retard), r.incidents_ouverts),
            '/dashboard/finances', 'inapp', 'sent',
            'weekly:' || r.org_id::text || ':' || to_char(CURRENT_DATE,'IYYY-IW'))
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    IF FOUND THEN v_created := v_created + 1; END IF;
  END LOOP;
  RETURN v_created;
END $$;
REVOKE ALL ON FUNCTION public.run_weekly_digest() FROM PUBLIC, anon, authenticated;

-- ═══ Planification ═══
DO $$
DECLARE j text;
BEGIN
  FOREACH j IN ARRAY ARRAY['lw_escalating_reminders','lw_lease_expiry_alerts','lw_weekly_digest'] LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = j) THEN PERFORM cron.unschedule(j); END IF;
  END LOOP;
END $$;
SELECT cron.schedule('lw_escalating_reminders', '15 7 * * *', $$SELECT public.run_escalating_reminders();$$);
SELECT cron.schedule('lw_lease_expiry_alerts',  '30 7 * * *', $$SELECT public.run_lease_expiry_alerts();$$);
SELECT cron.schedule('lw_weekly_digest',        '0 8 * * 1',  $$SELECT public.run_weekly_digest();$$);
