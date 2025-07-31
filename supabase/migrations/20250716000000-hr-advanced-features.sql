-- Migration pour les fonctionnalités RH avancées

-- Table pour les évaluations de performance
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.employees(id),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    goals_achievement INTEGER CHECK (goals_achievement >= 0 AND goals_achievement <= 100),
    competencies JSONB,
    strengths TEXT[],
    areas_for_improvement TEXT[],
    comments TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les plans de développement
CREATE TABLE IF NOT EXISTS public.development_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    target_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    skills_to_develop JSONB,
    learning_resources JSONB,
    mentors UUID[],
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour le suivi du bien-être
CREATE TABLE IF NOT EXISTS public.wellbeing_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    survey_date DATE NOT NULL,
    wellbeing_score INTEGER CHECK (wellbeing_score >= 0 AND wellbeing_score <= 100),
    stress_level INTEGER CHECK (stress_level >= 0 AND stress_level <= 100),
    work_life_balance INTEGER CHECK (work_life_balance >= 0 AND work_life_balance <= 100),
    team_connection INTEGER CHECK (team_connection >= 0 AND team_connection <= 100),
    career_satisfaction INTEGER CHECK (career_satisfaction >= 0 AND career_satisfaction <= 100),
    sentiment VARCHAR(50),
    feedback TEXT,
    anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les candidatures
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(50),
    resume_url TEXT,
    cover_letter TEXT,
    portfolio_url TEXT,
    skills JSONB,
    experience_years INTEGER,
    education VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'new',
    ai_score INTEGER,
    ai_analysis JSONB,
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les offres d'emploi
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    location VARCHAR(255),
    employment_type VARCHAR(50),
    experience_required VARCHAR(100),
    salary_range VARCHAR(100),
    description TEXT,
    requirements JSONB,
    benefits JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    posted_date DATE,
    closing_date DATE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les packages de compensation
CREATE TABLE IF NOT EXISTS public.compensation_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    base_salary DECIMAL(12,2),
    bonus_target DECIMAL(12,2),
    benefits JSONB,
    total_package_value DECIMAL(12,2),
    market_percentile INTEGER,
    effective_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour le suivi des compétences
CREATE TABLE IF NOT EXISTS public.employee_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(100),
    current_level INTEGER CHECK (current_level >= 0 AND current_level <= 100),
    target_level INTEGER CHECK (target_level >= 0 AND target_level <= 100),
    last_assessed DATE,
    certifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les pulse surveys
CREATE TABLE IF NOT EXISTS public.pulse_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    target_audience JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les réponses aux pulse surveys
CREATE TABLE IF NOT EXISTS public.pulse_survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id),
    responses JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les objectifs (OKRs)
CREATE TABLE IF NOT EXISTS public.employee_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    unit VARCHAR(50),
    start_date DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(20),
    key_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes pour améliorer les performances
CREATE INDEX idx_performance_reviews_employee ON public.performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_date ON public.performance_reviews(review_period_end);
CREATE INDEX idx_wellbeing_surveys_employee ON public.wellbeing_surveys(employee_id);
CREATE INDEX idx_wellbeing_surveys_date ON public.wellbeing_surveys(survey_date);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_job_applications_score ON public.job_applications(ai_score);
CREATE INDEX idx_employee_skills_employee ON public.employee_skills(employee_id);
CREATE INDEX idx_employee_objectives_employee ON public.employee_objectives(employee_id);
CREATE INDEX idx_employee_objectives_status ON public.employee_objectives(status);

-- Fonction pour calculer le score de bien-être global
CREATE OR REPLACE FUNCTION calculate_employee_wellbeing_score(emp_id UUID)
RETURNS TABLE(
    wellbeing_score INTEGER,
    trend VARCHAR(10),
    last_survey_date DATE
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_surveys AS (
        SELECT 
            ws.wellbeing_score,
            ws.survey_date,
            LAG(ws.wellbeing_score) OVER (ORDER BY ws.survey_date) as prev_score
        FROM public.wellbeing_surveys ws
        WHERE ws.employee_id = emp_id
        ORDER BY ws.survey_date DESC
        LIMIT 2
    )
    SELECT 
        rs.wellbeing_score,
        CASE 
            WHEN rs.wellbeing_score > COALESCE(rs.prev_score, rs.wellbeing_score) THEN 'up'
            WHEN rs.wellbeing_score < COALESCE(rs.prev_score, rs.wellbeing_score) THEN 'down'
            ELSE 'stable'
        END as trend,
        rs.survey_date as last_survey_date
    FROM recent_surveys rs
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour matcher les candidats avec les postes
CREATE OR REPLACE FUNCTION match_candidates_to_job(job_id UUID)
RETURNS TABLE(
    candidate_id UUID,
    match_score INTEGER,
    matching_skills JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH job_requirements AS (
        SELECT requirements
        FROM public.job_postings
        WHERE id = job_id
    )
    SELECT 
        ja.id as candidate_id,
        GREATEST(0, LEAST(100, 
            60 + -- Base score
            (ja.experience_years * 3) + -- Experience bonus
            COALESCE(ja.ai_score, 0) * 0.2 -- AI score influence
        ))::INTEGER as match_score,
        ja.skills as matching_skills
    FROM public.job_applications ja
    WHERE ja.job_posting_id = job_id
    ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_performance_reviews_updated_at
    BEFORE UPDATE ON public.performance_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_development_plans_updated_at
    BEFORE UPDATE ON public.development_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_postings_updated_at
    BEFORE UPDATE ON public.job_postings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_compensation_packages_updated_at
    BEFORE UPDATE ON public.compensation_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_employee_skills_updated_at
    BEFORE UPDATE ON public.employee_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pulse_surveys_updated_at
    BEFORE UPDATE ON public.pulse_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_employee_objectives_updated_at
    BEFORE UPDATE ON public.employee_objectives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Permissions RLS (Row Level Security)
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellbeing_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_objectives ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité basiques
CREATE POLICY "Les employés peuvent voir leurs propres données" ON public.performance_reviews
    FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Les managers RH peuvent tout voir" ON public.performance_reviews
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role IN ('admin', 'hr_manager')
    ));

-- Données de test
INSERT INTO public.pulse_surveys (title, description, questions, status, start_date)
VALUES (
    'Pulse Check Hebdomadaire',
    'Évaluation rapide du bien-être des équipes',
    '[
        {"id": 1, "question": "Comment vous sentez-vous cette semaine?", "type": "scale", "min": 1, "max": 10},
        {"id": 2, "question": "Votre charge de travail est-elle gérable?", "type": "scale", "min": 1, "max": 10},
        {"id": 3, "question": "Avez-vous des suggestions d''amélioration?", "type": "text"}
    ]'::jsonb,
    'active',
    now()
);