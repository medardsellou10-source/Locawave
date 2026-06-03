-- Phase 2 — Encaissement PSP (en plus de l'OCR Wave/OM conservé).
-- On ne stocke AUCUNE donnée bancaire : seulement des références et statuts pilotés via le PSP.

-- Lien de paiement par échéance
ALTER TABLE rent_schedules ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE rent_schedules ADD COLUMN IF NOT EXISTS payment_link_ref TEXT;          -- référence de la transaction PSP (intent)
ALTER TABLE rent_schedules ADD COLUMN IF NOT EXISTS payment_link_expires_at TIMESTAMPTZ;

-- Traçabilité PSP sur le règlement
ALTER TABLE payments ADD COLUMN IF NOT EXISTS psp_provider TEXT;                    -- 'paydunya' | 'cinetpay' | 'simulation'
ALTER TABLE payments ADD COLUMN IF NOT EXISTS psp_reference TEXT;

-- Idempotence du webhook : une même référence PSP ne peut créer qu'un seul paiement
CREATE UNIQUE INDEX IF NOT EXISTS uniq_payments_psp_reference
  ON payments(psp_reference) WHERE psp_reference IS NOT NULL;

-- Élargir les méthodes acceptées : ajout du remboursement (refunded) tracé côté règlement
-- (le statut d'échéance reste pending|paid|late ; un remboursement est un évènement métier)
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_method_check
  CHECK (method IN ('wave', 'orange_money', 'cash', 'psp'));

CREATE INDEX IF NOT EXISTS idx_rent_schedules_payment_link_ref
  ON rent_schedules(payment_link_ref) WHERE payment_link_ref IS NOT NULL;
