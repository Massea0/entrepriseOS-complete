-- =====================================================
-- VÉRIFIER LES TABLES SANS POLICIES RLS
-- =====================================================

-- 1. Tables avec RLS activé MAIS sans policies
SELECT 
  schemaname,
  tablename,
  '❌ RLS activé mais AUCUNE policy' as status
FROM pg_tables t
WHERE schemaname = 'public'
AND rowsecurity = true
AND NOT EXISTS (
  SELECT 1 
  FROM pg_policies p 
  WHERE p.schemaname = t.schemaname 
  AND p.tablename = t.tablename
)
ORDER BY tablename;

-- 2. Nouvelles tables qui pourraient avoir besoin de policies
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS activé'
    ELSE '❌ RLS désactivé'
  END as rls_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies p 
      WHERE p.tablename = t.tablename
    ) THEN '✅ A des policies'
    ELSE '❌ Aucune policy'
  END as policy_status
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN (
  'leave_types',
  'leave_requests', 
  'leave_balances',
  'profiles'  -- Vue créée par la migration
)
ORDER BY tablename;