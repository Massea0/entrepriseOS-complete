-- Phase 3: Créer des devis réalistes

INSERT INTO public.devis (id, number, object, amount, original_amount, company_id, status, valid_until, notes, created_at) VALUES 

-- Devis Orange Sénégal
('770e8400-e29b-41d4-a716-446655440001', 'DEV-2024-001', 'Transformation Digitale Orange Money - Phase 1', 850000000.00, 900000000.00, '550e8400-e29b-41d4-a716-446655440001', 'approved', '2024-12-31', 'Négociation réussie avec remise de 50M XOF', now() - interval '6 months'),
('770e8400-e29b-41d4-a716-446655440002', 'DEV-2024-002', 'App Mobile Orange V3 - Développement complet', 420000000.00, 420000000.00, '550e8400-e29b-41d4-a716-446655440001', 'pending', '2024-08-31', 'En cours d''évaluation technique', now() - interval '3 months'),

-- Devis Sonatel
('770e8400-e29b-41d4-a716-446655440003', 'DEV-2024-003', 'Portal Enterprise B2B - Développement', 650000000.00, 720000000.00, '550e8400-e29b-41d4-a716-446655440002', 'approved', '2024-11-30', 'Remise accordée pour client fidèle', now() - interval '5 months'),
('770e8400-e29b-41d4-a716-446655440004', 'DEV-2023-015', 'Migration Cloud Infrastructure', 980000000.00, 980000000.00, '550e8400-e29b-41d4-a716-446655440002', 'approved', '2024-01-31', 'Projet complexe validé rapidement', now() - interval '8 months'),

-- Devis CBAO
('770e8400-e29b-41d4-a716-446655440005', 'DEV-2024-005', 'CBAO Digital Banking - Plateforme complète', 1200000000.00, 1350000000.00, '550e8400-e29b-41d4-a716-446655440003', 'approved', '2025-03-31', 'Négociation longue mais fructueuse', now() - interval '4 months'),
('770e8400-e29b-41d4-a716-446655440006', 'DEV-2024-006', 'Système Crédit Immobilier avec IA', 780000000.00, 780000000.00, '550e8400-e29b-41d4-a716-446655440003', 'pending', '2024-08-15', 'Validation en cours du comité technique', now() - interval '2 months'),

-- Devis Total Sénégal
('770e8400-e29b-41d4-a716-446655440007', 'DEV-2024-007', 'Fleet Management System - Géolocalisation', 520000000.00, 580000000.00, '550e8400-e29b-41d4-a716-446655440004', 'approved', '2024-10-31', 'Remise consentie pour délais serrés', now() - interval '3 months'),

-- Devis Sococim
('770e8400-e29b-41d4-a716-446655440008', 'DEV-2024-008', 'Production Analytics - Tableaux de bord IA', 680000000.00, 680000000.00, '550e8400-e29b-41d4-a716-446655440005', 'approved', '2024-12-31', 'Validation rapide du directeur technique', now() - interval '2 months'),

-- Devis CSS
('770e8400-e29b-41d4-a716-446655440009', 'DEV-2024-009', 'Supply Chain Optimization - IA Prédictive', 890000000.00, 950000000.00, '550e8400-e29b-41d4-a716-446655440006', 'pending', '2024-09-30', 'Négociation en cours avec la direction', now() - interval '1 month'),

-- Devis supplémentaires (prospects)
('770e8400-e29b-41d4-a716-446655440010', 'DEV-2024-010', 'Orange - Module Paiement Marchand', 320000000.00, 320000000.00, '550e8400-e29b-41d4-a716-446655440001', 'draft', '2024-09-15', 'Proposition technique en préparation', now() - interval '2 weeks'),
('770e8400-e29b-41d4-a716-446655440011', 'DEV-2024-011', 'CBAO - Chatbot IA Service Client', 150000000.00, 150000000.00, '550e8400-e29b-41d4-a716-446655440003', 'rejected', '2024-07-31', 'Budget insuffisant côté client', now() - interval '1 month');