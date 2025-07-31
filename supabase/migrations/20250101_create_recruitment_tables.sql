-- Create job_postings table
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

-- Create job_applications table
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

-- Create recruitment_interviews table
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

-- Create indexes
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_department ON public.job_postings(department);
CREATE INDEX idx_job_postings_created_at ON public.job_postings(created_at DESC);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_job_applications_application_date ON public.job_applications(application_date DESC);
CREATE INDEX idx_recruitment_interviews_application_id ON public.recruitment_interviews(application_id);
CREATE INDEX idx_recruitment_interviews_scheduled_date ON public.recruitment_interviews(scheduled_date);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_postings
CREATE POLICY "Everyone can view published job postings" ON public.job_postings
    FOR SELECT
    USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "HR can manage job postings" ON public.job_postings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'hr_manager', 'hr_admin')
        )
    );

-- RLS Policies for job_applications
CREATE POLICY "HR can view all applications" ON public.job_applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'hr_manager', 'hr_admin')
        )
    );

CREATE POLICY "HR can manage applications" ON public.job_applications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'hr_manager', 'hr_admin')
        )
    );

-- RLS Policies for recruitment_interviews
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

CREATE POLICY "HR can manage interviews" ON public.recruitment_interviews
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'hr_manager', 'hr_admin')
        )
    );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER job_postings_updated_at
    BEFORE UPDATE ON public.job_postings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER recruitment_interviews_updated_at
    BEFORE UPDATE ON public.recruitment_interviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();