#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables Supabase manquantes dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔐 Test d\'authentification Supabase...\n');

  // Test 1: Vérifier la connexion
  console.log('1️⃣ Test de connexion à Supabase...');
  try {
    const { data, error } = await supabase.from('companies').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Connexion réussie!\n');
  } catch (error: any) {
    console.error('❌ Erreur de connexion:', error.message);
    return;
  }

  // Test 2: Créer un utilisateur test
  const testEmail = `test-${Date.now()}@entrepriseos.com`;
  const testPassword = 'TestPass123!';
  
  console.log('2️⃣ Création d\'un utilisateur test...');
  console.log(`   Email: ${testEmail}`);
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.error('❌ Erreur lors de l\'inscription:', signUpError.message);
    return;
  }

  console.log('✅ Utilisateur créé avec succès!');
  console.log(`   ID: ${signUpData.user?.id}\n`);

  // Test 3: Connexion
  console.log('3️⃣ Test de connexion...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error('❌ Erreur lors de la connexion:', signInError.message);
    return;
  }

  console.log('✅ Connexion réussie!');
  console.log(`   Session: ${signInData.session?.access_token.substring(0, 20)}...\n`);

  // Test 4: Récupérer l'utilisateur
  console.log('4️⃣ Récupération des infos utilisateur...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('❌ Erreur lors de la récupération:', userError.message);
    return;
  }

  console.log('✅ Utilisateur récupéré!');
  console.log(`   Email: ${user?.email}`);
  console.log(`   Role: ${user?.role}\n`);

  // Test 5: Déconnexion
  console.log('5️⃣ Test de déconnexion...');
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error('❌ Erreur lors de la déconnexion:', signOutError.message);
    return;
  }

  console.log('✅ Déconnexion réussie!\n');

  // Résumé
  console.log('📊 Résumé des tests:');
  console.log('   ✅ Connexion à Supabase: OK');
  console.log('   ✅ Création utilisateur: OK');
  console.log('   ✅ Authentification: OK');
  console.log('   ✅ Récupération infos: OK');
  console.log('   ✅ Déconnexion: OK');
  console.log('\n🎉 Tous les tests sont passés avec succès!');
  console.log('\n💡 Vous pouvez maintenant utiliser:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Mot de passe: ${testPassword}`);
}

testAuth().catch(console.error);