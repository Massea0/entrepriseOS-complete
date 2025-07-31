#!/usr/bin/env node

// Script de migration des données de Neon vers Supabase
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Configuration
const NEON_DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Besoin de la clé service pour bypass RLS

// Validation
if (!NEON_DATABASE_URL) {
  console.error('❌ DATABASE_URL manquante dans .env');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY manquante - utilisation de la clé anon (limité par RLS)');
}

// Clients
const neonPool = new Pool({ connectionString: NEON_DATABASE_URL });
const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Tables à migrer dans l'ordre (respecter les dépendances)
const MIGRATION_ORDER = [
  'companies',
  'users', // vers auth.users + profiles
  'employees',
  'projects',
  'tasks',
  'invoices',
  'devis',
  'quotes', // si différent de devis
  'contracts',
  'aiAgents',
  'aiAgentActions',
  'aiAgentMemory',
  'leaveTypes',
  'leaveRequests',
  'leaveBalances'
];

// Mapping des tables Neon vers Supabase
const TABLE_MAPPING = {
  'quotes': 'devis', // Si quotes est le nom dans Neon
  'aiAgents': 'ai_agents',
  'aiAgentActions': 'ai_agent_actions',
  'aiAgentMemory': 'ai_agent_memory',
  'leaveTypes': 'leave_types',
  'leaveRequests': 'leave_requests',
  'leaveBalances': 'leave_balances'
};

// Log helper
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`)
};

// Migration functions
async function migrateCompanies() {
  log.info('Migration des companies...');
  
  try {
    const { rows } = await neonPool.query('SELECT * FROM companies');
    log.info(`${rows.length} companies trouvées`);
    
    for (const company of rows) {
      const { error } = await supabase
        .from('companies')
        .upsert({
          id: company.id,
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          siret: company.siret,
          industry: company.industry,
          website: company.website,
          description: company.description,
          created_at: company.createdAt || company.created_at,
          updated_at: company.updatedAt || company.updated_at
        });
      
      if (error) {
        log.error(`Erreur migration company ${company.name}: ${error.message}`);
      }
    }
    
    log.success(`${rows.length} companies migrées`);
  } catch (error) {
    log.error(`Erreur migration companies: ${error.message}`);
  }
}

async function migrateUsers() {
  log.info('Migration des users...');
  
  try {
    const { rows } = await neonPool.query('SELECT * FROM users');
    log.info(`${rows.length} users trouvés`);
    
    let migrated = 0;
    
    for (const user of rows) {
      try {
        // 1. Créer l'utilisateur dans auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'TempPassword123!', // À changer par l'utilisateur
          email_confirm: true,
          user_metadata: {
            role: user.role || 'employee',
            company_id: user.companyId || user.company_id
          }
        });
        
        if (authError) {
          if (authError.message.includes('already exists')) {
            log.warn(`User ${user.email} existe déjà`);
            continue;
          }
          throw authError;
        }
        
        // 2. Créer le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            first_name: user.firstName || user.first_name,
            last_name: user.lastName || user.last_name,
            email: user.email,
            role: user.role || 'employee',
            company_id: user.companyId || user.company_id,
            created_at: user.createdAt || user.created_at,
            updated_at: user.updatedAt || user.updated_at
          });
        
        if (profileError) {
          log.error(`Erreur création profil ${user.email}: ${profileError.message}`);
        } else {
          migrated++;
        }
        
      } catch (error) {
        log.error(`Erreur migration user ${user.email}: ${error.message}`);
      }
    }
    
    log.success(`${migrated}/${rows.length} users migrés`);
  } catch (error) {
    log.error(`Erreur migration users: ${error.message}`);
  }
}

async function migrateEmployees() {
  log.info('Migration des employees...');
  
  try {
    // D'abord récupérer le mapping user_id depuis les emails
    const { data: profiles } = await supabase.from('profiles').select('id, email');
    const emailToUserId = {};
    profiles?.forEach(p => emailToUserId[p.email] = p.id);
    
    const { rows } = await neonPool.query(`
      SELECT e.*, u.email 
      FROM employees e 
      LEFT JOIN users u ON e."userId" = u.id OR e.user_id = u.id
    `);
    
    log.info(`${rows.length} employees trouvés`);
    
    for (const emp of rows) {
      const userId = emailToUserId[emp.email] || emp.userId || emp.user_id;
      
      const { error } = await supabase
        .from('employees')
        .upsert({
          id: emp.id,
          user_id: userId,
          company_id: emp.companyId || emp.company_id,
          employee_number: emp.employeeNumber || emp.employee_number,
          department_id: emp.departmentId || emp.department_id,
          position_id: emp.positionId || emp.position_id,
          manager_id: emp.manager,
          employment_status: emp.employmentStatus || emp.employment_status || 'active',
          hire_date: emp.hireDate || emp.hire_date,
          salary: emp.salary,
          skills: emp.skills,
          work_schedule: emp.workSchedule || emp.work_schedule,
          created_at: emp.createdAt || emp.created_at,
          updated_at: emp.updatedAt || emp.updated_at
        });
      
      if (error) {
        log.error(`Erreur migration employee ${emp.employee_number}: ${error.message}`);
      }
    }
    
    log.success(`${rows.length} employees migrés`);
  } catch (error) {
    log.error(`Erreur migration employees: ${error.message}`);
  }
}

async function migrateProjects() {
  log.info('Migration des projects...');
  
  try {
    const { rows } = await neonPool.query('SELECT * FROM projects');
    log.info(`${rows.length} projects trouvés`);
    
    // Récupérer le mapping des users
    const { data: profiles } = await supabase.from('profiles').select('id, email');
    const userMapping = {};
    
    // Si on a besoin de mapper les anciens IDs
    const { rows: users } = await neonPool.query('SELECT id, email FROM users');
    users.forEach(u => {
      const profile = profiles?.find(p => p.email === u.email);
      if (profile) userMapping[u.id] = profile.id;
    });
    
    for (const project of rows) {
      const managerId = userMapping[project.managerId || project.manager_id] || project.managerId || project.manager_id;
      
      const { error } = await supabase
        .from('projects')
        .upsert({
          id: project.id,
          name: project.name,
          description: project.description,
          company_id: project.companyId || project.company_id,
          client_id: project.clientId || project.client_id,
          manager_id: managerId,
          status: project.status || 'draft',
          start_date: project.startDate || project.start_date,
          end_date: project.endDate || project.end_date,
          budget: project.budget,
          progress: project.progress || 0,
          created_at: project.createdAt || project.created_at,
          updated_at: project.updatedAt || project.updated_at
        });
      
      if (error) {
        log.error(`Erreur migration project ${project.name}: ${error.message}`);
      }
    }
    
    log.success(`${rows.length} projects migrés`);
  } catch (error) {
    log.error(`Erreur migration projects: ${error.message}`);
  }
}

async function migrateTasks() {
  log.info('Migration des tasks...');
  
  try {
    const { rows } = await neonPool.query('SELECT * FROM tasks');
    log.info(`${rows.length} tasks trouvées`);
    
    // Récupérer le mapping des users
    const { data: profiles } = await supabase.from('profiles').select('id, email');
    const userMapping = {};
    
    const { rows: users } = await neonPool.query('SELECT id, email FROM users');
    users.forEach(u => {
      const profile = profiles?.find(p => p.email === u.email);
      if (profile) userMapping[u.id] = profile.id;
    });
    
    for (const task of rows) {
      const assigneeId = userMapping[task.assigneeId || task.assignee_id] || task.assigneeId || task.assignee_id;
      const assignedBy = userMapping[task.assignedBy || task.assigned_by] || task.assignedBy || task.assigned_by;
      
      const { error } = await supabase
        .from('tasks')
        .upsert({
          id: task.id,
          title: task.title,
          description: task.description,
          project_id: task.projectId || task.project_id,
          assignee_id: assigneeId,
          assigned_by: assignedBy,
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          due_date: task.dueDate || task.due_date,
          estimated_hours: task.estimatedHours || task.estimated_hours,
          actual_hours: task.actualHours || task.actual_hours,
          tags: task.tags,
          created_at: task.createdAt || task.created_at,
          updated_at: task.updatedAt || task.updated_at
        });
      
      if (error) {
        log.error(`Erreur migration task ${task.title}: ${error.message}`);
      }
    }
    
    log.success(`${rows.length} tasks migrées`);
  } catch (error) {
    log.error(`Erreur migration tasks: ${error.message}`);
  }
}

async function migrateInvoices() {
  log.info('Migration des invoices...');
  
  try {
    const { rows } = await neonPool.query('SELECT * FROM invoices');
    log.info(`${rows.length} invoices trouvées`);
    
    for (const invoice of rows) {
      const { error } = await supabase
        .from('invoices')
        .upsert({
          id: invoice.id,
          invoice_number: invoice.invoiceNumber || invoice.invoice_number,
          company_id: invoice.companyId || invoice.company_id,
          client_id: invoice.clientId || invoice.client_id,
          project_id: invoice.projectId || invoice.project_id,
          status: invoice.status || 'draft',
          issue_date: invoice.issueDate || invoice.issue_date,
          due_date: invoice.dueDate || invoice.due_date,
          paid_date: invoice.paidDate || invoice.paid_date,
          amount: invoice.amount,
          tax_amount: invoice.taxAmount || invoice.tax_amount || 0,
          total_amount: invoice.totalAmount || invoice.total_amount || invoice.amount,
          currency: invoice.currency || 'XOF',
          items: invoice.items,
          payment_terms: invoice.paymentTerms || invoice.payment_terms,
          notes: invoice.notes,
          created_at: invoice.createdAt || invoice.created_at,
          updated_at: invoice.updatedAt || invoice.updated_at
        });
      
      if (error) {
        log.error(`Erreur migration invoice ${invoice.invoice_number}: ${error.message}`);
      }
    }
    
    log.success(`${rows.length} invoices migrées`);
  } catch (error) {
    log.error(`Erreur migration invoices: ${error.message}`);
  }
}

async function migrateDevis() {
  log.info('Migration des devis/quotes...');
  
  try {
    // Essayer 'quotes' et 'devis'
    let rows;
    try {
      const result = await neonPool.query('SELECT * FROM quotes');
      rows = result.rows;
    } catch (e) {
      const result = await neonPool.query('SELECT * FROM devis');
      rows = result.rows;
    }
    
    log.info(`${rows.length} devis trouvés`);
    
    for (const devis of rows) {
      const { error } = await supabase
        .from('devis')
        .upsert({
          id: devis.id,
          devis_number: devis.quoteNumber || devis.devisNumber || devis.devis_number,
          company_id: devis.companyId || devis.company_id,
          client_id: devis.clientId || devis.client_id,
          status: devis.status || 'draft',
          valid_until: devis.validUntil || devis.valid_until,
          amount: devis.amount,
          tax_amount: devis.taxAmount || devis.tax_amount || 0,
          total_amount: devis.totalAmount || devis.total_amount || devis.amount,
          currency: devis.currency || 'XOF',
          items: devis.items,
          terms: devis.terms,
          notes: devis.notes,
          created_at: devis.createdAt || devis.created_at,
          updated_at: devis.updatedAt || devis.updated_at
        });
      
      if (error) {
        log.error(`Erreur migration devis ${devis.devis_number}: ${error.message}`);
      }
    }
    
    log.success(`${rows.length} devis migrés`);
  } catch (error) {
    log.error(`Erreur migration devis: ${error.message}`);
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 DÉBUT DE LA MIGRATION NEON → SUPABASE\n');
  console.log(`📍 Source: ${NEON_DATABASE_URL.split('@')[1]}`);
  console.log(`📍 Destination: ${SUPABASE_URL}\n`);
  
  const startTime = Date.now();
  
  try {
    // Test connections
    log.info('Test connexion Neon...');
    await neonPool.query('SELECT 1');
    log.success('Connexion Neon OK');
    
    log.info('Test connexion Supabase...');
    const { error } = await supabase.from('companies').select('count', { count: 'exact', head: true });
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    log.success('Connexion Supabase OK\n');
    
    // Migration dans l'ordre
    await migrateCompanies();
    await migrateUsers();
    await migrateEmployees();
    await migrateProjects();
    await migrateTasks();
    await migrateInvoices();
    await migrateDevis();
    
    // Migration des autres tables si elles existent
    for (const table of MIGRATION_ORDER.slice(8)) {
      try {
        const neonTable = table;
        const supabaseTable = TABLE_MAPPING[table] || table;
        
        const { rows } = await neonPool.query(`SELECT * FROM "${neonTable}"`);
        if (rows.length > 0) {
          log.info(`Migration de ${rows.length} enregistrements de ${neonTable}...`);
          // Logique générique de migration
          for (const row of rows) {
            await supabase.from(supabaseTable).upsert(row);
          }
          log.success(`${neonTable} migré`);
        }
      } catch (error) {
        log.warn(`Table ${table} non trouvée ou erreur: ${error.message}`);
      }
    }
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✅ MIGRATION TERMINÉE EN ${duration} secondes!`);
    
    // Rapport final
    console.log('\n📊 RAPPORT FINAL:');
    for (const table of ['companies', 'profiles', 'employees', 'projects', 'tasks', 'invoices', 'devis']) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`   ${table}: ${count || 0} enregistrements`);
    }
    
  } catch (error) {
    log.error(`Erreur fatale: ${error.message}`);
    console.error(error);
  } finally {
    await neonPool.end();
  }
}

// Run migration
migrate().catch(console.error);