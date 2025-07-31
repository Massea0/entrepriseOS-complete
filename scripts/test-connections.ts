#!/usr/bin/env node
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

// Load environment variables
config();

interface TestResult {
  service: string;
  status: 'success' | 'failed' | 'warning';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Test Supabase connection
async function testSupabase() {
  console.log(chalk.blue('Testing Supabase connection...'));
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;

    // Test database
    const { count, error: dbError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (dbError) throw dbError;

    results.push({
      service: 'Supabase',
      status: 'success',
      message: 'Connection successful',
      details: { tablesAccessible: true }
    });
  } catch (error) {
    results.push({
      service: 'Supabase',
      status: 'failed',
      message: `Connection failed: ${error}`,
    });
  }
}

// Test OpenAI connection
async function testOpenAI() {
  console.log(chalk.blue('Testing OpenAI connection...'));
  
  if (!process.env.OPENAI_API_KEY) {
    results.push({
      service: 'OpenAI',
      status: 'warning',
      message: 'API key not configured',
    });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    results.push({
      service: 'OpenAI',
      status: 'success',
      message: 'Connection successful',
      details: { modelsAvailable: data.data.length }
    });
  } catch (error) {
    results.push({
      service: 'OpenAI',
      status: 'failed',
      message: `Connection failed: ${error}`,
    });
  }
}

// Test Google AI connection
async function testGoogleAI() {
  console.log(chalk.blue('Testing Google AI connection...'));
  
  if (!process.env.GOOGLE_AI_API_KEY) {
    results.push({
      service: 'Google AI',
      status: 'warning',
      message: 'API key not configured',
    });
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    results.push({
      service: 'Google AI',
      status: 'success',
      message: 'Connection successful',
      details: { modelsAvailable: data.models?.length || 0 }
    });
  } catch (error) {
    results.push({
      service: 'Google AI',
      status: 'failed',
      message: `Connection failed: ${error}`,
    });
  }
}

// Test SMTP connection
async function testSMTP() {
  console.log(chalk.blue('Testing SMTP configuration...'));
  
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    results.push({
      service: 'SMTP',
      status: 'warning',
      message: `Missing configuration: ${missing.join(', ')}`,
    });
    return;
  }

  results.push({
    service: 'SMTP',
    status: 'success',
    message: 'Configuration present',
    details: { 
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT 
    }
  });
}

// Test feature flags
async function testFeatureFlags() {
  console.log(chalk.blue('Checking feature flags...'));
  
  const flags = {
    AI_VOICE: process.env.FEATURE_AI_VOICE === 'true',
    AI_PREDICTIONS: process.env.FEATURE_AI_PREDICTIONS !== 'false',
    INVENTORY_MODULE: process.env.FEATURE_INVENTORY_MODULE !== 'false',
    MOBILE_PWA: process.env.FEATURE_MOBILE_PWA !== 'false',
  };

  results.push({
    service: 'Feature Flags',
    status: 'success',
    message: 'Feature flags configured',
    details: flags
  });
}

// Test environment setup
async function testEnvironment() {
  console.log(chalk.blue('Checking environment setup...'));
  
  const critical = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];

  const missing = critical.filter(key => !process.env[key]);

  if (missing.length > 0) {
    results.push({
      service: 'Environment',
      status: 'failed',
      message: `Missing critical variables: ${missing.join(', ')}`,
    });
  } else {
    results.push({
      service: 'Environment',
      status: 'success',
      message: 'All critical variables present',
    });
  }
}

// Run all tests
async function runTests() {
  console.log(chalk.bold.cyan('\n🚀 EntrepriseOS Connection Tests\n'));

  await testEnvironment();
  await testSupabase();
  await testOpenAI();
  await testGoogleAI();
  await testSMTP();
  await testFeatureFlags();

  // Display results
  console.log(chalk.bold.cyan('\n📊 Test Results:\n'));

  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : 
                 result.status === 'failed' ? '❌' : '⚠️';
    const color = result.status === 'success' ? chalk.green :
                  result.status === 'failed' ? chalk.red : chalk.yellow;
    
    console.log(`${icon} ${color(result.service)}: ${result.message}`);
    if (result.details) {
      console.log(chalk.gray(`   Details: ${JSON.stringify(result.details)}`));
    }
  });

  console.log(chalk.bold.cyan('\n📈 Summary:'));
  console.log(chalk.green(`   ✅ Success: ${successCount}`));
  console.log(chalk.yellow(`   ⚠️  Warnings: ${warningCount}`));
  console.log(chalk.red(`   ❌ Failed: ${failedCount}`));

  if (failedCount > 0) {
    console.log(chalk.bold.red('\n❗ Critical issues detected. Please fix before deployment.'));
    process.exit(1);
  } else if (warningCount > 0) {
    console.log(chalk.bold.yellow('\n⚠️  Some services are not configured. They will be disabled.'));
  } else {
    console.log(chalk.bold.green('\n✨ All systems operational! Ready for production.'));
  }
}

// Execute tests
runTests().catch(console.error);