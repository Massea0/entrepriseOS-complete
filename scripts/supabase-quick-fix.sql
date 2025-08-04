-- Script rapide pour corriger le profil de l'utilisateur admin@entrepriseos.com

-- Créer le profil pour l'utilisateur existant
INSERT INTO public.profiles (id, email, first_name, last_name, status)
SELECT 
  id,
  email,
  'Admin',
  'Enterprise OS',
  'active'
FROM auth.users
WHERE email = 'admin@entrepriseos.com'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  status = EXCLUDED.status,
  updated_at = NOW();