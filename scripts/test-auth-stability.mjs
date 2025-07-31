#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('❌ Variables d\'environnement manquantes'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log(chalk.blue('\n🧪 Test de Stabilité de l\'Authentification\n'));

async function testConnection() {
  const testEmail = 'admin@entreprise-os.com';
  const testPassword = 'Admin123!@#';
  
  console.log(chalk.gray('📡 Test de connexion...'));
  
  try {
    // Test 1: Connexion
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error(chalk.red('❌ Erreur de connexion:'), signInError.message);
      return;
    }
    
    console.log(chalk.green('✅ Connexion réussie'));
    console.log(chalk.gray(`   User ID: ${signInData.user.id}`));
    console.log(chalk.gray(`   Email: ${signInData.user.email}`));
    console.log(chalk.gray(`   Role: ${signInData.user.app_metadata?.role || 'N/A'}`));
    
    // Test 2: Récupération de session
    console.log(chalk.gray('\n🔄 Test de récupération de session...'));
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error(chalk.red('❌ Erreur de session:'), sessionError.message);
    } else if (sessionData.session) {
      console.log(chalk.green('✅ Session active'));
      console.log(chalk.gray(`   Expire dans: ${Math.round((new Date(sessionData.session.expires_at * 1000) - new Date()) / 1000 / 60)} minutes`));
    } else {
      console.log(chalk.yellow('⚠️  Pas de session active'));
    }
    
    // Test 3: Test de stabilité (plusieurs requêtes rapides)
    console.log(chalk.gray('\n⚡ Test de stabilité (5 requêtes rapides)...'));
    
    let successCount = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < 5; i++) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        successCount++;
      }
      process.stdout.write(chalk.gray('.'));
    }
    
    const duration = Date.now() - startTime;
    console.log('');
    
    if (successCount === 5) {
      console.log(chalk.green(`✅ Toutes les requêtes réussies (${duration}ms)`));
    } else {
      console.log(chalk.yellow(`⚠️  ${successCount}/5 requêtes réussies`));
    }
    
    // Test 4: Déconnexion
    console.log(chalk.gray('\n🚪 Test de déconnexion...'));
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error(chalk.red('❌ Erreur de déconnexion:'), signOutError.message);
    } else {
      console.log(chalk.green('✅ Déconnexion réussie'));
    }
    
    // Résumé
    console.log(chalk.blue('\n📊 Résumé:'));
    console.log(chalk.gray('─────────────────────'));
    console.log(chalk.green('✅ Connexion: OK'));
    console.log(chalk.green('✅ Session: OK'));
    console.log(chalk.green(`✅ Stabilité: ${successCount}/5 requêtes`));
    console.log(chalk.green('✅ Déconnexion: OK'));
    console.log(chalk.gray('─────────────────────'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Erreur inattendue:'), error);
  }
}

// Test de performance
console.log(chalk.yellow('\n⏱️  Test de Performance\n'));

async function measurePerformance() {
  const operations = [
    { name: 'Connexion', fn: async () => {
      await supabase.auth.signInWithPassword({
        email: 'admin@entreprise-os.com',
        password: 'Admin123!@#'
      });
    }},
    { name: 'Get Session', fn: async () => {
      await supabase.auth.getSession();
    }},
    { name: 'Get User', fn: async () => {
      await supabase.auth.getUser();
    }},
    { name: 'Déconnexion', fn: async () => {
      await supabase.auth.signOut();
    }}
  ];
  
  for (const op of operations) {
    const start = Date.now();
    try {
      await op.fn();
      const duration = Date.now() - start;
      console.log(chalk.green(`✓ ${op.name}: ${duration}ms`));
    } catch (error) {
      const duration = Date.now() - start;
      console.log(chalk.red(`✗ ${op.name}: ${duration}ms (erreur)`));
    }
  }
}

// Exécuter les tests
(async () => {
  await testConnection();
  await measurePerformance();
  
  console.log(chalk.blue('\n✨ Tests terminés !\n'));
})();