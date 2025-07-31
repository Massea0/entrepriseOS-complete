-- Génération de données test réalistes pour Enterprise OS Genesis Framework
-- Phase 1: Créer les entreprises clientes réalistes

INSERT INTO public.companies (id, name, email, phone, address, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Orange Sénégal', 'contact@orange.sn', '+221 800 00 12 12', 'Rue 9, Immeuble Fahd, Almadies, Dakar', now() - interval '2 years'),
('550e8400-e29b-41d4-a716-446655440002', 'Sonatel Group', 'info@sonatel.sn', '+221 800 00 11 11', 'Boulevard du Sud, BP 69, Dakar', now() - interval '18 months'),
('550e8400-e29b-41d4-a716-446655440003', 'CBAO Attijariwafa Bank', 'contact@cbao.sn', '+221 33 889 10 10', 'Place de l''Indépendance, Dakar', now() - interval '1 year'),
('550e8400-e29b-41d4-a716-446655440004', 'Total Sénégal', 'info@total.sn', '+221 33 849 95 95', 'Rue Huart, Plateau, Dakar', now() - interval '8 months'),
('550e8400-e29b-41d4-a716-446655440005', 'Sococim Industries', 'contact@sococim.sn', '+221 33 957 19 19', 'Km 15, Route de Rufisque, Dakar', now() - interval '6 months'),
('550e8400-e29b-41d4-a716-446655440006', 'Compagnie Sucrière Sénégalaise', 'info@css.sn', '+221 33 955 10 10', 'Richard-Toll, Saint-Louis', now() - interval '4 months');