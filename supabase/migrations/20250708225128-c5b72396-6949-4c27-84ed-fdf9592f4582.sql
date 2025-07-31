-- PHASE 1: GÉNÉRATION DE DONNÉES DE TEST RÉALISTES POUR L'IA
-- Données supplémentaires pour entreprises
INSERT INTO companies (id, name, email, phone, address) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TechCorp Solutions', 'contact@techcorp.sn', '+221 33 123 4567', 'Zone Industrielle, Dakar'),
('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'InnovaBuild SARL', 'info@innovabuild.sn', '+221 33 234 5678', 'Almadies, Dakar'),
('c3d4e5f6-g7h8-9012-cdef-345678901234', 'DataFlow Analytics', 'contact@dataflow.sn', '+221 33 345 6789', 'Plateau, Dakar'),
('d4e5f6g7-h8i9-0123-defg-456789012345', 'GreenEnergy Sénégal', 'info@greenenergy.sn', '+221 33 456 7890', 'Rufisque, Dakar'),
('e5f6g7h8-i9j0-1234-efgh-567890123456', 'ConsultMax Group', 'contact@consultmax.sn', '+221 33 567 8901', 'Mermoz, Dakar'),
('f6g7h8i9-j0k1-2345-fghi-678901234567', 'Digital Factory', 'hello@digitalfactory.sn', '+221 33 678 9012', 'Point E, Dakar'),
('g7h8i9j0-k1l2-3456-ghij-789012345678', 'EcoLogistics SARL', 'info@ecologistics.sn', '+221 33 789 0123', 'Liberté 6, Dakar'),
('h8i9j0k1-l2m3-4567-hijk-890123456789', 'SmartBanking Solutions', 'contact@smartbanking.sn', '+221 33 890 1234', 'Plateau, Dakar');

-- Données supplémentaires pour projets
INSERT INTO projects (id, name, description, status, start_date, end_date, budget, client_company_id) VALUES
('proj-001-tech', 'Plateforme E-commerce Mobile', 'Développement d''une application mobile de e-commerce avec paiement mobile', 'in_progress', '2024-01-15', '2024-08-15', 45000000, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('proj-002-innova', 'Système de Gestion Immobilière', 'ERP complet pour la gestion de biens immobiliers', 'in_progress', '2024-02-01', '2024-09-30', 67000000, 'b2c3d4e5-f6g7-8901-bcde-f23456789012'),
('proj-003-data', 'Dashboard Analytics Avancé', 'Tableau de bord avec IA pour analyse de données business', 'planning', '2024-07-01', '2024-12-31', 32000000, 'c3d4e5f6-g7h8-9012-cdef-345678901234'),
('proj-004-green', 'App de Monitoring Énergétique', 'Application IoT pour surveillance de consommation énergétique', 'in_progress', '2024-03-15', '2024-10-15', 58000000, 'd4e5f6g7-h8i9-0123-defg-456789012345'),
('proj-005-consult', 'Portail Client RH', 'Portail web pour gestion RH et paie', 'review', '2024-01-01', '2024-06-30', 28000000, 'e5f6g7h8-i9j0-1234-efgh-567890123456'),
('proj-006-digital', 'Marketplace B2B', 'Plateforme de mise en relation B2B avec système de commandes', 'in_progress', '2024-04-01', '2024-11-30', 85000000, 'f6g7h8i9-j0k1-2345-fghi-678901234567'),
('proj-007-eco', 'Système de Tracking Logistique', 'Solution complète de suivi de colis en temps réel', 'in_progress', '2024-02-15', '2024-09-15', 42000000, 'g7h8i9j0-k1l2-3456-ghij-789012345678'),
('proj-008-bank', 'API Banking Sécurisée', 'API REST pour services bancaires avec sécurité renforcée', 'planning', '2024-08-01', '2025-02-28', 95000000, 'h8i9j0k1-l2m3-4567-hijk-890123456789');

-- Données supplémentaires pour devis
INSERT INTO devis (id, number, object, amount, original_amount, status, company_id, valid_until, notes) VALUES
('devis-2024-015', 'DEV-2024-015', 'Développement Module CRM', 18500000, 22000000, 'pending', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2024-08-31', 'Devis avec remise de 15% pour fidélité'),
('devis-2024-016', 'DEV-2024-016', 'Intégration API Paiement', 8200000, 8200000, 'approved', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '2024-09-15', 'Validation rapide demandée'),
('devis-2024-017', 'DEV-2024-017', 'Migration Base de Données', 12300000, 15000000, 'pending', 'c3d4e5f6-g7h8-9012-cdef-345678901234', '2024-08-20', 'Devis urgent avec tarif négocié'),
('devis-2024-018', 'DEV-2024-018', 'Maintenance Préventive Annuelle', 24000000, 24000000, 'approved', 'd4e5f6g7-h8i9-0123-defg-456789012345', '2024-12-31', 'Contrat de maintenance 12 mois'),
('devis-2024-019', 'DEV-2024-019', 'Formation Équipe Technique', 3500000, 4000000, 'rejected', 'e5f6g7h8-i9j0-1234-efgh-567890123456', '2024-07-31', 'Budget insuffisant côté client'),
('devis-2024-020', 'DEV-2024-020', 'Audit Sécurité Informatique', 9800000, 9800000, 'pending', 'f6g7h8i9-j0k1-2345-fghi-678901234567', '2024-09-30', 'Audit complet demandé'),
('devis-2024-021', 'DEV-2024-021', 'Développement App Mobile', 35000000, 40000000, 'approved', 'g7h8i9j0-k1l2-3456-ghij-789012345678', '2024-10-15', 'Projet stratégique prioritaire'),
('devis-2024-022', 'DEV-2024-022', 'Optimisation Performance', 6700000, 6700000, 'pending', 'h8i9j0k1-l2m3-4567-hijk-890123456789', '2024-08-25', 'Optimisation serveurs demandée');

-- Données supplémentaires pour factures
INSERT INTO invoices (id, number, object, amount, currency, status, company_id, due_date, notes) VALUES
('inv-2024-036', 'FACT-2024-036', 'Phase 1 - Plateforme E-commerce', 15000000, 'XOF', 'pending', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2024-08-15', 'Première tranche du projet'),
('inv-2024-037', 'FACT-2024-037', 'Développement Backend API', 12500000, 'XOF', 'paid', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '2024-07-30', 'Paiement reçu avant échéance'),
('inv-2024-038', 'FACT-2024-038', 'Setup Infrastructure Cloud', 8900000, 'XOF', 'pending', 'c3d4e5f6-g7h8-9012-cdef-345678901234', '2024-08-20', 'Configuration serveurs AWS'),
('inv-2024-039', 'FACT-2024-039', 'Licence Logiciel Annuelle', 18600000, 'XOF', 'overdue', 'd4e5f6g7-h8i9-0123-defg-456789012345', '2024-07-15', 'Facture en retard de 2 semaines'),
('inv-2024-040', 'FACT-2024-040', 'Support Technique Q2', 5400000, 'XOF', 'paid', 'e5f6g7h8-i9j0-1234-efgh-567890123456', '2024-06-30', 'Support trimestriel payé'),
('inv-2024-041', 'FACT-2024-041', 'Développement Frontend', 22000000, 'XOF', 'pending', 'f6g7h8i9-j0k1-2345-fghi-678901234567', '2024-09-01', 'Interface utilisateur avancée'),
('inv-2024-042', 'FACT-2024-042', 'Tests et Validation', 7800000, 'XOF', 'pending', 'g7h8i9j0-k1l2-3456-ghij-789012345678', '2024-08-25', 'Phase de tests complets'),
('inv-2024-043', 'FACT-2024-043', 'Formation Utilisateurs', 4200000, 'XOF', 'draft', 'h8i9j0k1-l2m3-4567-hijk-890123456789', '2024-09-15', 'Formation équipe client');

-- Amélioration des données existantes avec plus de détails
UPDATE projects SET 
  custom_fields = jsonb_build_object(
    'complexity', CASE 
      WHEN budget > 50000000 THEN 'high'
      WHEN budget > 25000000 THEN 'medium'
      ELSE 'low'
    END,
    'team_size', CASE 
      WHEN budget > 70000000 THEN 8
      WHEN budget > 40000000 THEN 5
      ELSE 3
    END,
    'technologies', CASE name
      WHEN 'Plateforme E-commerce Mobile' THEN '["React Native", "Node.js", "MongoDB", "Payment APIs"]'
      WHEN 'Système de Gestion Immobilière' THEN '["Vue.js", "Laravel", "PostgreSQL", "AWS"]'
      WHEN 'Dashboard Analytics Avancé' THEN '["React", "Python", "TensorFlow", "BigQuery"]'
      ELSE '["JavaScript", "PHP", "MySQL"]'
    END::jsonb,
    'priority', CASE status
      WHEN 'in_progress' THEN 'high'
      WHEN 'planning' THEN 'medium'
      ELSE 'low'
    END,
    'risk_level', CASE 
      WHEN EXTRACT(days FROM (end_date - start_date)) > 300 THEN 'high'
      WHEN EXTRACT(days FROM (end_date - start_date)) > 180 THEN 'medium'
      ELSE 'low'
    END
  )
WHERE id LIKE 'proj-%';

-- Index optimisés pour les requêtes IA
CREATE INDEX IF NOT EXISTS idx_projects_status_budget ON projects(status, budget);
CREATE INDEX IF NOT EXISTS idx_invoices_status_amount ON invoices(status, amount);
CREATE INDEX IF NOT EXISTS idx_devis_status_company ON devis(status, company_id);
CREATE INDEX IF NOT EXISTS idx_companies_name_search ON companies USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status IN ('pending', 'overdue');

-- Fonction pour calculer les métriques business en temps réel
CREATE OR REPLACE FUNCTION get_business_metrics()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
    total_revenue numeric;
    pending_revenue numeric;
    overdue_revenue numeric;
    active_projects int;
    conversion_rate numeric;
BEGIN
    -- Calcul du chiffre d'affaires total
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue
    FROM invoices WHERE status = 'paid';
    
    -- Calcul du chiffre d'affaires en attente
    SELECT COALESCE(SUM(amount), 0) INTO pending_revenue
    FROM invoices WHERE status = 'pending';
    
    -- Calcul du chiffre d'affaires en retard
    SELECT COALESCE(SUM(amount), 0) INTO overdue_revenue
    FROM invoices WHERE status = 'overdue';
    
    -- Nombre de projets actifs
    SELECT COUNT(*) INTO active_projects
    FROM projects WHERE status = 'in_progress';
    
    -- Taux de conversion devis/factures
    SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE status = 'approved') = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'approved')::numeric / COUNT(*)::numeric) * 100, 2)
    END INTO conversion_rate
    FROM devis;
    
    result := jsonb_build_object(
        'total_revenue', total_revenue,
        'pending_revenue', pending_revenue,
        'overdue_revenue', overdue_revenue,
        'active_projects', active_projects,
        'conversion_rate', conversion_rate,
        'updated_at', NOW()
    );
    
    RETURN result;
END;
$$;