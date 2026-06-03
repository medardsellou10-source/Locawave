-- Inscription multi-acteur : le profil prend le rôle choisi à l'inscription
-- (transmis via user_metadata.role), avec garde sur les valeurs autorisées.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'owner');
BEGIN
  IF v_role NOT IN ('owner','tenant','provider','seeker','admin') THEN
    v_role := 'owner';
  END IF;
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Utilisateur'),
    v_role,
    NEW.phone
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
