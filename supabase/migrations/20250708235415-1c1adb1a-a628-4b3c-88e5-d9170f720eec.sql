-- Phase 5: Créer des tâches réalistes pour les projets

INSERT INTO public.tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at, position) VALUES 

-- Tâches pour Transformation Orange Money
('990e8400-e29b-41d4-a716-446655440001', 'Analyse des besoins fonctionnels', 'Analyser les besoins métier pour la transformation d''Orange Money', 'completed', 'high', '660e8400-e29b-41d4-a716-446655440001', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-02-15', now() - interval '6 months', now() - interval '5 months', 1),
('990e8400-e29b-41d4-a716-446655440002', 'Conception architecture technique', 'Définir l''architecture technique de la nouvelle plateforme', 'completed', 'high', '660e8400-e29b-41d4-a716-446655440001', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-03-01', now() - interval '5 months', now() - interval '4 months', 2),
('990e8400-e29b-41d4-a716-446655440003', 'Développement API paiements', 'Développer les nouvelles API de paiement mobile', 'in_progress', 'high', '660e8400-e29b-41d4-a716-446655440001', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-08-15', now() - interval '3 months', now() - interval '1 week', 3),
('990e8400-e29b-41d4-a716-446655440004', 'Interface utilisateur mobile', 'Refonte complète de l''interface mobile Orange Money', 'pending', 'medium', '660e8400-e29b-41d4-a716-446655440001', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-09-30', now() - interval '2 months', now() - interval '2 months', 4),
('990e8400-e29b-41d4-a716-446655440005', 'Tests de sécurité', 'Effectuer les tests de sécurité et pénétration', 'pending', 'high', '660e8400-e29b-41d4-a716-446655440001', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-11-15', now() - interval '1 month', now() - interval '1 month', 5),

-- Tâches pour App Mobile Orange V3
('990e8400-e29b-41d4-a716-446655440006', 'Maquettes UI/UX', 'Création des maquettes pour la nouvelle version', 'completed', 'medium', '660e8400-e29b-41d4-a716-446655440002', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-07-01', now() - interval '3 months', now() - interval '2 months', 1),
('990e8400-e29b-41d4-a716-446655440007', 'Développement React Native', 'Développement de l''application mobile en React Native', 'in_progress', 'high', '660e8400-e29b-41d4-a716-446655440002', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-10-01', now() - interval '2 months', now() - interval '1 week', 2),

-- Tâches pour Portal Enterprise Sonatel
('990e8400-e29b-41d4-a716-446655440008', 'Analyse des processus B2B', 'Cartographie des processus métier B2B de Sonatel', 'completed', 'high', '660e8400-e29b-41d4-a716-446655440003', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-03-15', now() - interval '4 months', now() - interval '3 months', 1),
('990e8400-e29b-41d4-a716-446655440009', 'Développement portail web', 'Développement du portail entreprise responsive', 'in_progress', 'high', '660e8400-e29b-41d4-a716-446655440003', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-09-01', now() - interval '3 months', now() - interval '1 week', 2),
('990e8400-e29b-41d4-a716-446655440010', 'Intégration systèmes existants', 'Intégrer le portail avec les systèmes Sonatel existants', 'pending', 'medium', '660e8400-e29b-41d4-a716-446655440003', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-10-15', now() - interval '2 months', now() - interval '2 months', 3),

-- Tâches pour CBAO Digital Banking
('990e8400-e29b-41d4-a716-446655440011', 'Audit sécurité bancaire', 'Audit complet des exigences de sécurité bancaire', 'completed', 'critical', '660e8400-e29b-41d4-a716-446655440005', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-04-01', now() - interval '3 months', now() - interval '2 months', 1),
('990e8400-e29b-41d4-a716-446655440012', 'Développement Core Banking API', 'APIs pour les services bancaires core', 'in_progress', 'critical', '660e8400-e29b-41d4-a716-446655440005', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-10-01', now() - interval '2 months', now() - interval '1 week', 2),
('990e8400-e29b-41d4-a716-446655440013', 'Interface client web', 'Développement de l''interface web pour les clients', 'pending', 'high', '660e8400-e29b-41d4-a716-446655440005', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-12-01', now() - interval '1 month', now() - interval '1 month', 3),

-- Tâches pour Total Fleet Management
('990e8400-e29b-41d4-a716-446655440014', 'Intégration GPS tracking', 'Intégration des systèmes de géolocalisation', 'in_progress', 'high', '660e8400-e29b-41d4-a716-446655440007', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-08-15', now() - interval '2 months', now() - interval '1 week', 1),
('990e8400-e29b-41d4-a716-446655440015', 'Dashboard temps réel', 'Développement du tableau de bord temps réel', 'pending', 'medium', '660e8400-e29b-41d4-a716-446655440007', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-09-15', now() - interval '1 month', now() - interval '1 month', 2),

-- Tâches pour Sococim Production Analytics
('990e8400-e29b-41d4-a716-446655440016', 'Collecte données production', 'Mise en place de la collecte de données IoT', 'completed', 'high', '660e8400-e29b-41d4-a716-446655440008', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-06-15', now() - interval '1 month', now() - interval '2 weeks', 1),
('990e8400-e29b-41d4-a716-446655440017', 'Algorithmes prédictifs IA', 'Développement des modèles d''IA prédictive', 'in_progress', 'high', '660e8400-e29b-41d4-a716-446655440008', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-09-30', now() - interval '2 weeks', now() - interval '3 days', 2),
('990e8400-e29b-41d4-a716-446655440018', 'Dashboard analytics', 'Interface de visualisation des analytics', 'pending', 'medium', '660e8400-e29b-41d4-a716-446655440008', '05abd360-84e0-44a9-b708-1537ec50b6cc', '2024-11-01', now() - interval '1 week', now() - interval '1 week', 3);