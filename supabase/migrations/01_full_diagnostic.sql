-- =====================================================
-- DIAGNOSTIC COMPLET DE L'ÉTAT ACTUEL
-- =====================================================

-- 1. LISTER TOUTES LES TABLES EXISTANTES
SELECT '=== TABLES EXISTANTES ===' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. STRUCTURE DE LA TABLE AI_AGENTS (si elle existe)
SELECT '=== STRUCTURE AI_AGENTS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'ai_agents'
ORDER BY ordinal_position;

-- 3. STRUCTURE DE LA TABLE PROFILES (si elle existe)
SELECT '=== STRUCTURE PROFILES ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. STRUCTURE DE LA TABLE COMPANIES (si elle existe)
SELECT '=== STRUCTURE COMPANIES ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'companies'
ORDER BY ordinal_position;

-- 5. TOUTES LES COLONNES AVEC COMPANY_ID
SELECT '=== TABLES AVEC COMPANY_ID ===' as info;
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'company_id'
ORDER BY table_name;

-- 6. COMPTER LES ENREGISTREMENTS DANS LES TABLES PRINCIPALES
SELECT '=== NOMBRE D\'ENREGISTREMENTS ===' as info;
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM companies) as companies_count,
  (SELECT COUNT(*) FROM ai_agents) as ai_agents_count;