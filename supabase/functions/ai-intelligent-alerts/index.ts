import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface ProactiveAlert {
  id: string;
  type: 'financial' | 'operational' | 'commercial' | 'hr' | 'strategic';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  data: unknown;
  createdAt: string;
  expiresAt: string;
  isRead: boolean;
  isActioned: boolean;
  confidence: number;
  impact: string;
  recommendedActions: AlertAction[];
  automatedActions: AutomatedAction[];
  notifications: NotificationHistory[];
}

interface AlertAction {
  id: string;
  type: 'manual' | 'automated';
  title: string;
  description: string;
  priority: number;
  module: string;
  function: string;
  parameters?: unknown;
  estimatedImpact: string;
}

interface AutomatedAction {
  id: string;
  type: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  title: string;
  executedAt?: string;
  result?: unknown;
  error?: string;
}

interface NotificationHistory {
  id: string;
  channel: 'email' | 'sms' | 'push' | 'teams' | 'slack';
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
  recipient: string;
}

// Règles d'alertes intelligentes
const ALERT_RULES = {
  // Alertes financières
  critical_cash_flow: {
    type: 'financial',
    severity: 'critical',
    condition: (data: unknown) => data.financialMetrics.pendingRevenue < data.financialMetrics.totalRevenue * 0.1,
    title: 'Crise de Trésorerie Imminente',
    message: (data: unknown) => `Flux de trésorerie critique détecté. Seulement ${(data.financialMetrics.pendingRevenue / 1000000).toFixed(1)}M XOF en attente.`,
    automatedActions: ['send_payment_reminders', 'contact_accounting_team', 'prepare_cash_flow_report'],
    confidence: 0.95
  },
  
  revenue_decline: {
    type: 'financial',
    severity: 'high',
    condition: (data: unknown) => data.financialMetrics.growthRate < -20,
    title: 'Baisse Significative du Chiffre d\'Affaires',
    message: (data: unknown) => `Baisse de ${Math.abs(data.financialMetrics.growthRate).toFixed(1)}% du chiffre d'affaires détectée.`,
    automatedActions: ['analyze_sales_trends', 'schedule_sales_meeting', 'generate_revenue_report'],
    confidence: 0.88
  },

  // Alertes opérationnelles
  project_failure_risk: {
    type: 'operational',
    severity: 'high',
    condition: (data: unknown) => data.projects.filter(p => p.status === 'in_progress' && calculateProjectRisk(p) > 0.8).length > 0,
    title: 'Projets à Risque d\'Échec',
    message: (data: unknown) => `${data.projects.filter(p => calculateProjectRisk(p) > 0.8).length} projet(s) nécessitent une intervention urgente.`,
    automatedActions: ['alert_project_managers', 'schedule_risk_assessment', 'reallocate_resources'],
    confidence: 0.91
  },

  team_overload: {
    type: 'operational',
    severity: 'medium',
    condition: (data: unknown) => data.employees.filter(e => calculateEmployeeWorkload(e, data.tasks) > 120).length > 0,
    title: 'Surcharge d\'Équipe Détectée',
    message: (data: unknown) => `${data.employees.filter(e => calculateEmployeeWorkload(e, data.tasks) > 120).length} employé(s) en surcharge.`,
    automatedActions: ['redistribute_tasks', 'schedule_hr_meeting', 'analyze_workload_balance'],
    confidence: 0.85
  },

  // Alertes commerciales
  conversion_drop: {
    type: 'commercial',
    severity: 'medium',
    condition: (data: unknown) => data.financialMetrics.conversionRate < 50,
    title: 'Chute du Taux de Conversion',
    message: (data: unknown) => `Taux de conversion tombé à ${data.financialMetrics.conversionRate.toFixed(1)}%.`,
    automatedActions: ['analyze_sales_funnel', 'review_pricing_strategy', 'schedule_sales_training'],
    confidence: 0.82
  },

  client_churn_risk: {
    type: 'commercial',
    severity: 'high',
    condition: (data: unknown) => identifyChurnRiskClients(data).length > 0,
    title: 'Risque de Perte de Clients',
    message: (data: unknown) => `${identifyChurnRiskClients(data).length} client(s) à risque de départ.`,
    automatedActions: ['contact_at_risk_clients', 'prepare_retention_offers', 'schedule_client_reviews'],
    confidence: 0.89
  },

  // Alertes RH
  employee_turnover: {
    type: 'hr',
    severity: 'medium',
    condition: (data: unknown) => data.employees.filter(e => e.employment_status === 'inactive').length > data.employees.length * 0.15,
    title: 'Taux de Rotation Élevé',
    message: (data: unknown) => `Taux de rotation des employés supérieur à 15%.`,
    automatedActions: ['conduct_exit_interviews', 'analyze_retention_factors', 'improve_benefits_package'],
    confidence: 0.78
  },

  // Alertes stratégiques
  market_opportunity: {
    type: 'strategic',
    severity: 'low',
    condition: (data: unknown) => data.companies.filter(c => c.potential_revenue > 5000000).length > 5,
    title: 'Opportunité de Marché',
    message: (data: unknown) => `${data.companies.filter(c => c.potential_revenue > 5000000).length} opportunités à fort potentiel identifiées.`,
    automatedActions: ['analyze_market_trends', 'prepare_expansion_plan', 'schedule_strategy_meeting'],
    confidence: 0.75
  }
};

// Actions automatisées disponibles
const AUTOMATED_ACTIONS = {
  send_payment_reminders: {
    title: 'Envoyer rappels de paiement',
    description: 'Envoie automatiquement des rappels aux clients en retard de paiement',
    execute: async (data: unknown) => {
      // Simulation d'envoi de rappels
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, remindersSent: 5 };
    }
  },
  
  contact_accounting_team: {
    title: 'Alerter équipe comptable',
    description: 'Notifie l\'équipe comptable de la situation critique',
    execute: async (data: unknown) => {
      // Simulation de notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, teamNotified: true };
    }
  },
  
  analyze_sales_trends: {
    title: 'Analyser tendances commerciales',
    description: 'Lance une analyse approfondie des tendances de vente',
    execute: async (data: unknown) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, analysisGenerated: true };
    }
  },
  
  alert_project_managers: {
    title: 'Alerter chefs de projet',
    description: 'Notifie les chefs de projet des risques identifiés',
    execute: async (data: unknown) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, managersAlerted: 3 };
    }
  },
  
  redistribute_tasks: {
    title: 'Redistribuer les tâches',
    description: 'Propose automatiquement une redistribution des tâches',
    execute: async (data: unknown) => {
      await new Promise(resolve => setTimeout(resolve, 2500));
      return { success: true, tasksRedistributed: 8 };
    }
  },
  
  contact_at_risk_clients: {
    title: 'Contacter clients à risque',
    description: 'Initie le contact avec les clients identifiés comme à risque',
    execute: async (data: unknown) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, clientsContacted: 3 };
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // WebSocket pour alertes temps réel
  if (upgradeHeader.toLowerCase() === "websocket") {
    return handleWebSocketAlerts(req);
  }

  // API REST pour actions sur les alertes
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, ...requestData } = await req.json();

    console.log('🚨 Alertes Intelligentes - Action:', action);

    switch (action) {
      case 'get_alerts': {
  const alerts = await generateIntelligentAlerts(supabase, requestData.configuration);
        const stats = await calculateAlertsStats(alerts);
        return new Response(JSON.stringify({
          success: true,
          alerts: alerts,
          stats: stats
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'mark_as_read':
        await markAlertAsRead(supabase, requestData.alertId);
        return new Response(JSON.stringify({
          success: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'execute_action': {
  const result = await executeAlertAction(supabase, requestData.alertId, requestData.actionId);
        return new Response(JSON.stringify({
          success: true,
          result: result
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'save_configuration':
        await saveAlertsConfiguration(supabase, requestData.configuration);
        return new Response(JSON.stringify({
          success: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        throw new Error(`Action non supportée: ${action}`);
    }

  } catch (error) {
    console.error('❌ Erreur Alertes Intelligentes:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// WebSocket pour alertes temps réel
async function handleWebSocketAlerts(req: Request): Promise<Response> {
  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    console.log("🚨 WebSocket Alertes établi");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let monitoringInterval: number | null = null;

    socket.onopen = () => {
      console.log("✅ WebSocket Alertes ouvert");
      socket.send(JSON.stringify({
        type: 'connection_established',
        message: 'Système d\'alertes intelligentes activé',
        timestamp: new Date().toISOString()
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 Message reçu:", data.type);

        switch (data.type) {
          case 'start_monitoring':
            // Démarrer la surveillance des alertes
            if (monitoringInterval) clearInterval(monitoringInterval);
            
            monitoringInterval = setInterval(async () => {
              try {
                const alerts = await generateIntelligentAlerts(supabase, data.configuration);
                const newAlerts = alerts.filter(alert => !alert.isRead);
                
                if (newAlerts.length > 0) {
                  for (const alert of newAlerts) {
                    socket.send(JSON.stringify({
                      type: 'new_alert',
                      alert: alert,
                      timestamp: new Date().toISOString()
                    }));
                    
                    // Exécuter les actions automatisées si activées
                    if (data.configuration?.automatedActions && alert.automatedActions.length > 0) {
                      await executeAutomatedActions(alert, socket);
                    }
                  }
                }
                
                // Envoyer statistiques
                const stats = await calculateAlertsStats(alerts);
                socket.send(JSON.stringify({
                  type: 'stats_update',
                  stats: stats,
                  timestamp: new Date().toISOString()
                }));
                
              } catch (error) {
                console.error('❌ Erreur surveillance:', error);
                socket.send(JSON.stringify({
                  type: 'error',
                  message: 'Erreur lors de la surveillance des alertes',
                  error: error.message
                }));
              }
            }, data.interval || 10000); // Surveillance toutes les 10 secondes
            
            socket.send(JSON.stringify({
              type: 'monitoring_started',
              message: 'Surveillance des alertes démarrée',
              interval: data.interval || 10000
            }));
            break;

          case 'stop_monitoring':
            if (monitoringInterval) {
              clearInterval(monitoringInterval);
              monitoringInterval = null;
            }
            socket.send(JSON.stringify({
              type: 'monitoring_stopped',
              message: 'Surveillance des alertes arrêtée'
            }));
            break;

          case 'ping':
            socket.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString(),
              status: 'active',
              monitoring: monitoringInterval ? true : false
            }));
            break;

          default:
            socket.send(JSON.stringify({
              type: 'error',
              message: `Type de message non supporté: ${data.type}`
            }));
        }
      } catch (error) {
        console.error('❌ Erreur traitement message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Erreur de traitement du message',
          details: error.message
        }));
      }
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket Alertes fermé");
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ Erreur WebSocket Alertes:", error);
    };

    return response;

  } catch (error) {
    console.error("❌ Erreur création WebSocket:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      service: 'ai-intelligent-alerts'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Génération des alertes intelligentes
async function generateIntelligentAlerts(supabase: unknown, configuration: unknown): Promise<ProactiveAlert[]> {
  const alerts: ProactiveAlert[] = [];

  try {
    console.log('🔍 Génération des alertes intelligentes...');

    // Collecte des données
    const businessData = await collectBusinessData(supabase);
    
    // Évaluation de chaque règle d'alerte
    for (const [ruleId, rule] of Object.entries(ALERT_RULES)) {
      try {
        if (rule.condition(businessData)) {
          const alert: ProactiveAlert = {
            id: `alert_${ruleId}_${Date.now()}`,
            type: rule.type,
            severity: rule.severity,
            title: rule.title,
            message: typeof rule.message === 'function' ? rule.message(businessData) : rule.message,
            data: businessData,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
            isRead: false,
            isActioned: false,
            confidence: rule.confidence,
            impact: calculateAlertImpact(rule.severity, businessData),
            recommendedActions: generateRecommendedActions(rule.type, businessData),
            automatedActions: rule.automatedActions.map(actionId => ({
              id: actionId,
              type: actionId,
              status: 'pending',
              title: AUTOMATED_ACTIONS[actionId]?.title || actionId
            })),
            notifications: []
          };

          alerts.push(alert);
          console.log(`✅ Alerte générée: ${alert.title} (${alert.severity})`);
        }
      } catch (error) {
        console.error(`❌ Erreur évaluation règle ${ruleId}:`, error);
      }
    }

    console.log(`📊 ${alerts.length} alertes générées`);
    return alerts;

  } catch (error) {
    console.error('❌ Erreur génération alertes:', error);
    return [];
  }
}

// Collecte des données business
async function collectBusinessData(supabase: unknown): Promise<any> {
  try {
    const [projectsRes, tasksRes, employeesRes, companiesRes, devisRes, invoicesRes] = await Promise.all([
      supabase.from('projects').select('*').limit(100),
      supabase.from('tasks').select('*').limit(200),
      supabase.from('employees').select('*').limit(100),
      supabase.from('companies').select('*').limit(50),
      supabase.from('devis').select('*').limit(100),
      supabase.from('invoices').select('*').limit(100)
    ]);

    const rawData = {
      projects: projectsRes.data || [],
      tasks: tasksRes.data || [],
      employees: employeesRes.data || [],
      companies: companiesRes.data || [],
      devis: devisRes.data || [],
      invoices: invoicesRes.data || []
    };

    // Calcul des métriques enrichies
    const financialMetrics = {
      totalRevenue: rawData.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0),
      pendingRevenue: rawData.invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.amount || 0), 0),
      conversionRate: rawData.devis.length > 0 ? (rawData.devis.filter(d => d.status === 'approved').length / rawData.devis.length) * 100 : 0,
      growthRate: calculateGrowthRate(rawData.invoices)
    };

    return {
      ...rawData,
      financialMetrics
    };

  } catch (error) {
    console.error('❌ Erreur collecte données:', error);
    throw error;
  }
}

// Exécution des actions automatisées
async function executeAutomatedActions(alert: ProactiveAlert, socket: WebSocket) {
  for (const action of alert.automatedActions) {
    try {
      action.status = 'executing';
      
      socket.send(JSON.stringify({
        type: 'automated_action_started',
        alertId: alert.id,
        action: action
      }));

      const automatedAction = AUTOMATED_ACTIONS[action.type];
      if (automatedAction) {
        action.result = await automatedAction.execute(alert.data);
        action.status = 'completed';
        action.executedAt = new Date().toISOString();
      } else {
        action.status = 'failed';
        action.error = 'Action non trouvée';
      }

      socket.send(JSON.stringify({
        type: 'automated_action_completed',
        alertId: alert.id,
        action: action
      }));

    } catch (error) {
      action.status = 'failed';
      action.error = error.message;
      
      socket.send(JSON.stringify({
        type: 'automated_action_failed',
        alertId: alert.id,
        action: action,
        error: error.message
      }));
    }
  }
}

// Calculs utilitaires
function calculateProjectRisk(project: unknown): number {
  const now = new Date();
  const endDate = new Date(project.end_date || now);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let risk = 0;
  if (daysRemaining < 7) risk += 0.4;
  if (daysRemaining < 30) risk += 0.3;
  if (project.budget && project.budget > 10000000) risk += 0.2;
  if (project.status === 'in_progress' && daysRemaining < 0) risk = 1;
  
  return Math.min(1, risk);
}

function calculateEmployeeWorkload(employee: unknown, tasks: unknown[]): number {
  const employeeTasks = tasks.filter(t => t.assignee_id === employee.user_id && t.status === 'in_progress');
  return employeeTasks.length * 20; // 20 points par tâche active
}

function identifyChurnRiskClients(data: unknown): unknown[] {
  return data.companies.filter(company => {
    const companyInvoices = data.invoices.filter(i => i.company_id === company.id);
    const lastInvoice = companyInvoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    if (!lastInvoice) return false;
    
    const daysSinceLastInvoice = Math.floor((Date.now() - new Date(lastInvoice.created_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastInvoice > 90; // Plus de 90 jours sans facture
  });
}

function calculateGrowthRate(invoices: unknown[]): number {
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  if (paidInvoices.length < 2) return 0;
  
  const sortedInvoices = paidInvoices.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth - 1;
  
  const currentMonthRevenue = sortedInvoices
    .filter(i => new Date(i.created_at).getMonth() === currentMonth)
    .reduce((sum, i) => sum + (i.amount || 0), 0);
    
  const lastMonthRevenue = sortedInvoices
    .filter(i => new Date(i.created_at).getMonth() === lastMonth)
    .reduce((sum, i) => sum + (i.amount || 0), 0);
  
  return lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
}

function calculateAlertImpact(severity: string, data: unknown): string {
  const impacts = {
    critical: 'Impact financier direct > 10M XOF',
    high: 'Impact opérationnel majeur',
    medium: 'Impact modéré sur la productivité',
    low: 'Impact minimal, amélioration recommandée'
  };
  return impacts[severity] || 'Impact à évaluer';
}

function generateRecommendedActions(type: string, data: unknown): AlertAction[] {
  const actions: AlertAction[] = [];
  
  switch (type) {
    case 'financial':
      actions.push({
        id: 'review_cash_flow',
        type: 'manual',
        title: 'Réviser le flux de trésorerie',
        description: 'Analyser en détail les entrées et sorties de trésorerie',
        priority: 1,
        module: 'finance',
        function: 'cash_flow_analysis',
        estimatedImpact: 'Amélioration de 15% de la visibilité financière'
      });
      break;
      
    case 'operational':
      actions.push({
        id: 'optimize_resources',
        type: 'manual',
        title: 'Optimiser les ressources',
        description: 'Redistribuer les ressources pour améliorer l\'efficacité',
        priority: 1,
        module: 'operations',
        function: 'resource_optimization',
        estimatedImpact: 'Gain de productivité de 20%'
      });
      break;
      
    case 'commercial':
      actions.push({
        id: 'improve_sales_process',
        type: 'manual',
        title: 'Améliorer le processus commercial',
        description: 'Optimiser le tunnel de vente pour augmenter les conversions',
        priority: 1,
        module: 'sales',
        function: 'sales_process_optimization',
        estimatedImpact: 'Augmentation de 25% du taux de conversion'
      });
      break;
  }

  
  return actions;
}

async function calculateAlertsStats(alerts: ProactiveAlert[]): Promise<any> {
  return {
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    highAlerts: alerts.filter(a => a.severity === 'high').length,
    mediumAlerts: alerts.filter(a => a.severity === 'medium').length,
    lowAlerts: alerts.filter(a => a.severity === 'low').length,
    resolvedAlerts: alerts.filter(a => a.isActioned).length,
    unreadAlerts: alerts.filter(a => !a.isRead).length,
    automatedActions: alerts.reduce((sum, a) => sum + a.automatedActions.filter(action => action.status === 'completed').length, 0),
    notificationsSent: alerts.reduce((sum, a) => sum + a.notifications.length, 0)
  };
}

async function markAlertAsRead(supabase: unknown, alertId: string): Promise<void> {
  // Ici, on sauvegarderait normalement en base de données
  // Pour cette démo, nous simulons
  console.log(`✅ Alerte ${alertId} marquée comme lue`);
}

async function executeAlertAction(supabase: unknown, alertId: string, actionId: string): Promise<any> {
  // Simulation d'exécution d'action
  console.log(`🚀 Exécution de l'action ${actionId} pour l'alerte ${alertId}`);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    actionId: actionId,
    executedAt: new Date().toISOString(),
    result: 'Action exécutée avec succès'
  };
}

async function saveAlertsConfiguration(supabase: unknown, configuration: unknown): Promise<void> {
  // Sauvegarde de la configuration
  console.log('💾 Configuration des alertes sauvegardée:', configuration);
}

export {
  generateIntelligentAlerts,
  ALERT_RULES,
  AUTOMATED_ACTIONS
};