#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://kdwjbqhdpthbtqpphkid.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkd2picWhkcHRoYnRxcHBoa2lkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjU0Mzg1MiwiZXhwIjoyMDQ4MTE5OTUyfQ.XjKQP4VJwX6ZZ8XqF7JlFj_5YXkZ7XcX8ZI7VXaT8zJ';

// Utiliser la clé service_role pour créer des utilisateurs
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

async function deleteExistingTestUsers() {
  console.log('🧹 Suppression des utilisateurs test existants...\n');
  
  for (const user of testUsers) {
    try {
      // Récupérer l'utilisateur s'il existe
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userToDelete = existingUser?.users.find(u => u.email === user.email);
      
      if (userToDelete) {
        const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
        if (error) {
          console.error(`❌ Erreur lors de la suppression de ${user.email}:`, error.message);
        } else {
          console.log(`✅ ${user.email} supprimé`);
        }
      }
    } catch (err) {
      console.error(`❌ Erreur lors de la suppression de ${user.email}:`, err);
    }
  }
}

async function createTestUsers() {
  console.log('\n👥 Création des utilisateurs test...\n');

  // Créer d'abord une entreprise test si elle n'existe pas
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'EntrepriseOS Demo')
    .single();

  let companyId = existingCompany?.id;

  if (!companyId) {
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'EntrepriseOS Demo',
        domain: 'entrepriseos.com',
        industry: 'Technology',
        size: 'sme',
        billing_plan: 'premium',
        settings: {
          features: {
            ai_enabled: true,
            inventory_enabled: true,
            hr_enabled: true,
            crm_enabled: true,
            finance_enabled: true
          }
        }
      })
      .select()
      .single();

    if (companyError) {
      console.error('❌ Erreur lors de la création de l\'entreprise:', companyError);
      return;
    }

    companyId = newCompany.id;
    console.log('✅ Entreprise de démonstration créée');
  }

  for (const user of testUsers) {
    try {
      console.log(`📧 Création de ${user.email}...`);
      
      // Créer l'utilisateur avec la méthode admin
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          department: user.department,
        }
      });

      if (authError) {
        console.error(`❌ Erreur auth pour ${user.email}:`, authError.message);
        continue;
      }

      // Créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          company_id: companyId,
          onboarding_completed: true,
          status: 'active'
        });

      if (profileError) {
        console.error(`❌ Erreur profil pour ${user.email}:`, profileError.message);
        // Si le profil existe déjà, on le met à jour
        if (profileError.code === '23505') {
          await supabase
            .from('profiles')
            .update({
              first_name: user.firstName,
              last_name: user.lastName,
              role: user.role,
              company_id: companyId,
              onboarding_completed: true,
              status: 'active'
            })
            .eq('id', authUser.user.id);
        }
      }

      console.log(`✅ ${user.email} créé avec succès!`);
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
  
  console.log('\n✅ Tous les utilisateurs ont été créés dans Supabase!');
  console.log('🚀 Vous pouvez maintenant vous connecter avec ces comptes.');
}

// Exécuter le script
async function main() {
  await deleteExistingTestUsers();
  await createTestUsers();
}

main().catch(console.error);