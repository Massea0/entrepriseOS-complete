#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('\n🔧 Correction des utilisateurs existants\n'));

async function fixExistingUsers() {
  try {
    // 1. Récupérer tous les utilisateurs
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    if (error) {
      console.error(chalk.red('Erreur:'), error);
      return;
    }

    console.log(chalk.cyan(`Utilisateurs trouvés: ${users.length}\n`));

    // 2. Identifier ceux qui n'ont pas de mot de passe
    const usersWithoutPassword = users.filter(u => !u.identities || u.identities.length === 0);
    
    if (usersWithoutPassword.length === 0) {
      console.log(chalk.green('✅ Tous les utilisateurs ont déjà un mot de passe!'));
      return;
    }

    console.log(chalk.yellow(`⚠️  ${usersWithoutPassword.length} utilisateur(s) sans mot de passe:\n`));

    // 3. Pour chaque utilisateur sans mot de passe
    for (const user of usersWithoutPassword) {
      console.log(chalk.white(`\nTraitement de ${user.email}...`));
      
      // Option 1: Définir un mot de passe temporaire
      const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
      
      console.log(chalk.yellow('Option 1: Définir un mot de passe temporaire'));
      
      // Supprimer et recréer l'utilisateur avec mot de passe
      console.log('  - Suppression de l\'ancien compte...');
      await supabase.auth.admin.deleteUser(user.id);
      
      console.log('  - Création du nouveau compte...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: user.user_metadata || {},
        app_metadata: user.app_metadata || {}
      });

      if (createError) {
        console.error(chalk.red(`  ❌ Erreur: ${createError.message}`));
        continue;
      }

      // Récupérer le profil existant
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (profile) {
        // Mettre à jour l'ID dans le profil
        await supabase
          .from('profiles')
          .update({ id: newUser.user.id })
          .eq('email', user.email);
      } else {
        // Créer un nouveau profil
        await supabase.from('profiles').insert({
          id: newUser.user.id,
          email: user.email,
          role: user.app_metadata?.role || 'employee',
          is_active: true
        });
      }

      console.log(chalk.green(`  ✅ Compte recréé avec succès!`));
      console.log(chalk.cyan(`  📧 Email: ${user.email}`));
      console.log(chalk.cyan(`  🔑 Mot de passe temporaire: ${tempPassword}`));
      
      // Option 2: Envoyer un email de réinitialisation
      console.log(chalk.yellow('\nOption 2: Email de réinitialisation'));
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: 'http://localhost:5173/reset-password'
      });

      if (resetError) {
        console.log(chalk.red(`  ❌ Impossible d'envoyer l'email: ${resetError.message}`));
      } else {
        console.log(chalk.green(`  ✅ Email de réinitialisation envoyé!`));
      }
    }

    // 4. Vérification finale
    console.log(chalk.blue('\n\n📊 Vérification finale...\n'));
    
    const { data: { users: finalUsers } } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    const canLogin = finalUsers?.users?.filter(u => u.identities && u.identities.length > 0) || [];
    const cannotLogin = finalUsers?.users?.filter(u => !u.identities || u.identities.length === 0) || [];

    console.log(`✅ Peuvent se connecter: ${chalk.green(canLogin.length)}`);
    console.log(`❌ Ne peuvent pas: ${chalk.red(cannotLogin.length)}`);

    if (canLogin.length > 0) {
      console.log(chalk.green('\n\nComptes corrigés avec succès:'));
      canLogin.forEach(u => {
        console.log(`  ✅ ${u.email}`);
      });
    }

  } catch (error) {
    console.error(chalk.red('\nErreur inattendue:'), error);
  }
}

// Exécuter
fixExistingUsers();