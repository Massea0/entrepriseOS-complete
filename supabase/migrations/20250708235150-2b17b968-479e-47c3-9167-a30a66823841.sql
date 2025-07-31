-- Phase 4: Créer des factures réalistes

INSERT INTO public.invoices (id, number, object, amount, company_id, status, due_date, created_at, paid_at, currency) VALUES 

-- Factures Orange Sénégal
('880e8400-e29b-41d4-a716-446655440001', 'FACT-2024-001', 'Transformation Orange Money - Acompte 30%', 25500000.00, '550e8400-e29b-41d4-a716-446655440001', 'paid', '2024-02-15', now() - interval '5 months', now() - interval '4 months 15 days', 'XOF'),
('880e8400-e29b-41d4-a716-446655440002', 'FACT-2024-002', 'Transformation Orange Money - Facture intermédiaire 40%', 34000000.00, '550e8400-e29b-41d4-a716-446655440001', 'paid', '2024-05-15', now() - interval '2 months', now() - interval '1 month 20 days', 'XOF'),
('880e8400-e29b-41d4-a716-446655440003', 'FACT-2024-003', 'Transformation Orange Money - Solde final 30%', 25500000.00, '550e8400-e29b-41d4-a716-446655440001', 'pending', '2024-08-31', now() - interval '1 week', null, 'XOF'),

-- Factures Sonatel
('880e8400-e29b-41d4-a716-446655440004', 'FACT-2024-004', 'Portal Enterprise - Acompte', 19500000.00, '550e8400-e29b-41d4-a716-446655440002', 'paid', '2024-03-01', now() - interval '4 months', now() - interval '3 months 25 days', 'XOF'),
('880e8400-e29b-41d4-a716-446655440005', 'FACT-2024-005', 'Migration Cloud - Facture finale', 95000000.00, '550e8400-e29b-41d4-a716-446655440002', 'paid', '2024-04-30', now() - interval '2 months', now() - interval '1 month 10 days', 'XOF'),

-- Factures CBAO
('880e8400-e29b-41d4-a716-446655440006', 'FACT-2024-006', 'Digital Banking - Phase 1', 47500000.00, '550e8400-e29b-41d4-a716-446655440003', 'paid', '2024-04-15', now() - interval '3 months', now() - interval '2 months 20 days', 'XOF'),
('880e8400-e29b-41d4-a716-446655440007', 'FACT-2024-007', 'Digital Banking - Phase 2', 47500000.00, '550e8400-e29b-41d4-a716-446655440003', 'pending', '2024-08-15', now() - interval '2 weeks', null, 'XOF'),

-- Factures Total Sénégal
('880e8400-e29b-41d4-a716-446655440008', 'FACT-2024-008', 'Fleet Management - Développement', 52000000.00, '550e8400-e29b-41d4-a716-446655440004', 'pending', '2024-08-30', now() - interval '1 week', null, 'XOF'),

-- Factures Sococim
('880e8400-e29b-41d4-a716-446655440009', 'FACT-2024-009', 'Production Analytics - Acompte', 34000000.00, '550e8400-e29b-41d4-a716-446655440005', 'paid', '2024-06-15', now() - interval '1 month', now() - interval '15 days', 'XOF'),

-- Factures anciennes (historique)
('880e8400-e29b-41d4-a716-446655440010', 'FACT-2023-045', 'Orange - Maintenance annuelle', 12000000.00, '550e8400-e29b-41d4-a716-446655440001', 'paid', '2023-12-31', now() - interval '7 months', now() - interval '6 months 20 days', 'XOF'),
('880e8400-e29b-41d4-a716-446655440011', 'FACT-2023-046', 'Sonatel - Formation équipe', 8500000.00, '550e8400-e29b-41d4-a716-446655440002', 'paid', '2023-11-30', now() - interval '8 months', now() - interval '7 months 15 days', 'XOF');