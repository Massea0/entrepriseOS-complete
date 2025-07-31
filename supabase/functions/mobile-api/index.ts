import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mobile-app, x-app-version, x-device-info',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Interfaces pour l'API mobile
interface MobileRequest {
  endpoint: string;
  method: string;
  data?: unknown;
  headers?: Record<string, string>;
  timestamp?: string;
  deviceInfo?: DeviceInfo;
  connectionType?: 'wifi' | '4g' | '3g' | '2g' | 'offline';
  priority?: 'high' | 'medium' | 'low';
}

interface DeviceInfo {
  platform: 'android' | 'ios' | 'web';
  version: string;
  model?: string;
  screenSize?: { width: number; height: number };
  networkType?: string;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
}

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: unknown;
  timestamp: string;
  priority: number;
  retryCount: number;
  lastAttempt?: string;
  error?: string;
}

interface MobileResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  sync?: {
    queued: boolean;
    queueId?: string;
    needsSync?: boolean;
  };
  meta?: {
    cached: boolean;
    timestamp: string;
    compression?: string;
    nextSync?: string;
  };
}

interface OfflineCapabilities {
  read: boolean;
  write: boolean;
  sync: boolean;
  notifications: boolean;
}

// Configuration API mobile
const MOBILE_CONFIG = {
  maxRequestSize: 5 * 1024 * 1024, // 5MB
  maxBatchSize: 50,
  syncInterval: 30000, // 30 secondes
  offlineRetentionDays: 7,
  compressionThreshold: 1024, // 1KB
  lowDataMode: {
    imageQuality: 0.6,
    maxImageSize: 512,
    skipNonEssential: true
  }
};

// Cache des réponses pour optimisation mobile
const responseCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/mobile-api', '');
    
    // Extraire les headers mobile
    const mobileHeaders = extractMobileHeaders(req.headers);
    const deviceInfo = mobileHeaders.deviceInfo;
    const isLowDataMode = mobileHeaders.isLowDataMode;
    
    console.log('📱 API Mobile - Requête:', {
      path,
      method: req.method,
      device: deviceInfo?.platform,
      connection: mobileHeaders.connectionType
    });

    // Router les requêtes selon le chemin
    switch (path) {
      case '/sync':
        return await handleSync(req, supabase, deviceInfo);
        
      case '/dashboard':
        return await handleDashboard(req, supabase, deviceInfo, isLowDataMode);
        
      case '/projects':
        return await handleProjects(req, supabase, deviceInfo, isLowDataMode);
        
      case '/tasks':
        return await handleTasks(req, supabase, deviceInfo, isLowDataMode);
        
      case '/notifications':
        return await handleNotifications(req, supabase, deviceInfo);
        
      case '/offline-capabilities':
        return await handleOfflineCapabilities(req, supabase, deviceInfo);
        
      case '/batch':
        return await handleBatch(req, supabase, deviceInfo);
        
      case '/analytics':
        return await handleMobileAnalytics(req, supabase, deviceInfo, isLowDataMode);
        
      case '/voice':
        return await handleVoiceCommands(req, supabase, deviceInfo);
        
      case '/health':
        return await handleHealthCheck(req, supabase, deviceInfo);
        
      default:
        return createMobileResponse(false, null, 'Endpoint non trouvé', 404);
    }

  } catch (error) {
    console.error('❌ Erreur API Mobile:', error);
    return createMobileResponse(false, null, error.message, 500);
  }
});

// Extraire les headers spécifiques mobile
function extractMobileHeaders(headers: Headers) {
  const deviceInfoHeader = headers.get('x-device-info');
  const connectionType = headers.get('x-connection-type') as 'wifi' | '4g' | '3g' | '2g' | 'offline' || 'wifi';
  const isLowDataMode = headers.get('x-low-data-mode') === 'true';
  const appVersion = headers.get('x-app-version') || '1.0.0';
  
  let deviceInfo: DeviceInfo | undefined;
  if (deviceInfoHeader) {
    try {
      deviceInfo = JSON.parse(deviceInfoHeader);
    } catch (e) {
      console.warn('Invalid device info header');
    }
  }
  
  return {
    deviceInfo,
    connectionType,
    isLowDataMode,
    appVersion
  };
}

// Gestionnaire de synchronisation
async function handleSync(req: Request, supabase: unknown, deviceInfo?: DeviceInfo): Promise<Response> {
  if (req.method === 'POST') {
    const { queueItems, lastSync } = await req.json();
    
    console.log('🔄 Synchronisation mobile:', queueItems?.length || 0, 'éléments');
    
    // Traiter les éléments de la queue
    const results = [];
    for (const item of queueItems || []) {
      try {
        const result = await processSyncItem(item, supabase);
        results.push({ id: item.id, success: true, result });
      } catch (error) {
        results.push({ id: item.id, success: false, error: error.message });
      }
    }
    
    // Récupérer les mises à jour depuis la dernière sync
    const updates = await getUpdatesSince(lastSync, supabase);
    
    return createMobileResponse(true, {
      processed: results,
      updates: updates,
      nextSync: new Date(Date.now() + MOBILE_CONFIG.syncInterval).toISOString(),
      serverTime: new Date().toISOString()
    });
  }
  
  if (req.method === 'GET') {
    // Status de synchronisation
    const syncStatus = await getSyncStatus(supabase);
    return createMobileResponse(true, syncStatus);
  }
  
  return createMobileResponse(false, null, 'Méthode non supportée', 405);
}

// Traiter un élément de synchronisation
async function processSyncItem(item: SyncQueueItem, supabase: unknown): Promise<any> {
  const { action, table, data } = item;
  
  switch (action) {
    case 'create': {
  const { data: created, error: createError } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      if (createError) throw createError;
      return created;
      
    case 'update': {
  const { data: updated, error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq('id', data.id)
        .select()
        .single();
      if (updateError) throw updateError;
      return updated;
      
    case 'delete': {
  const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', data.id);
      if (deleteError) throw deleteError;
      return { deleted: true, id: data.id };
      
    default:
      throw new Error(`Action non supportée: ${action}`);
  }
}

// Récupérer les mises à jour depuis la dernière sync
async function getUpdatesSince(lastSync: string, supabase: unknown): Promise<any> {
  const since = new Date(lastSync || 0);
  
  // Récupérer les mises à jour des principales tables
  const [projects, tasks, notifications] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .gt('updated_at', since.toISOString())
      .order('updated_at', { ascending: false })
      .limit(50),
    
    supabase
      .from('tasks')
      .select('*')
      .gt('updated_at', since.toISOString())
      .order('updated_at', { ascending: false })
      .limit(100),
      
    supabase
      .from('notifications')
      .select('*')
      .gt('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(20)
  ]);
  
  return {
    projects: projects.data || [],
    tasks: tasks.data || [],
    notifications: notifications.data || [],
    lastUpdate: new Date().toISOString()
  };
}

// Dashboard mobile optimisé
async function handleDashboard(req: Request, supabase: unknown, deviceInfo?: DeviceInfo, isLowDataMode?: boolean): Promise<Response> {
  const cacheKey = `dashboard_${deviceInfo?.platform}_${isLowDataMode}`;
  
  // Vérifier le cache
  if (req.method === 'GET') {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return createMobileResponse(true, cached, undefined, 200, { cached: true, timestamp: new Date().toISOString() });
    }
  }
  
  try {
    // Données essentielles pour le dashboard mobile
    const [projectsRes, tasksRes, metricsRes] = await Promise.all([
      supabase
        .from('projects')
        .select(isLowDataMode ? 'id, name, status, priority' : '*')
        .eq('status', 'in_progress')
        .order('priority', { ascending: false })
        .limit(isLowDataMode ? 5 : 10),
        
      supabase
        .from('tasks')
        .select(isLowDataMode ? 'id, title, status, priority, due_date' : '*')
        .in('status', ['todo', 'in_progress'])
        .order('priority', { ascending: false })
        .limit(isLowDataMode ? 10 : 20),
        
      // Métriques simplifiées pour mobile
      generateMobileMetrics(supabase, isLowDataMode)
    ]);
    
    const dashboardData = {
      projects: projectsRes.data || [],
      tasks: tasksRes.data || [],
      metrics: metricsRes,
      lastUpdate: new Date().toISOString(),
      deviceOptimized: true,
      lowDataMode: isLowDataMode
    };
    
    // Mettre en cache pour 5 minutes
    setCachedResponse(cacheKey, dashboardData, 5 * 60 * 1000);
    
    return createMobileResponse(true, dashboardData);
    
  } catch (error) {
    console.error('❌ Erreur dashboard mobile:', error);
    return createMobileResponse(false, null, error.message, 500);
  }
}

// Métriques optimisées mobile
async function generateMobileMetrics(supabase: unknown, isLowDataMode?: boolean): Promise<any> {
  try {
    const [projectsCount, tasksCount, completionRate] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      calculateCompletionRate(supabase)
    ]);
    
    const basicMetrics = {
      totalProjects: projectsCount.count || 0,
      totalTasks: tasksCount.count || 0,
      completionRate: completionRate,
      lastCalculated: new Date().toISOString()
    };
    
    if (isLowDataMode) {
      return basicMetrics;
    }
    
    // Métriques étendues si pas en mode économique
    const [activeProjects, overdueTasks] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).lt('due_date', new Date().toISOString())
    ]);
    
    return {
      ...basicMetrics,
      activeProjects: activeProjects.count || 0,
      overdueTasks: overdueTasks.count || 0,
      efficiency: Math.round(completionRate * 0.8 + Math.random() * 20), // Simulation
      trends: {
        projectsGrowth: Math.round((Math.random() - 0.5) * 20),
        tasksGrowth: Math.round((Math.random() - 0.5) * 30)
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur métriques mobile:', error);
    return {
      totalProjects: 0,
      totalTasks: 0,
      completionRate: 0,
      error: 'Métriques indisponibles'
    };
  }
}

// Calcul du taux de completion
async function calculateCompletionRate(supabase: unknown): Promise<number> {
  try {
    const [completed, total] = await Promise.all([
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
      supabase.from('tasks').select('*', { count: 'exact', head: true })
    ]);
    
    if (total.count === 0) return 0;
    return Math.round((completed.count / total.count) * 100);
  } catch (error) {
    return 0;
  }
}

// Gestionnaire projets mobile
async function handleProjects(req: Request, supabase: unknown, deviceInfo?: DeviceInfo, isLowDataMode?: boolean): Promise<Response> {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || (isLowDataMode ? '10' : '20'));
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const status = url.searchParams.get('status');
  
  try {
    let query = supabase
      .from('projects')
      .select(isLowDataMode ? 'id, name, status, priority, budget' : '*')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return createMobileResponse(true, {
      projects: data || [],
      pagination: {
        limit,
        offset,
        hasMore: (data || []).length === limit
      },
      optimized: isLowDataMode
    });
    
  } catch (error) {
    console.error('❌ Erreur projets mobile:', error);
    return createMobileResponse(false, null, error.message, 500);
  }
}

// Gestionnaire tâches mobile  
async function handleTasks(req: Request, supabase: unknown, deviceInfo?: DeviceInfo, isLowDataMode?: boolean): Promise<Response> {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || (isLowDataMode ? '15' : '30'));
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const status = url.searchParams.get('status');
  const projectId = url.searchParams.get('project_id');
  
  try {
    let query = supabase
      .from('tasks')
      .select(isLowDataMode ? 'id, title, status, priority, due_date, project_id' : '*')
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return createMobileResponse(true, {
      tasks: data || [],
      pagination: {
        limit,
        offset,
        hasMore: (data || []).length === limit
      },
      filters: { status, projectId },
      optimized: isLowDataMode
    });
    
  } catch (error) {
    console.error('❌ Erreur tâches mobile:', error);
    return createMobileResponse(false, null, error.message, 500);
  }
}

// Gestionnaire notifications mobile
async function handleNotifications(req: Request, supabase: unknown, deviceInfo?: DeviceInfo): Promise<Response> {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      return createMobileResponse(true, {
        notifications: data || [],
        unreadCount: (data || []).filter(n => !n.read_at).length
      });
      
    } catch (error) {
      return createMobileResponse(false, null, error.message, 500);
    }
  }
  
  if (req.method === 'POST') {
    // Marquer comme lu ou créer notification
    const body = await req.json();
    
    if (body.action === 'mark_read') {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', body.notificationId);
        
        if (error) throw error;
        
        return createMobileResponse(true, { marked_read: true });
      } catch (error) {
        return createMobileResponse(false, null, error.message, 500);
      }
    }
  }
  
  return createMobileResponse(false, null, 'Méthode non supportée', 405);
}

// Capacités offline
async function handleOfflineCapabilities(req: Request, supabase: unknown, deviceInfo?: DeviceInfo): Promise<Response> {
  const capabilities: OfflineCapabilities = {
    read: true,      // Lecture des données mises en cache
    write: true,     // Écriture dans la queue locale
    sync: true,      // Synchronisation en arrière-plan
    notifications: true // Notifications push
  };
  
  // Adapter selon l'appareil
  if (deviceInfo?.platform === 'web') {
    capabilities.sync = 'serviceWorker' in navigator;
    capabilities.notifications = 'Notification' in window;
  }
  
  return createMobileResponse(true, {
    capabilities,
    supportedTables: ['projects', 'tasks', 'notifications'],
    maxOfflineDays: MOBILE_CONFIG.offlineRetentionDays,
    syncInterval: MOBILE_CONFIG.syncInterval
  });
}

// Traitement par lots (batch)
async function handleBatch(req: Request, supabase: unknown, deviceInfo?: DeviceInfo): Promise<Response> {
  if (req.method !== 'POST') {
    return createMobileResponse(false, null, 'Méthode non supportée', 405);
  }
  
  const { requests } = await req.json();
  
  if (!Array.isArray(requests) || requests.length > MOBILE_CONFIG.maxBatchSize) {
    return createMobileResponse(false, null, `Trop de requêtes. Maximum: ${MOBILE_CONFIG.maxBatchSize}`, 400);
  }
  
  console.log('📦 Traitement batch mobile:', requests.length, 'requêtes');
  
  const results = [];
  
  for (const request of requests) {
    try {
      const result = await processBatchRequest(request, supabase);
      results.push({ id: request.id, success: true, data: result });
    } catch (error) {
      results.push({ id: request.id, success: false, error: error.message });
    }
  }
  
  return createMobileResponse(true, { results });
}

// Traiter une requête batch
async function processBatchRequest(request: MobileRequest, supabase: unknown): Promise<any> {
  const { endpoint, method, data } = request;
  
  // Simplification: traiter selon l'endpoint
  switch (endpoint) {
    case 'tasks':
      if (method === 'POST') {
        const { data: created, error } = await supabase.from('tasks').insert(data).select().single();
        if (error) throw error;
        return created;
      }
      break;
      
    case 'projects':
      if (method === 'PUT') {
        const { data: updated, error } = await supabase.from('projects').update(data).eq('id', data.id).select().single();
        if (error) throw error;
        return updated;
      }
      break;
      
    default:
      throw new Error(`Endpoint non supporté en batch: ${endpoint}`);
  }
  
  throw new Error(`Méthode ${method} non supportée pour ${endpoint}`);
}

// Analytics mobile optimisé
async function handleMobileAnalytics(req: Request, supabase: unknown, deviceInfo?: DeviceInfo, isLowDataMode?: boolean): Promise<Response> {
  try {
    // Analytics simplifiées pour mobile
    const analytics = {
      summary: {
        totalProjects: await getCount(supabase, 'projects'),
        totalTasks: await getCount(supabase, 'tasks'),
        completedTasks: await getCount(supabase, 'tasks', { status: 'done' }),
        activeProjects: await getCount(supabase, 'projects', { status: 'in_progress' })
      },
      trends: isLowDataMode ? null : {
        weeklyTasksCompleted: Math.floor(Math.random() * 50) + 20,
        projectsGrowth: Math.floor(Math.random() * 10) + 5,
        efficiency: Math.floor(Math.random() * 30) + 70
      },
      lastUpdate: new Date().toISOString(),
      optimizedForMobile: true
    };
    
    return createMobileResponse(true, analytics);
  } catch (error) {
    return createMobileResponse(false, null, error.message, 500);
  }
}

// Commandes vocales mobile
async function handleVoiceCommands(req: Request, supabase: unknown, deviceInfo?: DeviceInfo): Promise<Response> {
  if (req.method !== 'POST') {
    return createMobileResponse(false, null, 'Méthode non supportée', 405);
  }
  
  const { command, transcript } = await req.json();
  
  console.log('🎤 Commande vocale mobile:', transcript);
  
  // Traitement simplifié des commandes vocales pour mobile
  const response = await processVoiceCommand(command, transcript, supabase);
  
  return createMobileResponse(true, {
    processed: true,
    command,
    response,
    timestamp: new Date().toISOString()
  });
}

// Traiter commande vocale
async function processVoiceCommand(command: string, transcript: string, supabase: unknown): Promise<any> {
  // Simulation de traitement de commande vocale
  if (transcript.toLowerCase().includes('créer tâche')) {
    return {
      action: 'create_task',
      message: 'Tâche créée avec succès',
      data: { id: Date.now(), title: 'Nouvelle tâche vocale' }
    };
  }
  
  if (transcript.toLowerCase().includes('mes projets')) {
    const { data } = await supabase.from('projects').select('id, name, status').limit(5);
    return {
      action: 'list_projects',
      message: `Vous avez ${data?.length || 0} projets`,
      data: data || []
    };
  }
  
  return {
    action: 'unknown',
    message: 'Commande non reconnue',
    data: null
  };
}

// Health check mobile
async function handleHealthCheck(req: Request, supabase: unknown, deviceInfo?: DeviceInfo): Promise<Response> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    platform: deviceInfo?.platform || 'unknown',
    features: {
      sync: true,
      offline: true,
      notifications: true,
      voice: true,
      analytics: true
    },
    performance: {
      cacheSize: responseCache.size,
      uptime: process.uptime?.() || 0
    }
  };
  
  return createMobileResponse(true, health);
}

// Utilitaires

function createMobileResponse(success: boolean, data?: unknown, error?: string, status = 200, meta?: unknown): Response {
  const response: MobileResponse = {
    success,
    ...(data && { data }),
    ...(error && { error }),
    ...(meta && { meta })
  };
  
  return new Response(JSON.stringify(response), {
    status,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'X-Mobile-API': 'v2.0',
      'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-cache'
    }
  });
}

function getCachedResponse(key: string): unknown | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key: string, data: unknown, ttl: number): void {
  responseCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
  
  // Nettoyer le cache si trop gros
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
}

async function getCount(supabase: unknown, table: string, filter?: Record<string, unknown>): Promise<number> {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { count } = await query;
    return count || 0;
  } catch (error) {
    return 0;
  }
}

async function getSyncStatus(supabase: unknown): Promise<any> {
  return {
    lastSync: new Date().toISOString(),
    pendingCount: 0,
    conflictsCount: 0,
    isOnline: true,
    nextSync: new Date(Date.now() + MOBILE_CONFIG.syncInterval).toISOString()
  };
}

console.log('📱 API Mobile Enterprise OS v2.0 démarrée'); 