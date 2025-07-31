#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('🚀 Applying recruitment tables migration...'));

async function executeSQLStatements(statements) {
  const results = [];
  
  for (const statement of statements) {
    const trimmed = statement.trim();
    if (!trimmed || trimmed.startsWith('--')) continue;
    
    try {
      console.log(chalk.yellow(`Executing: ${trimmed.substring(0, 50)}...`));
      
      // Use RPC call to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', { 
        query: trimmed 
      }).catch(async (rpcError) => {
        // If RPC doesn't exist, try direct query
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ query: trimmed })
        });
        
        if (!response.ok) {
          // Try alternative approach - use management API
          const mgmtResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: trimmed })
          });
          
          if (!mgmtResponse.ok) {
            throw new Error(`Failed to execute SQL: ${mgmtResponse.statusText}`);
          }
          
          return { data: await mgmtResponse.json(), error: null };
        }
        
        return { data: await response.json(), error: null };
      });
      
      if (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        results.push({ statement: trimmed, success: false, error });
      } else {
        console.log(chalk.green('✓ Success'));
        results.push({ statement: trimmed, success: true });
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      results.push({ statement: trimmed, success: false, error: err.message });
    }
  }
  
  return results;
}

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250101_create_recruitment_tables.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(chalk.blue(`Found ${statements.length} SQL statements to execute`));
    
    // Execute statements
    const results = await executeSQLStatements(statements);
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n' + chalk.blue('═'.repeat(50)));
    console.log(chalk.blue('Summary:'));
    console.log(chalk.green(`✓ Successful: ${successful}`));
    if (failed > 0) {
      console.log(chalk.red(`✗ Failed: ${failed}`));
      console.log(chalk.yellow('\nFailed statements:'));
      results.filter(r => !r.success).forEach(r => {
        console.log(chalk.red(`- ${r.statement.substring(0, 50)}...`));
        console.log(chalk.gray(`  Error: ${r.error?.message || r.error}`));
      });
    }
    
    // Verify tables were created
    console.log('\n' + chalk.blue('Verifying tables...'));
    
    const tables = ['job_postings', 'job_applications', 'recruitment_interviews'];
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(chalk.red(`✗ Table ${table}: ${error.message}`));
        } else {
          console.log(chalk.green(`✓ Table ${table} exists`));
        }
      } catch (err) {
        console.log(chalk.red(`✗ Table ${table}: ${err.message}`));
      }
    }
    
    console.log('\n' + chalk.green('✨ Migration complete!'));
    
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
}

// Alternative approach using Supabase Management API
async function applyMigrationViaAPI() {
  try {
    console.log(chalk.yellow('Trying alternative approach via direct table creation...'));
    
    // Create tables one by one using Supabase's REST API
    const tablesCreated = [];
    
    // Since we can't execute raw SQL via the client library without RPC,
    // we'll check if tables exist and report status
    const tables = ['job_postings', 'job_applications', 'recruitment_interviews'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log(chalk.yellow(`Table ${table} does not exist - needs to be created via Supabase Dashboard`));
      } else if (error) {
        console.log(chalk.red(`Error checking ${table}: ${error.message}`));
      } else {
        console.log(chalk.green(`✓ Table ${table} already exists`));
        tablesCreated.push(table);
      }
    }
    
    if (tablesCreated.length === 0) {
      console.log('\n' + chalk.yellow('📋 Next Steps:'));
      console.log(chalk.white('1. Go to your Supabase Dashboard'));
      console.log(chalk.white('2. Navigate to SQL Editor'));
      console.log(chalk.white('3. Paste and run the migration from:'));
      console.log(chalk.cyan('   supabase/migrations/20250101_create_recruitment_tables.sql'));
      console.log(chalk.white('4. Then run: node scripts/seed-recruitment-data.mjs'));
    } else if (tablesCreated.length < tables.length) {
      console.log('\n' + chalk.yellow('⚠️  Some tables are missing'));
      console.log(chalk.white('Please create the missing tables via Supabase Dashboard'));
    } else {
      console.log('\n' + chalk.green('✅ All tables exist! You can now run:'));
      console.log(chalk.cyan('   node scripts/seed-recruitment-data.mjs'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error:'), error);
  }
}

// Try to apply migration
applyMigration().catch(() => {
  console.log('\n' + chalk.yellow('Direct SQL execution failed. Checking table status...'));
  applyMigrationViaAPI();
});