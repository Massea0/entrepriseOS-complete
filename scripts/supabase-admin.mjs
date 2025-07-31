#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Charger les variables d'environnement
dotenv.config();

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

// Client admin avec service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helpers
const log = {
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  data: (data) => console.log(JSON.stringify(data, null, 2))
};

// Fonctions utilitaires
export const db = {
  // Requête SELECT
  async query(table, options = {}) {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      if (options.eq) {
        Object.entries(options.eq).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options.limit) query = query.limit(options.limit);
      if (options.order) query = query.order(options.order);
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      log.error(`Query error: ${error.message}`);
      return null;
    }
  },

  // INSERT
  async insert(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      log.success(`Inserted ${result.length} row(s) into ${table}`);
      return result;
    } catch (error) {
      log.error(`Insert error: ${error.message}`);
      return null;
    }
  },

  // UPDATE
  async update(table, id, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      log.success(`Updated ${table} with id ${id}`);
      return result;
    } catch (error) {
      log.error(`Update error: ${error.message}`);
      return null;
    }
  },

  // DELETE
  async delete(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      log.success(`Deleted from ${table} with id ${id}`);
      return true;
    } catch (error) {
      log.error(`Delete error: ${error.message}`);
      return false;
    }
  },

  // COUNT
  async count(table, options = {}) {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      
      if (options.eq) {
        Object.entries(options.eq).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { count, error } = await query;
      
      if (error) throw error;
      return count;
    } catch (error) {
      log.error(`Count error: ${error.message}`);
      return 0;
    }
  },

  // Requête SQL brute
  async sql(query) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { query });
      
      if (error) throw error;
      return data;
    } catch (error) {
      // Si la fonction n'existe pas, on essaie directement
      log.warning('SQL direct non disponible via RPC');
      return null;
    }
  }
};

// Fonctions de test rapide
export const test = {
  // Tester la connexion
  async connection() {
    log.info('Test de connexion Supabase...');
    const users = await db.count('users');
    if (users !== null) {
      log.success(`Connexion OK - ${users} utilisateurs`);
      return true;
    }
    return false;
  },

  // Afficher les stats
  async stats() {
    log.info('Statistiques de la base de données:');
    
    const tables = [
      'users', 'companies', 'employees', 'projects', 
      'tasks', 'invoices', 'quotes'
    ];
    
    for (const table of tables) {
      const count = await db.count(table);
      log.info(`${table}: ${count} enregistrements`);
    }
  },

  // Dernières entrées
  async recent(table = 'projects', limit = 5) {
    log.info(`Dernières entrées de ${table}:`);
    const data = await db.query(table, { 
      limit, 
      order: 'created_at.desc' 
    });
    log.data(data);
  }
};

// CLI si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  console.log(chalk.cyan.bold('\n🔧 Supabase Admin Tool\n'));

  switch (command) {
    case 'test':
      await test.connection();
      break;
      
    case 'stats':
      await test.stats();
      break;
      
    case 'recent':
      await test.recent(args[0] || 'projects', parseInt(args[1]) || 5);
      break;
      
    case 'query':
      if (!args[0]) {
        log.error('Usage: query <table> [limit]');
        break;
      }
      const data = await db.query(args[0], { limit: parseInt(args[1]) || 10 });
      log.data(data);
      break;
      
    case 'count':
      if (!args[0]) {
        log.error('Usage: count <table>');
        break;
      }
      const count = await db.count(args[0]);
      log.info(`${args[0]}: ${count} enregistrements`);
      break;
      
    default:
      console.log(`
Commandes disponibles:
  test              - Tester la connexion
  stats             - Afficher les statistiques
  recent [table]    - Voir les dernières entrées
  query <table>     - Requête sur une table
  count <table>     - Compter les enregistrements

Exemples:
  node scripts/supabase-admin.mjs test
  node scripts/supabase-admin.mjs stats
  node scripts/supabase-admin.mjs recent invoices 10
  node scripts/supabase-admin.mjs query projects
      `);
  }
}

// Export pour utilisation dans d'autres scripts
export { supabase };