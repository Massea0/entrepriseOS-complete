#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzkwNTAsImV4cCI6MjA0NzE1NTA1MH0.xE-ws_IkXJBMV5fwEAZhPFkjHDbN5JrXyj88QmE6kKg';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

console.log(chalk.blue('🔍 Testing Recruitment Tables Status...\n'));

async function testWithKey(keyName, key) {
  console.log(chalk.yellow(`Testing with ${keyName}:`));
  const supabase = createClient(SUPABASE_URL, key);
  
  const tables = ['job_postings', 'job_applications', 'recruitment_interviews'];
  
  for (const table of tables) {
    try {
      // Try to select from table
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(chalk.red(`  ✗ ${table}: Table does not exist`));
        } else if (error.message.includes('permission denied')) {
          console.log(chalk.yellow(`  ⚠️  ${table}: Table exists but no permission`));
        } else {
          console.log(chalk.red(`  ✗ ${table}: ${error.message}`));
        }
      } else {
        console.log(chalk.green(`  ✓ ${table}: Table exists and accessible (${count || 0} rows)`));
      }
    } catch (err) {
      console.log(chalk.red(`  ✗ ${table}: ${err.message}`));
    }
  }
  console.log('');
}

async function checkTableSchema() {
  console.log(chalk.yellow('Checking table schema via API:'));
  
  try {
    // Try to fetch table info via REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Accept': 'application/vnd.pgrst.object+json'
      }
    });
    
    if (response.ok) {
      console.log(chalk.green('  ✓ REST API is accessible'));
    } else {
      console.log(chalk.red(`  ✗ REST API error: ${response.status} ${response.statusText}`));
    }
  } catch (err) {
    console.log(chalk.red(`  ✗ API error: ${err.message}`));
  }
}

async function testTableCreation() {
  console.log(chalk.yellow('\nTrying to create a test record:'));
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    const testJob = {
      title: 'Test Job',
      department: 'tech',
      location: 'Test Location',
      type: 'full_time',
      experience_level: 'junior',
      status: 'draft',
      description: 'This is a test job posting',
      responsibilities: ['Test responsibility'],
      requirements: ['Test requirement'],
      skills: ['Test skill']
    };
    
    const { data, error } = await supabase
      .from('job_postings')
      .insert(testJob)
      .select()
      .single();
    
    if (error) {
      console.log(chalk.red(`  ✗ Cannot create record: ${error.message}`));
      if (error.message.includes('does not exist')) {
        console.log(chalk.yellow('\n📋 Next Steps:'));
        console.log(chalk.white('1. Go to your Supabase Dashboard: https://app.supabase.com'));
        console.log(chalk.white('2. Select your project'));
        console.log(chalk.white('3. Go to SQL Editor'));
        console.log(chalk.white('4. Run the migration script from:'));
        console.log(chalk.cyan('   supabase/migrations/20250101_create_recruitment_tables.sql'));
      }
    } else {
      console.log(chalk.green(`  ✓ Successfully created test record with ID: ${data.id}`));
      
      // Clean up test record
      await supabase.from('job_postings').delete().eq('id', data.id);
      console.log(chalk.gray('  ℹ Test record cleaned up'));
    }
  } catch (err) {
    console.log(chalk.red(`  ✗ Error: ${err.message}`));
  }
}

// Run all tests
async function runTests() {
  await testWithKey('ANON KEY', SUPABASE_ANON_KEY);
  await testWithKey('SERVICE ROLE KEY', SUPABASE_SERVICE_KEY);
  await checkTableSchema();
  await testTableCreation();
  
  console.log(chalk.blue('\n✨ Diagnostic complete!'));
}

runTests().catch(console.error);