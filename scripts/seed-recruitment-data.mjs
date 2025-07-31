#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(chalk.blue('🌱 Seeding recruitment data...'));

// Sample job postings
const jobPostings = [
  {
    title: 'Développeur Full Stack Senior',
    department: 'tech',
    location: 'Paris, France (Remote)',
    type: 'full_time',
    experience_level: 'senior',
    status: 'published',
    published_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    salary_min: 65000,
    salary_max: 85000,
    description: `Nous recherchons un développeur Full Stack Senior passionné pour rejoindre notre équipe technique. Vous serez responsable du développement de nouvelles fonctionnalités, de l'optimisation des performances et du mentorat des développeurs juniors.`,
    responsibilities: [
      'Développer et maintenir des applications web modernes avec React et Node.js',
      'Concevoir et implémenter des APIs RESTful robustes',
      'Collaborer avec l\'équipe produit pour définir les spécifications techniques',
      'Participer aux revues de code et assurer la qualité du code',
      'Mentorer les développeurs juniors de l\'équipe'
    ],
    requirements: [
      'Minimum 5 ans d\'expérience en développement web',
      'Maîtrise de React, TypeScript et Node.js',
      'Expérience avec PostgreSQL et les bases NoSQL',
      'Connaissance des pratiques DevOps et CI/CD',
      'Excellent esprit d\'équipe et capacités de communication'
    ],
    benefits: [
      'Télétravail flexible (2-3 jours/semaine)',
      'Budget formation annuel de 3000€',
      'Mutuelle entreprise premium',
      'Tickets restaurant',
      '7 semaines de congés (5 + 2 RTT)'
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Git']
  },
  {
    title: 'Product Designer UX/UI',
    department: 'tech',
    location: 'Lyon, France',
    type: 'full_time',
    experience_level: 'mid',
    status: 'published',
    published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    closing_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    salary_min: 45000,
    salary_max: 60000,
    description: `Rejoignez notre équipe design pour créer des expériences utilisateur exceptionnelles. Vous travaillerez en étroite collaboration avec les développeurs et le product owner.`,
    responsibilities: [
      'Concevoir des interfaces utilisateur intuitives et esthétiques',
      'Créer des wireframes, prototypes et maquettes haute fidélité',
      'Conduire des tests utilisateurs et analyser les retours',
      'Maintenir et faire évoluer le design system',
      'Collaborer avec les équipes de développement'
    ],
    requirements: [
      '3+ années d\'expérience en design UX/UI',
      'Maîtrise de Figma et des outils de prototypage',
      'Portfolio démontrant des projets réussis',
      'Connaissance des principes d\'accessibilité',
      'Capacité à travailler en équipe agile'
    ],
    benefits: [
      'Environnement créatif et stimulant',
      'Matériel de pointe (MacBook Pro, écran 4K)',
      'Abonnement aux outils design',
      'Participation aux conférences design',
      'Horaires flexibles'
    ],
    skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototypage', 'User Research', 'Design System']
  },
  {
    title: 'Chef de Projet Digital',
    department: 'operations',
    location: 'Marseille, France',
    type: 'full_time',
    experience_level: 'mid',
    status: 'published',
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    salary_min: 50000,
    salary_max: 65000,
    description: `Nous recherchons un chef de projet digital expérimenté pour piloter nos projets clients et coordonner les équipes pluridisciplinaires.`,
    responsibilities: [
      'Piloter des projets digitaux de A à Z',
      'Gérer la relation client et les attentes',
      'Coordonner les équipes techniques et créatives',
      'Suivre les budgets et les délais',
      'Assurer la qualité des livrables'
    ],
    requirements: [
      '3-5 ans d\'expérience en gestion de projet digital',
      'Certification PMP ou Prince2 appréciée',
      'Excellentes compétences relationnelles',
      'Maîtrise des méthodologies agiles',
      'Anglais professionnel'
    ],
    benefits: [
      'Prime sur objectifs',
      'Véhicule de fonction',
      'Smartphone et laptop',
      'Formation continue',
      'Évolution de carrière rapide'
    ],
    skills: ['Gestion de projet', 'Agile', 'Scrum', 'JIRA', 'Communication', 'Leadership']
  },
  {
    title: 'Développeur React Junior',
    department: 'tech',
    location: 'Remote',
    type: 'full_time',
    experience_level: 'junior',
    status: 'draft',
    salary_min: 35000,
    salary_max: 45000,
    description: `Opportunité parfaite pour un développeur junior passionné par React et désireux d'apprendre dans une équipe bienveillante.`,
    responsibilities: [
      'Développer des composants React réutilisables',
      'Participer aux revues de code',
      'Écrire des tests unitaires',
      'Documenter le code',
      'Apprendre et grandir avec l\'équipe'
    ],
    requirements: [
      '0-2 ans d\'expérience avec React',
      'Connaissance de JavaScript ES6+',
      'Notions de Git',
      'Envie d\'apprendre',
      'Autonomie et curiosité'
    ],
    benefits: [
      'Mentorat par des seniors',
      'Budget formation important',
      'Remote first',
      'Équipement fourni',
      'Ambiance startup'
    ],
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git']
  },
  {
    title: 'Data Analyst',
    department: 'tech',
    location: 'Toulouse, France',
    type: 'full_time',
    experience_level: 'mid',
    status: 'on_hold',
    salary_min: 48000,
    salary_max: 62000,
    description: `Nous cherchons un Data Analyst pour transformer nos données en insights actionnables et aider à la prise de décision stratégique.`,
    responsibilities: [
      'Analyser les données business et créer des dashboards',
      'Identifier les tendances et opportunités',
      'Créer des rapports automatisés',
      'Collaborer avec les équipes métiers',
      'Optimiser les processus data'
    ],
    requirements: [
      '3+ ans en analyse de données',
      'Maîtrise de SQL et Python',
      'Expérience avec Tableau ou Power BI',
      'Compétences en statistiques',
      'Esprit analytique'
    ],
    benefits: [
      'Télétravail partiel',
      'Formation data science',
      'Conférences tech',
      'Prime annuelle',
      'RTT'
    ],
    skills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel', 'Statistiques']
  }
];

// Sample candidates
const generateCandidates = (jobId, jobTitle, count) => {
  const firstNames = ['Sophie', 'Thomas', 'Marie', 'Lucas', 'Emma', 'Hugo', 'Léa', 'Louis', 'Chloé', 'Alexandre'];
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon'];
  const statuses = ['new', 'screening', 'interview_1', 'interview_2', 'interview_3', 'offer', 'hired', 'rejected'];
  
  const candidates = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    candidates.push({
      job_id: jobId,
      candidate_name: `${firstName} ${lastName}`,
      candidate_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      candidate_phone: `+33 6 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
      status,
      application_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      cv_url: `https://example.com/cv/${firstName.toLowerCase()}_${lastName.toLowerCase()}.pdf`,
      cover_letter: `Madame, Monsieur,\n\nJe suis vivement intéressé(e) par le poste de ${jobTitle}...`,
      experience_years: Math.floor(Math.random() * 10) + 1,
      skills_match_score: Math.floor(Math.random() * 40) + 60,
      rating: status !== 'new' ? Math.floor(Math.random() * 3) + 3 : null,
      notes: status !== 'new' ? [`Candidat(e) prometteur(se)`, `Bonne expérience technique`] : []
    });
  }
  return candidates;
};

async function seedData() {
  try {
    // Insert job postings directly (tables exist with service role key)
    console.log(chalk.yellow('Creating job postings...'));
    const { data: jobs, error: jobError } = await supabase
      .from('job_postings')
      .insert(jobPostings)
      .select();

    if (jobError) {
      console.error(chalk.red('Error creating job postings:'));
      console.error(chalk.red('Message:'), jobError.message || 'Unknown error');
      console.error(chalk.red('Code:'), jobError.code || 'No code');
      console.error(chalk.red('Details:'), JSON.stringify(jobError.details || jobError, null, 2));
      return;
    }

    console.log(chalk.green(`✓ Created ${jobs.length} job postings`));

    // Generate and insert candidates for each job
    console.log(chalk.yellow('Creating job applications...'));
    let totalCandidates = 0;

    for (const job of jobs) {
      const candidateCount = job.status === 'published' 
        ? Math.floor(Math.random() * 20) + 10 
        : Math.floor(Math.random() * 5);
        
      const candidates = generateCandidates(job.id, job.title, candidateCount);
      
      const { error: appError } = await supabase
        .from('job_applications')
        .insert(candidates);

      if (appError) {
        console.error(chalk.red(`Error creating applications for ${job.title}:`));
        console.error(chalk.red('Details:'), appError.message || JSON.stringify(appError));
        continue;
      }

      totalCandidates += candidates.length;
      console.log(chalk.gray(`  - ${candidates.length} applications for "${job.title}"`));
    }

    console.log(chalk.green(`✓ Created ${totalCandidates} job applications`));

    // Create some interviews for candidates in interview stages
    console.log(chalk.yellow('Creating interviews...'));
    const { data: applications } = await supabase
      .from('job_applications')
      .select('id, status, job_id')
      .in('status', ['interview_1', 'interview_2', 'interview_3']);

    let interviewCount = 0;
    for (const app of applications || []) {
      const interviewType = app.status === 'interview_1' ? 'phone' : 
                          app.status === 'interview_2' ? 'technical' : 'final';
      
      const interview = {
        application_id: app.id,
        interview_type: interviewType,
        scheduled_date: new Date(Date.now() + Math.floor(Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: interviewType === 'phone' ? 30 : 60,
        location: interviewType === 'phone' ? 'Phone' : 'Office/Video',
        interviewer_ids: ['00000000-0000-0000-0000-000000000001'], // Mock interviewer
        status: 'scheduled'
      };

      const { error } = await supabase
        .from('recruitment_interviews')
        .insert(interview);

      if (!error) interviewCount++;
    }

    console.log(chalk.green(`✓ Created ${interviewCount} interviews`));
    console.log(chalk.blue('\n✨ Recruitment data seeding completed!'));

  } catch (error) {
    console.error(chalk.red('Unexpected error:'), error);
  }
}

// Run the seeding
seedData();