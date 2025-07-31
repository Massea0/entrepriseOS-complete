-- =====================================================
-- DIAGNOSTIC COMPLET DE L'ÉTAT ACTUEL
-- =====================================================

-- 1. LISTER TOUTES LES TABLES EXISTANTES
SELECT 'TABLES_EXISTANTES' as section, table_name as value
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. VÉRIFIER SI LES TABLES PRINCIPALES EXISTENT
SELECT 
  'TABLES_CHECK' as section,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') 
    THEN 'companies: EXISTS' 
    ELSE 'companies: NOT EXISTS' 
  END as companies,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
    THEN 'profiles: EXISTS' 
    ELSE 'profiles: NOT EXISTS' 
  END as profiles,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_agents') 
    THEN 'ai_agents: EXISTS' 
    ELSE 'ai_agents: NOT EXISTS' 
  END as ai_agents;

-- 3. STRUCTURE DE LA TABLE PROFILES (si elle existe)
SELECT 
  'PROFILES_COLUMNS' as section,
  column_name, 
  data_type,
  CASE WHEN column_name = 'company_id' THEN 'IMPORTANT' ELSE '' END as note
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. STRUCTURE DE LA TABLE AI_AGENTS (si elle existe)  
SELECT 
  'AI_AGENTS_COLUMNS' as section,
  column_name, 
  data_type,
  CASE WHEN column_name = 'company_id' THEN 'HAS_COMPANY_ID' ELSE '' END as note
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'ai_agents'
ORDER BY ordinal_position;

-- 5. LISTER TOUS LES TYPES ENUM
SELECT 
  'ENUM_TYPES' as section,
  t.typname as type_name
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public' 
AND t.typtype = 'e'
ORDER BY t.typname;

-- 6. TABLES QUI ONT UNE COLONNE COMPANY_ID
SELECT 
  'TABLES_WITH_COMPANY_ID' as section,
  table_name
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'company_id'
ORDER BY table_name;