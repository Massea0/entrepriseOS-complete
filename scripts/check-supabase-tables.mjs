#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function checkTables() {
  console.log('🔍 Diagnostic des tables Supabase...\n');

  try {
    // Liste des tables à vérifier
    const tablesToCheck = [
      'companies', 'profiles', 'departments', 'positions', 
      'employees', 'projects', 'tasks', 'invoices', 
      'devis', 'contracts', 'leave_types', 'leave_requests',
      'leave_balances', 'ai_agents', 'ai_agent_actions', 'ai_agent_memory'
    ];

    for (const tableName of tablesToCheck) {
      console.log(`\n📊 Table: ${tableName}`);
      console.log('─'.repeat(50));

      // Vérifier si la table existe
      const { data: tableInfo, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (tableError) {
        if (tableError.message.includes('does not exist')) {
          console.log('❌ Table n\'existe pas');
        } else {
          console.log(`⚠️  Erreur: ${tableError.message}`);
        }
        continue;
      }

      console.log('✅ Table existe');

      // Alternative: essayer de récupérer un enregistrement pour voir la structure
      const { data: sample } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (sample && sample.length > 0) {
        console.log('\n📋 Colonnes détectées:');
        Object.keys(sample[0]).forEach(key => {
          console.log(`   - ${key}`);
        });
      }

      // Compter les enregistrements
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log(`\n📊 Nombre d'enregistrements: ${count || 0}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
  }
}

// Exécution
console.log('🚀 Diagnostic Supabase\n');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseServiceKey.substring(0, 20)}...`);
console.log('─'.repeat(50));

// Lancer le diagnostic
await checkTables();