#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('\n🔍 Vérification complète de TOUS les utilisateurs Supabase Auth\n'));

async function checkAllUsers() {
  try {
    // Récupérer TOUS les utilisateurs sans limite
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000 // Maximum pour être sûr de tout récupérer
    });
    
    if (error) {
      console.error(chalk.red('Erreur:'), error);
      return;
    }

    console.log(chalk.cyan(`\n📊 TOTAL D'UTILISATEURS TROUVÉS: ${users.length}\n`));
    console.log(chalk.gray('═'.repeat(80)));

    // Grouper par statut
    const canLogin = [];
    const cannotLogin = [];

    users.forEach((user, index) => {
      const hasPassword = user.identities && user.identities.length > 0;
      const isConfirmed = !!user.email_confirmed_at;
      
      if (hasPassword && isConfirmed) {
        canLogin.push(user);
      } else {
        cannotLogin.push(user);
      }
    });

    // Afficher ceux qui PEUVENT se connecter
    console.log(chalk.green(`\n✅ PEUVENT SE CONNECTER (${canLogin.length} utilisateurs):\n`));
    canLogin.forEach((user, index) => {
      console.log(chalk.green(`${index + 1}. ${user.email}`));
      console.log(`   ID: ${chalk.gray(user.id)}`);
      console.log(`   Provider: ${chalk.cyan(user.identities[0].provider)}`);
      console.log(`   Dernière connexion: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Jamais'}`);
      console.log(`   Rôle (profile): ${chalk.magenta(user.raw_app_meta_data?.role || 'À vérifier dans profiles')}`);
      console.log('');
    });

    // Afficher ceux qui NE PEUVENT PAS se connecter
    console.log(chalk.red(`\n❌ NE PEUVENT PAS SE CONNECTER (${cannotLogin.length} utilisateurs):\n`));
    cannotLogin.forEach((user, index) => {
      console.log(chalk.red(`${index + 1}. ${user.email}`));
      console.log(`   ID: ${chalk.gray(user.id)}`);
      
      const problems = [];
      if (!user.identities || user.identities.length === 0) {
        problems.push('Pas de mot de passe');
      }
      if (!user.email_confirmed_at) {
        problems.push('Email non confirmé');
      }
      
      console.log(`   Problèmes: ${chalk.yellow(problems.join(', '))}`);
      console.log('');
    });

    // Vérifier aussi les profils
    console.log(chalk.blue('\n🔍 Vérification des profils associés...\n'));
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, first_name, last_name, is_active')
      .order('created_at', { ascending: false });

    if (!profileError && profiles) {
      console.log(chalk.cyan(`Profils trouvés: ${profiles.length}\n`));
      
      // Comparer avec auth.users
      const authUserIds = new Set(users.map(u => u.id));
      const profileIds = new Set(profiles.map(p => p.id));
      
      // Utilisateurs sans profil
      const usersWithoutProfile = users.filter(u => !profileIds.has(u.id));
      if (usersWithoutProfile.length > 0) {
        console.log(chalk.yellow(`⚠️  ${usersWithoutProfile.length} utilisateurs SANS profil:`));
        usersWithoutProfile.forEach(u => {
          console.log(`   - ${u.email} (${u.id})`);
        });
        console.log('');
      }
      
      // Profils orphelins (sans auth.user)
      const orphanProfiles = profiles.filter(p => !authUserIds.has(p.id));
      if (orphanProfiles.length > 0) {
        console.log(chalk.red(`❌ ${orphanProfiles.length} profils ORPHELINS (sans auth.user):`));
        orphanProfiles.forEach(p => {
          console.log(`   - ${p.email} (${p.id})`);
        });
      }
    }

    // Résumé final
    console.log(chalk.blue('\n\n📋 RÉSUMÉ FINAL:\n'));
    console.log(`Total utilisateurs auth: ${chalk.cyan(users.length)}`);
    console.log(`✅ Peuvent se connecter: ${chalk.green(canLogin.length)}`);
    console.log(`❌ Ne peuvent pas: ${chalk.red(cannotLogin.length)}`);
    console.log(`📊 Profils existants: ${chalk.cyan(profiles?.length || 0)}`);

    if (canLogin.length === 0) {
      console.log(chalk.red('\n⚠️  ATTENTION: Aucun utilisateur ne peut actuellement se connecter!'));
      console.log(chalk.yellow('\nSolutions:'));
      console.log('1. Créer de nouveaux utilisateurs avec mot de passe');
      console.log('2. Envoyer des liens de réinitialisation aux utilisateurs existants');
      console.log('3. Utiliser le script create-working-admin.mjs pour créer un admin fonctionnel');
    }

  } catch (error) {
    console.error(chalk.red('Erreur:'), error);
  }
}

// Exécuter
checkAllUsers();