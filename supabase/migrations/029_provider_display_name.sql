-- Phase 7 (fix) — nom affiché dénormalisé sur provider_profiles.
-- La RLS de profiles (self/admin) empêche les tiers de lire le nom d'un prestataire
-- via jointure ; on stocke donc un display_name lisible publiquement (table déjà
-- en lecture publique pour les prestataires vérifiés).
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
UPDATE provider_profiles pp SET display_name = p.full_name
  FROM profiles p WHERE p.id = pp.id AND (pp.display_name IS NULL OR pp.display_name = '');
