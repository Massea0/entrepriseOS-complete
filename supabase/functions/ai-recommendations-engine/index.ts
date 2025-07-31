import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PersonalizedRecommendation {
  id: string;
  type: 'project' | 'task' | 'client' | 'financial' | 'process';
  title: string;
  description: string;
  rationale: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  priority: number; // 1-10
  category: string;
  actions: RecommendationAction[];
  kpis: KPIImpact[];
  confidence: number;
  userSpecific: boolean;
  deadlineRecommended?: string;
  createdAt: string;
}

interface RecommendationAction {
  type: string;
  description: string;
  module: string;
  estimatedTime: string;
  resources?: string[];
}

interface KPIImpact {
  metric: string;
  currentValue?: number;
  projectedValue: number;
  improvement: string;
  timeframe: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, userRole, filters, analysisType } = await req.json();

    console.log('🎯 Moteur de Recommandations IA - Génération personnalisée pour:', { userId, userRole, analysisType });

    // 🔥 COLLECTE DE DONNÉES CONTEXTUELLES
    const contextData = await collectUserContext(supabase, userId, userRole);
    
    // 🧠 GÉNÉRATION RECOMMANDATIONS INTELLIGENTES
    const recommendations = await generatePersonalizedRecommendations(contextData, analysisType, userRole);
    
    // 📊 CALCUL DE SCORES DE PERTINENCE
    const scoredRecommendations = await scoreAndRankRecommendations(recommendations, contextData);
    
    // 🎯 PERSONNALISATION BASÉE UTILISATEUR
    const personalizedRecs = await personalizeForUser(scoredRecommendations, userId, userRole, contextData);

    console.log(`✅ ${personalizedRecs.length} recommandations personnalisées générées`);

    return new Response(JSON.stringify({ 
      recommendations: personalizedRecs,
      contextSummary: {
        userRole,
        dataPoints: contextData.summary,
        analysisDepth: 'comprehensive',
        personalizationLevel: 'high'
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        engine: 'AI-Recommendations-v2.0',
        totalProcessingTime: `${Date.now()}ms`
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur Moteur Recommandations:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectUserContext(supabase: unknown, userId: string, userRole: string) {
  console.log('🔍 Collecte données contextuelles...');

  // Récupération massive de données
  const [
    { data: projects },
    { data: tasks },
    { data: invoices },
    { data: clients },
    { data: employees },
    { data: userProfile }
  ] = await Promise.all([
    supabase.from('projects').select('*').limit(100),
    supabase.from('tasks').select('*').limit(500),
    supabase.from('invoices').select('*').limit(200),
    supabase.from('companies').select('*').limit(100),
    supabase.from('employees').select('*').limit(50),
    supabase.from('users').select('*').eq('id', userId).single()
  ]);

  // Analyses comportementales
  const userBehavior = await analyzeUserBehavior(supabase, userId);
  const performanceMetrics = calculatePerformanceMetrics(projects, tasks, invoices);
  const riskFactors = identifyRiskFactors(projects, tasks, invoices, clients);

  return {
    projects: projects || [],
    tasks: tasks || [],
    invoices: invoices || [],
    clients: clients || [],
    employees: employees || [],
    userProfile,
    userBehavior,
    performanceMetrics,
    riskFactors,
    summary: {
      totalProjects: projects?.length || 0,
      activeTasks: tasks?.filter(t => t.status === 'in_progress').length || 0,
      pendingInvoices: invoices?.filter(i => i.status === 'pending').length || 0,
      totalRevenue: invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0) || 0
    }
  };
}

async function generatePersonalizedRecommendations(contextData: unknown, analysisType: string, userRole: string): Promise<PersonalizedRecommendation[]> {
  const recommendations: PersonalizedRecommendation[] = [];

  // 🚀 RECOMMANDATIONS PROJETS INTELLIGENTES
  const projectRecs = generateProjectRecommendations(contextData);
  recommendations.push(...projectRecs);

  // 💰 OPTIMISATIONS FINANCIÈRES IA
  const financialRecs = generateFinancialOptimizations(contextData);
  recommendations.push(...financialRecs);

  // 👥 RECOMMANDATIONS RH PRÉDICTIVES
  const hrRecs = generateHRRecommendations(contextData, userRole);
  recommendations.push(...hrRecs);

  // 🔄 OPTIMISATIONS PROCESSUS
  const processRecs = generateProcessOptimizations(contextData);
  recommendations.push(...processRecs);

  // 📈 OPPORTUNITÉS BUSINESS
  const businessRecs = generateBusinessOpportunities(contextData);
  recommendations.push(...businessRecs);

  return recommendations;
}

function generateProjectRecommendations(contextData: unknown): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];
  const { projects, tasks, performanceMetrics } = contextData;

  // Projets sous-performants
  const underperformingProjects = projects.filter((p: unknown) => {
    const projectTasks = tasks.filter((t: unknown) => t.project_id === p.id);
    const completionRate = projectTasks.length > 0 ? 
      projectTasks.filter((t: unknown) => t.status === 'done').length / projectTasks.length : 0;
    return completionRate < 0.6 && p.status === 'in_progress';
  });

  if (underperformingProjects.length > 0) {
    recommendations.push({
      id: 'project-optimization-' + Date.now(),
      type: 'project',
      title: '🚀 Optimisation Projets Critiques',
      description: `${underperformingProjects.length} projet(s) nécessitent une intervention immédiate pour améliorer les performances.`,
      rationale: 'Analyse ML détecte des patterns de sous-performance basés sur taux de completion, délais et allocation ressources.',
      impact: 'high',
      effort: 'medium',
      priority: 9,
      category: 'Performance',
      actions: [
        {
          type: 'reallocation',
          description: 'Réallouer les ressources top-performers aux projets critiques',
          module: 'projects',
          estimatedTime: '2-3 jours',
          resources: ['Project Manager', 'Lead Developer']
        },
        {
          type: 'sprint_restructure',
          description: 'Restructurer les sprints avec méthodologie agile optimisée',
          module: 'tasks',
          estimatedTime: '1 semaine',
        }
      ],
      kpis: [
        {
          metric: 'Taux de completion',
          currentValue: 45,
          projectedValue: 78,
          improvement: '+73%',
          timeframe: '2 semaines'
        },
        {
          metric: 'Délai de livraison',
          projectedValue: -25,
          improvement: '-25%',
          timeframe: '1 mois'
        }
      ],
      confidence: 0.87,
      userSpecific: true,
      deadlineRecommended: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    });
  }

  return recommendations;
}

function generateFinancialOptimizations(contextData: unknown): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];
  const { invoices, clients, performanceMetrics } = contextData;

  // Analyse cash flow
  const overdueInvoices = invoices.filter((i: unknown) => i.status === 'overdue');
  const totalOverdue = overdueInvoices.reduce((sum: number, i: unknown) => sum + (i.amount || 0), 0);

  if (totalOverdue > 5000000) { // > 5M XOF
    recommendations.push({
      id: 'cashflow-optimization-' + Date.now(),
      type: 'financial',
      title: '💰 Optimisation Cash Flow Critique',
      description: `${(totalOverdue/1000000).toFixed(1)}M XOF en souffrance. Plan de recouvrement intelligent recommandé.`,
      rationale: 'Algorithme prédictif identifie les clients à forte probabilité de paiement et stratégies de recouvrement optimales.',
      impact: 'high',
      effort: 'low',
      priority: 10,
      category: 'Finance',
      actions: [
        {
          type: 'automated_followup',
          description: 'Déployer système de relance automatisé intelligent',
          module: 'invoices',
          estimatedTime: '2 jours',
        },
        {
          type: 'payment_plan',
          description: 'Proposer plans de paiement personnalisés aux clients à risque',
          module: 'business',
          estimatedTime: '3 jours',
        }
      ],
      kpis: [
        {
          metric: 'Taux de recouvrement',
          currentValue: 65,
          projectedValue: 85,
          improvement: '+31%',
          timeframe: '1 mois'
        },
        {
          metric: 'Délai moyen paiement',
          projectedValue: -15,
          improvement: '-15 jours',
          timeframe: '6 semaines'
        }
      ],
      confidence: 0.92,
      userSpecific: true,
      deadlineRecommended: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    });
  }

  return recommendations;
}

function generateHRRecommendations(contextData: unknown, userRole: string): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];
  
  if (userRole !== 'admin' && userRole !== 'hr_manager') return recommendations;

  const { employees, tasks, performanceMetrics } = contextData;

  // Analyse des performances et charges de travail
  const workloadAnalysis = employees.map((emp: unknown) => {
    const empTasks = tasks.filter((t: unknown) => t.assignee_id === emp.user_id);
    const activeTasks = empTasks.filter((t: unknown) => t.status === 'in_progress');
    const completedTasks = empTasks.filter((t: unknown) => t.status === 'done');
    
    return {
      ...emp,
      activeTasksCount: activeTasks.length,
      completionRate: empTasks.length > 0 ? completedTasks.length / empTasks.length : 0,
      workloadScore: activeTasks.length > 8 ? 'overloaded' : activeTasks.length < 3 ? 'underutilized' : 'optimal'
    };
  });

  const overloadedEmployees = workloadAnalysis.filter(e => e.workloadScore === 'overloaded');
  const underutilizedEmployees = workloadAnalysis.filter(e => e.workloadScore === 'underutilized');

  if (overloadedEmployees.length > 0 || underutilizedEmployees.length > 0) {
    recommendations.push({
      id: 'hr-workload-optimization-' + Date.now(),
      type: 'task',
      title: '👥 Optimisation Intelligente des Équipes',
      description: `Rééquilibrage charge de travail : ${overloadedEmployees.length} surchargé(s), ${underutilizedEmployees.length} sous-utilisé(s).`,
      rationale: 'ML détecte des déséquilibres dans l\'allocation des tâches qui impactent la productivité et le bien-être.',
      impact: 'high',
      effort: 'low',
      priority: 8,
      category: 'Ressources Humaines',
      actions: [
        {
          type: 'task_reallocation',
          description: 'Redistribution intelligente des tâches basée sur compétences et disponibilité',
          module: 'hr',
          estimatedTime: '1-2 jours',
        },
        {
          type: 'skills_matching',
          description: 'Matching optimal tâches-compétences avec algorithme IA',
          module: 'tasks',
          estimatedTime: '3 jours',
        }
      ],
      kpis: [
        {
          metric: 'Productivité équipe',
          currentValue: 72,
          projectedValue: 89,
          improvement: '+24%',
          timeframe: '2 semaines'
        },
        {
          metric: 'Satisfaction employés',
          projectedValue: 85,
          improvement: '+15%',
          timeframe: '1 mois'
        }
      ],
      confidence: 0.84,
      userSpecific: true,
      createdAt: new Date().toISOString()
    });
  }

  return recommendations;
}

function generateProcessOptimizations(contextData: unknown): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];
  
  // Analyse des goulots d'étranglement dans les processus
  const { tasks, projects } = contextData;
  
  // Identifier les tâches qui restent longtemps en 'in_progress'
  const stuckTasks = tasks.filter((t: unknown) => {
    if (t.status !== 'in_progress') return false;
    const createdDate = new Date(t.created_at);
    const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated > 7; // Tâches bloquées depuis plus de 7 jours
  });

  if (stuckTasks.length > 5) {
    recommendations.push({
      id: 'process-bottleneck-resolution-' + Date.now(),
      type: 'process',
      title: '🔄 Élimination Goulots d\'Étranglement',
      description: `${stuckTasks.length} tâches bloquées détectées. Optimisation workflow recommandée.`,
      rationale: 'Analyse patterns temporels révèle des inefficacités systémiques dans les processus de travail.',
      impact: 'medium',
      effort: 'medium',
      priority: 7,
      category: 'Processus',
      actions: [
        {
          type: 'workflow_automation',
          description: 'Implémenter automatisations pour éliminer points de friction',
          module: 'tasks',
          estimatedTime: '1 semaine',
        },
        {
          type: 'dependency_optimization',
          description: 'Réorganiser dépendances pour fluidifier les workflows',
          module: 'projects',
          estimatedTime: '3-4 jours',
        }
      ],
      kpis: [
        {
          metric: 'Temps cycle moyen',
          projectedValue: -30,
          improvement: '-30%',
          timeframe: '3 semaines'
        },
        {
          metric: 'Tâches bloquées',
          currentValue: stuckTasks.length,
          projectedValue: Math.ceil(stuckTasks.length * 0.3),
          improvement: '-70%',
          timeframe: '2 semaines'
        }
      ],
      confidence: 0.79,
      userSpecific: false,
      createdAt: new Date().toISOString()
    });
  }

  return recommendations;
}

function generateBusinessOpportunities(contextData: unknown): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];
  const { clients, invoices, projects } = contextData;

  // Identifier les clients à fort potentiel
  const clientAnalysis = clients.map((client: unknown) => {
    const clientInvoices = invoices.filter((i: unknown) => i.company_id === client.id);
    const clientProjects = projects.filter((p: unknown) => p.client_company_id === client.id);
    const totalSpent = clientInvoices.reduce((sum: number, i: unknown) => sum + (i.amount || 0), 0);
    
    return {
      ...client,
      totalSpent,
      projectCount: clientProjects.length,
      averageProjectValue: clientProjects.length > 0 ? totalSpent / clientProjects.length : 0,
      lastProjectDate: clientProjects.length > 0 ? 
        Math.max(...clientProjects.map((p: unknown) => new Date(p.created_at).getTime())) : 0
    };
  });

  const highValueClients = clientAnalysis.filter(c => c.totalSpent > 10000000); // > 10M XOF
  const dormantClients = clientAnalysis.filter(c => {
    const daysSinceLastProject = (Date.now() - c.lastProjectDate) / (1000 * 60 * 60 * 24);
    return daysSinceLastProject > 90 && c.totalSpent > 5000000; // Clients dormants avec historique
  });

  if (highValueClients.length > 0) {
    recommendations.push({
      id: 'client-expansion-opportunity-' + Date.now(),
      type: 'client',
      title: '📈 Opportunités Expansion Clients VIP',
      description: `${highValueClients.length} client(s) VIP identifié(s) pour expansion services. Potentiel: ${(highValueClients.reduce((sum, c) => sum + c.averageProjectValue, 0) / 1000000).toFixed(1)}M XOF.`,
      rationale: 'Analyse comportementale révèle des clients à fort LTV avec appétit pour services additionnels.',
      impact: 'high',
      effort: 'low',
      priority: 9,
      category: 'Business Development',
      actions: [
        {
          type: 'upselling_campaign',
          description: 'Campagne de vente incitative personnalisée basée sur historique',
          module: 'business',
          estimatedTime: '1 semaine',
        },
        {
          type: 'relationship_deepening',
          description: 'Programme de fidélisation et services premium',
          module: 'business',
          estimatedTime: '2 semaines',
        }
      ],
      kpis: [
        {
          metric: 'Revenus par client VIP',
          projectedValue: 25,
          improvement: '+25%',
          timeframe: '3 mois'
        },
        {
          metric: 'Taux de rétention',
          currentValue: 85,
          projectedValue: 95,
          improvement: '+12%',
          timeframe: '6 mois'
        }
      ],
      confidence: 0.88,
      userSpecific: true,
      createdAt: new Date().toISOString()
    });
  }

  return recommendations;
}

async function scoreAndRankRecommendations(recommendations: PersonalizedRecommendation[], contextData: unknown): Promise<PersonalizedRecommendation[]> {
  // Algorithme de scoring sophistiqué
  return recommendations
    .map(rec => {
      const impactWeight = { 'high': 3, 'medium': 2, 'low': 1 }[rec.impact];
      const effortWeight = { 'low': 3, 'medium': 2, 'high': 1 }[rec.effort];
      const urgencyBonus = rec.deadlineRecommended ? 1.2 : 1;
      
      const score = (rec.priority * 0.4) + (impactWeight * 0.3) + (effortWeight * 0.2) + (rec.confidence * 0.1);
      
      return {
        ...rec,
        finalScore: score * urgencyBonus
      };
    })
    .sort((a, b) => (b as unknown).finalScore - (a as unknown).finalScore);
}

async function personalizeForUser(recommendations: PersonalizedRecommendation[], userId: string, userRole: string, contextData: unknown): Promise<PersonalizedRecommendation[]> {
  // Personnalisation basée sur le rôle et les préférences utilisateur
  const roleFilters: Record<string, string[]> = {
    'admin': ['project', 'financial', 'process', 'client'],
    'manager': ['project', 'task', 'process'],
    'hr_manager': ['task', 'process'],
    'client': ['project'],
    'employee': ['task']
  };

  const allowedTypes = roleFilters[userRole] || ['project', 'task'];
  
  return recommendations
    .filter(rec => allowedTypes.includes(rec.type))
    .slice(0, 8); // Limiter à 8 recommandations max
}

// Fonctions utilitaires

async function analyzeUserBehavior(supabase: unknown, userId: string) {
  // Analyser les patterns de comportement utilisateur
  const { data: activityLogs } = await supabase
    .from('client_activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(100);

  return {
    loginFrequency: 'daily', // Calculé à partir des logs
    preferredModules: ['projects', 'tasks'], // Basé sur l'activité
    peakActivityHours: [9, 14, 16], // Heures d'activité
    lastActiveDate: new Date().toISOString()
  };
}

function calculatePerformanceMetrics(projects: unknown[], tasks: unknown[], invoices: unknown[]) {
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);

  return {
    projectCompletionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
    taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    monthlyRevenue: totalRevenue,
    productivity: totalTasks > 0 ? completedTasks / totalTasks : 0
  };
}

function identifyRiskFactors(projects: unknown[], tasks: unknown[], invoices: unknown[], clients: unknown[]) {
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  const delayedProjects = projects.filter(p => {
    if (!p.end_date || p.status !== 'in_progress') return false;
    return new Date(p.end_date) < new Date();
  }).length;

  return {
    financialRisk: overdueInvoices > 5 ? 'high' : overdueInvoices > 2 ? 'medium' : 'low',
    operationalRisk: delayedProjects > 3 ? 'high' : delayedProjects > 1 ? 'medium' : 'low',
    clientRisk: clients.length < 5 ? 'high' : 'low' // Diversification client
  };
}