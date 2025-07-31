#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('\n🔍 Test de la fonction log_admin_action\n'));

async function testAuditLogs() {
  try {
    // 1. Vérifier que la table existe
    console.log(chalk.yellow('1. Vérification de la table audit_logs...'));
    const { data: tableCheck, error: tableError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error(chalk.red('❌ Table audit_logs non trouvée!'));
      console.error(chalk.red('   Veuillez d\'abord exécuter la migration SQL'));
      console.error(chalk.gray('   Erreur:', tableError.message));
      return;
    }

    console.log(chalk.green('✅ Table audit_logs existe'));

    // 2. Récupérer un utilisateur réel pour le test
    console.log(chalk.yellow('\n2. Récupération d\'un utilisateur pour le test...'));
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });

    if (usersError || !users || users.length === 0) {
      console.error(chalk.red('❌ Aucun utilisateur trouvé'));
      return;
    }

    const testUser = users[0];
    console.log(chalk.green(`✅ Utilisateur trouvé: ${testUser.email}`));
    console.log(chalk.gray(`   UUID: ${testUser.id}`));

    // 3. Tester la fonction log_admin_action
    console.log(chalk.yellow('\n3. Test de log_admin_action...'));
    
    // Test 1: Log avec cible
    const { data: log1, error: error1 } = await supabase.rpc('log_admin_action', {
      p_action: 'test.audit_log_with_target',
      p_target_type: 'user',
      p_target_id: testUser.id,
      p_details: {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Test de la fonction audit log'
      }
    });

    if (error1) {
      console.error(chalk.red('❌ Erreur lors du test 1:'), error1.message);
    } else {
      console.log(chalk.green('✅ Test 1 réussi - Log avec cible'));
      console.log(chalk.gray(`   Log ID: ${log1}`));
    }

    // Test 2: Log sans cible
    const { data: log2, error: error2 } = await supabase.rpc('log_admin_action', {
      p_action: 'test.audit_log_without_target',
      p_target_type: null,
      p_target_id: null,
      p_details: {
        test: true,
        action: 'Test sans cible spécifique'
      }
    });

    if (error2) {
      console.error(chalk.red('❌ Erreur lors du test 2:'), error2.message);
    } else {
      console.log(chalk.green('✅ Test 2 réussi - Log sans cible'));
      console.log(chalk.gray(`   Log ID: ${log2}`));
    }

    // 4. Vérifier les logs créés
    console.log(chalk.yellow('\n4. Vérification des logs créés...'));
    const { data: logs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .in('action', ['test.audit_log_with_target', 'test.audit_log_without_target'])
      .order('created_at', { ascending: false })
      .limit(2);

    if (!logsError && logs) {
      console.log(chalk.green(`✅ ${logs.length} logs trouvés:`));
      logs.forEach(log => {
        console.log(chalk.cyan(`\n   Action: ${log.action}`));
        console.log(chalk.gray(`   ID: ${log.id}`));
        console.log(chalk.gray(`   Target: ${log.target_type || 'N/A'} - ${log.target_id || 'N/A'}`));
        console.log(chalk.gray(`   Details: ${JSON.stringify(log.details)}`));
        console.log(chalk.gray(`   Créé: ${new Date(log.created_at).toLocaleString()}`));
      });
    }

    // 5. Exemples SQL pour utilisation manuelle
    console.log(chalk.blue('\n\n📝 Exemples SQL pour utilisation manuelle:\n'));
    
    console.log(chalk.white('-- Exemple avec un vrai UUID:'));
    console.log(chalk.gray(`SELECT log_admin_action(
    'user.role_changed',
    'user',
    '${testUser.id}',
    '{"old_role": "employee", "new_role": "manager"}'
);`));

    console.log(chalk.white('\n-- Exemple sans cible:'));
    console.log(chalk.gray(`SELECT log_admin_action(
    'system.maintenance',
    NULL,
    NULL,
    '{"action": "database_backup", "status": "completed"}'
);`));

    console.log(chalk.white('\n-- Exemple avec recherche d\'UUID:'));
    console.log(chalk.gray(`WITH target_user AS (
    SELECT id FROM auth.users WHERE email = '${testUser.email}'
)
SELECT log_admin_action(
    'user.account_locked',
    'user',
    (SELECT id FROM target_user),
    '{"reason": "multiple_failed_attempts", "locked_for": "30 minutes"}'
);`));

  } catch (error) {
    console.error(chalk.red('\n❌ Erreur inattendue:'), error);
  }
}

// Exécuter le test
testAuditLogs();