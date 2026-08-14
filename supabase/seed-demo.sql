-- ============================================================================
-- Locawave — Jeu de données de DÉMONSTRATION (tournage du film explicatif)
-- ============================================================================
--
-- ⚠️  CE FICHIER N'EST PAS UNE MIGRATION. Il ne doit jamais être placé dans
--     supabase/migrations/ : les migrations s'exécutent automatiquement au
--     déploiement, et ces données n'ont rien à faire en production.
--     Exécution manuelle uniquement, sur le compte de démonstration.
--
-- Objectif : rendre les trois espaces réellement démontrables à l'écran.
-- L'état actuel du compte (0 FCFA en attente, 0 en retard, 100 % de
-- recouvrement, une seule ligne) ne permet pas de filmer les relances ni le
-- suivi des impayés — c'est-à-dire l'essentiel de ce que le film explique.
--
-- Toutes les données sont fictives. Marqueurs de démonstration :
--   · biens      → nom préfixé « DÉMO — »
--   · locataires → email en @demo.locawave.sn
--   · chantiers  → titre préfixé « DÉMO — »
-- Le script est ré-exécutable : il purge ces marqueurs avant de réinsérer.
--
-- Utilisation :
--   1. Adapter v_email ci-dessous à l'adresse du compte propriétaire de démo.
--   2. Exécuter dans le SQL Editor Supabase, ou :
--      psql "$DATABASE_URL" -f supabase/seed-demo.sql
-- ============================================================================

DO $$
DECLARE
  -- ⚙️  À ADAPTER : compte propriétaire de démonstration
  v_email          TEXT := 'medardcellou160@gmail.com';

  v_org_id         UUID;
  v_owner_id       UUID;
  v_provider_id    UUID;

  v_prop_teranga   UUID;
  v_prop_almadies  UUID;
  v_prop_liberte   UUID;

  v_unit_a1        UUID;
  v_unit_a2        UUID;
  v_unit_a3        UUID;
  v_unit_villa     UUID;
  v_unit_b1        UUID;

  v_tenant_awa     UUID;
  v_tenant_moussa  UUID;
  v_tenant_fatou   UUID;
  v_tenant_ibrahima UUID;
  v_tenant_mariama UUID;

  v_lease_awa      UUID;
  v_lease_moussa   UUID;
  v_lease_fatou    UUID;
  v_lease_ibrahima UUID;
  v_lease_mariama  UUID;

  v_project        UUID;
  v_ms             UUID;
  v_sched          UUID;
  v_pay            UUID;
  v_incident       UUID;
  v_month_start    DATE := date_trunc('month', CURRENT_DATE)::DATE;
BEGIN

  -- ── Résolution du compte ──────────────────────────────────────────────────
  SELECT u.org_id, u.id INTO v_org_id, v_owner_id
  FROM users u WHERE lower(u.email) = lower(v_email) LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION
      'Aucun utilisateur pour %. Corrigez v_email en haut du script.', v_email;
  END IF;

  RAISE NOTICE 'Organisation cible : %', v_org_id;

  -- ── Purge des données de démonstration précédentes ────────────────────────
  -- L'ordre compte peu : les cascades font le travail (tenants → leases →
  -- rent_schedules → payments → receipts ; properties → units).
  DELETE FROM incidents
   WHERE org_id = v_org_id AND description LIKE 'DÉMO —%';
  DELETE FROM construction_projects
   WHERE org_id = v_org_id AND title LIKE 'DÉMO —%';
  DELETE FROM tenants
   WHERE org_id = v_org_id AND email LIKE '%@demo.locawave.sn';
  DELETE FROM properties
   WHERE org_id = v_org_id AND name LIKE 'DÉMO —%';

  -- ── L'organisation est configurée ─────────────────────────────────────────
  -- Sans ça, la bannière orange « Complétez votre configuration » s'affiche en
  -- haut du tableau de bord et pollue chaque plan du film.
  UPDATE organizations
     SET onboarding_completed = TRUE,
         name    = COALESCE(NULLIF(name, ''), 'Gestion Teranga (démo)'),
         address = COALESCE(address, 'Sacré-Cœur 3, Dakar'),
         wave_number = COALESCE(wave_number, '+221770000000')
   WHERE id = v_org_id;

  -- ══════════════════════════════════════════════════════════════════════════
  -- BIENS ET UNITÉS
  -- ══════════════════════════════════════════════════════════════════════════
  INSERT INTO properties (org_id, name, type, address, neighborhood, city)
  VALUES (v_org_id, 'DÉMO — Résidence Teranga', 'appartement',
          'Rue 10 x Boulevard du Centenaire', 'Sacré-Cœur 3', 'Dakar')
  RETURNING id INTO v_prop_teranga;

  INSERT INTO properties (org_id, name, type, address, neighborhood, city)
  VALUES (v_org_id, 'DÉMO — Villa Almadies', 'villa',
          'Route des Almadies, lot 42', 'Almadies', 'Dakar')
  RETURNING id INTO v_prop_almadies;

  INSERT INTO properties (org_id, name, type, address, neighborhood, city)
  VALUES (v_org_id, 'DÉMO — Immeuble Liberté 6', 'appartement',
          'Liberté 6 Extension, villa 21', 'Liberté 6', 'Dakar')
  RETURNING id INTO v_prop_liberte;

  INSERT INTO units (property_id, org_id, unit_number, type, floor, surface_m2, rent_fcfa, status)
  VALUES (v_prop_teranga, v_org_id, 'A1', 'f3', 1, 78.0, 350000, 'rented')
  RETURNING id INTO v_unit_a1;

  INSERT INTO units (property_id, org_id, unit_number, type, floor, surface_m2, rent_fcfa, status)
  VALUES (v_prop_teranga, v_org_id, 'A2', 'f2', 2, 55.0, 250000, 'rented')
  RETURNING id INTO v_unit_a2;

  INSERT INTO units (property_id, org_id, unit_number, type, floor, surface_m2, rent_fcfa, status)
  VALUES (v_prop_teranga, v_org_id, 'A3', 'studio', 3, 28.0, 150000, 'rented')
  RETURNING id INTO v_unit_a3;

  INSERT INTO units (property_id, org_id, unit_number, type, floor, surface_m2, rent_fcfa, status)
  VALUES (v_prop_almadies, v_org_id, 'Villa', 'f4', 0, 210.0, 850000, 'rented')
  RETURNING id INTO v_unit_villa;

  INSERT INTO units (property_id, org_id, unit_number, type, floor, surface_m2, rent_fcfa, status)
  VALUES (v_prop_liberte, v_org_id, 'B1', 'f2', 1, 60.0, 200000, 'rented')
  RETURNING id INTO v_unit_b1;

  -- Une unité vacante : un parc 100 % loué n'est pas crédible, et la fiche bien
  -- doit pouvoir montrer l'état « vacant ».
  INSERT INTO units (property_id, org_id, unit_number, type, floor, surface_m2, rent_fcfa, status)
  VALUES (v_prop_liberte, v_org_id, 'B2', 'commerce', 0, 45.0, 400000, 'vacant');

  -- ══════════════════════════════════════════════════════════════════════════
  -- LOCATAIRES
  -- ══════════════════════════════════════════════════════════════════════════
  INSERT INTO tenants (org_id, first_name, last_name, whatsapp, email, employer)
  VALUES (v_org_id, 'Awa', 'Ndiaye', '+221770000001', 'awa.ndiaye@demo.locawave.sn', 'Sonatel')
  RETURNING id INTO v_tenant_awa;

  INSERT INTO tenants (org_id, first_name, last_name, whatsapp, email, employer)
  VALUES (v_org_id, 'Moussa', 'Fall', '+221770000002', 'moussa.fall@demo.locawave.sn', 'Indépendant')
  RETURNING id INTO v_tenant_moussa;

  INSERT INTO tenants (org_id, first_name, last_name, whatsapp, email, employer)
  VALUES (v_org_id, 'Fatou', 'Sarr', '+221770000003', 'fatou.sarr@demo.locawave.sn', 'Ministère de la Santé')
  RETURNING id INTO v_tenant_fatou;

  INSERT INTO tenants (org_id, first_name, last_name, whatsapp, email, employer)
  VALUES (v_org_id, 'Ibrahima', 'Diop', '+221770000004', 'ibrahima.diop@demo.locawave.sn', 'BOA Sénégal')
  RETURNING id INTO v_tenant_ibrahima;

  INSERT INTO tenants (org_id, first_name, last_name, whatsapp, email, employer)
  VALUES (v_org_id, 'Mariama', 'Bâ', '+221770000005', 'mariama.ba@demo.locawave.sn', 'Enseignante')
  RETURNING id INTO v_tenant_mariama;

  -- ══════════════════════════════════════════════════════════════════════════
  -- BAUX
  -- ══════════════════════════════════════════════════════════════════════════
  INSERT INTO leases (org_id, unit_id, tenant_id, start_date, end_date, rent_fcfa, due_day, deposit_fcfa, status)
  VALUES (v_org_id, v_unit_a1, v_tenant_awa,
          v_month_start - INTERVAL '14 months', v_month_start + INTERVAL '10 months',
          350000, 5, 700000, 'active')
  RETURNING id INTO v_lease_awa;

  INSERT INTO leases (org_id, unit_id, tenant_id, start_date, end_date, rent_fcfa, due_day, deposit_fcfa, status)
  VALUES (v_org_id, v_unit_a2, v_tenant_moussa,
          v_month_start - INTERVAL '8 months', v_month_start + INTERVAL '16 months',
          250000, 5, 500000, 'active')
  RETURNING id INTO v_lease_moussa;

  INSERT INTO leases (org_id, unit_id, tenant_id, start_date, end_date, rent_fcfa, due_day, deposit_fcfa, status)
  VALUES (v_org_id, v_unit_a3, v_tenant_fatou,
          v_month_start - INTERVAL '5 months', v_month_start + INTERVAL '19 months',
          150000, 5, 300000, 'active')
  RETURNING id INTO v_lease_fatou;

  INSERT INTO leases (org_id, unit_id, tenant_id, start_date, end_date, rent_fcfa, due_day, deposit_fcfa, status)
  VALUES (v_org_id, v_unit_villa, v_tenant_ibrahima,
          v_month_start - INTERVAL '20 months', v_month_start + INTERVAL '4 months',
          850000, 5, 1700000, 'active')
  RETURNING id INTO v_lease_ibrahima;

  INSERT INTO leases (org_id, unit_id, tenant_id, start_date, end_date, rent_fcfa, due_day, deposit_fcfa, status)
  VALUES (v_org_id, v_unit_b1, v_tenant_mariama,
          v_month_start - INTERVAL '3 months', v_month_start + INTERVAL '21 months',
          200000, 5, 400000, 'active')
  RETURNING id INTO v_lease_mariama;

  -- ══════════════════════════════════════════════════════════════════════════
  -- ÉCHÉANCES — 6 mois d'historique, tout payé, pour nourrir Finances/Rapports
  -- ══════════════════════════════════════════════════════════════════════════
  FOR i IN 1..6 LOOP
    FOR v_sched IN
      SELECT l.id FROM leases l
       WHERE l.org_id = v_org_id
         AND l.start_date <= (v_month_start - (i || ' months')::INTERVAL)::DATE
    LOOP
      INSERT INTO rent_schedules (lease_id, org_id, due_date, amount_fcfa, status)
      SELECT v_sched, v_org_id,
             ((v_month_start - (i || ' months')::INTERVAL)::DATE + 4),
             l.rent_fcfa, 'paid'
        FROM leases l WHERE l.id = v_sched
      RETURNING id INTO v_pay;

      INSERT INTO payments (org_id, rent_schedule_id, amount_fcfa, method, reference, paid_at)
      SELECT v_org_id, v_pay, s.amount_fcfa,
             (ARRAY['wave','orange_money','cash'])[1 + (i % 3)],
             'DEMO-' || substr(v_pay::text, 1, 8),
             (s.due_date + 1)::TIMESTAMPTZ
        FROM rent_schedules s WHERE s.id = v_pay
      RETURNING id INTO v_incident;   -- réutilisation de variable, sans effet

      INSERT INTO receipts (org_id, payment_id, receipt_number, created_at)
      VALUES (v_org_id, v_incident,
              'DEMO-Q-' || to_char(v_month_start - (i || ' months')::INTERVAL, 'YYYYMM')
                        || '-' || substr(v_pay::text, 1, 4),
              (v_month_start - (i || ' months')::INTERVAL)::TIMESTAMPTZ);
    END LOOP;
  END LOOP;

  -- ── Mois en cours : un mélange lisible à l'écran ──────────────────────────
  -- 2 payés · 1 en attente · 2 en retard → le taux de recouvrement tombe sous
  -- 100 %, les tuiles « En attente » et « En retard » cessent d'afficher zéro,
  -- et les relances J+3 / J+5 ont enfin quelque chose à relancer.

  -- Awa — payée
  INSERT INTO rent_schedules (lease_id, org_id, due_date, amount_fcfa, status)
  VALUES (v_lease_awa, v_org_id, v_month_start + 4, 350000, 'paid')
  RETURNING id INTO v_sched;
  INSERT INTO payments (org_id, rent_schedule_id, amount_fcfa, method, reference, paid_at)
  VALUES (v_org_id, v_sched, 350000, 'wave', 'DEMO-WAVE-2481', (v_month_start + 4)::TIMESTAMPTZ)
  RETURNING id INTO v_pay;
  INSERT INTO receipts (org_id, payment_id, receipt_number)
  VALUES (v_org_id, v_pay, 'DEMO-Q-' || to_char(v_month_start, 'YYYYMM') || '-0001');

  -- Ibrahima — payé
  INSERT INTO rent_schedules (lease_id, org_id, due_date, amount_fcfa, status)
  VALUES (v_lease_ibrahima, v_org_id, v_month_start + 4, 850000, 'paid')
  RETURNING id INTO v_sched;
  INSERT INTO payments (org_id, rent_schedule_id, amount_fcfa, method, reference, paid_at)
  VALUES (v_org_id, v_sched, 850000, 'orange_money', 'DEMO-OM-7734', (v_month_start + 5)::TIMESTAMPTZ)
  RETURNING id INTO v_pay;
  INSERT INTO receipts (org_id, payment_id, receipt_number)
  VALUES (v_org_id, v_pay, 'DEMO-Q-' || to_char(v_month_start, 'YYYYMM') || '-0002');

  -- Fatou — en attente
  INSERT INTO rent_schedules (lease_id, org_id, due_date, amount_fcfa, status)
  VALUES (v_lease_fatou, v_org_id, v_month_start + 4, 150000, 'pending');

  -- Moussa — en retard, 2 relances déjà parties
  INSERT INTO rent_schedules (lease_id, org_id, due_date, amount_fcfa, status,
                              reminder_count, reminder_sent_at)
  VALUES (v_lease_moussa, v_org_id, v_month_start + 4, 250000, 'late',
          2, NOW() - INTERVAL '2 days');

  -- Mariama — en retard, 1 relance
  INSERT INTO rent_schedules (lease_id, org_id, due_date, amount_fcfa, status,
                              reminder_count, reminder_sent_at)
  VALUES (v_lease_mariama, v_org_id, v_month_start + 4, 200000, 'late',
          1, NOW() - INTERVAL '5 days');

  -- ══════════════════════════════════════════════════════════════════════════
  -- INCIDENTS
  -- ══════════════════════════════════════════════════════════════════════════
  INSERT INTO incidents (org_id, property_id, lease_id, reporter_id, category,
                         urgency, description, status, charge_to)
  VALUES (v_org_id, v_prop_teranga, v_lease_awa, v_owner_id, 'plomberie', 'high',
          'DÉMO — Fuite sous l''évier de la cuisine, le placard prend l''eau.',
          'assigned', 'owner');

  INSERT INTO incidents (org_id, property_id, lease_id, reporter_id, category,
                         urgency, description, status, charge_to)
  VALUES (v_org_id, v_prop_liberte, v_lease_mariama, v_owner_id, 'electricite', 'medium',
          'DÉMO — Disjoncteur qui saute dès que le climatiseur démarre.',
          'resolved', 'owner');

  INSERT INTO incidents (org_id, property_id, lease_id, reporter_id, category,
                         urgency, description, status, charge_to)
  VALUES (v_org_id, v_prop_almadies, v_lease_ibrahima, v_owner_id, 'serrurerie', 'low',
          'DÉMO — Serrure du portail difficile à tourner.',
          'open', 'tenant');

  -- ══════════════════════════════════════════════════════════════════════════
  -- CHANTIER — le cœur de la démonstration « preuve avant paiement »
  -- ══════════════════════════════════════════════════════════════════════════
  -- Un chef de chantier prestataire est facultatif : s'il n'existe aucun profil
  -- prestataire, le chantier est créé sans lui plutôt que d'échouer.
  SELECT pp.id INTO v_provider_id
    FROM provider_profiles pp
    JOIN profiles p ON p.id = pp.id
   WHERE p.role = 'provider'
   LIMIT 1;

  INSERT INTO construction_projects (org_id, property_id, owner_id, provider_id,
                                     title, description, total_budget_fcfa, status)
  VALUES (v_org_id, v_prop_almadies, v_owner_id, v_provider_id,
          'DÉMO — Construction R+1 à Diamniadio',
          'Maison individuelle R+1, 4 chambres. Suivi par phases avec preuve photo.',
          20000000, 'active')
  RETURNING id INTO v_project;

  -- Phases : 2 validées, 1 soumise en attente de validation, 2 à venir.
  -- escrow_status reste 'none' — Locawave ne détient jamais les fonds.
  INSERT INTO project_milestones (project_id, order_index, title, description,
                                  amount_fcfa, status, approved_at)
  VALUES (v_project, 1, 'Fondations', 'Terrassement, semelles et longrines.',
          4000000, 'approved', NOW() - INTERVAL '4 months')
  RETURNING id INTO v_ms;
  INSERT INTO milestone_updates (milestone_id, project_id, author_id, kind, note, taken_at)
  VALUES (v_ms, v_project, v_owner_id, 'photo',
          'Semelles coulées, ferraillage conforme au plan.', NOW() - INTERVAL '4 months');

  INSERT INTO project_milestones (project_id, order_index, title, description,
                                  amount_fcfa, status, approved_at)
  VALUES (v_project, 2, 'Élévation rez-de-chaussée', 'Murs porteurs et chaînages.',
          5000000, 'approved', NOW() - INTERVAL '2 months')
  RETURNING id INTO v_ms;
  INSERT INTO milestone_updates (milestone_id, project_id, author_id, kind, note, taken_at)
  VALUES (v_ms, v_project, v_owner_id, 'photo',
          'Élévation terminée, linteaux en place.', NOW() - INTERVAL '2 months');

  -- LA phase du film : soumise, preuves déposées, pas encore validée.
  INSERT INTO project_milestones (project_id, order_index, title, description,
                                  amount_fcfa, status, submitted_at)
  VALUES (v_project, 3, 'Dalle et étage', 'Coffrage, coulage de la dalle, élévation R+1.',
          6000000, 'submitted', NOW() - INTERVAL '3 days')
  RETURNING id INTO v_ms;
  INSERT INTO milestone_updates (milestone_id, project_id, author_id, kind, note, taken_at)
  VALUES (v_ms, v_project, v_owner_id, 'photo',
          'Dalle coulée le 3, décoffrage prévu sous huit jours.', NOW() - INTERVAL '3 days');
  INSERT INTO milestone_updates (milestone_id, project_id, author_id, kind, note, taken_at)
  VALUES (v_ms, v_project, v_owner_id, 'note',
          'Ferraillage vérifié avant coulage, photos jointes.', NOW() - INTERVAL '4 days');

  INSERT INTO project_milestones (project_id, order_index, title, description,
                                  amount_fcfa, status)
  VALUES (v_project, 4, 'Toiture', 'Charpente et couverture.', 3000000, 'planned');

  INSERT INTO project_milestones (project_id, order_index, title, description,
                                  amount_fcfa, status)
  VALUES (v_project, 5, 'Finitions', 'Enduits, menuiseries, peinture.', 2000000, 'planned');

  RAISE NOTICE 'Jeu de démonstration installé pour l''organisation %.', v_org_id;
  RAISE NOTICE '3 biens · 6 unités · 5 locataires · 5 baux · échéances sur 7 mois';
  RAISE NOTICE '3 incidents · 1 chantier à 5 phases (2 validées, 1 en attente)';
  IF v_provider_id IS NULL THEN
    RAISE NOTICE 'Aucun profil prestataire trouvé : chantier créé sans chef de chantier.';
  END IF;

END $$;
