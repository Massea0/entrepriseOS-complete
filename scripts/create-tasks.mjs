#!/usr/bin/env node
import { supabase } from './supabase-admin.mjs';
import chalk from 'chalk';

console.log(chalk.cyan.bold('\n📋 Création de tâches pour le projet test\n'));

const projectId = '135b6d2c-d4ac-48cc-961e-7f3c3aeb1d8b'; // ID du projet créé

const tasks = [
  {
    project_id: projectId,
    title: 'Analyse des besoins Frontend',
    description: 'Analyser les besoins pour l\'interface utilisateur',
    status: 'todo',
    priority: 'high',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    position: 1
  },
  {
    project_id: projectId,
    title: 'Architecture Backend API',
    description: 'Concevoir l\'architecture des APIs REST',
    status: 'todo',
    priority: 'high',
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    position: 2
  },
  {
    project_id: projectId,
    title: 'Design UI/UX',
    description: 'Créer les maquettes et le design system',
    status: 'in_progress',
    priority: 'medium',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    position: 3
  },
  {
    project_id: projectId,
    title: 'Intégration API externes',
    description: 'Intégrer les APIs tierces nécessaires',
    status: 'todo',
    priority: 'medium',
    due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    position: 4
  },
  {
    project_id: projectId,
    title: 'Tests automatisés',
    description: 'Mettre en place les tests unitaires et E2E',
    status: 'todo',
    priority: 'low',
    due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    position: 5
  }
];

// D'abord, essayons de voir quels sont les statuts valides
console.log(chalk.yellow('Test des statuts valides...'));

const testStatuses = ['todo', 'to_do', 'done', 'in_progress', 'pending', 'new'];

for (const status of testStatuses) {
  const { error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      title: `Test status: ${status}`,
      status: status,
      position: 999
    });
  
  if (!error) {
    console.log(chalk.green(`✓ Status valide: ${status}`));
    // Supprimer la tâche de test
    await supabase.from('tasks').delete().eq('title', `Test status: ${status}`);
  } else {
    console.log(chalk.red(`✗ Status invalide: ${status}`));
  }
}

console.log(chalk.cyan('\n📋 Création des vraies tâches...\n'));

// Créer les tâches
for (const task of tasks) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();
  
  if (error) {
    console.log(chalk.red(`❌ Erreur: ${error.message}`));
    console.log(chalk.yellow('Détails:', JSON.stringify(error, null, 2)));
  } else {
    console.log(chalk.green(`✅ Tâche créée: ${data.title}`));
  }
}

console.log(chalk.green('\n✅ Terminé!'));