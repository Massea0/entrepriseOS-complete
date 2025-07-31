#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('🧪 Testing job posting insertion...\n'));

// Simple job posting
const simpleJob = {
  title: 'Test Developer',
  department: 'tech',
  location: 'Paris',
  type: 'full_time',
  experience_level: 'junior',
  status: 'draft',
  description: 'Test job description'
};

async function testInsert() {
  try {
    console.log(chalk.yellow('Inserting simple job posting...'));
    console.log(chalk.gray('Data:'), JSON.stringify(simpleJob, null, 2));
    
    const { data, error } = await supabase
      .from('job_postings')
      .insert(simpleJob)
      .select();
    
    if (error) {
      console.error(chalk.red('\nError occurred:'));
      console.error(chalk.red('Type:'), typeof error);
      console.error(chalk.red('Constructor:'), error.constructor.name);
      console.error(chalk.red('Message:'), error.message || 'No message');
      console.error(chalk.red('Code:'), error.code || 'No code');
      console.error(chalk.red('Details:'), error.details || 'No details');
      console.error(chalk.red('Full error:'), JSON.stringify(error, null, 2));
      
      // Try to get more info
      if (error.toString) {
        console.error(chalk.red('toString():'), error.toString());
      }
    } else {
      console.log(chalk.green('\n✓ Success! Inserted job(s):'));
      console.log(data);
      
      // Clean up
      if (data && data.length > 0) {
        const ids = data.map(job => job.id);
        console.log(chalk.yellow('\nCleaning up test data...'));
        const { error: deleteError } = await supabase
          .from('job_postings')
          .delete()
          .in('id', ids);
        
        if (deleteError) {
          console.error(chalk.red('Error cleaning up:'), deleteError);
        } else {
          console.log(chalk.green('✓ Test data cleaned up'));
        }
      }
    }
  } catch (err) {
    console.error(chalk.red('\nCaught exception:'));
    console.error(err);
  }
}

// Also test if we can read the table structure
async function checkTableStructure() {
  console.log(chalk.yellow('\nChecking table structure...'));
  
  try {
    // Try to query with limit 0 to get column info
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .limit(0);
    
    if (!error) {
      console.log(chalk.green('✓ Table is queryable'));
    } else {
      console.error(chalk.red('Error querying table:'), error);
    }
  } catch (err) {
    console.error(chalk.red('Exception:'), err);
  }
}

async function main() {
  await checkTableStructure();
  await testInsert();
}

main().catch(console.error);