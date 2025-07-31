-- =====================================================
-- MIGRATION COMPLÉMENTAIRE - AJOUTE SEULEMENT CE QUI MANQUE
-- Date: 2025-07-29
-- Description: Complète la structure existante sans rien casser
-- =====================================================

-- =====================================================
-- 1. AJOUT DES COLONNES MANQUANTES
-- =====================================================

-- Compléter la table companies
DO $$ 
BEGIN
  -- siret
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'siret'
  ) THEN
    ALTER TABLE companies ADD COLUMN siret VARCHAR(50);
  END IF;
  
  -- industry
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'industry'
  ) THEN
    ALTER TABLE companies ADD COLUMN industry VARCHAR(100);
  END IF;
  
  -- website
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'website'
  ) THEN
    ALTER TABLE companies ADD COLUMN website VARCHAR(255);
  END IF;
  
  -- description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'description'
  ) THEN
    ALTER TABLE companies ADD COLUMN description TEXT;
  END IF;
  
  -- logo_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE companies ADD COLUMN logo_url TEXT;
  END IF;
  
  -- updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Compléter la table users
DO $$ 
BEGIN
  -- avatar_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
  
  -- updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- =====================================================
-- 2. CRÉER LES TYPES ENUM MANQUANTS
-- =====================================================

-- Leave status
DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. CRÉER LES TABLES RH MANQUANTES
-- =====================================================

-- Leave types table
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  days_per_year INTEGER,
  company_id UUID REFERENCES companies(id),
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave balances table
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  entitled_days INTEGER DEFAULT 0,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER GENERATED ALWAYS AS (entitled_days - used_days) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- =====================================================
-- 4. FONCTION UPDATE_AT (si elle n'existe pas)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 5. AJOUTER LES TRIGGERS POUR UPDATED_AT
-- =====================================================

-- Pour companies
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pour users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pour leave_requests
DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pour leave_balances
DROP TRIGGER IF EXISTS update_leave_balances_updated_at ON leave_balances;
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. DONNÉES PAR DÉFAUT
-- =====================================================

INSERT INTO leave_types (name, days_per_year, company_id) VALUES
  ('Congés Payés', 30, NULL),
  ('Congé Maladie', 15, NULL),
  ('Congé Maternité', 90, NULL),
  ('Congé Paternité', 14, NULL),
  ('Congé Sans Solde', 0, NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. ACTIVER RLS SUR LES NOUVELLES TABLES
-- =====================================================

ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CRÉER UNE VUE profiles POUR COMPATIBILITÉ
-- =====================================================

CREATE OR REPLACE VIEW profiles AS
SELECT 
  id,
  first_name,
  last_name,
  email,
  phone,
  avatar_url,
  role,
  company_id,
  is_active,
  created_at,
  updated_at
FROM users;

-- =====================================================
-- RÉSUMÉ
-- =====================================================
-- Cette migration :
-- 1. Ajoute les colonnes manquantes à companies et users
-- 2. Crée seulement les 3 tables RH manquantes
-- 3. Crée une vue 'profiles' pour compatibilité avec le code
-- 4. N'interfère PAS avec vos 50+ tables existantes
-- =====================================================