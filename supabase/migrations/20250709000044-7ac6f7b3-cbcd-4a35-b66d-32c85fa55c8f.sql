-- Ajout de données de test pour la structure RH avec UUIDs auto-générés

-- 1. Créer des branches (filiales)
INSERT INTO public.branches (name, code, city, country, address, phone, email, status, is_headquarters, created_at, updated_at) VALUES
('Siège Social Dakar', 'HQ-DKR', 'Dakar', 'SN', 'Plateau, Avenue Léopold Sédar Senghor', '+221 33 823 45 67', 'siege@arcadis.tech', 'active', true, now(), now()),
('Agence Casablanca', 'AG-CASA', 'Casablanca', 'MA', 'Quartier des Affaires, Twin Center', '+212 522 48 97 65', 'casa@arcadis.tech', 'active', false, now(), now()),
('Bureau Abidjan', 'BUR-ABJ', 'Abidjan', 'CI', 'Plateau, Boulevard Lagunaire', '+225 27 20 25 30 40', 'abidjan@arcadis.tech', 'active', false, now(), now());

-- 2. Créer des départements (en utilisant les IDs générés pour les branches)
INSERT INTO public.departments (name, code, description, branch_id, status, created_at, updated_at) 
SELECT 
    'Direction Générale', 'DG', 'Direction Générale et Management Exécutif', b.id, 'active', now(), now()
FROM public.branches b WHERE b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Développement Logiciel', 'DEV', 'Équipe de développement et ingénierie logiciel', b.id, 'active', now(), now()
FROM public.branches b WHERE b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Ressources Humaines', 'RH', 'Gestion des ressources humaines et recrutement', b.id, 'active', now(), now()
FROM public.branches b WHERE b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Commercial & Marketing', 'COM', 'Équipe commerciale et marketing digital', b.id, 'active', now(), now()
FROM public.branches b WHERE b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Finance & Comptabilité', 'FIN', 'Gestion financière et comptabilité', b.id, 'active', now(), now()
FROM public.branches b WHERE b.code = 'HQ-DKR';

-- 3. Créer des postes
INSERT INTO public.positions (title, code, description, department_id, branch_id, level, salary_min, salary_max, required_skills, status, created_at, updated_at)
SELECT 
    'Directeur Général', 'DG-001', 'Direction générale de l''entreprise', 
    d.id, b.id, 5, 5000000, 8000000, 
    '["Leadership", "Stratégie", "Management"]', 'active', now(), now()
FROM public.departments d, public.branches b 
WHERE d.code = 'DG' AND b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Lead Developer Full Stack', 'DEV-001', 'Développeur senior et chef d''équipe technique', 
    d.id, b.id, 4, 2500000, 4000000, 
    '["React", "Node.js", "TypeScript", "Leadership", "Architecture"]', 'active', now(), now()
FROM public.departments d, public.branches b 
WHERE d.code = 'DEV' AND b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Développeur Full Stack Senior', 'DEV-002', 'Développement d''applications web et mobile', 
    d.id, b.id, 3, 1800000, 2800000, 
    '["React", "Node.js", "PostgreSQL", "AWS"]', 'active', now(), now()
FROM public.departments d, public.branches b 
WHERE d.code = 'DEV' AND b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Développeur Frontend', 'DEV-003', 'Spécialiste interfaces utilisateur', 
    d.id, b.id, 2, 1200000, 2000000, 
    '["React", "TypeScript", "CSS", "UI/UX"]', 'active', now(), now()
FROM public.departments d, public.branches b 
WHERE d.code = 'DEV' AND b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Responsable RH', 'RH-001', 'Gestion des ressources humaines', 
    d.id, b.id, 3, 1500000, 2500000, 
    '["RH", "Recrutement", "Paie", "Droit du travail"]', 'active', now(), now()
FROM public.departments d, public.branches b 
WHERE d.code = 'RH' AND b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Directeur Commercial', 'COM-001', 'Direction commerciale et développement business', 
    d.id, b.id, 4, 2000000, 3500000, 
    '["Vente", "Négociation", "CRM", "Management"]', 'active', now(), now()
FROM public.departments d, public.branches b 
WHERE d.code = 'COM' AND b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Chargé de Clientèle', 'COM-002', 'Gestion et suivi de la clientèle', 
    d.id, b.id, 2, 800000, 1500000, 
    '["Relation client", "CRM", "Communication"]', 'active', now(), now()
FROM public.departments d, public.branches b 
WHERE d.code = 'COM' AND b.code = 'HQ-DKR'
UNION ALL
SELECT 
    'Responsable Financier', 'FIN-001', 'Gestion financière et comptable', 
    d.id, b.id, 3, 1800000, 2800000, 
    '["Comptabilité", "Finance", "Audit", "Fiscalité"]', 'active', now(), now'
FROM public.departments d, public.branches b 
WHERE d.code = 'FIN' AND b.code = 'HQ-DKR';

-- 4. Créer des employés réalistes
INSERT INTO public.employees (
    employee_number, first_name, last_name, user_id, 
    department_id, position_id, branch_id, manager_id,
    hire_date, start_date, current_salary, employment_status,
    work_email, personal_phone, skills, performance_score,
    created_at, updated_at
)
-- Direction Générale
SELECT 
    'EMP-001', 'Massamba', 'Diouf', '05abd360-84e0-44a9-b708-1537ec50b6cc',
    d.id, p.id, b.id, NULL,
    '2020-01-15', '2020-01-15', 6500000, 'active',
    'mdiouf@arcadis.tech', '+221 77 123 45 67', 
    '["Leadership", "Stratégie", "Innovation", "Management"]', 4.8, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'DG' AND p.code = 'DG-001' AND b.code = 'HQ-DKR'
UNION ALL
-- Lead Developer
SELECT 
    'EMP-002', 'Amadou', 'Ba', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-001'),
    '2020-03-01', '2020-03-01', 3200000, 'active',
    'aba@arcadis.tech', '+221 77 234 56 78', 
    '["React", "Node.js", "TypeScript", "Leadership", "DevOps"]', 4.6, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'DEV' AND p.code = 'DEV-001' AND b.code = 'HQ-DKR'
UNION ALL
-- Développeur Senior
SELECT 
    'EMP-003', 'Fatou', 'Sow', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-002'),
    '2021-01-15', '2021-01-15', 2300000, 'active',
    'fsow@arcadis.tech', '+221 77 345 67 89', 
    '["React", "Node.js", "PostgreSQL", "AWS", "Docker"]', 4.4, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'DEV' AND p.code = 'DEV-002' AND b.code = 'HQ-DKR'
UNION ALL
-- Développeur Senior 2
SELECT 
    'EMP-004', 'Ousmane', 'Diallo', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-002'),
    '2021-06-01', '2021-06-01', 2100000, 'active',
    'odiallo@arcadis.tech', '+221 77 456 78 90', 
    '["React", "Node.js", "MongoDB", "GraphQL"]', 4.2, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'DEV' AND p.code = 'DEV-002' AND b.code = 'HQ-DKR'
UNION ALL
-- Développeur Frontend
SELECT 
    'EMP-005', 'Aissatou', 'Ndiaye', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-002'),
    '2022-02-01', '2022-02-01', 1600000, 'active',
    'andiaye@arcadis.tech', '+221 77 567 89 01', 
    '["React", "TypeScript", "CSS", "Figma", "UI/UX"]', 4.3, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'DEV' AND p.code = 'DEV-003' AND b.code = 'HQ-DKR'
UNION ALL
-- Développeur Frontend 2
SELECT 
    'EMP-006', 'Cheikh', 'Fall', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-002'),
    '2022-09-15', '2022-09-15', 1400000, 'active',
    'cfall@arcadis.tech', '+221 77 678 90 12', 
    '["Vue.js", "JavaScript", "SASS", "Webpack"]', 4.0, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'DEV' AND p.code = 'DEV-003' AND b.code = 'HQ-DKR'
UNION ALL
-- Responsable RH
SELECT 
    'EMP-007', 'Mariama', 'Cisse', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-001'),
    '2020-06-01', '2020-06-01', 2000000, 'active',
    'mcisse@arcadis.tech', '+221 77 789 01 23', 
    '["RH", "Recrutement", "Paie", "Formation", "Droit du travail"]', 4.5, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'RH' AND p.code = 'RH-001' AND b.code = 'HQ-DKR'
UNION ALL
-- Directeur Commercial
SELECT 
    'EMP-008', 'Ibrahima', 'Sarr', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-001'),
    '2020-08-15', '2020-08-15', 2800000, 'active',
    'isarr@arcadis.tech', '+221 77 890 12 34', 
    '["Vente", "Négociation", "CRM", "Management", "Business Development"]', 4.7, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'COM' AND p.code = 'COM-001' AND b.code = 'HQ-DKR'
UNION ALL
-- Chargé de Clientèle
SELECT 
    'EMP-009', 'Coumba', 'Gueye', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-008'),
    '2021-04-01', '2021-04-01', 1200000, 'active',
    'cgueye@arcadis.tech', '+221 77 901 23 45', 
    '["Relation client", "CRM", "Communication", "Suivi commercial"]', 4.1, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'COM' AND p.code = 'COM-002' AND b.code = 'HQ-DKR'
UNION ALL
-- Chargé de Clientèle 2
SELECT 
    'EMP-010', 'Moussa', 'Kane', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-008'),
    '2021-11-01', '2021-11-01', 1100000, 'active',
    'mkane@arcadis.tech', '+221 77 012 34 56', 
    '["Prospection", "Télémarketing", "CRM", "Lead Generation"]', 3.9, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'COM' AND p.code = 'COM-002' AND b.code = 'HQ-DKR'
UNION ALL
-- Responsable Financier
SELECT 
    'EMP-011', 'Khadija', 'Diop', NULL,
    d.id, p.id, b.id, 
    (SELECT id FROM public.employees WHERE employee_number = 'EMP-001'),
    '2021-03-15', '2021-03-15', 2200000, 'active',
    'kdiop@arcadis.tech', '+221 77 123 45 89', 
    '["Comptabilité", "Finance", "Audit", "Fiscalité", "Contrôle de gestion"]', 4.4, now(), now()
FROM public.departments d, public.positions p, public.branches b 
WHERE d.code = 'FIN' AND p.code = 'FIN-001' AND b.code = 'HQ-DKR';