-- =====================================================
-- CRÉATION DE PROJETS DE TEST
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- Insérer des projets avec les bons statuts
INSERT INTO projects (
  name,
  description,
  client_company_id,
  status,
  budget,
  owner_id,
  start_date,
  end_date
) VALUES 
(
  'Migration Cloud AWS',
  'Migration complète de l''infrastructure vers AWS avec optimisation des coûts',
  'c0000000-0000-0000-0000-000000000001',
  'in_progress', -- ou le statut valide pour "en cours"
  75000,
  'f68bb452-c4f9-4594-9657-b75d34b82c6b', -- ID de l'utilisateur admin
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '60 days'
),
(
  'Développement App Mobile',
  'Application mobile React Native pour les clients B2C',
  'c0000000-0000-0000-0000-000000000001',
  'pending', -- ou le statut valide pour "en attente"
  50000,
  'f68bb452-c4f9-4594-9657-b75d34b82c6b',
  CURRENT_DATE + INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '120 days'
),
(
  'Refonte Site Web',
  'Nouveau site avec CMS headless et optimisation SEO',
  'c0000000-0000-0000-0000-000000000001',
  'in_progress',
  35000,
  'f68bb452-c4f9-4594-9657-b75d34b82c6b',
  CURRENT_DATE - INTERVAL '45 days',
  CURRENT_DATE + INTERVAL '15 days'
);

-- Vérifier les projets créés
SELECT 
  id,
  name,
  status,
  budget,
  start_date,
  end_date
FROM projects 
WHERE client_company_id = 'c0000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC;

-- Pour voir les statuts valides, exécutez :
-- SELECT conname, consrc 
-- FROM pg_constraint 
-- WHERE conname = 'projects_status_check';