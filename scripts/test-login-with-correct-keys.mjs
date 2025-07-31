#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

// Utiliser les MÊMES clés que le frontend !
const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzkwNTAsImV4cCI6MjA0NzE1NTA1MH0.xE-ws_IkXJBMV5fwEAZhPFkjHDbN5JrXyj88QmE6kKg';

console.log(chalk.blue('\n🔐 Test de connexion avec les clés du FRONTEND\n'));

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
  const credentials = [
    { email: 'admin@entreprise-os.com', password: 'Admin123!@#', name: 'Admin' },
    { email: 'manager@test.com', password: 'Manager123!', name: 'Manager' },
    { email: 'employee@test.com', password: 'Employee123!', name: 'Employee' }
  ];

  console.log(chalk.yellow('Test avec les clés ANON du frontend:\n'));
  console.log(chalk.gray(`URL: ${SUPABASE_URL}`));
  console.log(chalk.gray(`Key: ${SUPABASE_ANON_KEY.substring(0, 50)}...`));
  console.log('');

  for (const cred of credentials) {
    console.log(chalk.cyan(`\nTest de connexion: ${cred.email}`));
    console.log(`Mot de passe: ${cred.password}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      if (error) {
        console.log(chalk.red(`❌ ERREUR: ${error.message}`));
        
        // Si invalid credentials, essayons de voir si l'utilisateur existe
        if (error.message.includes('Invalid login credentials')) {
          console.log(chalk.yellow('   → Vérification si l\'utilisateur existe...'));
          
          // On ne peut pas lister les users avec ANON key, mais on peut essayer reset password
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(cred.email);
          
          if (!resetError) {
            console.log(chalk.yellow('   → Email de reset envoyé = utilisateur existe'));
          } else {
            console.log(chalk.red('   → Utilisateur n\'existe peut-être pas'));
          }
        }
      } else {
        console.log(chalk.green(`✅ CONNEXION RÉUSSIE !`));
        console.log(`   User ID: ${data.user?.id}`);
        console.log(`   Session: ${data.session?.access_token?.substring(0, 20)}...`);
        
        // Se déconnecter pour le test suivant
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.log(chalk.red(`❌ Exception: ${e.message}`));
    }
  }

  // Diagnostic
  console.log(chalk.blue('\n\n📊 DIAGNOSTIC:\n'));
  console.log(chalk.yellow('Si tous les logins échouent avec "Invalid login credentials" :'));
  console.log('');
  console.log('1. Les utilisateurs ont été créés dans un AUTRE projet Supabase');
  console.log('2. Les clés ANON dans le frontend pointent vers un autre projet');
  console.log('3. Il faut recréer les utilisateurs dans le BON projet');
  console.log('');
  console.log(chalk.yellow('Vérifiez dans votre fichier .env :'));
  console.log('VITE_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=' + SUPABASE_ANON_KEY);
  console.log('');
  console.log(chalk.red('⚠️  Les clés SERVICE_ROLE dans mes scripts sont DIFFÉRENTES !'));
  console.log('Cela suggère qu\'il y a 2 projets Supabase différents.');
}

testLogin();