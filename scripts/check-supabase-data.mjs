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
  console.log('🔑 Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function checkData() {
  console.log('\n📊 VÉRIFICATION DES DONNÉES SUPABASE\n');
  console.log('─'.repeat(50));

  const tablesToCheck = [
    'companies',
    'users',
    'employees',
    'projects',
    'tasks',
    'invoices',
    'devis',
    'contracts'
  ];

  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Erreur - ${error.message}`);
      } else {
        const emoji = count > 0 ? '✅' : '⚪';
        console.log(`${emoji} ${table}: ${count || 0} enregistrements`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n─'.repeat(50));
  console.log('\n🔍 VÉRIFICATION DES UTILISATEURS\n');

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, company_id')
      .limit(5);

    if (!error && users && users.length > 0) {
      console.log('Exemples d\'utilisateurs :');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) ${user.company_id ? '✅ company' : '❌ no company'}`);
      });
    }
  } catch (err) {
    console.log('Impossible de récupérer les utilisateurs');
  }

  console.log('\n─'.repeat(50));
  console.log('\n🏢 VÉRIFICATION DES COMPANIES\n');

  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, email')
      .limit(5);

    if (!error && companies && companies.length > 0) {
      console.log('Exemples de companies :');
      companies.forEach(company => {
        console.log(`  - ${company.name} (${company.email})`);
      });
    }
  } catch (err) {
    console.log('Impossible de récupérer les companies');
  }
}

// Exécution
console.log('🚀 Diagnostic des données Supabase\n');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'MISSING'}`);

await checkData();