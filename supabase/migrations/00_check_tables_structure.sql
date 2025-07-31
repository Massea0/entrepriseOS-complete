-- =====================================================
-- DIAGNOSTIC : VÉRIFIER L'ÉTAT DES TABLES
-- À exécuter AVANT la migration pour comprendre l'état actuel
-- =====================================================

-- 1. LISTER TOUTES LES TABLES
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. VÉRIFIER LA STRUCTURE DE LA TABLE PROFILES
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. VÉRIFIER QUELLES TABLES ONT UNE COLONNE COMPANY_ID
SELECT table_name
FROM information_schema.columns
WHERE table_schema = 'public' 
AND column_name = 'company_id'
ORDER BY table_name;

-- 4. VÉRIFIER LES TYPES ENUM EXISTANTS
SELECT n.nspname as schema, t.typname as type_name
FROM pg_type t
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid))
AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
AND n.nspname = 'public'
AND t.typtype = 'e'
ORDER BY 1, 2;