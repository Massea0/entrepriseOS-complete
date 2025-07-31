#!/usr/bin/env node
import { supabase } from '../src/lib/supabase';

// Définir les utilisateurs test à créer
const testUsers = [
  {
    email: 'admin@entrepriseos.com',
    password: 'AdminPass123!',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'Système',
    department: 'Direction',
  },
  {
    email: 'manager@entrepriseos.com',
    password: 'ManagerPass123!',
    role: 'manager',
    firstName: 'Marie',
    lastName: 'Manager',
    department: 'Ventes',
  },
  {
    email: 'employee@entrepriseos.com',
    password: 'EmployeePass123!',
    role: 'employee',
    firstName: 'Jean',
    lastName: 'Employé',
    department: 'Production',
  },
  {
    email: 'hr@entrepriseos.com',
    password: 'HRPass123!',
    role: 'hr_manager',
    firstName: 'Sophie',
    lastName: 'RH',
    department: 'Ressources Humaines',
  },
  {
    email: 'finance@entrepriseos.com',
    password: 'FinancePass123!',
    role: 'finance_manager',
    firstName: 'Pierre',
    lastName: 'Finance',
    department: 'Finance',
  },
];

async function createTestUsers() {
  console.log('🧹 Suppression des utilisateurs test existants...\n');

  // Note: En mode mock, on ne peut pas vraiment supprimer les utilisateurs
  // Cette fonction est prête pour quand vous utiliserez le vrai Supabase

  console.log('👥 Création des utilisateurs test...\n');

  for (const user of testUsers) {
    try {
      console.log(`📧 Création de ${user.email}...`);
      
      // En mode mock, cela ne créera pas vraiment les utilisateurs
      // mais vous pouvez les ajouter manuellement dans supabase-mock.ts
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role,
            department: user.department,
          },
        },
      });

      if (error) {
        console.error(`❌ Erreur pour ${user.email}:`, error.message);
      } else {
        console.log(`✅ ${user.email} créé avec succès!`);
      }
    } catch (err) {
      console.error(`❌ Erreur inattendue pour ${user.email}:`, err);
    }
  }

  console.log('\n📋 Résumé des comptes créés:\n');
  console.log('┌─────────────────────────────────┬──────────────────┬────────────────┐');
  console.log('│ Email                           │ Mot de passe     │ Rôle           │');
  console.log('├─────────────────────────────────┼──────────────────┼────────────────┤');
  
  for (const user of testUsers) {
    console.log(`│ ${user.email.padEnd(31)} │ ${user.password.padEnd(16)} │ ${user.role.padEnd(14)} │`);
  }
  
  console.log('└─────────────────────────────────┴──────────────────┴────────────────┘');
  
  console.log('\n💡 Pour utiliser ces comptes en mode mock, ajoutez-les dans src/lib/supabase-mock.ts');
}

// Exécuter le script
createTestUsers().catch(console.error);