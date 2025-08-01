// validate-system.mjs
// Script de validation complète du système

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Configuration
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
}

console.log(`${colors.yellow}🚀 Validation du système EntrepriseOS${colors.reset}`)
console.log('=====================================\n')

// Test 1: Connexion Supabase
async function testSupabaseConnection() {
  console.log(`${colors.blue}📡 Test de connexion Supabase...${colors.reset}`)
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
    
    if (error) throw error
    log.success('Connexion Supabase OK')
    return true
  } catch (error) {
    log.error(`Connexion Supabase: ${error.message}`)
    return false
  }
}

// Test 2: Vérification des tables
async function testTables() {
  console.log(`\n${colors.blue}📊 Vérification des tables...${colors.reset}`)
  
  const tables = [
    'companies',
    'profiles', 
    'projects',
    'tasks',
    'invoices',
    'quotes',
    'contracts',
    'contract_templates'
  ]
  
  const results = []
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.message.includes('does not exist')) {
          log.warn(`Table '${table}' n'existe pas`)
          results.push({ table, exists: false })
        } else {
          log.error(`Table '${table}': ${error.message}`)
          results.push({ table, exists: false, error: error.message })
        }
      } else {
        log.success(`Table '${table}' accessible`)
        results.push({ table, exists: true })
      }
    } catch (error) {
      log.error(`Table '${table}': ${error.message}`)
      results.push({ table, exists: false, error: error.message })
    }
  }
  
  return results
}

// Test 3: Edge Functions
async function testEdgeFunctions() {
  console.log(`\n${colors.blue}⚡ Test des Edge Functions...${colors.reset}`)
  
  const functions = [
    {
      name: 'ai-business-analyzer',
      payload: { test: true }
    },
    {
      name: 'email-generator',
      payload: { template: 'test', context: {} }
    },
    {
      name: 'quote-generator-ai',
      payload: { test: true }
    },
    {
      name: 'contract-analyzer',
      payload: { test: true }
    },
    {
      name: 'financial-predictions',
      payload: { test: true }
    }
  ]
  
  const results = []
  
  for (const fn of functions) {
    try {
      const { data, error } = await supabase.functions.invoke(fn.name, {
        body: fn.payload
      })
      
      if (error) {
        log.warn(`Edge Function '${fn.name}': ${error.message}`)
        results.push({ function: fn.name, available: false, error: error.message })
      } else {
        log.success(`Edge Function '${fn.name}' disponible`)
        results.push({ function: fn.name, available: true })
      }
    } catch (error) {
      log.warn(`Edge Function '${fn.name}': ${error.message}`)
      results.push({ function: fn.name, available: false, error: error.message })
    }
  }
  
  return results
}

// Test 4: Permissions utilisateur
async function testUserPermissions() {
  console.log(`\n${colors.blue}🔐 Test des permissions utilisateur...${colors.reset}`)
  
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      log.warn('Aucun utilisateur connecté - test avec service key')
      return { authenticated: false }
    }
    
    // Tester les permissions sur différentes tables
    const permissions = {}
    
    // Test lecture quotes
    const { error: readError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1)
    permissions.readQuotes = !readError
    
    // Test création quotes
    const { error: insertError } = await supabase
      .from('quotes')
      .insert({
        company_id: 'c0000000-0000-0000-0000-000000000001',
        client_name: 'Test Client',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
    permissions.createQuotes = !insertError
    
    // Nettoyer si créé
    if (!insertError) {
      await supabase.from('quotes').delete().eq('client_name', 'Test Client')
    }
    
    Object.entries(permissions).forEach(([perm, allowed]) => {
      if (allowed) {
        log.success(`Permission ${perm}: Accordée`)
      } else {
        log.warn(`Permission ${perm}: Refusée`)
      }
    })
    
    return { authenticated: true, permissions }
  } catch (error) {
    log.error(`Test permissions: ${error.message}`)
    return { authenticated: false, error: error.message }
  }
}

// Test 5: Données de test
async function createTestData() {
  console.log(`\n${colors.blue}🎯 Création de données de test...${colors.reset}`)
  
  try {
    // Créer un devis de test
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        company_id: 'c0000000-0000-0000-0000-000000000001',
        client_name: 'Client Démo',
        client_email: 'demo@example.com',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: 5000,
        status: 'draft',
        items: [
          {
            description: 'Service de développement',
            quantity: 1,
            unitPrice: 5000,
            total: 5000
          }
        ]
      })
      .select()
      .single()
    
    if (quoteError) {
      log.error(`Création devis test: ${quoteError.message}`)
    } else {
      log.success(`Devis test créé: ${quote.quote_number}`)
    }
    
    // Créer un contrat de test
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        company_id: 'c0000000-0000-0000-0000-000000000001',
        title: 'Contrat de Service Démo',
        type: 'service',
        effective_date: new Date().toISOString(),
        status: 'draft',
        contract_value: 50000
      })
      .select()
      .single()
    
    if (contractError) {
      log.error(`Création contrat test: ${contractError.message}`)
    } else {
      log.success(`Contrat test créé: ${contract.contract_number}`)
    }
    
    return { quote, contract }
  } catch (error) {
    log.error(`Création données test: ${error.message}`)
    return null
  }
}

// Rapport final
async function generateReport(results) {
  console.log(`\n${colors.yellow}📊 RAPPORT DE VALIDATION${colors.reset}`)
  console.log('========================\n')
  
  const { connection, tables, functions, permissions, testData } = results
  
  // Résumé
  const tablesOk = tables.filter(t => t.exists).length
  const functionsOk = functions.filter(f => f.available).length
  
  console.log(`${colors.blue}Connexion Supabase:${colors.reset} ${connection ? '✅' : '❌'}`)
  console.log(`${colors.blue}Tables disponibles:${colors.reset} ${tablesOk}/${tables.length}`)
  console.log(`${colors.blue}Edge Functions:${colors.reset} ${functionsOk}/${functions.length}`)
  console.log(`${colors.blue}Authentification:${colors.reset} ${permissions.authenticated ? '✅' : '⚠️  Service Key'}`)
  
  // Tables manquantes
  const missingTables = tables.filter(t => !t.exists)
  if (missingTables.length > 0) {
    console.log(`\n${colors.yellow}Tables manquantes:${colors.reset}`)
    missingTables.forEach(t => console.log(`  - ${t.table}`))
  }
  
  // Functions non disponibles
  const missingFunctions = functions.filter(f => !f.available)
  if (missingFunctions.length > 0) {
    console.log(`\n${colors.yellow}Edge Functions non disponibles:${colors.reset}`)
    missingFunctions.forEach(f => console.log(`  - ${f.function}`))
  }
  
  // Recommandations
  console.log(`\n${colors.blue}📝 Recommandations:${colors.reset}`)
  
  if (missingTables.some(t => t.table === 'quotes' || t.table === 'contracts')) {
    console.log('  1. Exécuter les migrations: bash scripts/run-migrations.sh')
  }
  
  if (missingFunctions.length > 0) {
    console.log('  2. Déployer les Edge Functions manquantes')
  }
  
  if (!permissions.authenticated) {
    console.log('  3. Se connecter avec un utilisateur pour tester les permissions complètes')
  }
  
  console.log(`\n${colors.green}✨ Validation terminée !${colors.reset}`)
}

// Exécution principale
async function main() {
  const results = {
    connection: await testSupabaseConnection(),
    tables: [],
    functions: [],
    permissions: {},
    testData: null
  }
  
  if (results.connection) {
    results.tables = await testTables()
    results.functions = await testEdgeFunctions()
    results.permissions = await testUserPermissions()
    
    // Créer des données de test si les tables existent
    const quotesExist = results.tables.find(t => t.table === 'quotes')?.exists
    const contractsExist = results.tables.find(t => t.table === 'contracts')?.exists
    
    if (quotesExist && contractsExist) {
      results.testData = await createTestData()
    }
  }
  
  await generateReport(results)
}

// Lancer la validation
main().catch(console.error)