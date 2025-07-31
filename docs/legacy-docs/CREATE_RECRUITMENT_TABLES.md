# 🚀 Comment créer les tables de Recrutement dans Supabase

## ⚡ Méthode Rapide (Copier-Coller)

1. **Connectez-vous à votre Dashboard Supabase**
   - URL : https://app.supabase.com
   - Projet : `qlqgyrfqiflnqknbtycw`

2. **Allez dans l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur **SQL Editor**
   - Cliquez sur **New Query**

3. **Copiez et collez ce code SQL** :

```sql
-- 1. Créer la table job_postings
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('full_time', 'part_time', 'contract', 'internship')),
    experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'on_hold')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    closing_date TIMESTAMPTZ,
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT NOT NULL,
    responsibilities TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer la table job_applications
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    candidate_phone VARCHAR(50),
    avatar_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'screening', 'interview_1', 'interview_2', 'interview_3', 'offer', 'hired', 'rejected')),
    application_date TIMESTAMPTZ DEFAULT NOW(),
    cv_url TEXT,
    cover_letter TEXT,
    experience_years INTEGER,
    skills_match_score INTEGER CHECK (skills_match_score >= 0 AND skills_match_score <= 100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer la table recruitment_interviews
CREATE TABLE IF NOT EXISTS public.recruitment_interviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    interview_type VARCHAR(50) NOT NULL CHECK (interview_type IN ('phone', 'technical', 'cultural', 'final', 'other')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255),
    meeting_link TEXT,
    interviewer_ids UUID[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    feedback JSONB,
    decision VARCHAR(50) CHECK (decision IN ('pass', 'fail', 'maybe', 'strong_yes', 'strong_no')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Créer les index pour optimiser les performances
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_department ON public.job_postings(department);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_recruitment_interviews_application_id ON public.recruitment_interviews(application_id);
```

4. **Cliquez sur "Run" ou appuyez sur Ctrl+Enter**

5. **Vérifiez que les tables ont été créées**
   - Dans le menu de gauche, cliquez sur **Table Editor**
   - Vous devriez voir les 3 nouvelles tables :
     - `job_postings`
     - `job_applications`
     - `recruitment_interviews`

## ✅ Test de vérification

Une fois les tables créées, exécutez cette commande pour générer des données de test :

```bash
node scripts/seed-recruitment-data.mjs
```

## 🔧 En cas de problème

Si vous avez une erreur, vérifiez :
1. Que vous êtes bien connecté au bon projet Supabase
2. Que la table `users` existe déjà (nécessaire pour la foreign key)
3. Que vous avez les permissions pour créer des tables

## 📝 Note sur la sécurité (RLS)

Les tables sont créées SANS Row Level Security (RLS) activé par défaut.
Pour activer RLS et ajouter les politiques de sécurité, exécutez ce SQL après :

```sql
-- Activer RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_interviews ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut voir les offres publiées
CREATE POLICY "Anyone can view published jobs" ON public.job_postings
    FOR SELECT
    USING (status = 'published' OR auth.uid() IS NOT NULL);

-- Politique : Seuls les RH peuvent gérer les offres
CREATE POLICY "HR can manage job postings" ON public.job_postings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'hr_manager', 'hr_admin')
        )
    );

-- Politique : Seuls les RH peuvent voir les candidatures
CREATE POLICY "HR can view applications" ON public.job_applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'hr_manager', 'hr_admin')
        )
    );

-- Politique : Seuls les RH peuvent gérer les candidatures
CREATE POLICY "HR can manage applications" ON public.job_applications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'hr_manager', 'hr_admin')
        )
    );

-- Politique : RH et intervieweurs peuvent voir les entretiens
CREATE POLICY "HR and interviewers can view interviews" ON public.recruitment_interviews
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (
                role IN ('admin', 'super_admin', 'hr_manager', 'hr_admin')
                OR auth.uid() = ANY(interviewer_ids)
            )
        )
    );
```