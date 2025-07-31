-- =====================================================
-- VÉRIFIER LE STATUT RLS SUR LES TABLES
-- =====================================================

SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ACTIVÉ'
    ELSE '❌ RLS DÉSACTIVÉ'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'companies', 'users', 'employees', 'projects', 'tasks',
  'invoices', 'devis', 'contracts', 'ai_agents', 'tickets',
  'workflows', 'departments', 'positions'
)
ORDER BY 
  CASE WHEN rowsecurity = false THEN 0 ELSE 1 END,
  tablename;