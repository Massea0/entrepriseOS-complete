#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('\n🔧 Création des profils manquants\n'));

const usersWithoutProfiles = [
  { id: '7287eaed-7fa9-4826-93dd-71e004d61599', email: 'papaamath.ba@icloud.com' },
  { id: '0d1431e8-5955-4e54-ac01-6cf1680713d6', email: 'geofreesn@gmail.com' },
  { id: '767ab373-b0c8-44b5-9697-9d4eda5d498a', email: 'massea00@icloud.com' },
  { id: '7d09d7d5-941d-4993-b106-8a811b5b7317', email: 'noroudine85@gmail.com' },
  { id: '2f4c2b45-390b-480a-95b3-0c337c0f2bd4', email: '1980224@gmail.com' }
];

async function createProfiles() {
  console.log(chalk.yellow('Création des profils pour les utilisateurs sans profil...\n'));

  for (const user of usersWithoutProfiles) {
    try {
      // Extract name from email
      const emailParts = user.email.split('@');
      const namePart = emailParts[0];
      
      // Try to extract first and last name
      let firstName = '';
      let lastName = '';
      
      if (namePart.includes('.')) {
        const parts = namePart.split('.');
        firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : '';
      } else {
        firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }

      // Create profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          role: 'employee', // Default role
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(chalk.red(`❌ Erreur pour ${user.email}:`), error.message);
      } else {
        console.log(chalk.green(`✅ Profil créé pour ${user.email}`));
        console.log(chalk.gray(`   Nom: ${firstName} ${lastName}`));
        console.log(chalk.gray(`   Rôle: employee`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Erreur inattendue pour ${user.email}:`), error);
    }
  }

  console.log(chalk.blue('\n✨ Terminé!\n'));
  
  // Show summary
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error && profiles) {
    console.log(chalk.yellow('Résumé des profils:'));
    console.log(chalk.gray('─'.repeat(60)));
    profiles.forEach(profile => {
      console.log(`${chalk.cyan(profile.email)} - ${chalk.magenta(profile.role)} - ${profile.is_active ? '✅ Actif' : '❌ Inactif'}`);
    });
  }
}

// Ask for confirmation
console.log(chalk.yellow('⚠️  Attention: Ce script va créer des profils pour:'));
usersWithoutProfiles.forEach(u => console.log(`  - ${u.email}`));
console.log('\n' + chalk.red('Voulez-vous continuer? (Ctrl+C pour annuler)'));

// Give 3 seconds to cancel
setTimeout(() => {
  createProfiles();
}, 3000);