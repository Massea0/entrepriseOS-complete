import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Interfaces pour l'optimisation des performances IA
interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live en secondes
  maxSize: number; // Taille maximale en MB
  compressionEnabled: boolean;
  warmupEnabled: boolean;
}

interface ModelOptimization {
  id: string;
  name: string;
  type: 'predictive' | 'nlp' | 'vision' | 'recommendation';
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  accuracy: number;
  latency: number;
  enabled: boolean;
  lastOptimized: string;
}

interface PerformanceMetrics {
  timestamp: string;
  modelId: string;
  operation: string;
  duration: number;
  inputSize: number;
  outputSize: number;
  cacheHit: boolean;
  memoryUsage: number;
  cpuUsage: number;
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  averageResponseTime: number;
  cacheSize: number;
  memoryUsage: number;
  lastCleanup: string;
}

// Configuration de l'optimiseur IA
const AI_OPTIMIZER_CONFIG = {
  cache: {
    enabled: true,
    ttl: 3600, // 1 heure
    maxSize: 500, // 500MB
    compressionEnabled: true,
    warmupEnabled: true
  },
  models: {
    compressionTargets: {
      predictive: 0.3, // 30% de la taille originale
      nlp: 0.4,
      vision: 0.25,
      recommendation: 0.35
    },
    accuracyThreshold: 0.85, // Précision minimale après compression
    latencyThreshold: 2000 // Latence maximale en ms
  },
  monitoring: {
    metricsRetentionDays: 30,
    alertThresholds: {
      latency: 5000,
      errorRate: 0.05,
      memoryUsage: 0.8
    }
  }
};

// Cache en mémoire pour les résultats IA
const aiCache = new Map<string, {
  data: unknown;
  timestamp: number;
  ttl: number;
  compressed: boolean;
  size: number;
}>();

// Métriques de performance en temps réel
const performanceMetrics: PerformanceMetrics[] = [];
const cacheStats: CacheStats = {
  hitRate: 0,
  missRate: 0,
  totalRequests: 0,
  totalHits: 0,
  totalMisses: 0,
  averageResponseTime: 0,
  cacheSize: 0,
  memoryUsage: 0,
  lastCleanup: new Date().toISOString()
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/ai-performance-optimizer', '');
    
    console.log('⚡ AI Performance Optimizer - Requête:', {
      path,
      method: req.method
    });

    // Router selon le chemin
    switch (path) {
      case '/cache':
        return await handleCacheOperations(req, supabase);
        
      case '/models/optimize':
        return await handleModelOptimization(req, supabase);
        
      case '/metrics':
        return await handlePerformanceMetrics(req, supabase);
        
      case '/health':
        return await handleHealthCheck(req, supabase);
        
      case '/warmup':
        return await handleCacheWarmup(req, supabase);
        
      case '/cleanup':
        return await handleCacheCleanup(req, supabase);
        
      case '/compress':
        return await handleDataCompression(req, supabase);
        
      case '/monitor':
        return await handleRealtimeMonitoring(req, supabase);
        
      default:
        return createResponse(false, null, 'Endpoint non trouvé', 404);
    }

  } catch (error) {
    console.error('❌ Erreur AI Performance Optimizer:', error);
    return createResponse(false, null, error.message, 500);
  }
});

// Gestion des opérations de cache
async function handleCacheOperations(req: Request, supabase: unknown): Promise<Response> {
  if (req.method === 'GET') {
    // Récupérer les statistiques du cache
    updateCacheStats();
    
    return createResponse(true, {
      stats: cacheStats,
      config: AI_OPTIMIZER_CONFIG.cache,
      cacheEntries: aiCache.size,
      memoryUsage: getMemoryUsage()
    });
  }
  
  if (req.method === 'POST') {
    const { action, key, data, ttl } = await req.json();
    
    switch (action) {
      case 'get': {
  const result = await getCachedData(key);
        return createResponse(true, { 
          cached: result.hit, 
          data: result.data,
          fromCache: result.hit
        });
        
      case 'set':
        await setCachedData(key, data, ttl);
        return createResponse(true, { cached: true });
        
      case 'delete': {
  const deleted = aiCache.delete(key);
        return createResponse(true, { deleted });
        
      case 'clear':
        aiCache.clear();
        resetCacheStats();
        return createResponse(true, { cleared: true });
        
      default:
        return createResponse(false, null, 'Action non supportée', 400);
    }
  }
  
  return createResponse(false, null, 'Méthode non supportée', 405);
}

// Optimisation des modèles ML
async function handleModelOptimization(req: Request, supabase: unknown): Promise<Response> {
  if (req.method === 'POST') {
    const { modelId, optimizationType, targetCompression } = await req.json();
    
    console.log('🔧 Optimisation modèle:', modelId, optimizationType);
    
    try {
      const optimization = await optimizeModel(modelId, optimizationType, targetCompression);
      
      // Sauvegarder les résultats d'optimisation
      await supabase.from('ai_model_optimizations').insert({
        model_id: modelId,
        optimization_type: optimizationType,
        original_size: optimization.originalSize,
        optimized_size: optimization.optimizedSize,
        compression_ratio: optimization.compressionRatio,
        accuracy_before: optimization.accuracyBefore,
        accuracy_after: optimization.accuracyAfter,
        latency_before: optimization.latencyBefore,
        latency_after: optimization.latencyAfter,
        optimized_at: new Date().toISOString()
      });
      
      return createResponse(true, optimization);
      
    } catch (error) {
      console.error('❌ Erreur optimisation modèle:', error);
      return createResponse(false, null, error.message, 500);
    }
  }
  
  if (req.method === 'GET') {
    // Récupérer l'historique des optimisations
    const { data, error } = await supabase
      .from('ai_model_optimizations')
      .select('*')
      .order('optimized_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    return createResponse(true, { optimizations: data || [] });
  }
  
  return createResponse(false, null, 'Méthode non supportée', 405);
}

// Métriques de performance
async function handlePerformanceMetrics(req: Request, supabase: unknown): Promise<Response> {
  if (req.method === 'POST') {
    const metric: PerformanceMetrics = await req.json();
    
    // Ajouter aux métriques en mémoire
    performanceMetrics.push({
      ...metric,
      timestamp: new Date().toISOString()
    });
    
    // Garder seulement les 1000 dernières métriques en mémoire
    if (performanceMetrics.length > 1000) {
      performanceMetrics.splice(0, performanceMetrics.length - 1000);
    }
    
    // Sauvegarder en base de données
    await supabase.from('ai_performance_metrics').insert(metric);
    
    return createResponse(true, { recorded: true });
  }
  
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const hours = parseInt(url.searchParams.get('hours') || '24');
    const modelId = url.searchParams.get('modelId');
    
    let query = supabase
      .from('ai_performance_metrics')
      .select('*')
      .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });
    
    if (modelId) {
      query = query.eq('model_id', modelId);
    }
    
    const { data, error } = await query.limit(500);
    
    if (error) throw error;
    
    // Calculer les agrégats
    const metrics = data || [];
    const aggregates = calculateMetricsAggregates(metrics);
    
    return createResponse(true, {
      metrics,
      aggregates,
      realtime: {
        recentMetrics: performanceMetrics.slice(-10),
        cacheStats
      }
    });
  }
  
  return createResponse(false, null, 'Méthode non supportée', 405);
}

// Health check du système d'optimisation
async function handleHealthCheck(req: Request, supabase: unknown): Promise<Response> {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      cache: {
        enabled: AI_OPTIMIZER_CONFIG.cache.enabled,
        entries: aiCache.size,
        hitRate: cacheStats.hitRate,
        memoryUsage: getMemoryUsage()
      },
      performance: {
        averageLatency: cacheStats.averageResponseTime,
        recentMetrics: performanceMetrics.length,
        alerts: checkPerformanceAlerts()
      },
      database: await testDatabaseConnection(supabase)
    };
    
    return createResponse(true, health);
    
  } catch (error) {
    return createResponse(false, null, error.message, 500);
  }
}

// Réchauffement du cache
async function handleCacheWarmup(req: Request, supabase: unknown): Promise<Response> {
  if (req.method !== 'POST') {
    return createResponse(false, null, 'Méthode non supportée', 405);
  }
  
  const { strategies } = await req.json();
  
  console.log('🔥 Réchauffement du cache avec stratégies:', strategies);
  
  try {
    const results = await warmupCache(strategies, supabase);
    
    return createResponse(true, {
      warmedUp: true,
      results,
      cacheSize: aiCache.size,
      duration: results.duration
    });
    
  } catch (error) {
    console.error('❌ Erreur réchauffement cache:', error);
    return createResponse(false, null, error.message, 500);
  }
}

// Nettoyage du cache
async function handleCacheCleanup(req: Request, supabase: unknown): Promise<Response> {
  if (req.method !== 'POST') {
    return createResponse(false, null, 'Méthode non supportée', 405);
  }
  
  const { strategy } = await req.json();
  
  console.log('🧹 Nettoyage du cache avec stratégie:', strategy);
  
  try {
    const results = await cleanupCache(strategy);
    
    await supabase.from('ai_cache_cleanups').insert({
      strategy,
      entries_before: results.entriesBefore,
      entries_after: results.entriesAfter,
      memory_freed: results.memoryFreed,
      cleaned_at: new Date().toISOString()
    });
    
    return createResponse(true, results);
    
  } catch (error) {
    console.error('❌ Erreur nettoyage cache:', error);
    return createResponse(false, null, error.message, 500);
  }
}

// Compression des données
async function handleDataCompression(req: Request, supabase: unknown): Promise<Response> {
  if (req.method !== 'POST') {
    return createResponse(false, null, 'Méthode non supportée', 405);
  }
  
  const { data, algorithm } = await req.json();
  
  try {
    const compressed = await compressData(data, algorithm);
    
    return createResponse(true, {
      compressed: true,
      originalSize: JSON.stringify(data).length,
      compressedSize: compressed.size,
      compressionRatio: compressed.ratio,
      algorithm: compressed.algorithm
    });
    
  } catch (error) {
    console.error('❌ Erreur compression:', error);
    return createResponse(false, null, error.message, 500);
  }
}

// Monitoring temps réel
async function handleRealtimeMonitoring(req: Request, supabase: unknown): Promise<Response> {
  try {
    const monitoring = {
      timestamp: new Date().toISOString(),
      system: {
        memoryUsage: getMemoryUsage(),
        cacheSize: aiCache.size,
        activeConnections: 1 // Simulation
      },
      performance: {
        averageLatency: cacheStats.averageResponseTime,
        hitRate: cacheStats.hitRate,
        recentErrors: getRecentErrors()
      },
      models: await getActiveModelsStatus(supabase),
      alerts: checkPerformanceAlerts()
    };
    
    return createResponse(true, monitoring);
    
  } catch (error) {
    return createResponse(false, null, error.message, 500);
  }
}

// Fonctions utilitaires

async function getCachedData(key: string): Promise<{ hit: boolean; data: unknown }> {
  const startTime = Date.now();
  
  const cached = aiCache.get(key);
  const duration = Date.now() - startTime;
  
  // Mettre à jour les statistiques
  cacheStats.totalRequests++;
  
  if (cached && (Date.now() - cached.timestamp) < cached.ttl * 1000) {
    cacheStats.totalHits++;
    cacheStats.hitRate = (cacheStats.totalHits / cacheStats.totalRequests) * 100;
    
    // Enregistrer la métrique
    recordPerformanceMetric('cache_hit', duration, key.length, JSON.stringify(cached.data).length, true);
    
    return { hit: true, data: cached.data };
  } else {
    // Cache miss ou expiré
    if (cached) {
      aiCache.delete(key);
    }
    
    cacheStats.totalMisses++;
    cacheStats.missRate = (cacheStats.totalMisses / cacheStats.totalRequests) * 100;
    
    // Enregistrer la métrique
    recordPerformanceMetric('cache_miss', duration, key.length, 0, false);
    
    return { hit: false, data: null };
  }
}

async function setCachedData(key: string, data: unknown, ttl: number = AI_OPTIMIZER_CONFIG.cache.ttl): Promise<void> {
  const serialized = JSON.stringify(data);
  const compressed = AI_OPTIMIZER_CONFIG.cache.compressionEnabled ? 
    await compressString(serialized) : serialized;
  
  aiCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
    compressed: AI_OPTIMIZER_CONFIG.cache.compressionEnabled,
    size: compressed.length
  });
  
  // Vérifier la taille du cache
  if (getCacheSize() > AI_OPTIMIZER_CONFIG.cache.maxSize * 1024 * 1024) {
    await cleanupCache('lru');
  }
}

async function optimizeModel(modelId: string, type: string, targetCompression: number): Promise<any> {
  // Simulation d'optimisation de modèle
  const originalSize = Math.random() * 100 + 50; // 50-150 MB
  const optimizedSize = originalSize * (targetCompression || AI_OPTIMIZER_CONFIG.models.compressionTargets[type] || 0.3);
  const compressionRatio = optimizedSize / originalSize;
  
  // Simulation de métriques de performance
  const accuracyBefore = 0.92 + Math.random() * 0.05;
  const accuracyAfter = accuracyBefore - (Math.random() * 0.02); // Légère baisse
  const latencyBefore = 1000 + Math.random() * 500;
  const latencyAfter = latencyBefore * (0.7 + Math.random() * 0.2); // Amélioration
  
  return {
    modelId,
    type,
    originalSize,
    optimizedSize,
    compressionRatio,
    accuracyBefore,
    accuracyAfter,
    latencyBefore,
    latencyAfter,
    optimizedAt: new Date().toISOString()
  };
}

function calculateMetricsAggregates(metrics: PerformanceMetrics[]): unknown {
  if (metrics.length === 0) return {};
  
  const durations = metrics.map(m => m.duration);
  const cacheHits = metrics.filter(m => m.cacheHit).length;
  
  return {
    totalRequests: metrics.length,
    averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    cacheHitRate: (cacheHits / metrics.length) * 100,
    averageInputSize: metrics.reduce((sum, m) => sum + m.inputSize, 0) / metrics.length,
    averageOutputSize: metrics.reduce((sum, m) => sum + m.outputSize, 0) / metrics.length
  };
}

async function warmupCache(strategies: string[], supabase: unknown): Promise<any> {
  const startTime = Date.now();
  let warmedItems = 0;
  
  for (const strategy of strategies) {
    switch (strategy) {
      case 'frequent-queries':
        // Réchauffer avec les requêtes fréquentes
        const frequentQueries = await getFrequentQueries(supabase);
        for (const query of frequentQueries) {
          await setCachedData(`frequent_${query.id}`, query.result);
          warmedItems++;
        }
        break;
        
      case 'popular-models':
        // Réchauffer les modèles populaires
        const popularModels = await getPopularModels(supabase);
        for (const model of popularModels) {
          await setCachedData(`model_${model.id}`, model.data);
          warmedItems++;
        }
        break;
        
      case 'recent-results':
        // Réchauffer avec les résultats récents
        const recentResults = await getRecentResults(supabase);
        for (const result of recentResults) {
          await setCachedData(`recent_${result.id}`, result.data);
          warmedItems++;
        }
        break;
  }

  }
  
  const duration = Date.now() - startTime;
  
  return {
    strategies,
    warmedItems,
    duration,
    timestamp: new Date().toISOString()
  };
}

async function cleanupCache(strategy: string): Promise<any> {
  const entriesBefore = aiCache.size;
  const memoryBefore = getCacheSize();
  
  switch (strategy) {
    case 'lru':
      // Supprimer les éléments les moins récemment utilisés
      const entries = Array.from(aiCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Supprimer les 20% les plus anciens
      const toDelete = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toDelete; i++) {
        aiCache.delete(entries[i][0]);
      }
      break;
      
    case 'expired':
      // Supprimer les éléments expirés
      const now = Date.now();
      for (const [key, value] of aiCache) {
        if ((now - value.timestamp) > value.ttl * 1000) {
          aiCache.delete(key);
        }
      }
      break;
      
    case 'size-based':
      // Supprimer les plus gros éléments
      const sizeEntries = Array.from(aiCache.entries());
      sizeEntries.sort((a, b) => b[1].size - a[1].size);
      
      const targetSize = AI_OPTIMIZER_CONFIG.cache.maxSize * 1024 * 1024 * 0.8;
      let currentSize = getCacheSize();
      
      for (const [key] of sizeEntries) {
        if (currentSize <= targetSize) break;
        const entry = aiCache.get(key);
        if (entry) {
          currentSize -= entry.size;
          aiCache.delete(key);
        }
      }
      break;
  }

  
  const entriesAfter = aiCache.size;
  const memoryAfter = getCacheSize();
  
  cacheStats.lastCleanup = new Date().toISOString();
  
  return {
    strategy,
    entriesBefore,
    entriesAfter,
    entriesRemoved: entriesBefore - entriesAfter,
    memoryBefore,
    memoryAfter,
    memoryFreed: memoryBefore - memoryAfter
  };
}

async function compressData(data: unknown, algorithm: string = 'gzip'): Promise<any> {
  const serialized = JSON.stringify(data);
  const compressed = await compressString(serialized);
  
  return {
    algorithm,
    size: compressed.length,
    ratio: compressed.length / serialized.length,
    data: compressed
  };
}

async function compressString(str: string): Promise<string> {
  // Simulation de compression (en production, utiliser un vrai algorithme)
  return btoa(str).substring(0, Math.floor(str.length * 0.7));
}

function recordPerformanceMetric(operation: string, duration: number, inputSize: number, outputSize: number, cacheHit: boolean): void {
  const metric: PerformanceMetrics = {
    timestamp: new Date().toISOString(),
    modelId: 'cache',
    operation,
    duration,
    inputSize,
    outputSize,
    cacheHit,
    memoryUsage: getMemoryUsage(),
    cpuUsage: Math.random() * 100 // Simulation
  };
  
  performanceMetrics.push(metric);
}

function updateCacheStats(): void {
  cacheStats.cacheSize = getCacheSize();
  cacheStats.memoryUsage = getMemoryUsage();
  
  if (cacheStats.totalRequests > 0) {
    cacheStats.averageResponseTime = performanceMetrics
      .slice(-100)
      .reduce((sum, m) => sum + m.duration, 0) / Math.min(100, performanceMetrics.length);
  }
}

function resetCacheStats(): void {
  cacheStats.hitRate = 0;
  cacheStats.missRate = 0;
  cacheStats.totalRequests = 0;
  cacheStats.totalHits = 0;
  cacheStats.totalMisses = 0;
  cacheStats.averageResponseTime = 0;
  cacheStats.lastCleanup = new Date().toISOString();
}

function getCacheSize(): number {
  let size = 0;
  for (const entry of aiCache.values()) {
    size += entry.size;
  }
  return size;
}

function getMemoryUsage(): number {
  // Simulation d'utilisation mémoire
  return Math.random() * 100;
}

function checkPerformanceAlerts(): unknown[] {
  const alerts = [];
  
  if (cacheStats.averageResponseTime > AI_OPTIMIZER_CONFIG.monitoring.alertThresholds.latency) {
    alerts.push({
      type: 'latency',
      severity: 'warning',
      message: `Latence élevée: ${cacheStats.averageResponseTime}ms`,
      threshold: AI_OPTIMIZER_CONFIG.monitoring.alertThresholds.latency
    });
  }
  
  if (getMemoryUsage() > AI_OPTIMIZER_CONFIG.monitoring.alertThresholds.memoryUsage * 100) {
    alerts.push({
      type: 'memory',
      severity: 'critical',
      message: `Utilisation mémoire élevée: ${getMemoryUsage()}%`,
      threshold: AI_OPTIMIZER_CONFIG.monitoring.alertThresholds.memoryUsage * 100
    });
  }
  
  return alerts;
}

function getRecentErrors(): unknown[] {
  // Simulation d'erreurs récentes
  return [];
}

async function getActiveModelsStatus(supabase: unknown): Promise<any[]> {
  // Simulation de statut des modèles actifs
  return [
    { id: 'predictive-1', name: 'Revenue Forecasting', status: 'active', latency: 1200 },
    { id: 'nlp-1', name: 'Sentiment Analysis', status: 'active', latency: 800 },
    { id: 'workflow-1', name: 'Task Assignment', status: 'active', latency: 600 }
  ];
}

async function testDatabaseConnection(supabase: unknown): Promise<any> {
  try {
    const { data, error } = await supabase.from('ai_performance_metrics').select('*').limit(1);
    return { connected: !error, error: error?.message };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

async function getFrequentQueries(supabase: unknown): Promise<any[]> {
  // Simulation de requêtes fréquentes
  return [
    { id: 'query_1', result: { prediction: 95.2, confidence: 0.89 } },
    { id: 'query_2', result: { classification: 'positive', confidence: 0.92 } }
  ];
}

async function getPopularModels(supabase: unknown): Promise<any[]> {
  // Simulation de modèles populaires
  return [
    { id: 'model_1', data: { weights: 'compressed_weights_1' } },
    { id: 'model_2', data: { weights: 'compressed_weights_2' } }
  ];
}

async function getRecentResults(supabase: unknown): Promise<any[]> {
  // Simulation de résultats récents
  return [
    { id: 'result_1', data: { output: 'processed_result_1' } },
    { id: 'result_2', data: { output: 'processed_result_2' } }
  ];
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

console.log('⚡ AI Performance Optimizer v2.0 démarré'); 