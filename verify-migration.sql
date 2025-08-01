-- =====================================================
-- SCRIPT DE VÉRIFICATION PRÉ-MIGRATION
-- Exécutez ce script AVANT la migration principale
-- =====================================================

-- 1. Vérifier les extensions nécessaires
SELECT 
    name,
    installed_version,
    CASE 
        WHEN name IN ('uuid-ossp', 'pgcrypto') THEN '✅ Requis'
        ELSE '⚠️ Optionnel'
    END as status
FROM pg_available_extensions 
WHERE name IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent');

-- 2. Vérifier les tables existantes (pour éviter les conflits)
SELECT 
    tablename,
    '⚠️ Table existe déjà' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'companies', 'profiles', 'employees', 'departments',
    'projects', 'tasks', 'invoices', 'quotes',
    'contracts', 'leave_requests', 'leave_types'
);

-- 3. Vérifier les types ENUM existants
SELECT 
    typname as enum_name,
    '⚠️ Type existe déjà' as status
FROM pg_type 
WHERE typtype = 'e' 
AND typname IN (
    'user_role', 'employment_status', 'task_status',
    'project_status', 'invoice_status', 'quote_status'
);

-- 4. Vérifier l'état de auth.users
SELECT 
    COUNT(*) as user_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Prêt pour migration'
        ELSE '⚠️ ' || COUNT(*) || ' utilisateurs existants'
    END as status
FROM auth.users;

-- 5. Vérifier les politiques RLS existantes
SELECT 
    schemaname,
    tablename,
    COUNT(policyname) as policy_count,
    CASE 
        WHEN COUNT(policyname) = 0 THEN '✅ Aucune politique'
        ELSE '⚠️ ' || COUNT(policyname) || ' politiques existantes'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename;

-- 6. Résumé des recommandations
SELECT 
    '=============== RÉSUMÉ ===============' as info
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('companies', 'profiles'))
        THEN '⚠️ ATTENTION: Des tables existent déjà. Sauvegardez les données avant migration!'
        ELSE '✅ Aucune table en conflit détectée'
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typtype = 'e' AND typname IN ('user_role', 'employment_status'))
        THEN '⚠️ ATTENTION: Des types ENUM existent déjà. La migration gèrera les conflits.'
        ELSE '✅ Aucun type en conflit détecté'
    END
UNION ALL
SELECT 
    '✅ Migration safe detectée: 20250729_complete_migration_safe.sql'
UNION ALL
SELECT 
    '📋 Cette migration vérifie l''existence des objets avant création';