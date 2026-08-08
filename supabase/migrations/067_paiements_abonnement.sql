-- 067 — Paiement réel des abonnements.
--
-- CONSTAT
-- `handleUpgrade` dans l'écran Facturation activait le plan directement —
-- `UPDATE organizations SET plan = ...` — sans le moindre encaissement. Un
-- client cliquait « Passer au Pro » et obtenait le plan gratuitement.
--
-- Le commentaire du code l'assumait : « En production : rediriger vers Wave/OM
-- payment page. Pour l'instant : mise à jour directe (simulation) ». Cette
-- production est arrivée sans que la redirection ne soit jamais écrite.
--
-- Aucune table ne traçait les paiements d'abonnement : impossible de savoir qui
-- avait payé quoi, ni de rapprocher un encaissement d'une organisation.

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('solo', 'pro', 'agence')),
  amount_fcfa integer NOT NULL CHECK (amount_fcfa > 0),
  months integer NOT NULL DEFAULT 1 CHECK (months > 0),

  -- Notre référence, transmise au PSP et retrouvée au webhook. Le préfixe SUB-
  -- sert d'aiguillage : le webhook distingue ainsi un abonnement d'un loyer.
  reference text NOT NULL UNIQUE,
  psp_provider text,
  psp_reference text,
  checkout_url text,

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'expired')),
  paid_at timestamptz,
  -- Période couverte, calculée à l'encaissement et non à la création : un
  -- abonnement payé avec trois jours de retard ne doit pas perdre ces trois jours.
  period_start date,
  period_end date,

  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Une même référence PSP n'encaisse qu'une fois, comme pour les loyers.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_subscription_psp_reference
  ON public.subscription_payments (psp_reference) WHERE psp_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscription_payments_org
  ON public.subscription_payments (org_id, created_at DESC);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Chacun ne voit que les paiements de son organisation.
DROP POLICY IF EXISTS subscription_payments_org ON public.subscription_payments;
CREATE POLICY subscription_payments_org ON public.subscription_payments
  FOR SELECT TO authenticated
  USING (
    org_id = (SELECT u.org_id FROM users u WHERE u.id = auth.uid())
    OR public.is_admin()
  );

-- L'écriture passe uniquement par le serveur : un client ne doit pas pouvoir
-- se déclarer payé.
DROP POLICY IF EXISTS subscription_payments_service ON public.subscription_payments;
CREATE POLICY subscription_payments_service ON public.subscription_payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── Activation du plan à l'encaissement ───
-- Le calcul de la période vit ici, au plus près de la donnée, pour qu'un
-- renouvellement prolonge l'abonnement en cours au lieu de le raccourcir.
CREATE OR REPLACE FUNCTION public.activer_abonnement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_depart date; v_actuel timestamptz;
BEGIN
  IF NEW.status <> 'paid' OR OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

  SELECT plan_expires_at INTO v_actuel FROM organizations WHERE id = NEW.org_id;

  -- Renouvellement anticipé : on repart de la fin de la période en cours, pas
  -- d'aujourd'hui. Payer en avance ne doit jamais faire perdre des jours.
  v_depart := GREATEST(CURRENT_DATE, COALESCE(v_actuel::date, CURRENT_DATE));

  UPDATE organizations
     SET plan = NEW.plan,
         plan_expires_at = (v_depart + (NEW.months || ' months')::interval),
         updated_at = now()
   WHERE id = NEW.org_id;

  NEW.period_start := v_depart;
  NEW.period_end := (v_depart + (NEW.months || ' months')::interval)::date;
  NEW.paid_at := COALESCE(NEW.paid_at, now());

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_activer_abonnement ON public.subscription_payments;
CREATE TRIGGER trg_activer_abonnement
  BEFORE UPDATE OF status ON public.subscription_payments
  FOR EACH ROW EXECUTE FUNCTION public.activer_abonnement();

-- Vérifié après application :
--   première souscription  -> plan 'pro', échéance à J+1 mois
--   renouvellement anticipé (abonnement courant jusqu'au 08/09, payé le 08/08)
--                          -> prolongé au 08/10, aucun jour perdu
--   parcours réel GeniusPay (paiement Wave sandbox de 20 000 XOF)
--                          -> webhook signé reçu, statut 'paid', plan activé
