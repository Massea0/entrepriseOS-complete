import { supabase } from './supabase';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';

// Mapping des collections mockées vers les tables Supabase EXISTANTES
const COLLECTION_TO_TABLE_MAP: Record<string, string> = {
  // HR Module
  'employees': 'profiles',
  'departments': 'departments',
  'positions': 'positions',
  'leaves': 'leave_requests',
  'leave_types': 'leave_types',
  'leave_balances': 'leave_balances',
  
  // CRM Module
  'contacts': 'profiles', // Les contacts sont des profiles
  'companies': 'companies',
  'opportunities': 'projects', // Opportunities = Projects avec metadata
  'activities': 'audit_logs', // Activities tracked in audit
  
  // Finance Module
  'invoices': 'invoices',
  'quotes': 'devis',
  'expenses': 'invoices', // Expenses = negative invoices
  'transactions': 'audit_logs',
  
  // Projects Module
  'projects': 'projects',
  'tasks': 'tasks',
  'milestones': 'tasks', // Milestones = parent tasks
  
  // AI Module
  'ai_agents': 'ai_agents',
  'ai_actions': 'ai_agent_actions',
  
  // Common
  'users': 'profiles',
  'organizations': 'companies',
  'audit': 'audit_logs',
};

// Adaptateur pour les hooks existants
export function createSupabaseAdapter(moduleName: string) {
  return {
    // Query adapter
    useQuery: (collection: string, filters?: any) => {
      const tableName = COLLECTION_TO_TABLE_MAP[collection] || collection;
      
      return useSupabaseQuery(
        [moduleName, tableName, filters],
        {
          table: tableName,
          filters: filters,
          orderBy: { column: 'created_at', ascending: false },
        }
      );
    },

    // Get single item
    useGet: (collection: string, id: string) => {
      const tableName = COLLECTION_TO_TABLE_MAP[collection] || collection;
      
      return useSupabaseQuery(
        [moduleName, tableName, id],
        {
          table: tableName,
          filters: { id },
          single: true,
        }
      );
    },

    // Create mutation
    useCreate: (collection: string) => {
      const tableName = COLLECTION_TO_TABLE_MAP[collection] || collection;
      
      return useSupabaseMutation({
        table: tableName,
        operation: 'insert',
      });
    },

    // Update mutation
    useUpdate: (collection: string) => {
      const tableName = COLLECTION_TO_TABLE_MAP[collection] || collection;
      
      return useSupabaseMutation({
        table: tableName,
        operation: 'update',
      });
    },

    // Delete mutation
    useDelete: (collection: string) => {
      const tableName = COLLECTION_TO_TABLE_MAP[collection] || collection;
      
      return useSupabaseMutation({
        table: tableName,
        operation: 'delete',
      });
    },

    // Upsert mutation
    useUpsert: (collection: string, conflictColumn = 'id') => {
      const tableName = COLLECTION_TO_TABLE_MAP[collection] || collection;
      
      return useSupabaseMutation({
        table: tableName,
        operation: 'upsert',
        onConflict: conflictColumn,
      });
    },
  };
}

// Module-specific adapters
export const hrAdapter = createSupabaseAdapter('hr');
export const crmAdapter = createSupabaseAdapter('crm');
export const financeAdapter = createSupabaseAdapter('finance');
export const projectsAdapter = createSupabaseAdapter('projects');
export const inventoryAdapter = createSupabaseAdapter('inventory');

// Helper pour migrer les données existantes
export async function migrateModuleData(
  moduleName: string,
  mockData: Record<string, any[]>
) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const [collection, items] of Object.entries(mockData)) {
    const tableName = COLLECTION_TO_TABLE_MAP[collection] || collection;
    
    try {
      // Insert data in batches
      const batchSize = 100;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from(tableName)
          .upsert(batch, { onConflict: 'id' });
          
        if (error) {
          results.failed += batch.length;
          results.errors.push(`${tableName}: ${error.message}`);
        } else {
          results.success += batch.length;
        }
      }
    } catch (error) {
      results.failed += items.length;
      results.errors.push(`${tableName}: ${error}`);
    }
  }

  return results;
}

// Helper pour vérifier la connexion Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
      
    if (error) throw error;
    
    return { connected: true, message: 'Supabase connection successful' };
  } catch (error) {
    return { 
      connected: false, 
      message: `Supabase connection failed: ${error}` 
    };
  }
}

// Helper pour initialiser les données de base
export async function initializeOrganization(orgData: {
  name: string;
  domain: string;
  settings?: any;
}) {
  try {
    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('companies')
      .insert({
        name: orgData.name,
        domain: orgData.domain,
        settings: orgData.settings || {},
        subscription_tier: 'trial',
        subscription_status: 'active',
      })
      .select()
      .single();
      
    if (orgError) throw orgError;

    // Create default departments
    const departments = [
      { name: 'Management', code: 'MGT', company_id: org.id },
      { name: 'Sales', code: 'SLS', company_id: org.id },
      { name: 'Engineering', code: 'ENG', company_id: org.id },
      { name: 'HR', code: 'HR', company_id: org.id },
      { name: 'Finance', code: 'FIN', company_id: org.id },
    ];

    const { error: deptError } = await supabase
      .from('departments')
      .insert(departments);
      
    if (deptError) throw deptError;

    // Create default roles
    const roles = [
      { name: 'Admin', permissions: ['*'], company_id: org.id },
      { name: 'Manager', permissions: ['read', 'write', 'approve'], company_id: org.id },
      { name: 'Employee', permissions: ['read', 'write:own'], company_id: org.id },
      { name: 'Viewer', permissions: ['read'], company_id: org.id },
    ];

    const { error: roleError } = await supabase
      .from('roles')
      .insert(roles);
      
    if (roleError) throw roleError;

    return { success: true, organization: org };
  } catch (error) {
    return { success: false, error };
  }
}