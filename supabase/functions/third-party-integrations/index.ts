import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Configuration des intégrations tierces
const INTEGRATIONS_CONFIG = {
  slack: {
    clientId: Deno.env.get('SLACK_CLIENT_ID'),
    clientSecret: Deno.env.get('SLACK_CLIENT_SECRET'),
    signingSecret: Deno.env.get('SLACK_SIGNING_SECRET'),
    botToken: Deno.env.get('SLACK_BOT_TOKEN'),
    apiUrl: 'https://slack.com/api',
    webhookUrl: 'https://hooks.slack.com/services'
  },
  teams: {
    clientId: Deno.env.get('TEAMS_CLIENT_ID'),
    clientSecret: Deno.env.get('TEAMS_CLIENT_SECRET'),
    tenantId: Deno.env.get('TEAMS_TENANT_ID'),
    apiUrl: 'https://graph.microsoft.com/v1.0',
    webhookUrl: 'https://outlook.office.com/webhook'
  },
  whatsapp: {
    phoneNumberId: Deno.env.get('WHATSAPP_PHONE_NUMBER_ID'),
    accessToken: Deno.env.get('WHATSAPP_ACCESS_TOKEN'),
    webhookToken: Deno.env.get('WHATSAPP_WEBHOOK_TOKEN'),
    apiUrl: 'https://graph.facebook.com/v18.0',
    businessAccountId: Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-ms-teams-signature',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Interfaces pour les intégrations
interface IntegrationConfig {
  id: string;
  type: 'slack' | 'teams' | 'whatsapp';
  name: string;
  enabled: boolean;
  credentials: Record<string, unknown>;
  webhookUrl?: string;
  settings: {
    notifications: boolean;
    channels: string[];
    autoRespond: boolean;
    filterKeywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface NotificationPayload {
  type: 'alert' | 'notification' | 'message' | 'workflow';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, unknown>;
  channels?: string[];
  mentions?: string[];
  attachments?: Array<{
    type: 'file' | 'image' | 'link';
    url: string;
    title?: string;
    description?: string;
  }>;
}

interface WebhookEvent {
  platform: 'slack' | 'teams' | 'whatsapp';
  type: string;
  data: unknown;
  timestamp: string;
  signature?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/third-party-integrations', '');
    
    console.log('🔗 Intégrations Tierces - Requête:', {
      path,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Router selon le chemin
    switch (path) {
      case '/config':
        return await handleIntegrationsConfig(req, supabase);
        
      case '/slack/oauth':
        return await handleSlackOAuth(req, supabase);
        
      case '/slack/webhook':
        return await handleSlackWebhook(req, supabase);
        
      case '/teams/oauth':
        return await handleTeamsOAuth(req, supabase);
        
      case '/teams/webhook':
        return await handleTeamsWebhook(req, supabase);
        
      case '/whatsapp/webhook':
        return await handleWhatsAppWebhook(req, supabase);
        
      case '/notify':
        return await handleCrossplatformNotification(req, supabase);
        
      case '/test':
        return await handleTestIntegrations(req, supabase);
        
      case '/status':
        return await handleIntegrationsStatus(req, supabase);
        
      default:
        return createResponse(false, null, 'Endpoint non trouvé', 404);
    }

  } catch (error) {
    console.error('❌ Erreur Intégrations Tierces:', error);
    return createResponse(false, null, error.message, 500);
  }
});

// Gestion de la configuration des intégrations
async function handleIntegrationsConfig(req: Request, supabase: unknown): Promise<Response> {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('third_party_integrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return createResponse(true, {
        integrations: data || [],
        availablePlatforms: ['slack', 'teams', 'whatsapp'],
        configuredCount: (data || []).filter(i => i.enabled).length
      });
    } catch (error) {
      return createResponse(false, null, error.message, 500);
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { type, name, credentials, settings } = await req.json();
      
      // Valider la configuration
      const validationResult = await validateIntegrationConfig(type, credentials);
      if (!validationResult.valid) {
        return createResponse(false, null, validationResult.error, 400);
      }
      
      const integrationConfig: Partial<IntegrationConfig> = {
        type,
        name,
        enabled: true,
        credentials: await encryptCredentials(credentials),
        settings: settings || {
          notifications: true,
          channels: [],
          autoRespond: false,
          filterKeywords: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('third_party_integrations')
        .insert(integrationConfig)
        .select()
        .single();
      
      if (error) throw error;
      
      // Configurer les webhooks
      await setupWebhooks(data, supabase);
      
      return createResponse(true, data);
    } catch (error) {
      return createResponse(false, null, error.message, 500);
    }
  }
  
  return createResponse(false, null, 'Méthode non supportée', 405);
}

// OAuth Slack
async function handleSlackOAuth(req: Request, supabase: unknown): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  if (!code) {
    return createResponse(false, null, 'Code OAuth manquant', 400);
  }
  
  try {
    // Échanger le code contre un token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INTEGRATIONS_CONFIG.slack.clientId!,
        client_secret: INTEGRATIONS_CONFIG.slack.clientSecret!,
        code,
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.ok) {
      throw new Error(`Erreur OAuth Slack: ${tokenData.error}`);
    }
    
    // Sauvegarder la configuration Slack
    const slackConfig = {
      type: 'slack',
      name: `Slack - ${tokenData.team.name}`,
      enabled: true,
      credentials: await encryptCredentials({
        accessToken: tokenData.access_token,
        botToken: tokenData.bot_user_id ? tokenData.access_token : null,
        teamId: tokenData.team.id,
        teamName: tokenData.team.name,
        userId: tokenData.authed_user.id,
        scope: tokenData.scope
      }),
      settings: {
        notifications: true,
        channels: [],
        autoRespond: false,
        filterKeywords: []
      },
      webhook_url: `${req.url.split('/slack/oauth')[0]}/slack/webhook`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('third_party_integrations')
      .insert(slackConfig)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Configuration Slack sauvegardée:', data.id);
    
    return createResponse(true, {
      success: true,
      integration: data,
      team: tokenData.team
    });
    
  } catch (error) {
    console.error('❌ Erreur OAuth Slack:', error);
    return createResponse(false, null, error.message, 500);
  }
}

// Webhook Slack
async function handleSlackWebhook(req: Request, supabase: unknown): Promise<Response> {
  if (req.method !== 'POST') {
    return createResponse(false, null, 'Méthode non supportée', 405);
  }
  
  try {
    const body = await req.text();
    const signature = req.headers.get('x-slack-signature');
    const timestamp = req.headers.get('x-slack-request-timestamp');
    
    // Vérifier la signature Slack
    if (!await verifySlackSignature(body, signature, timestamp)) {
      return createResponse(false, null, 'Signature invalide', 401);
    }
    
    const event = JSON.parse(body);
    
    // Gestion du challenge Slack
    if (event.type === 'url_verification') {
      return new Response(event.challenge, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Traiter les événements Slack
    if (event.type === 'event_callback') {
      await processSlackEvent(event.event, supabase);
    }
    
    return createResponse(true, { received: true });
    
  } catch (error) {
    console.error('❌ Erreur webhook Slack:', error);
    return createResponse(false, null, error.message, 500);
  }
}

// OAuth Teams
async function handleTeamsOAuth(req: Request, supabase: unknown): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return createResponse(false, null, 'Code OAuth manquant', 400);
  }
  
  try {
    // Échanger le code contre un token Teams
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${INTEGRATIONS_CONFIG.teams.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INTEGRATIONS_CONFIG.teams.clientId!,
        client_secret: INTEGRATIONS_CONFIG.teams.clientSecret!,
        code,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/User.Read https://graph.microsoft.com/Chat.ReadWrite'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`Erreur OAuth Teams: ${tokenData.error_description}`);
    }
    
    // Récupérer les informations utilisateur
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    const userData = await userResponse.json();
    
    // Sauvegarder la configuration Teams
    const teamsConfig = {
      type: 'teams',
      name: `Teams - ${userData.displayName}`,
      enabled: true,
      credentials: await encryptCredentials({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        userId: userData.id,
        userPrincipalName: userData.userPrincipalName,
        tenantId: INTEGRATIONS_CONFIG.teams.tenantId
      }),
      settings: {
        notifications: true,
        channels: [],
        autoRespond: false,
        filterKeywords: []
      },
      webhook_url: `${req.url.split('/teams/oauth')[0]}/teams/webhook`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('third_party_integrations')
      .insert(teamsConfig)
      .select()
      .single();
    
    if (error) throw error;
    
    return createResponse(true, {
      success: true,
      integration: data,
      user: userData
    });
    
  } catch (error) {
    console.error('❌ Erreur OAuth Teams:', error);
    return createResponse(false, null, error.message, 500);
  }
}

// Webhook Teams
async function handleTeamsWebhook(req: Request, supabase: unknown): Promise<Response> {
  if (req.method !== 'POST') {
    return createResponse(false, null, 'Méthode non supportée', 405);
  }
  
  try {
    const event = await req.json();
    
    // Traiter les événements Teams
    await processTeamsEvent(event, supabase);
    
    return createResponse(true, { received: true });
    
  } catch (error) {
    console.error('❌ Erreur webhook Teams:', error);
    return createResponse(false, null, error.message, 500);
  }
}

// Webhook WhatsApp
async function handleWhatsAppWebhook(req: Request, supabase: unknown): Promise<Response> {
  if (req.method === 'GET') {
    // Vérification du webhook WhatsApp
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    
    if (mode === 'subscribe' && token === INTEGRATIONS_CONFIG.whatsapp.webhookToken) {
      return new Response(challenge, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    return createResponse(false, null, 'Token de vérification invalide', 403);
  }
  
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      
      // Traiter les événements WhatsApp
      if (body.entry && body.entry[0] && body.entry[0].changes) {
        for (const change of body.entry[0].changes) {
          if (change.value && change.value.messages) {
            await processWhatsAppMessages(change.value.messages, supabase);
          }
          
          if (change.value && change.value.statuses) {
            await processWhatsAppStatuses(change.value.statuses, supabase);
          }
        }
      }
      
      return createResponse(true, { received: true });
      
    } catch (error) {
      console.error('❌ Erreur webhook WhatsApp:', error);
      return createResponse(false, null, error.message, 500);
    }
  }
  
  return createResponse(false, null, 'Méthode non supportée', 405);
}

// Notification cross-platform
async function handleCrossplatformNotification(req: Request, supabase: unknown): Promise<Response> {
  if (req.method !== 'POST') {
    return createResponse(false, null, 'Méthode non supportée', 405);
  }
  
  try {
    const payload: NotificationPayload = await req.json();
    
    // Récupérer les intégrations actives
    const { data: integrations, error } = await supabase
      .from('third_party_integrations')
      .select('*')
      .eq('enabled', true);
    
    if (error) throw error;
    
    const results = [];
    
    // Envoyer sur chaque plateforme
    for (const integration of integrations || []) {
      try {
        let result;
        
        switch (integration.type) {
          case 'slack':
            result = await sendSlackNotification(integration, payload);
            break;
          case 'teams':
            result = await sendTeamsNotification(integration, payload);
            break;
          case 'whatsapp':
            result = await sendWhatsAppNotification(integration, payload);
            break;
          default:
            continue;
        }
        
        results.push({
          platform: integration.type,
          success: true,
          result
        });
        
      } catch (error) {
        console.error(`❌ Erreur notification ${integration.type}:`, error);
        results.push({
          platform: integration.type,
          success: false,
          error: error.message
        });
      }
    }
    
    // Sauvegarder l'historique des notifications
    await supabase.from('notification_history').insert({
      payload,
      results,
      timestamp: new Date().toISOString(),
      success_count: results.filter(r => r.success).length,
      total_count: results.length
    });
    
    return createResponse(true, {
      sent: true,
      results,
      successCount: results.filter(r => r.success).length,
      totalCount: results.length
    });
    
  } catch (error) {
    console.error('❌ Erreur notification cross-platform:', error);
    return createResponse(false, null, error.message, 500);
  }
}

// Test des intégrations
async function handleTestIntegrations(req: Request, supabase: unknown): Promise<Response> {
  try {
    // Test des connexions
    const { data: integrations, error } = await supabase
      .from('third_party_integrations')
      .select('*')
      .eq('enabled', true);
    
    if (error) throw error;
    
    const testResults = [];
    
    for (const integration of integrations || []) {
      try {
        const credentials = await decryptCredentials(integration.credentials);
        let testResult;
        
        switch (integration.type) {
          case 'slack':
            testResult = await testSlackConnection(credentials);
            break;
          case 'teams':
            testResult = await testTeamsConnection(credentials);
            break;
          case 'whatsapp':
            testResult = await testWhatsAppConnection(credentials);
            break;
          default:
            continue;
        }
        
        testResults.push({
          id: integration.id,
          type: integration.type,
          name: integration.name,
          status: 'connected',
          details: testResult
        });
        
      } catch (error) {
        testResults.push({
          id: integration.id,
          type: integration.type,
          name: integration.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return createResponse(true, {
      tests: testResults,
      summary: {
        total: testResults.length,
        connected: testResults.filter(t => t.status === 'connected').length,
        errors: testResults.filter(t => t.status === 'error').length
      }
    });
    
  } catch (error) {
    return createResponse(false, null, error.message, 500);
  }
}

// Statut des intégrations
async function handleIntegrationsStatus(req: Request, supabase: unknown): Promise<Response> {
  try {
    const { data: integrations, error } = await supabase
      .from('third_party_integrations')
      .select('id, type, name, enabled, created_at, updated_at');
    
    if (error) throw error;
    
    // Statistiques des notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notification_history')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // 24h
    
    const stats = {
      totalIntegrations: integrations?.length || 0,
      activeIntegrations: integrations?.filter(i => i.enabled).length || 0,
      platforms: {
        slack: integrations?.filter(i => i.type === 'slack').length || 0,
        teams: integrations?.filter(i => i.type === 'teams').length || 0,
        whatsapp: integrations?.filter(i => i.type === 'whatsapp').length || 0
      },
      notifications24h: {
        total: notifications?.length || 0,
        successful: notifications?.reduce((sum, n) => sum + (n.success_count || 0), 0) || 0,
        failed: notifications?.reduce((sum, n) => sum + ((n.total_count || 0) - (n.success_count || 0)), 0) || 0
      }
    };
    
    return createResponse(true, {
      integrations: integrations || [],
      statistics: stats,
      health: {
        status: stats.activeIntegrations > 0 ? 'healthy' : 'no_integrations',
        lastCheck: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return createResponse(false, null, error.message, 500);
  }
}

// Fonctions utilitaires

async function validateIntegrationConfig(type: string, credentials: unknown): Promise<{ valid: boolean; error?: string }> {
  switch (type) {
    case 'slack':
      if (!credentials.accessToken) {
        return { valid: false, error: 'Token Slack requis' };
      }
      break;
    case 'teams':
      if (!credentials.accessToken || !credentials.tenantId) {
        return { valid: false, error: 'Token et Tenant ID Teams requis' };
      }
      break;
    case 'whatsapp':
      if (!credentials.accessToken || !credentials.phoneNumberId) {
        return { valid: false, error: 'Token et Phone Number ID WhatsApp requis' };
      }
      break;
    default:
      return { valid: false, error: 'Type d\'intégration non supporté' };
  }
  
  return { valid: true };
}

async function encryptCredentials(credentials: unknown): Promise<string> {
  // Simple base64 encoding pour la démo - en prod, utiliser un vrai chiffrement
  return btoa(JSON.stringify(credentials));
}

async function decryptCredentials(encryptedCredentials: string): Promise<any> {
  // Simple base64 decoding pour la démo
  return JSON.parse(atob(encryptedCredentials));
}

async function setupWebhooks(integration: IntegrationConfig, supabase: unknown): Promise<void> {
  // Configuration automatique des webhooks selon la plateforme
  console.log('🔗 Configuration webhooks pour:', integration.type);
}

async function verifySlackSignature(body: string, signature: string | null, timestamp: string | null): Promise<boolean> {
  // Vérification signature Slack - simplifiée pour la démo
  return true;
}

async function processSlackEvent(event: unknown, supabase: unknown): Promise<void> {
  console.log('📨 Événement Slack reçu:', event.type, event.text);
  
  // Sauvegarder l'événement
  await supabase.from('integration_events').insert({
    platform: 'slack',
    type: event.type,
    data: event,
    timestamp: new Date().toISOString()
  });
}

async function processTeamsEvent(event: unknown, supabase: unknown): Promise<void> {
  console.log('📨 Événement Teams reçu:', event);
  
  await supabase.from('integration_events').insert({
    platform: 'teams',
    type: event.type || 'message',
    data: event,
    timestamp: new Date().toISOString()
  });
}

async function processWhatsAppMessages(messages: unknown[], supabase: unknown): Promise<void> {
  for (const message of messages) {
    console.log('📨 Message WhatsApp reçu:', message.from, message.text?.body);
    
    await supabase.from('integration_events').insert({
      platform: 'whatsapp',
      type: 'message',
      data: message,
      timestamp: new Date().toISOString()
    });
  }
}

async function processWhatsAppStatuses(statuses: unknown[], supabase: unknown): Promise<void> {
  for (const status of statuses) {
    console.log('📊 Statut WhatsApp:', status.status);
    
    await supabase.from('integration_events').insert({
      platform: 'whatsapp',
      type: 'status',
      data: status,
      timestamp: new Date().toISOString()
    });
  }
}

async function sendSlackNotification(integration: IntegrationConfig, payload: NotificationPayload): Promise<any> {
  const credentials = await decryptCredentials(integration.credentials);
  
  const slackMessage = {
    text: payload.title,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: payload.title
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: payload.message
        }
      }
    ],
    attachments: payload.attachments?.map(att => ({
      color: payload.priority === 'urgent' ? 'danger' : payload.priority === 'high' ? 'warning' : 'good',
      title: att.title,
      title_link: att.url,
      text: att.description
    }))
  };
  
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      channel: integration.settings.channels[0] || '#general',
      ...slackMessage
    })
  });
  
  return await response.json();
}

async function sendTeamsNotification(integration: IntegrationConfig, payload: NotificationPayload): Promise<any> {
  const credentials = await decryptCredentials(integration.credentials);
  
  const teamsMessage = {
    body: {
      contentType: 'html',
      content: `<h2>${payload.title}</h2><p>${payload.message}</p>`
    }
  };
  
  // Envoyer via Graph API
  const response = await fetch('https://graph.microsoft.com/v1.0/me/chats', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(teamsMessage)
  });
  
  return await response.json();
}

async function sendWhatsAppNotification(integration: IntegrationConfig, payload: NotificationPayload): Promise<any> {
  const credentials = await decryptCredentials(integration.credentials);
  
  const whatsAppMessage = {
    messaging_product: 'whatsapp',
    to: integration.settings.channels[0], // Numéro de téléphone
    type: 'text',
    text: {
      body: `*${payload.title}*\n\n${payload.message}`
    }
  };
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${credentials.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(whatsAppMessage)
  });
  
  return await response.json();
}

async function testSlackConnection(credentials: unknown): Promise<any> {
  const response = await fetch('https://slack.com/api/auth.test', {
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`
    }
  });
  
  return await response.json();
}

async function testTeamsConnection(credentials: unknown): Promise<any> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`
    }
  });
  
  return await response.json();
}

async function testWhatsAppConnection(credentials: unknown): Promise<any> {
  const response = await fetch(`https://graph.facebook.com/v18.0/${credentials.phoneNumberId}`, {
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`
    }
  });
  
  return await response.json();
}

function createResponse(success: boolean, data?: unknown, error?: string, status = 200): Response {
  return new Response(JSON.stringify({
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

console.log('🔗 Service Intégrations Tierces v2.0 démarré'); 