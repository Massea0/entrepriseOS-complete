#!/usr/bin/env node
import { db, supabase } from './supabase-admin.mjs';
import chalk from 'chalk';

// Helper pour afficher les résultats
const showResults = (title, data) => {
  console.log(chalk.cyan.bold(`\n${title}`));
  console.log(chalk.gray('='.repeat(50)));
  if (data && data.length > 0) {
    console.table(data);
  } else {
    console.log(chalk.yellow('Aucune donnée'));
  }
};

// Requêtes directes
const queries = {
  // Vérifier toutes les tables
  async checkTables() {
    console.log(chalk.cyan.bold('\n🗄️ Vérification des tables Supabase\n'));
    
    const tables = [
      'users', 'companies', 'employees', 'projects', 'tasks',
      'invoices', 'quotes', 'contracts', 'payments',
      'leave_types', 'leave_requests', 'leave_balances',
      'ai_agents', 'ai_agent_actions', 'workflows'
    ];
    
    for (const table of tables) {
      const count = await db.count(table);
      if (count !== null) {
        console.log(chalk.green(`✓ ${table}: ${count} enregistrements`));
      } else {
        console.log(chalk.red(`✗ ${table}: n'existe pas`));
      }
    }
  },

  // Dernières factures
  async recentInvoices() {
    const invoices = await db.query('invoices', {
      limit: 5,
      order: 'created_at.desc',
      select: 'id,number,amount,status,created_at,company:companies(name)'
    });
    showResults('📄 Dernières Factures', invoices);
  },

  // Projets actifs
  async activeProjects() {
    const projects = await supabase
      .from('projects')
      .select(`
        id,
        name,
        status,
        priority,
        company:companies(name),
        _count:tasks(count)
      `)
      .in('status', ['active', 'in_progress'])
      .order('created_at', { ascending: false });
    
    showResults('🏗️ Projets Actifs', projects.data);
  },

  // Tâches par statut
  async tasksByStatus() {
    const statuses = ['todo', 'in_progress', 'review', 'completed'];
    const results = [];
    
    for (const status of statuses) {
      const count = await db.count('tasks', { eq: { status } });
      results.push({ status, count });
    }
    
    showResults('📊 Répartition des Tâches', results);
  },

  // Employés avec charge de travail
  async employeeWorkload() {
    const { data } = await supabase
      .from('employees')
      .select(`
        full_name,
        position,
        tasks:tasks(count)
      `)
      .eq('status', 'active');
    
    const workload = data?.map(emp => ({
      name: emp.full_name,
      position: emp.position,
      tasks: emp.tasks?.[0]?.count || 0,
      workload: `${Math.min(100, (emp.tasks?.[0]?.count || 0) * 10)}%`
    }));
    
    showResults('👥 Charge de Travail Équipe', workload);
  },

  // Créer des données de test
  async seedTestData() {
    console.log(chalk.cyan.bold('\n🌱 Création de données de test\n'));
    
    // Créer un projet test
    const project = await db.insert('projects', {
      name: 'Projet Test IA ' + new Date().toISOString(),
      company_id: '672b96cf-68a5-4b09-93f5-1dd62cbef988', // Orange SA
      status: 'active',
      priority: 'high',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: 75000,
      description: 'Projet test pour démonstration assignation IA'
    });
    
    if (project) {
      console.log(chalk.green('✓ Projet créé:', project[0].name));
      
      // Créer des tâches
      for (let i = 1; i <= 5; i++) {
        await db.insert('tasks', {
          project_id: project[0].id,
          title: `Tâche ${i} - ${['Frontend', 'Backend', 'Design', 'API', 'Tests'][i-1]}`,
          description: `Description de la tâche ${i}`,
          status: 'todo',
          priority: ['low', 'medium', 'high'][i % 3],
          due_date: new Date(Date.now() + (7 * i) * 24 * 60 * 60 * 1000)
        });
      }
      console.log(chalk.green('✓ 5 tâches créées'));
    }
  },

  // Nettoyer les données de test
  async cleanup() {
    console.log(chalk.cyan.bold('\n🧹 Nettoyage des données de test\n'));
    
    // Supprimer les projets de test
    const { data: testProjects } = await supabase
      .from('projects')
      .select('id, name')
      .like('name', '%Test%');
    
    if (testProjects && testProjects.length > 0) {
      for (const project of testProjects) {
        // Supprimer d'abord les tâches
        await supabase.from('tasks').delete().eq('project_id', project.id);
        // Puis le projet
        await db.delete('projects', project.id);
        console.log(chalk.yellow(`✓ Supprimé: ${project.name}`));
      }
    } else {
      console.log(chalk.gray('Aucun projet de test trouvé'));
    }
  }
};

// CLI
const command = process.argv[2];

switch (command) {
  case 'tables':
    await queries.checkTables();
    break;
    
  case 'invoices':
    await queries.recentInvoices();
    break;
    
  case 'projects':
    await queries.activeProjects();
    break;
    
  case 'tasks':
    await queries.tasksByStatus();
    break;
    
  case 'workload':
    await queries.employeeWorkload();
    break;
    
  case 'seed':
    await queries.seedTestData();
    break;
    
  case 'cleanup':
    await queries.cleanup();
    break;
    
  default:
    console.log(chalk.cyan.bold('\n🎯 Requêtes Directes Supabase\n'));
    console.log(`
Commandes disponibles:
  tables    - Vérifier toutes les tables
  invoices  - Dernières factures
  projects  - Projets actifs
  tasks     - Répartition des tâches
  workload  - Charge de travail équipe
  seed      - Créer des données de test
  cleanup   - Nettoyer les données de test

Exemples:
  node scripts/supabase-direct-queries.mjs tables
  node scripts/supabase-direct-queries.mjs projects
  node scripts/supabase-direct-queries.mjs seed
    `);
}