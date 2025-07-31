#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(dirname(__dirname), '.env') });

console.log(chalk.blue('\n🔐 Création d\'utilisateurs avec les clés depuis .env\n'));

// Vérifier les variables d'environnement
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(chalk.red('❌ Variables d\'environnement manquantes!'));
  console.log('');
  console.log('Créez un fichier .env avec :');
  console.log(chalk.yellow('VITE_SUPABASE_URL=https://votre-projet.supabase.co'));
  console.log(chalk.yellow('VITE_SUPABASE_ANON_KEY=votre-anon-key'));
  console.log(chalk.yellow('SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key'));
  console.log('');
  console.log('Récupérez ces clés depuis : https://app.supabase.com');
  console.log('Settings > API');
  process.exit(1);
}

console.log(chalk.green('✅ Variables d\'environnement trouvées'));
console.log(chalk.gray(`URL: ${SUPABASE_URL}`));
console.log(chalk.gray(`Service Key: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`));
console.log(chalk.gray(`Anon Key: ${SUPABASE_ANON_KEY?.substring(0, 20)}...`));
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createUsers() {
  try {
    const users = [
      { 
        email: 'admin@entreprise-os.com', 
        password: 'Admin123!@#',
        name: 'Admin System',
        role: 'admin'
      },
      { 
        email: 'manager@test.com', 
        password: 'Manager123!',
        name: 'Manager Test',
        role: 'manager'
      },
      { 
        email: 'employee@test.com', 
        password: 'Employee123!',
        name: 'Employee Test',
        role: 'employee'
      }
    ];

    console.log(chalk.yellow('Création des utilisateurs...\n'));

    for (const user of users) {
      console.log(chalk.cyan(`\nCréation de ${user.email}...`));
      
      // Vérifier si l'utilisateur existe
      const { data: existingUsers } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });
      
      const existingUser = existingUsers?.users?.find(u => u.email === user.email);
      
      if (existingUser) {
        console.log(chalk.yellow('  → Utilisateur existant, suppression...'));
        await supabase.auth.admin.deleteUser(existingUser.id);
      }

      // Créer l'utilisateur
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.name,
          first_name: user.name.split(' ')[0],
          last_name: user.name.split(' ')[1]
        },
        app_metadata: {
          role: user.role,
          is_active: true
        }
      });

      if (error) {
        console.log(chalk.red(`  ❌ Erreur: ${error.message}`));
      } else {
        console.log(chalk.green(`  ✅ Créé avec succès!`));
        
        // Créer le profil
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: user.email,
          first_name: user.name.split(' ')[0],
          last_name: user.name.split(' ')[1],
          role: user.role,
          is_active: true
        });
      }
    }

    // Tester la connexion avec ANON key
    console.log(chalk.blue('\n\n🔐 Test de connexion avec ANON key...\n'));
    
    if (SUPABASE_ANON_KEY) {
      const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: 'admin@entreprise-os.com',
        password: 'Admin123!@#'
      });

      if (error) {
        console.log(chalk.red(`❌ Erreur de connexion: ${error.message}`));
        console.log(chalk.yellow('\nVérifiez que VITE_SUPABASE_ANON_KEY est correcte dans .env'));
      } else {
        console.log(chalk.green('✅ CONNEXION RÉUSSIE !'));
        console.log(chalk.green('\n🎉 Tout est configuré correctement !'));
      }
    }

    console.log(chalk.blue('\n\n📋 Comptes créés :\n'));
    console.log(chalk.cyan('admin@entreprise-os.com') + ' : ' + chalk.yellow('Admin123!@#'));
    console.log(chalk.cyan('manager@test.com') + ' : ' + chalk.yellow('Manager123!'));
    console.log(chalk.cyan('employee@test.com') + ' : ' + chalk.yellow('Employee123!'));
    
    console.log(chalk.green('\n✅ Vous pouvez maintenant vous connecter !'));

  } catch (error) {
    console.error(chalk.red('\nErreur:'), error);
  }
}

createUsers();