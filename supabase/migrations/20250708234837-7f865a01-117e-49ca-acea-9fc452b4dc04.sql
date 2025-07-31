-- Phase 2: Créer des projets réalistes avec statuts corrects

INSERT INTO public.projects (id, name, description, status, start_date, end_date, budget, client_company_id, owner_id, created_at) VALUES 

-- Projets Orange Sénégal
('660e8400-e29b-41d4-a716-446655440001', 'Transformation Digitale Orange Money', 'Modernisation complète de la plateforme Orange Money avec nouvelles fonctionnalités', 'in_progress', '2024-01-15', '2024-12-31', 850000000.00, '550e8400-e29b-41d4-a716-446655440001', '05abd360-84e0-44a9-b708-1537ec50b6cc', now() - interval '6 months'),
('660e8400-e29b-41d4-a716-446655440002', 'App Mobile Orange Sénégal V3', 'Refonte complète de l''application mobile avec interface utilisateur modernisée', 'planning', '2024-06-01', '2024-11-30', 420000000.00, '550e8400-e29b-41d4-a716-446655440001', '05abd360-84e0-44a9-b708-1537ec50b6cc', now() - interval '3 months'),

-- Projets Sonatel
('660e8400-e29b-41d4-a716-446655440003', 'Portal Enterprise Sonatel', 'Développement d''un portail entreprise pour gestion des services B2B', 'in_progress', '2024-02-01', '2024-10-31', 650000000.00, '550e8400-e29b-41d4-a716-446655440002', '05abd360-84e0-44a9-b708-1537ec50b6cc', now() - interval '5 months'),
('660e8400-e29b-41d4-a716-446655440004', 'Migration Cloud Infrastructure', 'Migration des services vers une infrastructure cloud hybride', 'completed', '2023-08-01', '2024-03-31', 980000000.00, '550e8400-e29b-41d4-a716-446655440002', '05abd360-84e0-44a9-b708-1537ec50b6cc', now() - interval '8 months'),

-- Projets CBAO
('660e8400-e29b-41d4-a716-446655440005', 'CBAO Digital Banking Platform', 'Plateforme bancaire numérique avec services en ligne avancés', 'in_progress', '2024-03-01', '2025-02-28', 1200000000.00, '550e8400-e29b-41d4-a716-446655440003', '05abd360-84e0-44a9-b708-1537ec50b6cc', now() - interval '4 months'),
('660e8400-e29b-41d4-a716-446655440006', 'Système Crédit Immobilier', 'Application de gestion des crédits immobiliers avec IA', 'planning', '2024-07-01', '2024-12-31', 780000000.00, '550e8400-e29b-41d4-a716-446655440003', '05abd360-84e0-44a9-b708-1537ec50b6cc', now() - interval '2 months'),

-- Projets Total Sénégal
('660e8400-e29b-41d4-a716-446655440007', 'Total Fleet Management System', 'Système de gestion de flotte avec géolocalisation temps réel', 'in_progress', '2024-04-01', '2024-09-30', 520000000.00, '550e8400-e29b-41d4-a716-446655440004', '05abd360-84e0-44a9-b708-1537ec50b6cc', now() - interval '3 months'),

-- Projets Sococim
('660e8400-e29b-41d4-a716-446655440008', 'Sococim Production Analytics', 'Système d''analyse de production avec tableaux de bord IA', 'in_progress', '2024-05-01', '2024-11-30', 680000000.00, '550e8400-e29b-41d4-a716-446655440005', '05abd360-84e0-44a9-b708-1537ec50b6cc', now() - interval '2 months'),

-- Projets CSS
('660e8400-e29b-41d4-a716-446655440009', 'CSS Supply Chain Optimization', 'Optimisation de la chaîne d''approvisionnement avec IA prédictive', 'planning', '2024-08-01', '2025-01-31', 890000000.00, '550e8400-e29b-41d4-a716-446655440006', '05abd360-84e0-44a9-b708-1537ec50b6cc', now() - interval '1 month');