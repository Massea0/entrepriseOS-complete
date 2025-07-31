-- Ajout de données de test pour la structure RH

-- 1. Créer des branches (filiales)
INSERT INTO public.branches (id, name, code, city, country, address, phone, email, status, is_headquarters, created_at, updated_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'Siège Social Dakar', 'HQ-DKR', 'Dakar', 'SN', 'Plateau, Avenue Léopold Sédar Senghor', '+221 33 823 45 67', 'siege@arcadis.tech', 'active', true, now(), now()),
('bb0e8400-e29b-41d4-a716-446655440002', 'Agence Casablanca', 'AG-CASA', 'Casablanca', 'MA', 'Quartier des Affaires, Twin Center', '+212 522 48 97 65', 'casa@arcadis.tech', 'active', false, now(), now()),
('bb0e8400-e29b-41d4-a716-446655440003', 'Bureau Abidjan', 'BUR-ABJ', 'Abidjan', 'CI', 'Plateau, Boulevard Lagunaire', '+225 27 20 25 30 40', 'abidjan@arcadis.tech', 'active', false, now(), now());

-- 2. Créer des départements
INSERT INTO public.departments (id, name, code, description, branch_id, status, created_at, updated_at) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'Direction Générale', 'DG', 'Direction Générale et Management Exécutif', 'bb0e8400-e29b-41d4-a716-446655440001', 'active', now(), now()),
('dd0e8400-e29b-41d4-a716-446655440002', 'Développement Logiciel', 'DEV', 'Équipe de développement et ingénierie logiciel', 'bb0e8400-e29b-41d4-a716-446655440001', 'active', now(), now()),
('dd0e8400-e29b-41d4-a716-446655440003', 'Ressources Humaines', 'RH', 'Gestion des ressources humaines et recrutement', 'bb0e8400-e29b-41d4-a716-446655440001', 'active', now(), now()),
('dd0e8400-e29b-41d4-a716-446655440004', 'Commercial & Marketing', 'COM', 'Équipe commerciale et marketing digital', 'bb0e8400-e29b-41d4-a716-446655440001', 'active', now(), now()),
('dd0e8400-e29b-41d4-a716-446655440005', 'Finance & Comptabilité', 'FIN', 'Gestion financière et comptabilité', 'bb0e8400-e29b-41d4-a716-446655440001', 'active', now(), now());

-- 3. Créer des postes
INSERT INTO public.positions (id, title, code, description, department_id, branch_id, level, salary_min, salary_max, required_skills, status, created_at, updated_at) VALUES
('pp0e8400-e29b-41d4-a716-446655440001', 'Directeur Général', 'DG-001', 'Direction générale de l''entreprise', 'dd0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 5, 5000000, 8000000, '["Leadership", "Stratégie", "Management"]', 'active', now(), now()),
('pp0e8400-e29b-41d4-a716-446655440002', 'Lead Developer Full Stack', 'DEV-001', 'Développeur senior et chef d''équipe technique', 'dd0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440001', 4, 2500000, 4000000, '["React", "Node.js", "TypeScript", "Leadership", "Architecture"]', 'active', now(), now()),
('pp0e8400-e29b-41d4-a716-446655440003', 'Développeur Full Stack Senior', 'DEV-002', 'Développement d''applications web et mobile', 'dd0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440001', 3, 1800000, 2800000, '["React", "Node.js", "PostgreSQL", "AWS"]', 'active', now(), now()),
('pp0e8400-e29b-41d4-a716-446655440004', 'Développeur Frontend', 'DEV-003', 'Spécialiste interfaces utilisateur', 'dd0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440001', 2, 1200000, 2000000, '["React", "TypeScript", "CSS", "UI/UX"]', 'active', now(), now()),
('pp0e8400-e29b-41d4-a716-446655440005', 'Responsable RH', 'RH-001', 'Gestion des ressources humaines', 'dd0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', 3, 1500000, 2500000, '["RH", "Recrutement", "Paie", "Droit du travail"]', 'active', now(), now()),
('pp0e8400-e29b-41d4-a716-446655440006', 'Directeur Commercial', 'COM-001', 'Direction commerciale et développement business', 'dd0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440001', 4, 2000000, 3500000, '["Vente", "Négociation", "CRM", "Management"]', 'active', now(), now()),
('pp0e8400-e29b-41d4-a716-446655440007', 'Chargé de Clientèle', 'COM-002', 'Gestion et suivi de la clientèle', 'dd0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440001', 2, 800000, 1500000, '["Relation client", "CRM", "Communication"]', 'active', now(), now()),
('pp0e8400-e29b-41d4-a716-446655440008', 'Responsable Financier', 'FIN-001', 'Gestion financière et comptable', 'dd0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', 3, 1800000, 2800000, '["Comptabilité", "Finance", "Audit", "Fiscalité"]', 'active', now(), now());

-- 4. Créer des employés réalistes
INSERT INTO public.employees (
    id, employee_number, first_name, last_name, user_id, 
    department_id, position_id, branch_id, manager_id,
    hire_date, start_date, current_salary, employment_status,
    work_email, personal_phone, skills, performance_score,
    created_at, updated_at
) VALUES

-- Direction
('ee0e8400-e29b-41d4-a716-446655440001', 'EMP-001', 'Massamba', 'Diouf', '05abd360-84e0-44a9-b708-1537ec50b6cc', 'dd0e8400-e29b-41d4-a716-446655440001', 'pp0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', NULL, '2020-01-15', '2020-01-15', 6500000, 'active', 'mdiouf@arcadis.tech', '+221 77 123 45 67', '["Leadership", "Stratégie", "Innovation", "Management"]', 4.8, now(), now()),

-- Équipe Développement
('ee0e8400-e29b-41d4-a716-446655440002', 'EMP-002', 'Amadou', 'Ba', NULL, 'dd0e8400-e29b-41d4-a716-446655440002', 'pp0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', '2020-03-01', '2020-03-01', 3200000, 'active', 'aba@arcadis.tech', '+221 77 234 56 78', '["React", "Node.js", "TypeScript", "Leadership", "DevOps"]', 4.6, now(), now()),

('ee0e8400-e29b-41d4-a716-446655440003', 'EMP-003', 'Fatou', 'Sow', NULL, 'dd0e8400-e29b-41d4-a716-446655440002', 'pp0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440002', '2021-01-15', '2021-01-15', 2300000, 'active', 'fsow@arcadis.tech', '+221 77 345 67 89', '["React", "Node.js", "PostgreSQL", "AWS", "Docker"]', 4.4, now(), now()),

('ee0e8400-e29b-41d4-a716-446655440004', 'EMP-004', 'Ousmane', 'Diallo', NULL, 'dd0e8400-e29b-41d4-a716-446655440002', 'pp0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440002', '2021-06-01', '2021-06-01', 2100000, 'active', 'odiallo@arcadis.tech', '+221 77 456 78 90', '["React", "Node.js", "MongoDB", "GraphQL"]', 4.2, now(), now()),

('ee0e8400-e29b-41d4-a716-446655440005', 'EMP-005', 'Aissatou', 'Ndiaye', NULL, 'dd0e8400-e29b-41d4-a716-446655440002', 'pp0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440002', '2022-02-01', '2022-02-01', 1600000, 'active', 'andiaye@arcadis.tech', '+221 77 567 89 01', '["React", "TypeScript", "CSS", "Figma", "UI/UX"]', 4.3, now(), now()),

('ee0e8400-e29b-41d4-a716-446655440006', 'EMP-006', 'Cheikh', 'Fall', NULL, 'dd0e8400-e29b-41d4-a716-446655440002', 'pp0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440002', '2022-09-15', '2022-09-15', 1400000, 'active', 'cfall@arcadis.tech', '+221 77 678 90 12', '["Vue.js", "JavaScript", "SASS", "Webpack"]', 4.0, now(), now()),

-- Équipe RH
('ee0e8400-e29b-41d4-a716-446655440007', 'EMP-007', 'Mariama', 'Cisse', NULL, 'dd0e8400-e29b-41d4-a716-446655440003', 'pp0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', '2020-06-01', '2020-06-01', 2000000, 'active', 'mcisse@arcadis.tech', '+221 77 789 01 23', '["RH", "Recrutement", "Paie", "Formation", "Droit du travail"]', 4.5, now(), now()),

-- Équipe Commerciale
('ee0e8400-e29b-41d4-a716-446655440008', 'EMP-008', 'Ibrahima', 'Sarr', NULL, 'dd0e8400-e29b-41d4-a716-446655440004', 'pp0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', '2020-08-15', '2020-08-15', 2800000, 'active', 'isarr@arcadis.tech', '+221 77 890 12 34', '["Vente", "Négociation", "CRM", "Management", "Business Development"]', 4.7, now(), now()),

('ee0e8400-e29b-41d4-a716-446655440009', 'EMP-009', 'Coumba', 'Gueye', NULL, 'dd0e8400-e29b-41d4-a716-446655440004', 'pp0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440008', '2021-04-01', '2021-04-01', 1200000, 'active', 'cgueye@arcadis.tech', '+221 77 901 23 45', '["Relation client", "CRM", "Communication", "Suivi commercial"]', 4.1, now(), now()),

('ee0e8400-e29b-41d4-a716-446655440010', 'EMP-010', 'Moussa', 'Kane', NULL, 'dd0e8400-e29b-41d4-a716-446655440004', 'pp0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440008', '2021-11-01', '2021-11-01', 1100000, 'active', 'mkane@arcadis.tech', '+221 77 012 34 56', '["Prospection", "Télémarketing", "CRM", "Lead Generation"]', 3.9, now(), now()),

-- Équipe Finance
('ee0e8400-e29b-41d4-a716-446655440011', 'EMP-011', 'Khadija', 'Diop', NULL, 'dd0e8400-e29b-41d4-a716-446655440005', 'pp0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', '2021-03-15', '2021-03-15', 2200000, 'active', 'kdiop@arcadis.tech', '+221 77 123 45 89', '["Comptabilité", "Finance", "Audit", "Fiscalité", "Contrôle de gestion"]', 4.4, now(), now()),

-- Employés à Casablanca
('ee0e8400-e29b-41d4-a716-446655440012', 'EMP-012', 'Youssef', 'Benali', NULL, 'dd0e8400-e29b-41d4-a716-446655440002', 'pp0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440002', 'ee0e8400-e29b-41d4-a716-446655440002', '2022-01-10', '2022-01-10', 2000000, 'active', 'ybenali@arcadis.tech', '+212 661 23 45 67', '["React", "Laravel", "MySQL", "Docker"]', 4.1, now(), now()),

-- Employés à Abidjan  
('ee0e8400-e29b-41d4-a716-446655440013', 'EMP-013', 'Aya', 'Kouame', NULL, 'dd0e8400-e29b-41d4-a716-446655440004', 'pp0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440003', 'ee0e8400-e29b-41d4-a716-446655440008', '2022-05-01', '2022-05-01', 900000, 'active', 'akouame@arcadis.tech', '+225 07 12 34 56 78', '["Relation client", "Marketing digital", "Réseaux sociaux"]', 4.0, now(), now());

-- Mettre à jour les managers dans les départements
UPDATE public.departments SET manager_id = 'ee0e8400-e29b-41d4-a716-446655440002' WHERE id = 'dd0e8400-e29b-41d4-a716-446655440002';
UPDATE public.departments SET manager_id = 'ee0e8400-e29b-41d4-a716-446655440007' WHERE id = 'dd0e8400-e29b-41d4-a716-446655440003';
UPDATE public.departments SET manager_id = 'ee0e8400-e29b-41d4-a716-446655440008' WHERE id = 'dd0e8400-e29b-41d4-a716-446655440004';
UPDATE public.departments SET manager_id = 'ee0e8400-e29b-41d4-a716-446655440011' WHERE id = 'dd0e8400-e29b-41d4-a716-446655440005';