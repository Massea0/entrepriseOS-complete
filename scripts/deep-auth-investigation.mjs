#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.Cq-L0OEe3fs8JkczYEqLmhdW0x9M7-_PqCkP-nkdsoQ';

console.log(chalk.blue('\n🔍 Investigation approfondie des utilisateurs Supabase Auth\n'));

async function deepInvestigation() {
  try {
    // 1. Avec service role key
    console.log(chalk.yellow('1. Test avec SERVICE ROLE KEY:\n'));
    const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Essayer différentes approches
    console.log(chalk.cyan('a) listUsers avec perPage élevé:'));
    const { data: data1, error: error1 } = await supabaseService.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    console.log(`   Résultat: ${data1?.users?.length || 0} utilisateurs`);
    if (error1) console.log(`   Erreur: ${error1.message}`);

    console.log(chalk.cyan('\nb) listUsers par pages:'));
    let allUsers = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 10) {
      const { data, error } = await supabaseService.auth.admin.listUsers({
        page: page,
        perPage: 50
      });
      
      if (data?.users) {
        allUsers = [...allUsers, ...data.users];
        console.log(`   Page ${page}: ${data.users.length} utilisateurs`);
        hasMore = data.users.length === 50;
      } else {
        hasMore = false;
      }
      page++;
    }
    console.log(`   Total cumulé: ${allUsers.length} utilisateurs`);

    // 2. Requête directe à l'API REST
    console.log(chalk.yellow('\n2. Test avec l\'API REST directe:\n'));
    
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      console.log(`   Utilisateurs: ${data.users?.length || 0}`);
      
      if (data.users && data.users.length > 2) {
        console.log(chalk.green('\n   ✅ Trouvé plus de 2 utilisateurs!'));
        console.log(chalk.cyan('\n   Utilisateurs supplémentaires:'));
        data.users.forEach((user, idx) => {
          console.log(`   ${idx + 1}. ${user.email || 'No email'} (${user.id})`);
        });
      }
    } catch (e) {
      console.error(chalk.red('   Erreur REST API:'), e.message);
    }

    // 3. Vérifier si c'est un problème de filtrage
    console.log(chalk.yellow('\n3. Analyse des utilisateurs trouvés:\n'));
    
    const uniqueUsers = new Map();
    allUsers.forEach(u => uniqueUsers.set(u.id, u));
    
    console.log(`   Utilisateurs uniques: ${uniqueUsers.size}`);
    console.log(`   Détails:`);
    
    Array.from(uniqueUsers.values()).forEach((user, idx) => {
      console.log(`\n   ${idx + 1}. ${chalk.cyan(user.email || 'No email')}`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Créé: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log(`      Provider: ${user.identities?.[0]?.provider || 'AUCUN'}`);
      console.log(`      App metadata: ${JSON.stringify(user.app_metadata || {})}`);
      console.log(`      Raw app metadata: ${JSON.stringify(user.raw_app_meta_data || {})}`);
      console.log(`      Confirmé: ${user.email_confirmed_at ? '✅' : '❌'}`);
      console.log(`      Banned: ${user.banned_until ? '⛔' : '✅'}`);
      console.log(`      Deleted: ${user.deleted_at ? '🗑️' : '✅'}`);
    });

    // 4. Résumé et hypothèses
    console.log(chalk.blue('\n\n📊 ANALYSE:\n'));
    console.log(`Utilisateurs trouvés via API: ${chalk.cyan(uniqueUsers.size)}`);
    console.log(`Utilisateurs dans le dashboard: ${chalk.cyan('6')}`);
    
    if (uniqueUsers.size < 6) {
      console.log(chalk.yellow('\n🤔 Hypothèses sur les 4 utilisateurs manquants:\n'));
      console.log('1. Ils sont dans un autre projet Supabase');
      console.log('2. Ils ont été supprimés mais restent visibles dans le dashboard');
      console.log('3. Ils sont dans un état spécial (banned, deleted, etc.)');
      console.log('4. Bug de l\'API Supabase ou du dashboard');
      console.log('5. Permissions insuffisantes (même avec service role?)');
      
      console.log(chalk.yellow('\n💡 Actions suggérées:\n'));
      console.log('1. Vérifiez dans le dashboard les emails des 6 utilisateurs');
      console.log('2. Regardez s\'il y a des utilisateurs "deleted" ou "banned"');
      console.log('3. Essayez de créer un nouvel utilisateur et voir s\'il apparaît');
      console.log('4. Contactez le support Supabase si le problème persiste');
    }

  } catch (error) {
    console.error(chalk.red('\nErreur inattendue:'), error);
  }
}

// Exécuter
deepInvestigation();