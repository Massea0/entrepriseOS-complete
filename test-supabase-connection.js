// test-supabase-connection.js
// Script pour tester la connexion à Supabase
// Usage: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Test de connexion Supabase\n')
console.log('Configuration:')
console.log(`- URL: ${supabaseUrl ? '✅ Définie' : '❌ Manquante'}`)
console.log(`- Anon Key: ${supabaseAnonKey ? '✅ Définie' : '❌ Manquante'}\n`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.log('\n📝 Créez un fichier .env avec:')
  console.log('VITE_SUPABASE_URL=https://your-project.supabase.co')
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key')
  process.exit(1)
}

// Créer le client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('🔄 Test de connexion...\n')
    
    // 1. Test de la connexion basique
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (healthError) {
      if (healthError.message.includes('relation "public.profiles" does not exist')) {
        console.log('⚠️  Table "profiles" n\'existe pas')
        console.log('   → Exécutez d\'abord les migrations SQL')
      } else {
        console.error('❌ Erreur de connexion:', healthError.message)
      }
    } else {
      console.log('✅ Connexion réussie!')
    }
    
    // 2. Vérifier les tables principales
    console.log('\n📊 Vérification des tables:')
    const tables = [
      'profiles',
      'companies', 
      'employees',
      'departments',
      'projects',
      'tasks',
      'invoices',
      'quotes',
      'deals',
      'contacts'
    ]
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`  ❌ ${table} - Non trouvée`)
      } else {
        console.log(`  ✅ ${table} - OK`)
      }
    }
    
    // 3. Test Auth
    console.log('\n🔐 Test Auth:')
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('  ❌ Erreur Auth:', authError.message)
    } else if (session) {
      console.log('  ✅ Session active trouvée')
    } else {
      console.log('  ⚠️  Pas de session active (normal)')
    }
    
    // 4. Test RLS
    console.log('\n🔒 Test RLS:')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (rlsError) {
      if (rlsError.message.includes('permission denied')) {
        console.log('  ✅ RLS actif (accès refusé sans auth)')
      } else {
        console.log('  ⚠️  Erreur RLS:', rlsError.message)
      }
    } else {
      console.log('  ⚠️  RLS peut-être désactivé (données accessibles sans auth)')
    }
    
    console.log('\n✨ Test terminé!')
    
  } catch (error) {
    console.error('\n❌ Erreur inattendue:', error.message)
  }
}

// Exécuter le test
testConnection()