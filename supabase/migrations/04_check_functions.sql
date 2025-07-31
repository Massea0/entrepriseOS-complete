-- =====================================================
-- VÉRIFIER LES FONCTIONS SQL EXISTANTES
-- =====================================================

-- Lister toutes les fonctions du schéma public
SELECT 
  proname as function_name,
  pg_get_function_result(oid) as return_type,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE pronamespace = (
  SELECT oid FROM pg_namespace WHERE nspname = 'public'
)
AND proname IN (
  'get_my_role',
  'get_user_company_id',
  'get_current_user_employee_id',
  'handle_new_user',
  'update_updated_at_column'
)
ORDER BY proname;