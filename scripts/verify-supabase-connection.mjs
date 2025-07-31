#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

// Vérifier les clés utilisées
const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

console.log(chalk.blue('\n🔍 Vérification de la connexion Supabase\n'));

console.log(chalk.yellow('Projet Supabase:'));
console.log(`URL: ${chalk.cyan(SUPABASE_URL)}`);
console.log(`Ref ID: ${chalk.cyan('qlqgyrfqiflnqknbtycw')}`);
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyConnection() {
  try {
    // 1. Tester la connexion de base
    console.log(chalk.yellow('1. Test de connexion...\n'));
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error(chalk.red('❌ Erreur de connexion:'), testError.message);
      return;
    }
    
    console.log(chalk.green('✅ Connexion réussie!'));
    console.log(`   Nombre de profils: ${testData}`);

    // 2. Lister TOUS les utilisateurs auth
    console.log(chalk.yellow('\n2. Récupération de TOUS les utilisateurs Auth...\n'));
    
    // Essayer différentes méthodes
    console.log(chalk.cyan('Méthode 1: listUsers avec pagination'));
    const { data: { users: users1 }, error: error1 } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    if (!error1) {
      console.log(`   Trouvés: ${chalk.green(users1.length)} utilisateurs`);
    } else {
      console.log(`   Erreur: ${chalk.red(error1.message)}`);
    }

    // Méthode alternative
    console.log(chalk.cyan('\nMéthode 2: listUsers sans paramètres'));
    const { data: { users: users2 }, error: error2 } = await supabase.auth.admin.listUsers();
    
    if (!error2) {
      console.log(`   Trouvés: ${chalk.green(users2.length)} utilisateurs`);
    } else {
      console.log(`   Erreur: ${chalk.red(error2.message)}`);
    }

    // 3. Afficher les détails
    const users = users1 || users2 || [];
    
    console.log(chalk.yellow('\n3. Détails des utilisateurs trouvés:\n'));
    console.log(chalk.gray('─'.repeat(80)));
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${chalk.cyan(user.email || 'No email')}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Créé: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log(`   Confirmé: ${user.email_confirmed_at ? '✅' : '❌'}`);
      console.log(`   Provider: ${user.identities?.[0]?.provider || 'Aucun'}`);
      console.log(`   Dernière connexion: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Jamais'}`);
    });

    console.log(chalk.gray('\n' + '─'.repeat(80)));
    console.log(chalk.blue('\n📊 RÉSUMÉ:\n'));
    console.log(`Utilisateurs Auth trouvés: ${chalk.cyan(users.length)}`);
    
    // 4. Message important
    console.log(chalk.yellow('\n⚠️  IMPORTANT:\n'));
    console.log('Si vous voyez 6 utilisateurs dans le dashboard Supabase mais seulement');
    console.log(`${users.length} ici, vérifiez que :`);
    console.log('\n1. Vous regardez le bon projet Supabase');
    console.log('2. L\'URL du projet est: ' + chalk.cyan(SUPABASE_URL));
    console.log('3. Le Reference ID est: ' + chalk.cyan('qlqgyrfqiflnqknbtycw'));
    console.log('\nDans le dashboard Supabase, allez dans:');
    console.log('Settings > General > Reference ID pour vérifier');

  } catch (error) {
    console.error(chalk.red('\nErreur inattendue:'), error);
  }
}

// Exécuter
verifyConnection();