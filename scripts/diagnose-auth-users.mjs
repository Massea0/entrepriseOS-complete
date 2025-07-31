#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('\n🔍 Diagnostic des problèmes d\'authentification\n'));

async function diagnoseAuthUsers() {
  try {
    // 1. Lister tous les utilisateurs
    console.log(chalk.yellow('1. Analyse des utilisateurs dans auth.users...\n'));
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000 // Récupérer jusqu'à 1000 utilisateurs
    });
    
    if (error) {
      console.error(chalk.red('Erreur:'), error);
      return;
    }

    console.log(chalk.cyan(`Total utilisateurs: ${users.length}\n`));

    // Analyser chaque utilisateur
    users.forEach((user, index) => {
      console.log(chalk.white(`\n${index + 1}. ${user.email}`));
      console.log(chalk.gray('─'.repeat(50)));
      
      // Informations de base
      console.log(`   ID: ${chalk.gray(user.id)}`);
      console.log(`   Créé le: ${chalk.gray(new Date(user.created_at).toLocaleDateString())}`);
      
      // Statut de confirmation email
      if (user.email_confirmed_at) {
        console.log(`   Email confirmé: ${chalk.green('✅ OUI')} le ${new Date(user.email_confirmed_at).toLocaleDateString()}`);
      } else {
        console.log(`   Email confirmé: ${chalk.red('❌ NON')}`);
      }
      
      // Dernière connexion
      if (user.last_sign_in_at) {
        console.log(`   Dernière connexion: ${chalk.green(new Date(user.last_sign_in_at).toLocaleDateString())}`);
      } else {
        console.log(`   Dernière connexion: ${chalk.yellow('JAMAIS')}`);
      }
      
      // Méthode de connexion
      console.log(`   Méthode d'inscription: ${chalk.cyan(user.identities?.[0]?.provider || 'unknown')}`);
      
      // Métadonnées
      console.log(`   Rôle (app_metadata): ${chalk.magenta(user.app_metadata?.role || 'NON DÉFINI')}`);
      console.log(`   Actif (app_metadata): ${user.app_metadata?.is_active ? '✅' : '❌'}`);
      
      // Problèmes potentiels
      const issues = [];
      
      if (!user.email_confirmed_at) {
        issues.push(chalk.red('⚠️  Email non confirmé'));
      }
      
      if (!user.identities || user.identities.length === 0) {
        issues.push(chalk.red('⚠️  Aucune identité (pas de mot de passe?)'));
      }
      
      if (!user.app_metadata?.role) {
        issues.push(chalk.yellow('⚠️  Rôle non défini'));
      }
      
      if (user.app_metadata?.is_active === false) {
        issues.push(chalk.red('⚠️  Compte désactivé'));
      }
      
      if (issues.length > 0) {
        console.log(chalk.red('\n   Problèmes détectés:'));
        issues.forEach(issue => console.log(`   ${issue}`));
      } else {
        console.log(chalk.green('\n   ✅ Compte semble OK'));
      }
    });

    // 2. Résumé des problèmes
    console.log(chalk.blue('\n\n📊 Résumé des problèmes:\n'));
    
    const unconfirmed = users.filter(u => !u.email_confirmed_at);
    const noIdentity = users.filter(u => !u.identities || u.identities.length === 0);
    const noRole = users.filter(u => !u.app_metadata?.role);
    const inactive = users.filter(u => u.app_metadata?.is_active === false);
    const neverLoggedIn = users.filter(u => !u.last_sign_in_at);
    
    console.log(`❌ Emails non confirmés: ${chalk.red(unconfirmed.length)} utilisateurs`);
    if (unconfirmed.length > 0) {
      unconfirmed.forEach(u => console.log(chalk.gray(`   - ${u.email}`)));
    }
    
    console.log(`\n❌ Sans identité/mot de passe: ${chalk.red(noIdentity.length)} utilisateurs`);
    if (noIdentity.length > 0) {
      noIdentity.forEach(u => console.log(chalk.gray(`   - ${u.email}`)));
    }
    
    console.log(`\n⚠️  Sans rôle défini: ${chalk.yellow(noRole.length)} utilisateurs`);
    if (noRole.length > 0) {
      noRole.forEach(u => console.log(chalk.gray(`   - ${u.email}`)));
    }
    
    console.log(`\n❌ Comptes désactivés: ${chalk.red(inactive.length)} utilisateurs`);
    if (inactive.length > 0) {
      inactive.forEach(u => console.log(chalk.gray(`   - ${u.email}`)));
    }
    
    console.log(`\n⚠️  Jamais connectés: ${chalk.yellow(neverLoggedIn.length)} utilisateurs`);
    if (neverLoggedIn.length > 0) {
      neverLoggedIn.forEach(u => console.log(chalk.gray(`   - ${u.email}`)));
    }

    // 3. Solutions proposées
    console.log(chalk.blue('\n\n💡 Solutions proposées:\n'));
    
    if (unconfirmed.length > 0) {
      console.log(chalk.yellow('Pour les emails non confirmés:'));
      console.log('1. Confirmer manuellement les emails');
      console.log('2. Renvoyer les emails de confirmation');
      console.log('3. Créer un script pour confirmer en masse\n');
    }
    
    if (noIdentity.length > 0) {
      console.log(chalk.yellow('Pour les utilisateurs sans mot de passe:'));
      console.log('1. Ces utilisateurs ont été créés sans mot de passe');
      console.log('2. Ils doivent utiliser "Mot de passe oublié" pour définir un mot de passe');
      console.log('3. Ou recréer les comptes avec un mot de passe\n');
    }

    // 4. Test de connexion
    console.log(chalk.blue('\n\n🔐 Test de connexion avec les comptes confirmés:\n'));
    
    const confirmedUsers = users.filter(u => u.email_confirmed_at && u.identities?.length > 0);
    
    if (confirmedUsers.length > 0) {
      console.log(chalk.green('Utilisateurs qui DEVRAIENT pouvoir se connecter:'));
      confirmedUsers.forEach(u => {
        console.log(`\n✅ ${chalk.cyan(u.email)}`);
        console.log(`   - Email confirmé: ✓`);
        console.log(`   - Identité présente: ✓`);
        console.log(`   - Rôle: ${u.app_metadata?.role || 'client (par défaut)'}`);
        
        if (!u.app_metadata?.role) {
          console.log(chalk.yellow('   ⚠️  Attention: Pas de rôle défini, utilisera "client" par défaut'));
        }
      });
    } else {
      console.log(chalk.red('❌ AUCUN utilisateur ne peut se connecter actuellement!'));
      console.log(chalk.yellow('\nRaison principale: Emails non confirmés ou pas de mot de passe défini.'));
    }

  } catch (error) {
    console.error(chalk.red('Erreur:'), error);
  }
}

// Exécuter le diagnostic
diagnoseAuthUsers();