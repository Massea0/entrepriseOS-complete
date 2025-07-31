-- GÉNÉRATION DE DONNÉES DE TEST RÉALISTES (Corrigé)
-- Utilisation des statuts valides pour les projets

-- Plus d'entreprises avec diversité sectorielle
INSERT INTO companies (name, email, phone, address) VALUES
('TechSolutions SARL', 'contact@techsolutions.sn', '+221 33 123 1111', 'Technopole, Dakar'),
('BatiPro Construction', 'info@batipro.sn', '+221 33 123 2222', 'Pikine, Dakar'),
('AgroTech Innovations', 'contact@agrotech.sn', '+221 33 123 3333', 'Thiès, Sénégal'),
('FinanceMax SARL', 'info@financemax.sn', '+221 33 123 4444', 'Plateau, Dakar'),
('LogiFlow Services', 'contact@logiflow.sn', '+221 33 123 5555', 'Guédiawaye, Dakar'),
('EduTech Academy', 'info@edutech.sn', '+221 33 123 6666', 'Rufisque, Sénégal'),
('HealthCare Plus', 'contact@healthcare.sn', '+221 33 123 7777', 'Almadies, Dakar'),
('RetailMax Group', 'info@retailmax.sn', '+221 33 123 8888', 'Liberté, Dakar'),
('EnergyGreen Solutions', 'contact@energygreen.sn', '+221 33 123 9999', 'Bargny, Sénégal'),
('MediaCorp Digital', 'info@mediacorp.sn', '+221 33 123 0000', 'Point E, Dakar');

-- Plus de projets avec statuts valides uniquement
DO $$
DECLARE
    company_ids uuid[];
    random_company uuid;
    project_names text[] := ARRAY[
        'Plateforme de Gestion Documentaire',
        'Application Mobile Bancaire', 
        'Système ERP Manufacturier',
        'Site Web E-commerce Premium',
        'App IoT Agriculture',
        'Portail Formation En Ligne',
        'Système de Suivi Patient',
        'Application Gestion Stock',
        'Plateforme Streaming Vidéo',
        'CRM Avancé Multi-tenant'
    ];
    statuses text[] := ARRAY['planning', 'in_progress']; -- Statuts valides seulement
    descriptions text[] := ARRAY[
        'Développement complet avec interface moderne et API robuste',
        'Solution mobile native avec fonctionnalités avancées',
        'Système intégré avec modules interconnectés',
        'Plateforme web responsive avec optimisation SEO',
        'Application IoT avec capteurs et dashboard temps réel'
    ];
    i int;
BEGIN
    -- Récupérer tous les IDs d'entreprises
    SELECT array_agg(id) INTO company_ids FROM companies;
    
    -- Créer 10 projets avec données réalistes
    FOR i IN 1..10 LOOP
        -- Sélectionner une entreprise aléatoire
        random_company := company_ids[floor(random() * array_length(company_ids, 1) + 1)];
        
        INSERT INTO projects (
            name, 
            description, 
            status, 
            start_date, 
            end_date, 
            budget, 
            client_company_id,
            custom_fields
        ) VALUES (
            project_names[i],
            descriptions[floor(random() * array_length(descriptions, 1) + 1)],
            statuses[floor(random() * array_length(statuses, 1) + 1)],
            CURRENT_DATE - (random() * 90)::int,
            CURRENT_DATE + (random() * 180)::int,
            (random() * 60000000 + 10000000)::numeric, -- Entre 10M et 70M XOF
            random_company,
            jsonb_build_object(
                'complexity', CASE WHEN random() > 0.7 THEN 'high' WHEN random() > 0.4 THEN 'medium' ELSE 'low' END,
                'priority', CASE WHEN random() > 0.6 THEN 'high' WHEN random() > 0.3 THEN 'medium' ELSE 'low' END,
                'team_size', floor(random() * 8 + 2)::int,
                'technologies', CASE floor(random() * 4)
                    WHEN 0 THEN '["React", "Node.js", "PostgreSQL", "AWS"]'
                    WHEN 1 THEN '["Vue.js", "Laravel", "MySQL", "Docker"]'
                    WHEN 2 THEN '["Angular", "Python", "MongoDB", "Azure"]'
                    ELSE '["React Native", "Express", "Redis", "GCP"]'
                END::jsonb
            )
        );
    END LOOP;
END $$;

-- Plus de devis avec statuts réalistes
DO $$
DECLARE
    company_ids uuid[];
    random_company uuid;
    devis_objects text[] := ARRAY[
        'Développement Application Mobile',
        'Création Site Web Corporate',
        'Intégration Système ERP',
        'Migration Cloud AWS',
        'Audit Sécurité Informatique',
        'Formation Équipe DevOps',
        'Maintenance Serveurs Annuelle',
        'Développement API RESTful',
        'Design Interface Utilisateur',
        'Optimisation Base de Données'
    ];
    statuses text[] := ARRAY['pending', 'approved', 'rejected'];
    i int;
BEGIN
    SELECT array_agg(id) INTO company_ids FROM companies;
    
    FOR i IN 1..10 LOOP
        random_company := company_ids[floor(random() * array_length(company_ids, 1) + 1)];
        
        INSERT INTO devis (
            number,
            object,
            amount,
            original_amount,
            status,
            company_id,
            valid_until,
            notes
        ) VALUES (
            'DEV-2024-' || LPAD((i + 100)::text, 3, '0'),
            devis_objects[i],
            (random() * 40000000 + 5000000)::numeric,
            (random() * 50000000 + 6000000)::numeric,
            statuses[floor(random() * array_length(statuses, 1) + 1)],
            random_company,
            CURRENT_DATE + (random() * 60 + 30)::int,
            CASE 
                WHEN random() > 0.7 THEN 'Devis urgent - réponse sous 48h'
                WHEN random() > 0.4 THEN 'Négociation en cours avec remise possible'
                ELSE 'Devis standard avec conditions habituelles'
            END
        );
    END LOOP;
END $$;

-- Plus de factures réalistes
DO $$
DECLARE
    company_ids uuid[];
    random_company uuid;
    invoice_objects text[] := ARRAY[
        'Livraison Phase 1 - Backend',
        'Développement Frontend Complet',
        'Setup Infrastructure Production',
        'Formation Utilisateurs Finaux',
        'Support Technique Mensuel',
        'Maintenance Corrective',
        'Optimisation Performances',
        'Tests et Validation',
        'Documentation Technique',
        'Déploiement Production'
    ];
    statuses text[] := ARRAY['paid', 'pending', 'overdue', 'draft'];
    i int;
BEGIN
    SELECT array_agg(id) INTO company_ids FROM companies;
    
    FOR i IN 1..15 LOOP
        random_company := company_ids[floor(random() * array_length(company_ids, 1) + 1)];
        
        INSERT INTO invoices (
            number,
            object,
            amount,
            currency,
            status,
            company_id,
            due_date,
            notes,
            paid_at
        ) VALUES (
            'FACT-2024-' || LPAD((i + 100)::text, 3, '0'),
            invoice_objects[i],
            (random() * 30000000 + 2000000)::numeric,
            'XOF',
            statuses[floor(random() * array_length(statuses, 1) + 1)],
            random_company,
            CURRENT_DATE + (random() * 45 - 15)::int, -- Entre -15 et +30 jours
            CASE 
                WHEN random() > 0.8 THEN 'Facture prioritaire - paiement express'
                WHEN random() > 0.5 THEN 'Conditions de paiement standard'
                ELSE 'Facture normale'
            END,
            CASE WHEN random() > 0.6 THEN CURRENT_TIMESTAMP - (random() * 20)::int * INTERVAL '1 day' ELSE NULL END
        );
    END LOOP;
END $$;