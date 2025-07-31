-- =====================================================
-- TABLES POUR LE SYSTÈME D'ONBOARDING COMPLET
-- =====================================================

-- 1. Table des souscriptions/onboarding
CREATE TABLE IF NOT EXISTS onboarding_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_email VARCHAR(255) NOT NULL,
  company_phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Informations de contact principal
  contact_first_name VARCHAR(100) NOT NULL,
  contact_last_name VARCHAR(100) NOT NULL,
  contact_position VARCHAR(100),
  
  -- Contexte entreprise
  industry VARCHAR(100),
  company_size VARCHAR(50), -- '1-10', '11-50', '51-200', '201-500', '500+'
  annual_revenue VARCHAR(50), -- ranges
  founding_year INTEGER,
  
  -- Services et domaine
  services JSONB DEFAULT '[]', -- Array des services proposés
  target_markets JSONB DEFAULT '[]', -- Marchés cibles
  main_competitors JSONB DEFAULT '[]', -- Concurrents principaux
  
  -- Philosophie et culture
  company_mission TEXT,
  company_vision TEXT,
  company_values JSONB DEFAULT '[]',
  work_methodology VARCHAR(100), -- 'agile', 'waterfall', 'hybrid', etc.
  
  -- Objectifs et besoins
  primary_goals JSONB DEFAULT '[]', -- Objectifs principaux
  pain_points JSONB DEFAULT '[]', -- Points de douleur actuels
  expected_outcomes JSONB DEFAULT '[]', -- Résultats attendus
  timeline VARCHAR(50), -- 'immediate', '1-3months', '3-6months', '6-12months'
  budget_range VARCHAR(50),
  
  -- Contexte technique
  current_tools JSONB DEFAULT '[]', -- Outils actuels utilisés
  integrations_needed JSONB DEFAULT '[]', -- Intégrations souhaitées
  data_volume VARCHAR(50), -- Volume de données à gérer
  
  -- Équipe
  team_structure JSONB DEFAULT '{}', -- Structure de l'équipe
  departments JSONB DEFAULT '[]', -- Départements
  decision_makers JSONB DEFAULT '[]', -- Décideurs clés
  
  -- Contexte IA
  ai_maturity VARCHAR(50), -- 'none', 'exploring', 'piloting', 'scaling', 'mature'
  ai_use_cases JSONB DEFAULT '[]', -- Cas d'usage IA souhaités
  data_quality VARCHAR(50), -- 'poor', 'fair', 'good', 'excellent'
  
  -- Statut et suivi
  submission_status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'reviewing', 'approved', 'rejected'
  onboarding_step INTEGER DEFAULT 1,
  completion_percentage INTEGER DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id),
  
  -- Après approbation
  converted_company_id UUID REFERENCES companies(id),
  converted_user_id UUID REFERENCES users(id)
);

-- 2. Table pour suivre les étapes d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES onboarding_submissions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_data JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  validation_errors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Table des templates de documents d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'contract', 'nda', 'proposal', 'guide', etc.
  template_url TEXT,
  description TEXT,
  required BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Table de liaison documents-soumissions
CREATE TABLE IF NOT EXISTS onboarding_submission_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES onboarding_submissions(id) ON DELETE CASCADE,
  document_id UUID REFERENCES onboarding_documents(id) ON DELETE CASCADE,
  signed_url TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'signed', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Table pour le contexte IA généré
CREATE TABLE IF NOT EXISTS ai_company_contexts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES onboarding_submissions(id),
  
  -- Profil IA généré
  company_profile JSONB DEFAULT '{}', -- Profil détaillé généré par IA
  industry_insights JSONB DEFAULT '{}', -- Insights sectoriels
  competitive_analysis JSONB DEFAULT '{}', -- Analyse concurrentielle
  
  -- Recommandations IA
  recommended_features JSONB DEFAULT '[]', -- Fonctionnalités recommandées
  recommended_workflows JSONB DEFAULT '[]', -- Workflows suggérés
  recommended_integrations JSONB DEFAULT '[]', -- Intégrations suggérées
  
  -- Stratégie IA
  ai_strategy JSONB DEFAULT '{}', -- Stratégie IA personnalisée
  implementation_roadmap JSONB DEFAULT '[]', -- Roadmap d'implémentation
  success_metrics JSONB DEFAULT '[]', -- Métriques de succès
  
  -- Contexte opérationnel
  operational_context TEXT, -- Résumé du contexte opérationnel
  cultural_context TEXT, -- Contexte culturel
  technical_context TEXT, -- Contexte technique
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- TABLES MANQUANTES (QUOTES & PAYMENTS)
-- =====================================================

-- Table des devis
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
  currency VARCHAR(3) DEFAULT 'XOF',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  object TEXT,
  description TEXT,
  valid_until DATE,
  
  -- Détails des lignes
  line_items JSONB DEFAULT '[]',
  
  -- Conditions
  payment_terms TEXT,
  delivery_terms TEXT,
  special_conditions TEXT,
  
  -- Suivi
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Conversion
  converted_to_invoice_id UUID REFERENCES invoices(id),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES users(id)
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('bank_transfer', 'check', 'cash', 'card', 'mobile_money', 'other')),
  reference VARCHAR(100),
  bank_reference VARCHAR(100),
  
  -- Détails bancaires
  from_account VARCHAR(100),
  to_account VARCHAR(100),
  
  -- Statut
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  
  -- Notes et validation
  notes TEXT,
  validated BOOLEAN DEFAULT FALSE,
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  
  -- Réconciliation
  reconciled BOOLEAN DEFAULT FALSE,
  reconciliation_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES users(id)
);

-- =====================================================
-- MODULE DE RECRUTEMENT
-- =====================================================

-- Table des offres d'emploi
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department_id UUID,
  position_id UUID,
  description TEXT,
  requirements JSONB DEFAULT '[]',
  responsibilities JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  
  -- Détails
  employment_type VARCHAR(50), -- 'full_time', 'part_time', 'contract', 'internship'
  experience_level VARCHAR(50), -- 'entry', 'mid', 'senior', 'lead', 'executive'
  education_level VARCHAR(50),
  salary_range_min DECIMAL(12,2),
  salary_range_max DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'XOF',
  
  -- Localisation
  location VARCHAR(255),
  remote_allowed BOOLEAN DEFAULT FALSE,
  
  -- Statut
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'closed', 'on_hold'
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES users(id)
);

-- Table des candidatures
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  
  -- Informations candidat
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  -- Documents
  resume_url TEXT,
  cover_letter_url TEXT,
  portfolio_url TEXT,
  other_documents JSONB DEFAULT '[]',
  
  -- Profil
  current_position VARCHAR(255),
  current_company VARCHAR(255),
  years_experience INTEGER,
  education JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  
  -- Évaluation
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'screening', 'interview', 'assessment', 'reference_check', 'offer', 'hired', 'rejected'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  
  -- Suivi
  source VARCHAR(100), -- D'où vient la candidature
  referrer VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des entretiens
CREATE TABLE IF NOT EXISTS recruitment_interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  
  -- Détails de l'entretien
  interview_type VARCHAR(50), -- 'phone_screening', 'technical', 'behavioral', 'cultural', 'final'
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location VARCHAR(255),
  meeting_link TEXT,
  
  -- Participants
  interviewers JSONB DEFAULT '[]', -- Array of user IDs
  
  -- Résultat
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  feedback TEXT,
  score INTEGER CHECK (score >= 1 AND score <= 10),
  recommendation VARCHAR(50), -- 'strong_yes', 'yes', 'maybe', 'no', 'strong_no'
  
  -- Notes
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  questions_asked JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES users(id)
);

-- Table des documents d'onboarding RH
CREATE TABLE IF NOT EXISTS hr_onboarding_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Checklists
  pre_arrival_tasks JSONB DEFAULT '[]',
  first_day_tasks JSONB DEFAULT '[]',
  first_week_tasks JSONB DEFAULT '[]',
  first_month_tasks JSONB DEFAULT '[]',
  
  -- Documents
  documents_to_sign JSONB DEFAULT '[]',
  documents_received JSONB DEFAULT '[]',
  
  -- Formation
  training_plan JSONB DEFAULT '[]',
  training_completed JSONB DEFAULT '[]',
  
  -- Équipement
  equipment_checklist JSONB DEFAULT '[]',
  equipment_provided JSONB DEFAULT '[]',
  
  -- Accès
  access_checklist JSONB DEFAULT '[]',
  access_granted JSONB DEFAULT '[]',
  
  -- Statut
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  completion_percentage INTEGER DEFAULT 0,
  
  -- Buddy/Mentor
  buddy_id UUID REFERENCES employees(id),
  mentor_id UUID REFERENCES employees(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES users(id)
);

-- =====================================================
-- INDEXES POUR PERFORMANCE
-- =====================================================

CREATE INDEX idx_onboarding_submissions_status ON onboarding_submissions(submission_status);
CREATE INDEX idx_onboarding_submissions_company_email ON onboarding_submissions(company_email);
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_number ON quotes(number);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_email ON job_applications(email);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_submission_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_company_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_onboarding_checklists ENABLE ROW LEVEL SECURITY;

-- Policies pour les admins (accès total)
CREATE POLICY "Admin full access" ON onboarding_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Répéter pour toutes les tables...

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour updated_at sur toutes les nouvelles tables
CREATE TRIGGER update_onboarding_submissions_updated_at BEFORE UPDATE ON onboarding_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Etc. pour toutes les tables...

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================

-- Documents d'onboarding par défaut
INSERT INTO onboarding_documents (name, type, description, required, order_index) VALUES
  ('Contrat de Service', 'contract', 'Contrat standard de prestation de services', true, 1),
  ('Accord de Confidentialité', 'nda', 'NDA pour protection des informations', true, 2),
  ('Guide de Démarrage', 'guide', 'Guide complet pour bien démarrer', false, 3),
  ('Charte Données', 'policy', 'Politique de gestion des données', true, 4),
  ('Proposition Commerciale', 'proposal', 'Proposition détaillée des services', false, 5);