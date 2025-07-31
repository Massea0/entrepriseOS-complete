import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 ANALYSE DE L\'ÉTAT D\'IMPLÉMENTATION\n');

// Check database data
async function checkDatabaseStatus() {
  console.log('📊 BASE DE DONNÉES SUPABASE');
  console.log('─'.repeat(50));

  const tables = [
    { name: 'users', minRequired: 2 },
    { name: 'companies', minRequired: 3 },
    { name: 'employees', minRequired: 5 },
    { name: 'projects', minRequired: 5 },
    { name: 'tasks', minRequired: 20 },
    { name: 'invoices', minRequired: 3 },
    { name: 'quotes', minRequired: 3 },
  ];

  let totalScore = 0;
  let maxScore = tables.length;

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table.name}: Erreur - ${error.message}`);
    } else {
      const status = count >= table.minRequired ? '✅' : '⚠️';
      const score = count >= table.minRequired ? 1 : 0.5;
      totalScore += score;
      console.log(`${status} ${table.name}: ${count} enregistrements (min: ${table.minRequired})`);
    }
  }

  console.log(`\n📈 Score données: ${Math.round(totalScore/maxScore * 100)}%\n`);
}

// Check frontend components
function checkFrontendStatus() {
  console.log('🎨 COMPOSANTS FRONTEND');
  console.log('─'.repeat(50));

  const components = [
    { path: 'client/src/components/auth/auth-context.tsx', feature: 'Authentification' },
    { path: 'client/src/pages/projects/index.tsx', feature: 'Liste projets' },
    { path: 'client/src/pages/projects/kanban.tsx', feature: 'Vue Kanban' },
    { path: 'client/src/pages/invoices/index.tsx', feature: 'Factures' },
    { path: 'client/src/pages/quotes/index.tsx', feature: 'Devis' },
    { path: 'client/src/pages/hr/leave-management.tsx', feature: 'Gestion congés' },
    { path: 'client/src/pages/ai/insights.tsx', feature: 'IA Insights' },
  ];

  let implemented = 0;

  components.forEach(comp => {
    const exists = existsSync(comp.path);
    console.log(`${exists ? '✅' : '❌'} ${comp.feature} (${comp.path})`);
    if (exists) implemented++;
  });

  console.log(`\n📈 Score frontend: ${Math.round(implemented/components.length * 100)}%\n`);
}

// Check API routes
function checkAPIStatus() {
  console.log('🔌 ROUTES API');
  console.log('─'.repeat(50));

  const routes = [
    { method: 'POST', path: '/api/login', feature: 'Authentification' },
    { method: 'GET', path: '/api/projects', feature: 'Liste projets' },
    { method: 'POST', path: '/api/projects', feature: 'Créer projet' },
    { method: 'GET', path: '/api/invoices', feature: 'Liste factures' },
    { method: 'POST', path: '/api/invoices', feature: 'Créer facture' },
    { method: 'GET', path: '/api/quotes', feature: 'Liste devis' },
    { method: 'POST', path: '/api/ai/insights', feature: 'IA Insights' },
    { method: 'GET', path: '/api/leave/requests', feature: 'Demandes congés' },
  ];

  // Read routes.ts to check implementations
  const routesContent = readFileSync('server/routes.ts', 'utf-8');
  let implemented = 0;

  routes.forEach(route => {
    const pattern = new RegExp(`app\\.${route.method.toLowerCase()}\\s*\\(\\s*["']${route.path}["']`);
    const exists = pattern.test(routesContent);
    console.log(`${exists ? '✅' : '❌'} ${route.method} ${route.path} - ${route.feature}`);
    if (exists) implemented++;
  });

  console.log(`\n📈 Score API: ${Math.round(implemented/routes.length * 100)}%\n`);
}

// Check critical features
async function checkCriticalFeatures() {
  console.log('🚨 FONCTIONNALITÉS CRITIQUES');
  console.log('─'.repeat(50));

  const features = [
    { name: 'Authentification Supabase', check: () => existsSync('client/src/lib/supabase.ts') },
    { name: 'WebSocket configuré', check: () => existsSync('server/services/realtime.ts') },
    { name: 'Export PDF', check: () => existsSync('node_modules/jspdf') },
    { name: 'Drag & Drop', check: () => existsSync('node_modules/@hello-pangea/dnd') },
    { name: 'Graphiques', check: () => existsSync('node_modules/recharts') },
  ];

  let working = 0;
  features.forEach(feat => {
    const isWorking = feat.check();
    console.log(`${isWorking ? '✅' : '❌'} ${feat.name}`);
    if (isWorking) working++;
  });

  console.log(`\n📈 Score features: ${Math.round(working/features.length * 100)}%\n`);
}

// Main execution
async function main() {
  await checkDatabaseStatus();
  checkFrontendStatus();
  checkAPIStatus();
  await checkCriticalFeatures();

  console.log('📋 PROCHAINES ÉTAPES');
  console.log('─'.repeat(50));
  console.log('1. Implémenter l\'authentification Supabase');
  console.log('2. Connecter les vues projets avec les données réelles');
  console.log('3. Activer la génération PDF pour factures/devis');
  console.log('4. Implémenter au moins une fonctionnalité IA');
  console.log('5. Ajouter des données de test supplémentaires');
  console.log('\n📖 Voir ROADMAP_BETA_V1.md pour le plan complet');
}

main().catch(console.error);