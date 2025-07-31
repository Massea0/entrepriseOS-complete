import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  source: string;
  score: number;
  status: string;
  value: number;
  ai_notes: string[];
  metadata: unknown;
}

interface SalesAgentConfig {
  min_lead_score: number;
  max_discount: number;
  auto_follow_up: boolean;
  qualification_criteria: string[];
  pricing_rules: {
    volume_discount: number;
    loyalty_bonus: number;
    urgency_premium: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, lead_id, data } = await req.json()

    // Configuration par défaut de l'agent
    const defaultConfig: SalesAgentConfig = {
      min_lead_score: 70,
      max_discount: 15,
      auto_follow_up: true,
      qualification_criteria: [
        'Budget confirmé',
        'Besoin identifié', 
        'Décideur contacté',
        'Timeline définie'
      ],
      pricing_rules: {
        volume_discount: 0.1,
        loyalty_bonus: 0.05,
        urgency_premium: 0.15
      }
    };

    let result;

    switch (action) {
      case 'qualify_lead':
        result = await qualifyLead(supabaseClient, lead_id, defaultConfig);
        break;
      
      case 'generate_proposal':
        result = await generateProposal(supabaseClient, lead_id, defaultConfig);
        break;
      
      case 'negotiate_price':
        result = await negotiatePrice(supabaseClient, lead_id, data.requested_discount, defaultConfig);
        break;
      
      case 'create_contract':
        result = await createContract(supabaseClient, lead_id, data);
        break;
      
      case 'auto_follow_up':
        result = await autoFollowUp(supabaseClient, defaultConfig);
        break;
      
      default:
        throw new Error(`Action non supportée: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('SalesAgent Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Qualification automatique des leads
async function qualifyLead(supabase: unknown, leadId: string, config: SalesAgentConfig) {
  // Récupérer le lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (leadError) throw leadError;

  // Algorithme IA de qualification (simulation)
  const qualificationFactors = {
    company_size: getCompanyScore(lead.company),
    email_domain: getEmailDomainScore(lead.email),
    source_quality: getSourceScore(lead.source),
    response_time: getResponseTimeScore(lead.created_at),
    contact_completeness: getContactCompletenessScore(lead)
  };

  // Calcul du score IA
  const weights = { company_size: 0.3, email_domain: 0.2, source_quality: 0.2, response_time: 0.15, contact_completeness: 0.15 };
  const calculatedScore = Object.entries(qualificationFactors).reduce((total, [key, score]) => {
    return total + (score * weights[key]);
  }, 0);

  const finalScore = Math.round(calculatedScore);
  const isQualified = finalScore >= config.min_lead_score;

  // Génération des notes IA
  const aiNotes = [
    `Score IA calculé: ${finalScore}/100`,
    `Facteurs: Entreprise(${qualificationFactors.company_size}), Email(${qualificationFactors.email_domain}), Source(${qualificationFactors.source_quality})`,
    isQualified ? 'Lead qualifié - priorité élevée' : 'Lead nécessite plus d\'informations',
    `Prochaine action: ${isQualified ? 'Générer proposition commerciale' : 'Contact de qualification'}`
  ];

  // Mise à jour du lead
  const { error: updateError } = await supabase
    .from('leads')
    .update({
      score: finalScore,
      status: isQualified ? 'QUALIFIED' : 'CONTACTED',
      ai_notes: [...(lead.ai_notes || []), ...aiNotes],
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (updateError) throw updateError;

  // Enregistrer l'action
  await logAgentAction(supabase, 'LEAD_QUALIFICATION', leadId, {
    description: 'Qualification automatique par IA',
    result: { score: finalScore, qualified: isQualified, factors: qualificationFactors },
    cost: 2.50
  });

  return {
    qualified: isQualified,
    score: finalScore,
    factors: qualificationFactors,
    next_action: isQualified ? 'generate_proposal' : 'follow_up_call'
  };
}

// Génération automatique de proposition
async function generateProposal(supabase: unknown, leadId: string, config: SalesAgentConfig) {
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (leadError) throw leadError;

  // Calcul automatique du prix
  const basePrice = lead.value || 50000; // Prix de base
  const urgencyMultiplier = isUrgent(lead) ? (1 + config.pricing_rules.urgency_premium) : 1;
  const volumeDiscount = getVolumeDiscount(basePrice, config.pricing_rules.volume_discount);
  
  const finalPrice = Math.round(basePrice * urgencyMultiplier * (1 - volumeDiscount));
  const discount = Math.round((1 - (finalPrice / basePrice)) * 100);

  // Génération du contenu de la proposition
  const proposal = {
    id: `PROP-${Date.now()}`,
    lead_id: leadId,
    base_price: basePrice,
    final_price: finalPrice,
    discount_percent: Math.abs(discount),
    timeline: generateTimeline(lead),
    deliverables: generateDeliverables(lead),
    terms: generateTerms(lead),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    ai_generated: true
  };

  // Sauvegarder la proposition
  const { error: proposalError } = await supabase
    .from('proposals')
    .insert(proposal);

  if (proposalError) throw proposalError;

  // Mettre à jour le lead
  const { error: updateError } = await supabase
    .from('leads')
    .update({
      status: 'PROPOSAL_SENT',
      ai_notes: [
        ...(lead.ai_notes || []),
        `Proposition générée automatiquement: ${finalPrice.toLocaleString()}€`,
        `Remise appliquée: ${Math.abs(discount)}%`,
        `Délai: ${proposal.timeline}`,
        `Validité: 30 jours`
      ],
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (updateError) throw updateError;

  // Enregistrer l'action
  await logAgentAction(supabase, 'PROPOSAL_GENERATION', leadId, {
    description: 'Génération automatique de proposition commerciale',
    result: proposal,
    cost: 5.00
  });

  // Programmer un suivi automatique dans 7 jours
  if (config.auto_follow_up) {
    await scheduleFollowUp(supabase, leadId, 7);
  }

  return proposal;
}

// Négociation automatique de prix
async function negotiatePrice(supabase: unknown, leadId: string, requestedDiscount: number, config: SalesAgentConfig) {
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (leadError) throw leadError;

  // Logique de négociation IA
  const maxAllowedDiscount = config.max_discount;
  const leadPriority = calculateLeadPriority(lead);
  const urgencyFactor = isUrgent(lead) ? 1.2 : 1.0;
  
  // Ajustement du discount autorisé selon la priorité
  const adjustedMaxDiscount = Math.min(
    maxAllowedDiscount * urgencyFactor * leadPriority,
    25 // Maximum absolu
  );

  const approvedDiscount = Math.min(requestedDiscount, adjustedMaxDiscount);
  const isAccepted = approvedDiscount >= requestedDiscount * 0.8; // Accepté si 80%+ du demandé

  const negotiationResult = {
    requested_discount: requestedDiscount,
    approved_discount: approvedDiscount,
    max_allowed: adjustedMaxDiscount,
    is_accepted: isAccepted,
    counter_offer: isAccepted ? null : approvedDiscount,
    reasoning: generateNegotiationReasoning(requestedDiscount, approvedDiscount, leadPriority)
  };

  // Mise à jour du lead
  const { error: updateError } = await supabase
    .from('leads')
    .update({
      status: isAccepted ? 'NEGOTIATING' : 'PROPOSAL_UPDATED',
      ai_notes: [
        ...(lead.ai_notes || []),
        `Négociation IA: Demande ${requestedDiscount}% → ${isAccepted ? 'Accepté' : `Contre-offre ${approvedDiscount}%`}`,
        `Priorité lead: ${(leadPriority * 100).toFixed(0)}%`,
        negotiationResult.reasoning
      ],
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (updateError) throw updateError;

  // Enregistrer l'action
  await logAgentAction(supabase, 'PRICE_NEGOTIATION', leadId, {
    description: `Négociation automatique: ${requestedDiscount}% → ${approvedDiscount}%`,
    result: negotiationResult,
    cost: 3.50
  });

  return negotiationResult;
}

// Création automatique de contrat
async function createContract(supabase: unknown, leadId: string, proposalData: unknown) {
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (leadError) throw leadError;

  // Génération du contrat
  const contract = {
    id: `CONT-${Date.now()}`,
    lead_id: leadId,
    client_name: lead.name,
    client_company: lead.company,
    client_email: lead.email,
    value: proposalData.final_price,
    status: 'DRAFT',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    terms: generateContractTerms(lead, proposalData),
    clauses: generateContractClauses(proposalData),
    ai_generated: true,
    created_at: new Date().toISOString()
  };

  // Sauvegarder le contrat
  const { error: contractError } = await supabase
    .from('contracts')
    .insert(contract);

  if (contractError) throw contractError;

  // Mettre à jour le lead
  const { error: updateError } = await supabase
    .from('leads')
    .update({
      status: 'CONTRACT_GENERATED',
      ai_notes: [
        ...(lead.ai_notes || []),
        `Contrat généré automatiquement: ${contract.id}`,
        `Valeur: ${contract.value.toLocaleString()}€`,
        `Statut: Brouillon - En attente de validation`
      ],
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (updateError) throw updateError;

  // Enregistrer l'action
  await logAgentAction(supabase, 'CONTRACT_CREATION', leadId, {
    description: 'Création automatique de contrat',
    result: { contract_id: contract.id, value: contract.value },
    cost: 7.50
  });

  return contract;
}

// Suivi automatique des leads
async function autoFollowUp(supabase: unknown, config: SalesAgentConfig) {
  // Récupérer les leads nécessitant un suivi
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .in('status', ['CONTACTED', 'PROPOSAL_SENT', 'NEGOTIATING'])
    .lt('last_contact', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (leadsError) throw leadsError;

  const followUpResults = [];

  for (const lead of leads) {
    const followUpAction = determineFollowUpAction(lead);
    
    // Exécuter l'action de suivi
    let result;
    switch (followUpAction.type) {
      case 'EMAIL_REMINDER':
        result = await sendEmailReminder(supabase, lead);
        break;
      case 'PRICE_ADJUSTMENT':
        result = await adjustPricing(supabase, lead);
        break;
      case 'ESCALATE_TO_HUMAN':
        result = await escalateToHuman(supabase, lead);
        break;
  }


    followUpResults.push({
      lead_id: lead.id,
      action: followUpAction,
      result
    });

    // Enregistrer l'action
    await logAgentAction(supabase, 'FOLLOW_UP', lead.id, {
      description: `Suivi automatique: ${followUpAction.type}`,
      result,
      cost: 1.50
    });
  }

  return {
    processed_leads: leads.length,
    actions: followUpResults
  };
}

// Fonctions utilitaires
function getCompanyScore(company: string): number {
  // Simulation d'analyse de l'entreprise
  const size = company.length > 20 ? 85 : company.length > 10 ? 70 : 50;
  return Math.min(100, size + Math.random() * 20);
}

function getEmailDomainScore(email: string): number {
  const domain = email.split('@')[1];
  if (domain.includes('gmail') || domain.includes('yahoo')) return 60;
  if (domain.includes('.com') && !domain.includes('free')) return 85;
  return 75;
}

function getSourceScore(source: string): number {
  const scores = {
    'Referral': 95,
    'LinkedIn': 85,
    'Website': 75,
    'Cold': 45
  };
  return scores[source] || 60;
}

function getResponseTimeScore(createdAt: string): number {
  const hoursOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  return Math.max(20, 100 - hoursOld);
}

function getContactCompletenessScore(lead: Lead): number {
  let score = 0;
  if (lead.name) score += 25;
  if (lead.email) score += 25;
  if (lead.phone) score += 25;
  if (lead.company) score += 25;
  return score;
}

function isUrgent(lead: Lead): boolean {
  return lead.ai_notes?.some(note => 
    note.toLowerCase().includes('urgent') || 
    note.toLowerCase().includes('asap') ||
    note.toLowerCase().includes('rapidement')
  ) || false;
}

function getVolumeDiscount(amount: number, discountRate: number): number {
  if (amount > 100000) return discountRate;
  if (amount > 50000) return discountRate * 0.5;
  return 0;
}

function generateTimeline(lead: Lead): string {
  const weeks = 4 + Math.floor(Math.random() * 8);
  return `${weeks} semaines`;
}

function generateDeliverables(lead: Lead): string[] {
  return [
    'Configuration système complète',
    'Formation utilisateurs (2 sessions)',
    'Documentation technique',
    'Support 3 mois inclus'
  ];
}

function generateTerms(lead: Lead): string {
  return 'Paiement: 30% à la signature, 40% à mi-parcours, 30% à la livraison. Garantie 24 mois.';
}

async function logAgentAction(supabase: unknown, actionType: string, leadId: string, details: unknown) {
  await supabase
    .from('ai_agent_actions')
    .insert({
      agent_id: 'sales-agent-pro',
      action_type: actionType,
      target_id: leadId,
      description: details.description,
      result: details.result,
      cost: details.cost,
      status: 'EXECUTED',
      created_at: new Date().toISOString()
    });
}

// Plus de fonctions utilitaires...
function calculateLeadPriority(lead: Lead): number {
  return Math.min(1.0, lead.score / 100 + (lead.value / 100000) * 0.3);
}

function generateNegotiationReasoning(requested: number, approved: number, priority: number): string {
  if (approved >= requested) {
    return `Remise accordée intégralement (lead prioritaire: ${(priority * 100).toFixed(0)}%)`;
  }
  return `Contre-offre basée sur analyse IA: valeur lead vs marge acceptable`;
}

function generateContractTerms(lead: Lead, proposal: unknown): string {
  return `Contrat de prestation de services - ${lead.company}\nValeur: ${proposal.final_price.toLocaleString()}€\nDurée: 12 mois\nRenouvellement automatique`;
}

function generateContractClauses(proposal: unknown): string[] {
  return [
    'Clause de confidentialité',
    'Clause de propriété intellectuelle', 
    'Clause de résiliation',
    'Clause de pénalités de retard',
    'Clause de garantie'
  ];
}

function determineFollowUpAction(lead: Lead): { type: string, reason: string } {
  const daysSinceContact = (Date.now() - new Date(lead.last_contact).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceContact > 14) {
    return { type: 'ESCALATE_TO_HUMAN', reason: 'Pas de réponse depuis 14 jours' };
  }
  if (lead.status === 'PROPOSAL_SENT' && daysSinceContact > 7) {
    return { type: 'EMAIL_REMINDER', reason: 'Relance proposition' };
  }
  if (lead.status === 'NEGOTIATING') {
    return { type: 'PRICE_ADJUSTMENT', reason: 'Ajustement prix nécessaire' };
  }
  
  return { type: 'EMAIL_REMINDER', reason: 'Suivi standard' };
}

async function sendEmailReminder(supabase: unknown, lead: Lead) {
  // Intégration avec système email (simulation)
  return { sent: true, type: 'email', recipient: lead.email };
}

async function adjustPricing(supabase: unknown, lead: Lead) {
  // Ajustement automatique des prix
  return { adjusted: true, new_discount: 5 };
}

async function escalateToHuman(supabase: unknown, lead: Lead) {
  // Escalade vers un humain
  return { escalated: true, assigned_to: 'sales_manager' };
}

async function scheduleFollowUp(supabase: unknown, leadId: string, days: number) {
  // Programmer un suivi
  return { scheduled: true, follow_up_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000) };
} 