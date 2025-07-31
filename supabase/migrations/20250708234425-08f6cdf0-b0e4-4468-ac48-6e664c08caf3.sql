-- Génération de données test réalistes pour Enterprise OS Genesis Framework
-- Phase 1: Structure organisationnelle et utilisateurs

-- Insérer des entreprises clientes réalistes
INSERT INTO public.companies (id, name, email, phone, address, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Orange Sénégal', 'contact@orange.sn', '+221 800 00 12 12', 'Rue 9, Immeuble Fahd, Almadies, Dakar', now() - interval '2 years'),
('550e8400-e29b-41d4-a716-446655440002', 'Sonatel Group', 'info@sonatel.sn', '+221 800 00 11 11', 'Boulevard du Sud, BP 69, Dakar', now() - interval '18 months'),
('550e8400-e29b-41d4-a716-446655440003', 'CBAO Attijariwafa Bank', 'contact@cbao.sn', '+221 33 889 10 10', 'Place de l''Indépendance, Dakar', now() - interval '1 year'),
('550e8400-e29b-41d4-a716-446655440004', 'Total Sénégal', 'info@total.sn', '+221 33 849 95 95', 'Rue Huart, Plateau, Dakar', now() - interval '8 months'),
('550e8400-e29b-41d4-a716-446655440005', 'Sococim Industries', 'contact@sococim.sn', '+221 33 957 19 19', 'Km 15, Route de Rufisque, Dakar', now() - interval '6 months'),
('550e8400-e29b-41d4-a716-446655440006', 'Compagnie Sucrière Sénégalaise', 'info@css.sn', '+221 33 955 10 10', 'Richard-Toll, Saint-Louis', now() - interval '4 months');

-- Insérer des utilisateurs réalistes avec différents rôles
INSERT INTO public.users (id, email, role, first_name, last_name, company_id, is_active, created_at) VALUES 
-- Admins Arcadis
('05abd360-84e0-44a9-b708-1537ec50b6cc', 'mdiouf@arcadis.tech', 'admin', 'Mamadou', 'Diouf', null, true, now() - interval '2 years'),
('15abd360-84e0-44a9-b708-1537ec50b6cc', 'afall@arcadis.tech', 'admin', 'Aminata', 'Fall', null, true, now() - interval '2 years'),
('25abd360-84e0-44a9-b708-1537ec50b6cc', 'ondiaye@arcadis.tech', 'hr_admin', 'Ousmane', 'Ndiaye', null, true, now() - interval '1 year'),

-- Clients Orange Sénégal
('35abd360-84e0-44a9-b708-1537ec50b6cc', 'directeur@orange.sn', 'client', 'Fatou', 'Sarr', '550e8400-e29b-41d4-a716-446655440001', true, now() - interval '2 years'),
('45abd360-84e0-44a9-b708-1537ec50b6cc', 'projet@orange.sn', 'client', 'Moussa', 'Ba', '550e8400-e29b-41d4-a716-446655440001', true, now() - interval '2 years'),

-- Clients Sonatel
('55abd360-84e0-44a9-b708-1537ec50b6cc', 'dg@sonatel.sn', 'client', 'Awa', 'Gueye', '550e8400-e29b-41d4-a716-446655440002', true, now() - interval '18 months'),
('65abd360-84e0-44a9-b708-1537ec50b6cc', 'tech@sonatel.sn', 'client', 'Ibrahima', 'Sow', '550e8400-e29b-41d4-a716-446655440002', true, now() - interval '18 months'),

-- Clients CBAO
('75abd360-84e0-44a9-b708-1537ec50b6cc', 'dsi@cbao.sn', 'client', 'Mariama', 'Diallo', '550e8400-e29b-41d4-a716-446655440003', true, now() - interval '1 year'),
('85abd360-84e0-44a9-b708-1537ec50b6cc', 'projet@cbao.sn', 'client', 'Cheikh', 'Diop', '550e8400-e29b-41d4-a716-446655440003', true, now() - interval '1 year'),

-- Clients Total
('95abd360-84e0-44a9-b708-1537ec50b6cc', 'it@total.sn', 'client', 'Khady', 'Kane', '550e8400-e29b-41d4-a716-446655440004', true, now() - interval '8 months'),

-- Clients Sococim
('a5abd360-84e0-44a9-b708-1537ec50b6cc', 'digital@sococim.sn', 'client', 'Babacar', 'Thiam', '550e8400-e29b-41d4-a716-446655440005', true, now() - interval '6 months'),

-- Clients CSS
('b5abd360-84e0-44a9-b708-1537ec50b6cc', 'informatique@css.sn', 'client', 'Aissatou', 'Mbaye', '550e8400-e29b-41d4-a716-446655440006', true, now() - interval '4 months'),

-- Employés Arcadis
('c5abd360-84e0-44a9-b708-1537ec50b6cc', 'developer1@arcadis.tech', 'employee', 'Modou', 'Faye', null, true, now() - interval '1 year'),
('d5abd360-84e0-44a9-b708-1537ec50b6cc', 'developer2@arcadis.tech', 'employee', 'Coumba', 'Sy', null, true, now() - interval '1 year'),
('e5abd360-84e0-44a9-b708-1537ec50b6cc', 'designer@arcadis.tech', 'employee', 'Momar', 'Ndoye', null, true, now() - interval '8 months'),
('f5abd360-84e0-44a9-b708-1537ec50b6cc', 'pm@arcadis.tech', 'employee', 'Binta', 'Camara', null, true, now() - interval '8 months');