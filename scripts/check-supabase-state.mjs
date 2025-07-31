// Script pour vérifier l'état actuel de Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzkwNTAsImV4cCI6MjA0NzE1NTA1MH0.xE-ws_IkXJBMV5fwEAZhPFkjHDbN5JrXyj88QmE6kKg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabaseState() {
  console.log('🔍 VÉRIFICATION DE L\'ÉTAT SUPABASE...\n');
  console.log(`URL: ${supabaseUrl}\n`);
  
  const results = {
    timestamp: new Date().toISOString(),
    supabaseUrl: supabaseUrl,
    tables: [],
    edgeFunctions: [],
    errors: [],
    summary: {}
  };

  // 1. Vérifier les tables principales
  const tablesToCheck = [
    // Tables Business
    'companies',
    'invoices',
    'devis',
    'contracts',
    
    // Tables Projects
    'projects', 
    'tasks',
    
    // Tables HR
    'employees',
    'departments',
    'positions',
    'leave_types',
    'leave_requests',
    'leave_balances',
    
    // Tables Auth/Users
    'users',
    'profiles',
    
    // Tables AI
    'ai_agents',
    'ai_agent_actions',
    'ai_agent_memory',
    'ai_insights',
    'ai_predictions',
    
    // Autres tables possibles
    'workflows',
    'notifications',
    'integrations'
  ];

  console.log('📊 VÉRIFICATION DES TABLES:\n');
  
  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === '42P01') {
          console.log(`❌ ${table}: N'existe pas`);
          results.tables.push({ name: table, exists: false });
        } else {
          console.log(`⚠️ ${table}: Erreur - ${error.message}`);
          results.errors.push({ table, error: error.message });
        }
      } else {
        console.log(`✅ ${table}: Existe (${count || 0} enregistrements)`);
        results.tables.push({ name: table, exists: true, count: count || 0 });
      }
    } catch (err) {
      console.log(`❌ ${table}: Erreur - ${err.message}`);
      results.errors.push({ table, error: err.message });
    }
  }

  // 2. Vérifier quelques données spécifiques pour les tables existantes
  console.log('\n📋 ÉCHANTILLON DE DONNÉES:\n');
  
  const existingTables = results.tables.filter(t => t.exists);
  
  for (const tableInfo of existingTables.slice(0, 5)) { // Limiter à 5 tables
    try {
      const { data, error } = await supabase
        .from(tableInfo.name)
        .select('*')
        .limit(2);
      
      if (!error && data && data.length > 0) {
        console.log(`\n📄 ${tableInfo.name} (échantillon):`);
        console.log(JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
      }
    } catch (err) {
      console.log(`Impossible de récupérer des données de ${tableInfo.name}`);
    }
  }

  // 3. Lister les Edge Functions attendues
  console.log('\n🚀 EDGE FUNCTIONS CONFIGURÉES:\n');
  const expectedFunctions = [
    'ai-business-analyzer',
    'ai-predictive-analytics',
    'ai-intelligent-alerts',
    'ai-workflow-orchestrator',
    'ai-sales-agent',
    'ai-support-assistant',
    'ai-work-organizer',
    'ai-recommendations-engine',
    'ai-performance-optimizer',
    'ai-financial-predictions',
    'enhance-task',
    'bulk-create-tasks',
    'project-planner-ai',
    'task-assigner-ai',
    'smart-task-assignment',
    'voice-ai-assistant',
    'gemini-live-voice',
    'gemini-live-voice-enhanced',
    'elevenlabs-voice',
    'send-notification-email',
    'send-sms-notification',
    'third-party-integrations',
    'gdpr-compliance',
    'setup-test-data',
    'mobile-api',
    'projects-api',
    'tasks-api',
    'task-mermaid-generator'
  ];

  expectedFunctions.forEach(func => {
    console.log(`📦 ${func}`);
    results.edgeFunctions.push(func);
  });

  // 4. Résumé
  console.log('\n📊 RÉSUMÉ:\n');
  const existingTablesCount = results.tables.filter(t => t.exists).length;
  const missingTablesCount = results.tables.filter(t => !t.exists).length;
  const totalRecords = results.tables
    .filter(t => t.exists)
    .reduce((sum, t) => sum + (t.count || 0), 0);
  
  results.summary = {
    existingTables: existingTablesCount,
    missingTables: missingTablesCount,
    totalRecords: totalRecords,
    edgeFunctions: expectedFunctions.length,
    errors: results.errors.length
  };
  
  console.log(`✅ Tables existantes: ${existingTablesCount}`);
  results.tables.filter(t => t.exists).forEach(t => {
    console.log(`   - ${t.name} (${t.count} enregistrements)`);
  });
  
  console.log(`\n❌ Tables manquantes: ${missingTablesCount}`);
  results.tables.filter(t => !t.exists).forEach(t => {
    console.log(`   - ${t.name}`);
  });
  
  console.log(`\n📦 Edge Functions: ${expectedFunctions.length}`);
  console.log(`📊 Total enregistrements: ${totalRecords}`);
  
  if (results.errors.length > 0) {
    console.log(`\n⚠️ Erreurs rencontrées: ${results.errors.length}`);
    results.errors.forEach(e => {
      console.log(`   - ${e.table}: ${e.error}`);
    });
  }

  // Sauvegarder le rapport
  fs.writeFileSync(
    'SUPABASE_STATE_REPORT.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n📄 Rapport complet sauvegardé dans SUPABASE_STATE_REPORT.json');
  
  return results;
}

// Exécuter la vérification
checkSupabaseState()
  .then(() => {
    console.log('\n✅ Vérification terminée !');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Erreur lors de la vérification:', err);
    process.exit(1);
  });