-- Migration pour la gestion des congés
-- 20250117_leave_management.sql

-- Table des types de congés
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_days INTEGER DEFAULT 25,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des demandes de congés
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,1) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    manager_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des soldes de congés par employé
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_days DECIMAL(4,1) NOT NULL DEFAULT 0,
    used_days DECIMAL(4,1) NOT NULL DEFAULT 0,
    remaining_days DECIMAL(4,1) GENERATED ALWAYS AS (total_days - used_days) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, leave_type_id, year)
);

-- Table des politiques de congés par entreprise
CREATE TABLE IF NOT EXISTS leave_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    days_per_year INTEGER NOT NULL DEFAULT 25,
    max_consecutive_days INTEGER,
    min_notice_days INTEGER DEFAULT 14,
    requires_approval BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, leave_type_id)
);

-- Insertion des types de congés par défaut
INSERT INTO leave_types (name, description, default_days, color) VALUES
('Congés payés', 'Congés annuels payés', 25, '#3B82F6'),
('Congés maladie', 'Congés pour maladie', 0, '#EF4444'),
('Congés maternité', 'Congés de maternité', 0, '#EC4899'),
('Congés paternité', 'Congés de paternité', 0, '#8B5CF6'),
('Congés sans solde', 'Congés non payés', 0, '#6B7280'),
('RTT', 'Réduction du temps de travail', 0, '#10B981'),
('Congés exceptionnels', 'Congés pour événements exceptionnels', 0, '#F59E0B')
ON CONFLICT DO NOTHING;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_manager_id ON leave_requests(manager_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_year ON leave_balances(employee_id, year);

-- Fonction pour mettre à jour automatiquement les soldes
CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le solde quand une demande est approuvée
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days)
        VALUES (NEW.employee_id, NEW.leave_type_id, EXTRACT(YEAR FROM NEW.start_date), 0, NEW.total_days)
        ON CONFLICT (employee_id, leave_type_id, year)
        DO UPDATE SET used_days = leave_balances.used_days + NEW.total_days;
    END IF;
    
    -- Annuler le solde si une demande approuvée est rejetée
    IF NEW.status = 'rejected' AND OLD.status = 'approved' THEN
        UPDATE leave_balances 
        SET used_days = used_days - OLD.total_days
        WHERE employee_id = NEW.employee_id 
        AND leave_type_id = NEW.leave_type_id 
        AND year = EXTRACT(YEAR FROM NEW.start_date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les soldes
CREATE TRIGGER trigger_update_leave_balance
    AFTER UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_balance();

-- Fonction pour calculer les jours ouvrés entre deux dates
CREATE OR REPLACE FUNCTION calculate_working_days(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
DECLARE
    working_days INTEGER := 0;
    current_date DATE := start_date;
BEGIN
    WHILE current_date <= end_date LOOP
        -- Exclure les weekends (samedi = 6, dimanche = 0)
        IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
            working_days := working_days + 1;
        END IF;
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
    
    RETURN working_days;
END;
$$ LANGUAGE plpgsql; 