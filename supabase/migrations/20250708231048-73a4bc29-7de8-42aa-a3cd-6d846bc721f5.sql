-- GÉNÉRATION DE DONNÉES DE TEST RÉALISTES (Corrigé - sans doublons)
-- Utilisation des statuts valides pour les projets

-- Plus de projets avec statuts valides uniquement
DO $$
DECLARE
    company_ids uuid[];
    random_company uuid;
    project_names text[] := ARRAY[
        'Plateforme de Gestion Documentaire v2',
        'Application Mobile Bancaire Nouvelle Gen', 
        'Système ERP Manufacturier Avancé',
        'Site Web E-commerce Premium Plus',
        'App IoT Agriculture Smart',
        'Portail Formation En Ligne Pro',
        'Système de Suivi Patient Next',
        'Application Gestion Stock Advanced',
        'Plateforme Streaming Vidéo HD',
        'CRM Avancé Multi-tenant Pro',
        'Solution BI Analytics',
        'Plateforme Blockchain Finance',
        'App Santé Connectée',
        'Système RH Digital',
        'Portail Client Self-Service'
    ];
    statuses text[] := ARRAY['planning', 'in_progress']; -- Statuts valides seulement
    descriptions text[] := ARRAY[
        'Développement complet avec interface moderne et API robuste',
        'Solution mobile native avec fonctionnalités avancées',
        'Système intégré avec modules interconnectés',
        'Plateforme web responsive avec optimisation SEO',
        'Application IoT avec capteurs et dashboard temps réel',
        'Solution cloud-native avec microservices',
        'Interface utilisateur moderne avec UX optimisée'
    ];
    i int;
    project_count int;
BEGIN
    -- Récupérer tous les IDs d'entreprises existantes
    SELECT array_agg(id) INTO company_ids FROM companies;
    
    -- Compter les projets existants pour éviter les doublons
    SELECT COUNT(*) INTO project_count FROM projects;
    
    -- Créer 15 nouveaux projets avec données réalistes
    FOR i IN 1..15 LOOP
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
            (random() * 80000000 + 15000000)::numeric, -- Entre 15M et 95M XOF
            random_company,
            jsonb_build_object(
                'complexity', CASE WHEN random() > 0.7 THEN 'high' WHEN random() > 0.4 THEN 'medium' ELSE 'low' END,
                'priority', CASE WHEN random() > 0.6 THEN 'high' WHEN random() > 0.3 THEN 'medium' ELSE 'low' END,
                'team_size', floor(random() * 10 + 3)::int,
                'technologies', CASE floor(random() * 5)
                    WHEN 0 THEN '["React", "Node.js", "PostgreSQL", "AWS", "TypeScript"]'
                    WHEN 1 THEN '["Vue.js", "Laravel", "MySQL", "Docker", "Redis"]'
                    WHEN 2 THEN '["Angular", "Python", "MongoDB", "Azure", "FastAPI"]'
                    WHEN 3 THEN '["React Native", "Express", "Redis", "GCP", "GraphQL"]'
                    ELSE '["Svelte", "Django", "PostgreSQL", "Kubernetes", "WebSocket"]'
                END::jsonb,
                'methodology', CASE WHEN random() > 0.5 THEN 'Agile' ELSE 'Waterfall' END,
                'client_satisfaction', floor(random() * 3 + 8)::int
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
        'Développement Application Mobile Banking',
        'Création Site Web Corporate Modern',
        'Intégration Système ERP Cloud',
        'Migration Cloud AWS Complete',
        'Audit Sécurité Informatique Complet',
        'Formation Équipe DevOps Avancée',
        'Maintenance Serveurs Premium',
        'Développement API RESTful Secure',
        'Design Interface Utilisateur UX',
        'Optimisation Base de Données Performance',
        'Solution BI Analytics Avancée',
        'Développement App Mobile E-commerce',
        'Setup Infrastructure Kubernetes',
        'Consulting Architecture Microservices',
        'Développement Portail Client'
    ];
    statuses text[] := ARRAY['pending', 'approved', 'rejected'];
    i int;
    devis_count int;
BEGIN
    SELECT array_agg(id) INTO company_ids FROM companies;
    SELECT COUNT(*) INTO devis_count FROM devis;
    
    FOR i IN 1..15 LOOP
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
            'DEV-2024-' || LPAD((devis_count + i + 200)::text, 3, '0'),
            devis_objects[i],
            (random() * 50000000 + 8000000)::numeric,
            (random() * 60000000 + 10000000)::numeric,
            statuses[floor(random() * array_length(statuses, 1) + 1)],
            random_company,
            CURRENT_DATE + (random() * 90 + 30)::int,
            CASE 
                WHEN random() > 0.8 THEN 'Devis urgent - réponse sous 24h'
                WHEN random() > 0.6 THEN 'Négociation en cours avec remise possible'
                WHEN random() > 0.3 THEN 'Devis premium avec support prioritaire'
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
        'Livraison Phase 1 - Backend API',
        'Développement Frontend React',
        'Setup Infrastructure Production AWS',
        'Formation Utilisateurs Avancée',
        'Support Technique Premium Mensuel',
        'Maintenance Corrective Urgente',
        'Optimisation Performances Database',
        'Tests et Validation Complets',
        'Documentation Technique Détaillée',
        'Déploiement Production Sécurisé',
        'Audit Code Source et Sécurité',
        'Intégration APIs Externes',
        'Configuration Serveurs Load Balancer',
        'Migration Données Legacy System',
        'Consulting Architecture Cloud',
        'Development Mobile App iOS/Android',
        'Setup CI/CD Pipeline',
        'Formation DevOps Team',
        'Monitoring et Alerting Setup',
        'Backup et Disaster Recovery'
    ];
    statuses text[] := ARRAY['paid', 'pending', 'overdue', 'draft'];
    currencies text[] := ARRAY['XOF', 'EUR', 'USD'];
    i int;
    invoice_count int;
BEGIN
    SELECT array_agg(id) INTO company_ids FROM companies;
    SELECT COUNT(*) INTO invoice_count FROM invoices;
    
    FOR i IN 1..20 LOOP
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
            'FACT-2024-' || LPAD((invoice_count + i + 200)::text, 3, '0'),
            invoice_objects[i],
            (random() * 40000000 + 3000000)::numeric,
            currencies[floor(random() * array_length(currencies, 1) + 1)],
            statuses[floor(random() * array_length(statuses, 1) + 1)],
            random_company,
            CURRENT_DATE + (random() * 60 - 20)::int, -- Entre -20 et +40 jours
            CASE 
                WHEN random() > 0.9 THEN 'Facture prioritaire - paiement express 24h'
                WHEN random() > 0.7 THEN 'Conditions de paiement standard 30 jours'
                WHEN random() > 0.5 THEN 'Facture avec échéancier personnalisé'
                WHEN random() > 0.3 THEN 'Facture projet - paiement par milestone'
                ELSE 'Facture récurrente mensuelle'
            END,
            CASE WHEN random() > 0.5 THEN CURRENT_TIMESTAMP - (random() * 40)::int * INTERVAL '1 day' ELSE NULL END
        );
    END LOOP;
END $$;