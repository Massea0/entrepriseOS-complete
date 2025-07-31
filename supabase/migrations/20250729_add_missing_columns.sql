-- =====================================================
-- AJOUT DES COLONNES MANQUANTES
-- Date: 2025-07-29
-- Description: Ajoute les colonnes manquantes aux tables existantes
-- =====================================================

-- =====================================================
-- PROFILES TABLE - Ajout company_id si manquant
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- =====================================================
-- DEPARTMENTS TABLE - Ajout company_id si manquant
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'departments' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE departments ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- EMPLOYEES TABLE - Ajout company_id si manquant
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE employees ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- =====================================================
-- PROJECTS TABLE - Ajout company_id si manquant
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- =====================================================
-- INVOICES TABLE - Ajout company_id si manquant
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- =====================================================
-- DEVIS TABLE - Ajout company_id si manquant
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'devis' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE devis ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- =====================================================
-- CONTRACTS TABLE - Ajout company_id si manquant
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contracts' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE contracts ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- =====================================================
-- LEAVE_TYPES TABLE - Ajout company_id si manquant
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leave_types' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE leave_types ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- =====================================================
-- AI_AGENTS TABLE - Ajout company_id si manquant
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_agents' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN company_id UUID REFERENCES companies(id);
  END IF;
END $$;

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Pour vérifier les colonnes après l'ajout :
-- SELECT table_name, column_name 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND column_name = 'company_id'
-- ORDER BY table_name;