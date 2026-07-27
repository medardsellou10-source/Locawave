-- 050 — Alertes chantier (phase soumise, budget dépassé, chantier silencieux)
-- et résumé mensuel envoyé au locataire.

-- ═══ Phase soumise → notification immédiate au propriétaire (trigger) ═══
CREATE OR REPLACE FUNCTION public.notify_milestone_submitted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_title text; v_nb_medias int;
BEGIN
  IF NEW.status = 'submitted' AND COALESCE(OLD.status,'') <> 'submitted' THEN
    SELECT cp.org_id, cp.title INTO v_org, v_title
    FROM construction_projects cp WHERE cp.id = NEW.project_id;

    SELECT COALESCE(sum(cardinality(mu.media_urls)),0) INTO v_nb_medias
    FROM milestone_updates mu WHERE mu.milestone_id = NEW.id;

    INSERT INTO notifications (org_id, kind, title, body, link, channel, delivery_status, dedupe_key)
    VALUES (v_org, 'chantier',
      format('Phase à valider — %s', NEW.title),
      format('Le prestataire a soumis « %s » (%s) pour %s FCFA. %s média(s) joint(s). Vérifiez avant de débloquer le paiement.',
             NEW.title, COALESCE(v_title,'chantier'), public.lw_fcfa(NEW.amount_fcfa), v_nb_medias),
      '/dashboard/chantiers/' || NEW.project_id::text, 'inapp', 'sent',
      'ms_sub:' || NEW.id::text || ':' || to_char(COALESCE(NEW.submitted_at, now()),'YYYYMMDDHH24MI'))
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_milestone_submitted ON public.project_milestones;
CREATE TRIGGER trg_milestone_submitted
  AFTER UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.notify_milestone_submitted();

-- ═══ Budget dépassé + chantier silencieux depuis 7 jours ═══
CREATE OR REPLACE FUNCTION public.run_chantier_alerts()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_created int := 0;
BEGIN
  -- Budget dépassé : la somme des phases excède l'enveloppe validée.
  FOR r IN
    SELECT cp.id, cp.org_id, cp.title, cp.total_budget_fcfa,
           COALESCE(sum(pm.amount_fcfa),0) AS total_phases
    FROM construction_projects cp
    LEFT JOIN project_milestones pm ON pm.project_id = cp.id
    WHERE cp.status IN ('active','in_progress')
    GROUP BY cp.id, cp.org_id, cp.title, cp.total_budget_fcfa
    HAVING COALESCE(sum(pm.amount_fcfa),0) > COALESCE(cp.total_budget_fcfa,0)
       AND COALESCE(cp.total_budget_fcfa,0) > 0
  LOOP
    INSERT INTO notifications (org_id, kind, title, body, link, channel, delivery_status, dedupe_key)
    VALUES (r.org_id, 'chantier',
      format('Budget dépassé — %s', r.title),
      format('Le total des phases (%s FCFA) dépasse l''enveloppe prévue (%s FCFA), soit %s FCFA de plus. Revoyez le chiffrage avant de valider la suite.',
             public.lw_fcfa(r.total_phases), public.lw_fcfa(r.total_budget_fcfa),
             public.lw_fcfa(r.total_phases - r.total_budget_fcfa)),
      '/dashboard/chantiers/' || r.id::text, 'inapp', 'sent',
      -- Le montant fait partie de la clé : un nouveau dépassement réalerte.
      'budget:' || r.id::text || ':' || r.total_phases::text)
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    IF FOUND THEN v_created := v_created + 1; END IF;
  END LOOP;

  -- Chantier silencieux : aucune photo/vidéo depuis 7 jours.
  FOR r IN
    SELECT cp.id, cp.org_id, cp.title,
           (SELECT max(mu.created_at) FROM milestone_updates mu WHERE mu.project_id = cp.id) AS dernier
    FROM construction_projects cp
    WHERE cp.status IN ('active','in_progress')
  LOOP
    CONTINUE WHEN r.dernier IS NOT NULL AND r.dernier > now() - interval '7 days';

    INSERT INTO notifications (org_id, kind, title, body, link, channel, delivery_status, dedupe_key)
    VALUES (r.org_id, 'chantier',
      format('Aucune nouvelle du chantier — %s', r.title),
      CASE WHEN r.dernier IS NULL
        THEN 'Aucune photo ni vidéo n''a encore été publiée sur ce chantier. Relancez le prestataire.'
        ELSE format('Dernier envoi de média il y a %s jours. Relancez le prestataire pour garder la traçabilité.',
                    EXTRACT(day FROM now() - r.dernier)::int) END,
      '/dashboard/chantiers/' || r.id::text, 'inapp', 'sent',
      -- Une alerte par semaine ISO au maximum, pour ne pas saturer.
      'silence:' || r.id::text || ':' || to_char(CURRENT_DATE,'IYYY-IW'))
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    IF FOUND THEN v_created := v_created + 1; END IF;
  END LOOP;

  RETURN v_created;
END $$;
REVOKE ALL ON FUNCTION public.run_chantier_alerts() FROM PUBLIC, anon, authenticated;

-- ═══ Résumé mensuel au locataire ═══
CREATE OR REPLACE FUNCTION public.run_tenant_monthly_digest()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_created int := 0; v_pct jsonb;
BEGIN
  FOR r IN
    SELECT DISTINCT t.id AS tenant_id, t.profile_id, t.first_name, l.org_id,
           (SELECT count(*) FROM rent_schedules s2
             JOIN leases l2 ON l2.id = s2.lease_id
             WHERE l2.tenant_id = t.id AND s2.status = 'late') AS retards,
           (SELECT COALESCE(sum(s2.amount_fcfa),0) FROM rent_schedules s2
             JOIN leases l2 ON l2.id = s2.lease_id
             WHERE l2.tenant_id = t.id AND s2.status = 'late') AS montant_du,
           (SELECT min(s2.due_date) FROM rent_schedules s2
             JOIN leases l2 ON l2.id = s2.lease_id
             WHERE l2.tenant_id = t.id AND s2.status = 'pending' AND s2.due_date >= CURRENT_DATE) AS prochaine
    FROM tenants t
    JOIN leases l ON l.tenant_id = t.id AND l.status = 'active'
    WHERE t.profile_id IS NOT NULL
  LOOP
    v_pct := public.tenant_punctuality(r.tenant_id);

    INSERT INTO notifications (org_id, profile_id, kind, title, body, link, channel, delivery_status, dedupe_key)
    VALUES (r.org_id, r.profile_id, 'weekly_report',
      CASE WHEN r.retards = 0 THEN 'Vous êtes à jour ✅' ELSE 'Votre point mensuel' END,
      CASE WHEN r.retards = 0 THEN
        format('Aucun loyer en retard. %sVotre score de ponctualité : %s/100 (%s).',
               CASE WHEN r.prochaine IS NOT NULL
                    THEN 'Prochaine échéance le ' || to_char(r.prochaine,'DD/MM/YYYY') || '. ' ELSE '' END,
               COALESCE((v_pct->>'score'),'—'), v_pct->>'label')
      ELSE
        format('%s échéance(s) en attente pour %s FCFA. Régularisez pour préserver votre score de ponctualité (%s/100).',
               r.retards, public.lw_fcfa(r.montant_du), COALESCE((v_pct->>'score'),'—'))
      END,
      '/locataire', 'inapp', 'sent',
      'tdigest:' || r.tenant_id::text || ':' || to_char(CURRENT_DATE,'YYYY-MM'))
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    IF FOUND THEN v_created := v_created + 1; END IF;
  END LOOP;
  RETURN v_created;
END $$;
REVOKE ALL ON FUNCTION public.run_tenant_monthly_digest() FROM PUBLIC, anon, authenticated;

-- ═══ Planification ═══
DO $$
DECLARE j text;
BEGIN
  FOREACH j IN ARRAY ARRAY['lw_chantier_alerts','lw_tenant_monthly_digest'] LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = j) THEN PERFORM cron.unschedule(j); END IF;
  END LOOP;
END $$;
SELECT cron.schedule('lw_chantier_alerts',       '45 7 * * *', $$SELECT public.run_chantier_alerts();$$);
SELECT cron.schedule('lw_tenant_monthly_digest', '0 9 1 * *',  $$SELECT public.run_tenant_monthly_digest();$$);
