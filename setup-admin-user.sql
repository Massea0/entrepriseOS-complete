-- =====================================================
-- SCRIPT COMPLET DE CONFIGURATION UTILISATEUR ADMIN
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. NETTOYAGE DES DONNÉES EXISTANTES
-- ===================================

-- Supprimer les projets existants
DELETE FROM projects WHERE company_id IN (
  SELECT id FROM companies WHERE domain = 'demo.entrepriseos.com'
);

-- Supprimer les profiles existants
DELETE FROM profiles WHERE email = 'admin@entrepriseos.com';

-- Supprimer les companies existantes
DELETE FROM companies WHERE domain = 'demo.entrepriseos.com';

-- 2. CRÉER LA COMPANY
-- ===================
INSERT INTO companies (
  id,
  name,
  domain,
  industry,
  size,
  billing_plan,
  subscription_status,
  settings
) VALUES (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'EntrepriseOS Demo',
  'demo.entrepriseos.com',
  'Technology',
  'sme',
  'pro',
  'active',
  '{"theme": "light", "language": "fr"}'::jsonb
);

-- 3. NOTE IMPORTANTE POUR L'UTILISATEUR
-- =====================================
-- AVANT de continuer, vous devez :
-- 1. Aller dans Authentication > Users
-- 2. Créer un nouvel utilisateur avec :
--    Email: admin@entrepriseos.com
--    Password: AdminPass123!
-- 3. Copier l'ID de l'utilisateur créé
-- 4. Remplacer 'REMPLACER_PAR_USER_ID' ci-dessous par cet ID

-- 4. CRÉER LE PROFIL (après avoir créé l'utilisateur)
-- ==================================================
-- DÉCOMMENTEZ ET MODIFIEZ CETTE SECTION :

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
  'REMPLACER_PAR_USER_ID'::uuid, -- ⚠️ REMPLACER PAR L'ID RÉEL
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'admin@entrepriseos.com',
  'Admin',
  'EntrepriseOS',
  'admin',
  true,
  'active'
) ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  onboarding_completed = EXCLUDED.onboarding_completed,
  status = EXCLUDED.status;
*/

-- 5. CRÉER DES PROJETS DE DÉMONSTRATION
-- =====================================
-- DÉCOMMENTEZ CETTE SECTION APRÈS AVOIR CRÉÉ LE PROFIL :

/*
INSERT INTO projects (
  company_id,
  name,
  description,
  status,
  priority,
  budget,
  progress,
  manager_id,
  tags,
  start_date,
  end_date
) VALUES 
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Migration Cloud AWS',
  'Migration complète de l''infrastructure vers AWS avec optimisation des coûts',
  'active',
  'high',
  75000,
  45,
  'REMPLACER_PAR_USER_ID'::uuid, -- ⚠️ REMPLACER
  ARRAY['cloud', 'aws', 'infrastructure', 'devops'],
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '60 days'
),
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Développement App Mobile',
  'Application mobile React Native pour les clients B2C avec notifications push',
  'planning',
  'medium',
  50000,
  20,
  'REMPLACER_PAR_USER_ID'::uuid, -- ⚠️ REMPLACER
  ARRAY['mobile', 'react-native', 'b2c', 'ios', 'android'],
  CURRENT_DATE + INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '120 days'
),
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Refonte Site Web Corporate',
  'Nouveau site avec CMS headless et optimisation SEO',
  'active',
  'high',
  35000,
  70,
  'REMPLACER_PAR_USER_ID'::uuid, -- ⚠️ REMPLACER
  ARRAY['web', 'cms', 'marketing', 'seo', 'nextjs'],
  CURRENT_DATE - INTERVAL '45 days',
  CURRENT_DATE + INTERVAL '15 days'
),
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Implémentation CRM',
  'Déploiement d''un CRM sur mesure avec intégration IA',
  'active',
  'high',
  95000,
  60,
  'REMPLACER_PAR_USER_ID'::uuid, -- ⚠️ REMPLACER
  ARRAY['crm', 'sales', 'ai', 'automation'],
  CURRENT_DATE - INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '30 days'
),
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Audit Sécurité RGPD',
  'Audit complet et mise en conformité RGPD',
  'completed',
  'critical',
  25000,
  100,
  'REMPLACER_PAR_USER_ID'::uuid, -- ⚠️ REMPLACER
  ARRAY['sécurité', 'audit', 'conformité', 'rgpd'],
  CURRENT_DATE - INTERVAL '90 days',
  CURRENT_DATE - INTERVAL '10 days'
),
(
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'Formation Équipe DevOps',
  'Programme de formation Kubernetes et CI/CD',
  'planning',
  'medium',
  15000,
  0,
  'REMPLACER_PAR_USER_ID'::uuid, -- ⚠️ REMPLACER
  ARRAY['formation', 'devops', 'kubernetes', 'ci-cd'],
  CURRENT_DATE + INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '60 days'
);
*/

-- 6. VÉRIFICATION
-- ===============
SELECT 'Company créée:' as info, COUNT(*) as count 
FROM companies 
WHERE domain = 'demo.entrepriseos.com';

-- Pour vérifier après avoir créé le profil :
-- SELECT 'Profil créé:' as info, COUNT(*) as count 
-- FROM profiles 
-- WHERE email = 'admin@entrepriseos.com';

-- Pour vérifier après avoir créé les projets :
-- SELECT 'Projets créés:' as info, COUNT(*) as count 
-- FROM projects 
-- WHERE company_id = 'c0000000-0000-0000-0000-000000000001'::uuid;