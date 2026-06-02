-- Phase 0 — Table profiles : identité canonique de TOUT compte auth.
-- Coexiste avec users (personnel B2B). Rôles consommateur : tenant/provider/seeker.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Utilisateur',
  role TEXT NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner', 'tenant', 'provider', 'seeker', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  country TEXT NOT NULL DEFAULT 'SN',
  kyc_status TEXT NOT NULL DEFAULT 'none'
    CHECK (kyc_status IN ('none', 'pending', 'verified', 'rejected')),
  geo GEOGRAPHY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_geo ON profiles USING GIST (geo);

-- updated_at (réutilise la fonction existante créée en migration 016)
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Helper anti-récursion : détecte un admin sans déclencher la RLS de profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- RLS : chacun gère son profil ; les admins lisent tout (KYC en phase 5)
CREATE POLICY "profiles_select_own_or_admin" ON profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_self" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own_or_admin" ON profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- Création automatique du profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Utilisateur'),
    NEW.phone
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill : un profil pour chaque compte auth déjà existant (owners B2B en prod)
INSERT INTO public.profiles (id, full_name, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Utilisateur'),
  'owner'
FROM auth.users au
ON CONFLICT (id) DO NOTHING;
