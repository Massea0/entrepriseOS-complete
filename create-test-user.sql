-- =====================================================
-- CRÉATION D'UN UTILISATEUR DE TEST
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. Créer une company de test (si elle n'existe pas)
INSERT INTO companies (
  id,
  name,
  domain,
  industry,
  size,
  billing_plan,
  subscription_status
) VALUES (
  'b1234567-1234-1234-1234-123456789012',
  'Demo Company',
  'demo.entrepriseos.com',
  'Technology',
  'sme',
  'pro',
  'active'
) ON CONFLICT (domain) DO NOTHING;

-- 2. Créer l'utilisateur via Supabase Auth
-- NOTE: Vous devez utiliser Supabase Dashboard > Authentication > Users > Create User
-- Email: admin@entrepriseos.com
-- Password: AdminPass123!

-- 3. Une fois l'utilisateur créé, récupérez son ID et exécutez ceci:
-- Remplacez 'USER_ID_FROM_SUPABASE' par l'ID réel de l'utilisateur

/*
INSERT INTO profiles (
  id,
  company_id,
  email,
  first_name,
  last_name,
  role,
  onboarding_completed,
  status
) VALUES (
  'USER_ID_FROM_SUPABASE', -- Remplacez par l'ID réel
  'b1234567-1234-1234-1234-123456789012',
  'admin@entrepriseos.com',
  'Admin',
  'User',
  'admin',
  true,
  'active'
) ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  role = EXCLUDED.role,
  onboarding_completed = EXCLUDED.onboarding_completed,
  status = EXCLUDED.status;
*/

-- 4. Créer quelques projets de test
INSERT INTO projects (
  company_id,
  name,
  description,
  status,
  priority,
  budget,
  progress,
  manager_id
) VALUES 
(
  'b1234567-1234-1234-1234-123456789012',
  'Projet CRM - Phase 1',
  'Implémentation du module CRM avec gestion des leads et pipeline',
  'active',
  'high',
  45000,
  65,
  null -- Sera mis à jour avec l'ID de l'admin
),
(
  'b1234567-1234-1234-1234-123456789012',
  'Migration Cloud',
  'Migration de l\'infrastructure vers AWS',
  'planning',
  'medium',
  25000,
  20,
  null
),
(
  'b1234567-1234-1234-1234-123456789012',
  'Refonte Site Web',
  'Nouvelle version du site corporate',
  'completed',
  'low',
  15000,
  100,
  null
);

-- 5. Vérifier les données
SELECT 
  'Companies' as table_name, 
  COUNT(*) as count 
FROM companies
WHERE name = 'Demo Company'

UNION ALL

SELECT 
  'Projects' as table_name, 
  COUNT(*) as count 
FROM projects
WHERE company_id = 'b1234567-1234-1234-1234-123456789012';

-- =====================================================
-- INSTRUCTIONS:
-- 1. Créez d'abord l'utilisateur dans Supabase Dashboard
-- 2. Récupérez son ID
-- 3. Décommentez et modifiez la section INSERT INTO profiles
-- 4. Exécutez le script
-- =====================================================