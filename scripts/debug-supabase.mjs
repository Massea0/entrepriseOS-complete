#!/usr/bin/env node
import { supabase, db } from './supabase-admin.mjs';
import chalk from 'chalk';

console.log(chalk.cyan.bold('\n🔍 Debug Supabase - Analyse de la structure\n'));

// Récupérer un exemple de chaque table
async function debugTables() {
  const tables = ['projects', 'companies', 'employees', 'tasks', 'invoices'];
  
  for (const table of tables) {
    console.log(chalk.yellow(`\n📋 Table: ${table}`));
    console.log(chalk.gray('='.repeat(50)));
    
    const data = await db.query(table, { limit: 1 });
    
    if (data && data.length > 0) {
      console.log(chalk.green('Exemple de données:'));
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log(chalk.blue('\nColonnes détectées:'));
      Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof data[0][key]}`);
      });
    } else {
      console.log(chalk.yellow('Aucune donnée dans cette table'));
    }
  }
}

// Vérifier les relations
async function checkRelations() {
  console.log(chalk.cyan.bold('\n🔗 Vérification des relations\n'));
  
  // Récupérer un projet avec ses relations
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      company:companies(id, name),
      tasks(count)
    `)
    .limit(1)
    .single();
  
  if (project) {
    console.log(chalk.green('Projet avec relations:'));
    console.log(JSON.stringify(project, null, 2));
  }
  
  // Récupérer les IDs des companies
  const companies = await db.query('companies', { limit: 5 });
  console.log(chalk.yellow('\n🏢 Companies disponibles:'));
  companies?.forEach(c => {
    console.log(`  - ${c.id}: ${c.name}`);
  });
}

// Créer un projet avec la bonne structure
async function createTestProject() {
  console.log(chalk.cyan.bold('\n🚀 Création d\'un projet test avec la bonne structure\n'));
  
  // D'abord, récupérer une company existante
  const companies = await db.query('companies', { limit: 1 });
  
  if (!companies || companies.length === 0) {
    console.log(chalk.red('❌ Aucune company trouvée!'));
    return;
  }
  
  const companyId = companies[0].id;
  console.log(chalk.blue(`Utilisation de la company: ${companies[0].name} (${companyId})`));
  
  // Créer le projet
  const projectData = {
    name: `Projet Test IA - ${new Date().toISOString().slice(0, 10)}`,
    client_company_id: companyId, // Utilisé client_company_id comme dans la structure
    status: 'in_progress',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 75000, // Nombre pas string
    description: 'Projet test pour démonstration assignation IA',
    owner_id: '05abd360-84e0-44a9-b708-1537ec50b6cc' // ID du propriétaire (Massamba)
  };
  
  console.log(chalk.gray('Données du projet:'));
  console.log(JSON.stringify(projectData, null, 2));
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    if (error) {
      console.log(chalk.red(`❌ Erreur: ${error.message}`));
      console.log(chalk.yellow('Détails:', JSON.stringify(error, null, 2)));
    } else {
      console.log(chalk.green('✅ Projet créé avec succès!'));
      console.log(JSON.stringify(data, null, 2));
      
      // Créer des tâches pour ce projet
      console.log(chalk.blue('\n📋 Création de tâches...'));
      
      for (let i = 1; i <= 5; i++) {
        const taskData = {
          project_id: data.id,
          title: `Tâche ${i} - ${['Frontend', 'Backend', 'Design', 'API', 'Tests'][i-1]}`,
          description: `Description de la tâche ${i}`,
          status: 'todo', // Changé back à 'todo'
          priority: ['low', 'medium', 'high'][i % 3],
          due_date: new Date(Date.now() + (7 * i) * 24 * 60 * 60 * 1000).toISOString(),
          position: i
        };
        
        const { error: taskError } = await supabase
          .from('tasks')
          .insert(taskData);
        
        if (taskError) {
          console.log(chalk.red(`❌ Erreur tâche ${i}: ${taskError.message}`));
        } else {
          console.log(chalk.green(`✅ Tâche ${i} créée`));
        }
      }
    }
  } catch (err) {
    console.log(chalk.red(`❌ Exception: ${err.message}`));
  }
}

// Menu
const command = process.argv[2];

switch (command) {
  case 'structure':
    await debugTables();
    break;
    
  case 'relations':
    await checkRelations();
    break;
    
  case 'create':
    await createTestProject();
    break;
    
  default:
    console.log(`
Commandes disponibles:
  structure  - Analyser la structure des tables
  relations  - Vérifier les relations
  create     - Créer un projet test

Exemples:
  node scripts/debug-supabase.mjs structure
  node scripts/debug-supabase.mjs create
    `);
}