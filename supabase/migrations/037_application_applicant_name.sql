-- Phase 9b (fix) — nom du candidat dénormalisé (RLS profiles masque les noms des tiers
-- au propriétaire). Rempli à la candidature depuis le profil du candidat.
ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_name TEXT;
