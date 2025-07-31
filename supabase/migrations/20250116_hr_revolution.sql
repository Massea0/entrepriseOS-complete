-- =====================================================
-- MIGRATION: HR Revolution - Nouvelles fonctionnalités
-- Date: 2025-01-16
-- Description: Ajout des tables pour CV parsing, vue 360°, 
-- contexte entreprise et onboarding
-- =====================================================

-- Table pour stocker les CV parsés
CREATE TABLE IF NOT EXISTS cv_parsed_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Informations personnelles extraites
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    
    -- Données brutes
    original_file_url TEXT,
    extracted_text TEXT,
    
    -- Statut
    status VARCHAR(50) DEFAULT 'pending', -- pending, processed, employee_created, failed
    employee_id UUID REFERENCES employees(id),
    
    -- Métadonnées
    extraction_confidence DECIMAL(3,2),
    processing_time_ms INTEGER,
    error_message TEXT
);

-- Table pour les compétences extraites des CV
CREATE TABLE IF NOT EXISTS cv_extracted_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cv_parsed_data_id UUID REFERENCES cv_parsed_data(id) ON DELETE CASCADE,
    
    skill_name VARCHAR(100) NOT NULL,
    skill_level INTEGER CHECK (skill_level BETWEEN 1 AND 5),
    skill_category VARCHAR(100),
    years_experience DECIMAL(3,1),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les expériences extraites
CREATE TABLE IF NOT EXISTS cv_extracted_experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cv_parsed_data_id UUID REFERENCES cv_parsed_data(id) ON DELETE CASCADE,
    
    company_name VARCHAR(255),
    position VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT,
    achievements TEXT[],
    skills_used TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les formations extraites
CREATE TABLE IF NOT EXISTS cv_extracted_education (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cv_parsed_data_id UUID REFERENCES cv_parsed_data(id) ON DELETE CASCADE,
    
    institution VARCHAR(255),
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    gpa VARCHAR(20),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les certifications extraites
CREATE TABLE IF NOT EXISTS cv_extracted_certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cv_parsed_data_id UUID REFERENCES cv_parsed_data(id) ON DELETE CASCADE,
    
    certification_name VARCHAR(255),
    issuer VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour l'analyse IA des CV
CREATE TABLE IF NOT EXISTS cv_ai_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cv_parsed_data_id UUID REFERENCES cv_parsed_data(id) ON DELETE CASCADE,
    
    profile_summary TEXT,
    match_score INTEGER CHECK (match_score BETWEEN 0 AND 100),
    strength_areas TEXT[],
    improvement_areas TEXT[],
    career_trajectory TEXT,
    recommendations TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour stocker le contexte de l'entreprise (onboarding)
CREATE TABLE IF NOT EXISTS company_context (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID DEFAULT gen_random_uuid() UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Mission Control
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    founded_year INTEGER,
    website_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    
    -- Cargo Bay
    offering_type VARCHAR(50), -- products, services, both
    main_offerings TEXT[],
    target_market TEXT,
    unique_value_proposition TEXT,
    
    -- Navigation
    organizational_structure VARCHAR(50), -- flat, hierarchical, matrix
    departments TEXT[],
    average_team_size INTEGER,
    remote_policy VARCHAR(50),
    
    -- Communication
    primary_communication_channel VARCHAR(50),
    communication_tools TEXT[],
    working_languages TEXT[],
    meeting_frequency VARCHAR(50),
    
    -- Crew Quarters
    company_values TEXT[],
    culture_description TEXT,
    benefits_offered TEXT[],
    work_life_balance_score INTEGER CHECK (work_life_balance_score BETWEEN 0 AND 100),
    
    -- Engine Room
    key_processes TEXT[],
    automation_level INTEGER CHECK (automation_level BETWEEN 0 AND 100),
    main_challenges TEXT[],
    tech_stack TEXT[],
    
    -- Bridge
    company_vision TEXT,
    strategic_objectives TEXT[],
    tracked_kpis TEXT[],
    objectives_timeline VARCHAR(50),
    
    -- AI Context
    ai_context_processed BOOLEAN DEFAULT FALSE,
    ai_personas_generated BOOLEAN DEFAULT FALSE
);

-- Table pour la vue employé 360°
CREATE TABLE IF NOT EXISTS employee_360_view (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Scores et métriques
    performance_score INTEGER CHECK (performance_score BETWEEN 0 AND 100),
    engagement_score INTEGER CHECK (engagement_score BETWEEN 0 AND 100),
    wellbeing_score INTEGER CHECK (wellbeing_score BETWEEN 0 AND 100),
    
    -- Prédictions IA
    retention_risk_score INTEGER CHECK (retention_risk_score BETWEEN 0 AND 100),
    promotion_readiness_score INTEGER CHECK (promotion_readiness_score BETWEEN 0 AND 100),
    skill_gap_score INTEGER CHECK (skill_gap_score BETWEEN 0 AND 100),
    predicted_next_role VARCHAR(255),
    estimated_time_to_promotion VARCHAR(50),
    key_strengths TEXT[],
    development_areas TEXT[],
    flight_risk_level VARCHAR(20), -- low, medium, high
    
    -- Historique de carrière
    career_milestones JSONB,
    
    -- Assistant IA personnel
    ai_chat_history JSONB,
    ai_recommendations JSONB
);

-- Table pour les projets d'employés
CREATE TABLE IF NOT EXISTS employee_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    
    role_in_project VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50), -- planned, in-progress, completed
    performance_rating INTEGER CHECK (performance_rating BETWEEN 0 AND 100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les objectifs d'employés détaillés
CREATE TABLE IF NOT EXISTS employee_detailed_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    deadline DATE,
    status VARCHAR(50), -- on-track, at-risk, completed, overdue
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les certifications d'employés
CREATE TABLE IF NOT EXISTS employee_certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    
    certification_name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    verification_url VARCHAR(500),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour le matching employé-projet par IA
CREATE TABLE IF NOT EXISTS ai_employee_project_matching (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id),
    project_id UUID REFERENCES projects(id),
    
    match_score INTEGER CHECK (match_score BETWEEN 0 AND 100),
    matching_reasons TEXT[],
    skill_alignments JSONB,
    availability_score INTEGER CHECK (availability_score BETWEEN 0 AND 100),
    recommendation_level VARCHAR(50), -- highly_recommended, recommended, maybe, not_recommended
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(employee_id, project_id)
);

-- Fonction pour calculer le score de bien-être global
CREATE OR REPLACE FUNCTION calculate_employee_360_scores(emp_id UUID)
RETURNS TABLE (
    performance_score INTEGER,
    engagement_score INTEGER,
    wellbeing_score INTEGER,
    retention_risk INTEGER
) AS $$
BEGIN
    -- Logique simplifiée, à adapter selon vos besoins
    RETURN QUERY
    SELECT 
        COALESCE(AVG(pr.rating)::INTEGER, 75) as performance_score,
        COALESCE(AVG(ws.engagement_score)::INTEGER, 80) as engagement_score,
        COALESCE(AVG(ws.wellbeing_score)::INTEGER, 78) as wellbeing_score,
        CASE 
            WHEN AVG(ws.wellbeing_score) < 50 THEN 75
            WHEN AVG(ws.wellbeing_score) < 70 THEN 50
            ELSE 25
        END as retention_risk
    FROM employees e
    LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
    LEFT JOIN wellbeing_surveys ws ON e.id = ws.employee_id
    WHERE e.id = emp_id
    GROUP BY e.id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour matcher automatiquement les compétences CV avec les projets
CREATE OR REPLACE FUNCTION match_cv_skills_to_projects(cv_id UUID)
RETURNS TABLE (
    project_id UUID,
    project_name VARCHAR,
    match_score INTEGER,
    matching_skills TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH cv_skills AS (
        SELECT ARRAY_AGG(skill_name) as skills
        FROM cv_extracted_skills
        WHERE cv_parsed_data_id = cv_id
    ),
    project_requirements AS (
        SELECT 
            p.id,
            p.name,
            p.required_skills
        FROM projects p
        WHERE p.status IN ('planned', 'active')
    )
    SELECT 
        pr.id,
        pr.name,
        (
            SELECT COUNT(*)::INTEGER * 100 / GREATEST(array_length(pr.required_skills, 1), 1)
            FROM unnest(pr.required_skills) AS rs
            WHERE rs = ANY(cs.skills)
        ) as match_score,
        (
            SELECT ARRAY_AGG(rs)
            FROM unnest(pr.required_skills) AS rs
            WHERE rs = ANY(cs.skills)
        ) as matching_skills
    FROM project_requirements pr, cv_skills cs
    WHERE (
        SELECT COUNT(*)
        FROM unnest(pr.required_skills) AS rs
        WHERE rs = ANY(cs.skills)
    ) > 0
    ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mise à jour automatique
CREATE OR REPLACE FUNCTION update_employee_360_view()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour automatique de la vue 360 lors de changements
    INSERT INTO employee_360_view (employee_id)
    VALUES (NEW.employee_id)
    ON CONFLICT (employee_id) DO UPDATE
    SET updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur plusieurs tables
CREATE TRIGGER update_360_on_performance
    AFTER INSERT OR UPDATE ON performance_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_employee_360_view();

CREATE TRIGGER update_360_on_wellbeing
    AFTER INSERT OR UPDATE ON wellbeing_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_employee_360_view();

-- Index pour les performances
CREATE INDEX idx_cv_parsed_data_status ON cv_parsed_data(status);
CREATE INDEX idx_cv_parsed_data_employee ON cv_parsed_data(employee_id);
CREATE INDEX idx_employee_360_view_employee ON employee_360_view(employee_id);
CREATE INDEX idx_employee_projects_employee ON employee_projects(employee_id);
CREATE INDEX idx_employee_projects_project ON employee_projects(project_id);
CREATE INDEX idx_ai_matching_scores ON ai_employee_project_matching(match_score DESC);

-- Row Level Security
ALTER TABLE cv_parsed_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_extracted_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_extracted_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_extracted_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_extracted_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_360_view ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_detailed_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_employee_project_matching ENABLE ROW LEVEL SECURITY;

-- Politiques RLS basiques (à adapter selon vos besoins)
CREATE POLICY "Les utilisateurs peuvent voir leurs propres données CV" ON cv_parsed_data
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Les managers peuvent voir les données de leurs équipes" ON employee_360_view
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees e
            WHERE e.id = employee_360_view.employee_id
            AND (e.manager_id IN (
                SELECT id FROM employees WHERE user_id = auth.uid()
            ) OR e.user_id = auth.uid())
        )
    );

CREATE POLICY "Tout le monde peut lire le contexte entreprise" ON company_context
    FOR SELECT USING (true);

CREATE POLICY "Seuls les admins peuvent modifier le contexte entreprise" ON company_context
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Commentaires pour documentation
COMMENT ON TABLE cv_parsed_data IS 'Stocke les données extraites des CV uploadés';
COMMENT ON TABLE company_context IS 'Contexte de l''entreprise défini lors de l''onboarding';
COMMENT ON TABLE employee_360_view IS 'Vue complète 360° d''un employé avec prédictions IA';
COMMENT ON FUNCTION match_cv_skills_to_projects IS 'Match automatique entre compétences CV et projets';