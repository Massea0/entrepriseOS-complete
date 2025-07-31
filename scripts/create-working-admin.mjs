#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('\n🔧 Création d\'un administrateur FONCTIONNEL\n'));

async function createWorkingAdmin() {
  try {
    const email = 'admin@entreprise-os.com';
    const password = 'Admin123!@#';
    
    console.log(chalk.yellow('Création de l\'utilisateur admin...\n'));
    console.log(`Email: ${chalk.cyan(email)}`);
    console.log(`Mot de passe: ${chalk.cyan(password)}`);
    console.log('');

    // 1. Vérifier si l'utilisateur existe déjà
    const { data: existingUsers } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      console.log(chalk.yellow('⚠️  Utilisateur existant trouvé. Suppression...'));
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log(chalk.green('✅ Ancien utilisateur supprimé'));
    }

    // 2. Créer le nouvel utilisateur avec mot de passe
    console.log(chalk.yellow('\nCréation du nouvel utilisateur...'));
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        first_name: 'Admin',
        last_name: 'System',
        full_name: 'Admin System'
      },
      app_metadata: {
        role: 'admin',
        is_active: true
      }
    });

    if (authError) {
      console.error(chalk.red('❌ Erreur création auth:'), authError);
      return;
    }

    console.log(chalk.green('✅ Utilisateur créé dans auth.users'));
    console.log(chalk.gray(`   ID: ${authData.user.id}`));

    // 3. Créer le profil
    console.log(chalk.yellow('\nCréation du profil...'));
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        first_name: 'Admin',
        last_name: 'System',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.warn(chalk.yellow('⚠️  Avertissement profil:'), profileError.message);
    } else {
      console.log(chalk.green('✅ Profil créé'));
    }

    // 4. Tester la connexion
    console.log(chalk.yellow('\n🔐 Test de connexion...'));
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error(chalk.red('❌ Erreur de connexion:'), signInError.message);
    } else {
      console.log(chalk.green('✅ CONNEXION RÉUSSIE !'));
      console.log(chalk.gray(`   Session token: ${signInData.session?.access_token?.substring(0, 20)}...`));
    }

    // 5. Résumé final
    console.log(chalk.blue('\n\n📋 COMPTE ADMIN CRÉÉ AVEC SUCCÈS !\n'));
    console.log(chalk.white('Utilisez ces identifiants pour vous connecter :\n'));
    console.log(chalk.cyan(`📧 Email    : ${email}`));
    console.log(chalk.cyan(`🔑 Password : ${password}`));
    console.log(chalk.cyan(`👤 Rôle     : admin`));
    console.log(chalk.cyan(`✅ Statut   : Actif et confirmé`));
    
    console.log(chalk.yellow('\n⚠️  IMPORTANT : Changez ce mot de passe après la première connexion !'));
    
    // Créer d'autres utilisateurs de test
    console.log(chalk.blue('\n\nCréation d\'autres utilisateurs de test...\n'));
    
    const testUsers = [
      { email: 'manager@test.com', password: 'Manager123!', role: 'manager', name: 'Manager Test' },
      { email: 'employee@test.com', password: 'Employee123!', role: 'employee', name: 'Employee Test' }
    ];

    for (const testUser of testUsers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
          user_metadata: {
            full_name: testUser.name
          },
          app_metadata: {
            role: testUser.role,
            is_active: true
          }
        });

        if (!error) {
          // Créer le profil
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: testUser.email,
            first_name: testUser.name.split(' ')[0],
            last_name: testUser.name.split(' ')[1],
            role: testUser.role,
            is_active: true
          });

          console.log(chalk.green(`✅ ${testUser.email} créé (${testUser.password})`));
        }
      } catch (e) {
        console.error(chalk.red(`❌ Erreur pour ${testUser.email}`));
      }
    }

    console.log(chalk.green('\n\n✨ Tous les comptes de test sont créés !'));

  } catch (error) {
    console.error(chalk.red('\n❌ Erreur inattendue:'), error);
  }
}

// Exécuter
createWorkingAdmin();