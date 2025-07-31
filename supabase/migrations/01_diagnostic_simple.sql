-- =====================================================
-- DIAGNOSTIC SIMPLE - EXÉCUTEZ CHAQUE REQUÊTE SÉPARÉMENT
-- =====================================================

-- REQUÊTE 1: Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- REQUÊTE 2: Vérifier si profiles existe et sa structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- REQUÊTE 3: Vérifier si ai_agents existe et sa structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'ai_agents'
ORDER BY ordinal_position;

-- REQUÊTE 4: Lister tous les types ENUM
SELECT t.typname as type_name
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public' 
AND t.typtype = 'e'
ORDER BY t.typname;

-- REQUÊTE 5: Chercher toutes les tables avec company_id
SELECT table_name
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'company_id'
ORDER BY table_name;