-- =====================================================
-- POLICIES RLS DE BASE
-- Date: 2025-07-29
-- Description: Policies RLS basiques pour commencer
-- À exécuter APRÈS la création des tables
-- =====================================================

-- =====================================================
-- COMPANIES POLICIES
-- =====================================================

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for authenticated users" ON companies
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for authenticated users" ON profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Modification de son propre profil
CREATE POLICY "Enable update for users based on id" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Insertion pour les nouveaux utilisateurs (leur propre profil)
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- PROJECTS POLICIES
-- =====================================================

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for authenticated users" ON projects
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TASKS POLICIES
-- =====================================================

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for authenticated users" ON tasks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- INVOICES POLICIES
-- =====================================================

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for authenticated users" ON invoices
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- DEVIS POLICIES
-- =====================================================

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for authenticated users" ON devis
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- CONTRACTS POLICIES
-- =====================================================

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for authenticated users" ON contracts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- EMPLOYEES POLICIES
-- =====================================================

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read access for authenticated users" ON employees
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Note: Policies plus complexes basées sur les rôles
-- seront ajoutées dans une migration ultérieure
-- =====================================================