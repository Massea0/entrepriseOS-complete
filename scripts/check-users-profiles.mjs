#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('\n🔍 Vérification des comptes existants dans Supabase\n'));

async function checkUsersAndProfiles() {
  try {
    // 1. Check profiles table
    console.log(chalk.yellow('📊 Table: profiles'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error(chalk.red('Erreur profiles:'), profilesError);
    } else if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        console.log(chalk.green(`\n✓ ${profile.first_name || 'N/A'} ${profile.last_name || 'N/A'}`));
        console.log(`  Email: ${chalk.cyan(profile.email)}`);
        console.log(`  Rôle: ${chalk.magenta(profile.role || 'non défini')}`);
        console.log(`  ID: ${profile.id}`);
        console.log(`  Société: ${profile.company_id || 'non défini'}`);
        console.log(`  Actif: ${profile.is_active ? '✅' : '❌'}`);
      });
    } else {
      console.log(chalk.yellow('Aucun profil trouvé'));
    }
    
    // 2. Check auth.users via admin API
    console.log(chalk.yellow('\n\n📊 Utilisateurs Supabase Auth'));
    console.log(chalk.gray('─'.repeat(60)));
    
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error(chalk.red('Erreur auth:'), authError);
    } else if (authUsers && authUsers.length > 0) {
      authUsers.forEach(user => {
        console.log(chalk.green(`\n✓ ${user.email}`));
        console.log(`  ID: ${user.id}`);
        console.log(`  Créé: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log(`  Confirmé: ${user.email_confirmed_at ? '✅' : '❌ Non confirmé'}`);
        console.log(`  Dernière connexion: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Jamais'}`);
      });
    } else {
      console.log(chalk.yellow('Aucun utilisateur auth trouvé'));
    }
    
    // 3. Cross-reference
    console.log(chalk.yellow('\n\n📊 Analyse'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(`Profils dans 'profiles': ${profiles?.length || 0}`);
    console.log(`Utilisateurs dans 'auth': ${authUsers?.length || 0}`);
    
    // Find auth users without profiles
    if (authUsers && profiles) {
      const profileIds = new Set(profiles.map(p => p.id));
      const authWithoutProfile = authUsers.filter(u => !profileIds.has(u.id));
      
      if (authWithoutProfile.length > 0) {
        console.log(chalk.red(`\n⚠️  ${authWithoutProfile.length} utilisateur(s) auth sans profil:`));
        authWithoutProfile.forEach(u => {
          console.log(`  - ${u.email} (ID: ${u.id})`);
        });
      }
    }
    
  } catch (error) {
    console.error(chalk.red('Erreur:'), error);
  }
}

checkUsersAndProfiles();