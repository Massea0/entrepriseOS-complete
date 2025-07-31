#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Vérifier les variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(chalk.red('❌ Variables Supabase manquantes!'));
  console.log('Vérifiez votre fichier .env');
  process.exit(1);
}

// Clients Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// Helpers
const log = {
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  section: (msg) => console.log(chalk.cyan.bold(`\n${msg}\n${'='.repeat(50)}`))
};

// Tests de vérification
const tests = {
  // 1. Connexion de base
  connection: async () => {
    log.section('🔌 TEST DE CONNEXION');
    
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        log.error(`Connexion échouée: ${error.message}`);
        return false;
      }
      
      log.success('Connexion à Supabase réussie');
      log.info(`URL: ${SUPABASE_URL}`);
      log.info(`Service Role Key: ${SUPABASE_SERVICE_KEY ? 'Configurée' : 'Non configurée'}`);
      return true;
    } catch (err) {
      log.error(`Erreur de connexion: ${err.message}`);
      return false;
    }
  },

  // 2. Vérification des tables
  tables: async () => {
    log.section('📋 VÉRIFICATION DES TABLES');
    
    const requiredTables = [
      'users',
      'companies',
      'employees',
      'projects',
      'tasks',
      'invoices',
      'quotes',
      'leave_types',
      'leave_requests',
      'leave_balances'
    ];

    let allTablesExist = true;

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        
        if (error) {
          log.error(`Table '${table}' - ${error.message}`);
          allTablesExist = false;
        } else {
          log.success(`Table '${table}' existe`);
        }
      } catch (err) {
        log.error(`Table '${table}' - Erreur: ${err.message}`);
        allTablesExist = false;
      }
    }

    return allTablesExist;
  },

  // 3. Compter les données
  dataCount: async () => {
    log.section('📊 COMPTAGE DES DONNÉES');
    
    const tables = [
      { name: 'users', icon: '👤' },
      { name: 'companies', icon: '🏢' },
      { name: 'employees', icon: '👥' },
      { name: 'projects', icon: '🏗️' },
      { name: 'tasks', icon: '📋' },
      { name: 'invoices', icon: '💰' },
      { name: 'quotes', icon: '📄' }
    ];

    const counts = {};

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          log.warning(`${table.icon} ${table.name}: Erreur - ${error.message}`);
          counts[table.name] = 0;
        } else {
          log.info(`${table.icon} ${table.name}: ${count || 0} enregistrements`);
          counts[table.name] = count || 0;
        }
      } catch (err) {
        log.error(`${table.icon} ${table.name}: Erreur - ${err.message}`);
        counts[table.name] = 0;
      }
    }

    return counts;
  },

  // 4. Test RLS (Row Level Security)
  rls: async () => {
    log.section('🔒 TEST ROW LEVEL SECURITY');
    
    if (!supabaseAdmin) {
      log.warning('Service Role Key non configurée - Test RLS limité');
      return null;
    }

    const tables = ['users', 'companies', 'projects', 'invoices', 'quotes'];
    const rlsStatus = {};

    for (const table of tables) {
      try {
        // Essayer de lire sans auth
        const { data, error } = await supabase.from(table).select('id').limit(1);
        
        if (error && error.message.includes('row-level security')) {
          log.success(`${table} - RLS activé ✓`);
          rlsStatus[table] = true;
        } else if (data !== null) {
          log.warning(`${table} - RLS peut être désactivé`);
          rlsStatus[table] = false;
        }
      } catch (err) {
        log.info(`${table} - ${err.message}`);
      }
    }

    return rlsStatus;
  },

  // 5. Test authentification
  auth: async () => {
    log.section('🔐 TEST AUTHENTIFICATION');
    
    try {
      // Tester avec un compte test
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ddjily60@gmail.com',
        password: 'admin'
      });

      if (error) {
        log.error(`Authentification échouée: ${error.message}`);
        return false;
      }

      if (data.user) {
        log.success(`Authentification réussie pour: ${data.user.email}`);
        log.info(`User ID: ${data.user.id}`);
        log.info(`Rôle: ${data.user.user_metadata?.role || 'Non défini'}`);
        
        // Se déconnecter
        await supabase.auth.signOut();
        return true;
      }
    } catch (err) {
      log.error(`Erreur auth: ${err.message}`);
    }

    return false;
  },

  // 6. Vérifier les Edge Functions
  edgeFunctions: async () => {
    log.section('⚡ EDGE FUNCTIONS');
    
    log.info('Edge Functions Supabase:');
    log.info('- auto-assign-project');
    log.info('- generate-invoice-pdf');
    log.info('- ai-predictions');
    log.info('- process-voice-command');
    
    log.warning('Pour déployer: supabase functions deploy <function-name>');
    
    return true;
  },

  // 7. Test Storage
  storage: async () => {
    log.section('📦 TEST STORAGE');
    
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        log.error(`Storage non accessible: ${error.message}`);
        return false;
      }

      if (data && data.length > 0) {
        log.success('Storage accessible');
        data.forEach(bucket => {
          log.info(`Bucket: ${bucket.name} (${bucket.public ? 'Public' : 'Privé'})`);
        });
      } else {
        log.warning('Aucun bucket trouvé');
      }
      
      return true;
    } catch (err) {
      log.error(`Erreur storage: ${err.message}`);
      return false;
    }
  }
};

// Script principal
async function verifySupabase() {
  console.log(chalk.bold.green(`
╔══════════════════════════════════════════════════════╗
║          VÉRIFICATION SUPABASE COMPLÈTE              ║
║                Enterprise OS v1.0                     ║
╚══════════════════════════════════════════════════════╝
`));

  const results = {
    connection: false,
    tables: false,
    dataCount: {},
    rls: {},
    auth: false,
    storage: false
  };

  // 1. Test connexion
  results.connection = await tests.connection();
  if (!results.connection) {
    log.error('Connexion impossible - Arrêt des tests');
    return;
  }

  // 2. Vérifier les tables
  results.tables = await tests.tables();

  // 3. Compter les données
  results.dataCount = await tests.dataCount();

  // 4. Test RLS
  results.rls = await tests.rls();

  // 5. Test auth
  results.auth = await tests.auth();

  // 6. Edge Functions
  await tests.edgeFunctions();

  // 7. Test storage
  results.storage = await tests.storage();

  // Résumé final
  log.section('📈 RÉSUMÉ FINAL');
  
  const allGood = results.connection && results.tables && results.auth;
  
  if (allGood) {
    console.log(chalk.green.bold('\n✅ Supabase est correctement configuré!'));
  } else {
    console.log(chalk.yellow.bold('\n⚠️  Certains tests ont échoué'));
  }

  // Recommandations
  log.section('💡 PROCHAINES ÉTAPES');
  
  const recommendations = [];
  
  if (Object.values(results.dataCount).some(count => count === 0)) {
    recommendations.push('1. Ajouter des données de test avec le script seed-data');
  }
  
  if (!SUPABASE_SERVICE_KEY) {
    recommendations.push('2. Configurer SUPABASE_SERVICE_ROLE_KEY dans .env');
  }
  
  if (!results.auth) {
    recommendations.push('3. Vérifier les utilisateurs et les mots de passe');
  }
  
  recommendations.push('4. Déployer les Edge Functions si nécessaire');
  recommendations.push('5. Configurer les buckets de storage pour les documents');
  
  recommendations.forEach(rec => console.log(rec));
}

// Lancer la vérification
verifySupabase().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  process.exit(1);
});