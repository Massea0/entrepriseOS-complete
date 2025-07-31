// Script pour vérifier l'état actuel de Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzkwNTAsImV4cCI6MjA0NzE1NTA1MH0.xE-ws_IkXJBMV5fwEAZhPFkjHDbN5JrXyj88QmE6kKg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabaseState() {
  console.log('🔍 VÉRIFICATION DE L\'ÉTAT SUPABASE...\n');
  
  const results = {
    tables: [],
    edgeFunctions: [],
    errors: []
  };

  // 1. Vérifier les tables principales
  const tablesToCheck = [
    'companies',
    'projects', 
    'tasks',
    'invoices',
    'devis',
    'contracts',
    'employees',
    'users',
    'profiles',
    'departments',
    'positions',
    'leave_types',
    'leave_requests',
    'ai_agents',
    'ai_agent_actions',
    'ai_agent_memory'
  ];

  console.log('📊 VÉRIFICATION DES TABLES:\n');
  
  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('does not exist')) {
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

  // 2. Vérifier quelques données spécifiques
  console.log('\n📋 ÉCHANTILLON DE DONNÉES:\n');
  
  // Vérifier les factures
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, amount, status, created_at')
      .limit(3)
      .order('created_at', { ascending: false });
    
    if (!error && invoices) {
      console.log('Dernières factures:', invoices);
    }
  } catch (err) {
    console.log('Impossible de récupérer les factures:', err.message);
  }

  // Vérifier les devis
  try {
    const { data: quotes, error } = await supabase
      .from('devis')
      .select('id, devis_number, amount, status, created_at')
      .limit(3)
      .order('created_at', { ascending: false });
    
    if (!error && quotes) {
      console.log('\nDerniers devis:', quotes);
    }
  } catch (err) {
    console.log('Impossible de récupérer les devis:', err.message);
  }

  // 3. Lister les Edge Functions (via l'API Supabase Management si disponible)
  console.log('\n🚀 EDGE FUNCTIONS ATTENDUES:\n');
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
    'voice-ai-assistant',
    'gemini-live-voice',
    'gemini-live-voice-enhanced'
  ];

  expectedFunctions.forEach(func => {
    console.log(`📦 ${func}`);
  });

  // 4. Résumé
  console.log('\n📊 RÉSUMÉ:\n');
  const existingTables = results.tables.filter(t => t.exists);
  const missingTables = results.tables.filter(t => !t.exists);
  
  console.log(`✅ Tables existantes: ${existingTables.length}`);
  existingTables.forEach(t => {
    console.log(`   - ${t.name} (${t.count} enregistrements)`);
  });
  
  console.log(`\n❌ Tables manquantes: ${missingTables.length}`);
  missingTables.forEach(t => {
    console.log(`   - ${t.name}`);
  });
  
  if (results.errors.length > 0) {
    console.log(`\n⚠️ Erreurs rencontrées: ${results.errors.length}`);
    results.errors.forEach(e => {
      console.log(`   - ${e.table}: ${e.error}`);
    });
  }

  // Sauvegarder le rapport
  const fs = await import('fs');
  fs.writeFileSync(
    'SUPABASE_STATE_REPORT.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n📄 Rapport sauvegardé dans SUPABASE_STATE_REPORT.json');
}

// Exécuter la vérification
checkSupabaseState().catch(console.error);