-- Phase 10c — Couche sociale : micro-assurance (CMU) + formation/badges

CREATE TABLE IF NOT EXISTS insurance_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('cmu','micro_sante','accident','autre')),
  provider_name TEXT,
  reference TEXT,
  monthly_fcfa INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
  enrolled_at DATE,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE insurance_enrollments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ins_profile ON insurance_enrollments(profile_id);
CREATE POLICY ins_self_all ON insurance_enrollments FOR ALL TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON insurance_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS training_modules (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  badge_label TEXT,
  sort_order INT DEFAULT 0
);
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tm_read ON training_modules FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS training_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL REFERENCES training_modules(key) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id, module_key)
);
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tp_profile ON training_progress(profile_id);
CREATE POLICY tp_self_all ON training_progress FOR ALL TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE TRIGGER set_updated_at BEFORE UPDATE ON training_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO training_modules(key, title, description, category, badge_label, sort_order) VALUES
 ('secu_chantier','Sécurité sur chantier','Bonnes pratiques de sécurité et d''équipement pour les artisans.','prestataire','Sécurité ★',1),
 ('relation_client','Relation client','Communication, ponctualité et satisfaction client.','prestataire','Pro du service ★',2),
 ('gestion_locative','Bases de la gestion locative','Droits et devoirs du propriétaire au Sénégal.','proprietaire','Proprio averti ★',3),
 ('droits_locataire','Droits du locataire','Connaître ses droits, son bail et ses recours.','locataire','Locataire informé ★',4)
ON CONFLICT (key) DO NOTHING;
