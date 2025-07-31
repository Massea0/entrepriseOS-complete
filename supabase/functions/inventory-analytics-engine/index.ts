import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  type: 'forecast' | 'optimization' | 'trends' | 'seasonality';
  parameters: {
    productId?: string;
    warehouseId?: string;
    categoryId?: string;
    periodDays?: number;
    forecastDays?: number;
    confidenceLevel?: number;
  };
}

interface ForecastResponse {
  productId: string;
  productName: string;
  forecasts: {
    date: string;
    predictedDemand: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }[];
  recommendations: {
    reorderDate: string;
    reorderQuantity: number;
    safetyStock: number;
    stockoutRisk: 'low' | 'medium' | 'high';
  };
  seasonalFactors?: number[];
}

interface OptimizationResponse {
  recommendations: {
    productId: string;
    productName: string;
    currentStock: number;
    optimalStock: number;
    excessStock: number;
    action: 'reduce' | 'maintain' | 'increase';
    potentialSavings: number;
  }[];
  summary: {
    totalExcessValue: number;
    totalShortageValue: number;
    optimizationPotential: number;
  };
}

interface TrendAnalysis {
  productId: string;
  productName: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendStrength: number;
  averageMonthlyChange: number;
  projectedChange: number;
  insights: string[];
}

serve(async (req) => {
  // Handle CORS
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

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get user's organization
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    const request: AnalyticsRequest = await req.json()
    let response: any = {}

    switch (request.type) {
      case 'forecast':
        response = await generateDemandForecast(
          supabaseClient,
          request.parameters,
          profile.organization_id
        )
        break

      case 'optimization':
        response = await optimizeInventoryLevels(
          supabaseClient,
          request.parameters,
          profile.organization_id
        )
        break

      case 'trends':
        response = await analyzeTrends(
          supabaseClient,
          request.parameters,
          profile.organization_id
        )
        break

      case 'seasonality':
        response = await analyzeSeasonality(
          supabaseClient,
          request.parameters,
          profile.organization_id
        )
        break

      default:
        throw new Error(`Unknown analytics type: ${request.type}`)
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function generateDemandForecast(
  supabaseClient: any,
  parameters: any,
  organizationId: string
): Promise<ForecastResponse[]> {
  const { productId, warehouseId, periodDays = 90, forecastDays = 30 } = parameters

  // Get historical movements
  let query = supabaseClient
    .from('stock_movements')
    .select(`
      product_id,
      quantity,
      created_at,
      products (
        id,
        name,
        reorder_point,
        reorder_quantity,
        min_stock_level
      )
    `)
    .eq('type', 'out')
    .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  if (productId) {
    query = query.eq('product_id', productId)
  }
  if (warehouseId) {
    query = query.eq('from_warehouse_id', warehouseId)
  }

  const { data: movements, error } = await query

  if (error) throw error

  // Group movements by product
  const productMovements = movements?.reduce((acc: any, movement: any) => {
    const pid = movement.product_id
    if (!acc[pid]) {
      acc[pid] = {
        product: movement.products,
        movements: []
      }
    }
    acc[pid].movements.push(movement)
    return acc
  }, {}) || {}

  const forecasts: ForecastResponse[] = []

  for (const [productId, data] of Object.entries(productMovements)) {
    const { product, movements } = data as any
    
    // Simple moving average forecast (in production, use more sophisticated methods)
    const dailyDemand = calculateDailyDemand(movements, periodDays)
    const avgDemand = dailyDemand.reduce((sum, d) => sum + d, 0) / dailyDemand.length
    const stdDev = calculateStandardDeviation(dailyDemand, avgDemand)
    
    // Generate forecast
    const forecastData = []
    for (let i = 1; i <= forecastDays; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
      const seasonalFactor = getSeasonalFactor(date)
      const predictedDemand = avgDemand * seasonalFactor
      
      forecastData.push({
        date: date.toISOString().split('T')[0],
        predictedDemand: Math.round(predictedDemand),
        lowerBound: Math.round(predictedDemand - 2 * stdDev),
        upperBound: Math.round(predictedDemand + 2 * stdDev),
        confidence: 0.95
      })
    }

    // Calculate recommendations
    const totalForecastDemand = forecastData.reduce((sum, f) => sum + f.predictedDemand, 0)
    const currentStock = await getCurrentStock(supabaseClient, productId, warehouseId)
    const daysUntilStockout = currentStock / avgDemand
    
    const recommendations = {
      reorderDate: new Date(Date.now() + (daysUntilStockout - 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reorderQuantity: product.reorder_quantity || Math.round(avgDemand * 30),
      safetyStock: Math.round(2 * stdDev * Math.sqrt(7)), // 7-day lead time assumed
      stockoutRisk: daysUntilStockout < 7 ? 'high' : daysUntilStockout < 14 ? 'medium' : 'low' as any
    }

    forecasts.push({
      productId,
      productName: product.name,
      forecasts: forecastData,
      recommendations,
      seasonalFactors: [1.0, 0.9, 0.8, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.9] // Monthly factors
    })
  }

  return forecasts
}

async function optimizeInventoryLevels(
  supabaseClient: any,
  parameters: any,
  organizationId: string
): Promise<OptimizationResponse> {
  const { warehouseId, categoryId } = parameters

  // Get current stock levels with product details
  let query = supabaseClient
    .from('v_product_stock_summary')
    .select('*')
    .eq('organization_id', organizationId)

  if (categoryId) {
    query = query.eq('category', categoryId)
  }

  const { data: products, error } = await query

  if (error) throw error

  const recommendations = []
  let totalExcessValue = 0
  let totalShortageValue = 0

  for (const product of products || []) {
    // Calculate optimal stock level (simplified - use more sophisticated methods in production)
    const turnoverRate = await calculateTurnoverRate(supabaseClient, product.product_id)
    const leadTime = 7 // days
    const serviceLevelFactor = 1.65 // 95% service level
    
    const avgDailyDemand = product.total_stock / Math.max(turnoverRate * 365, 1)
    const safetyStock = serviceLevelFactor * Math.sqrt(leadTime) * avgDailyDemand * 0.3 // 30% demand variability
    const optimalStock = Math.round((avgDailyDemand * leadTime) + safetyStock)
    
    const excessStock = Math.max(0, product.total_stock - optimalStock)
    const shortageStock = Math.max(0, optimalStock - product.total_stock)
    
    let action: 'reduce' | 'maintain' | 'increase' = 'maintain'
    if (excessStock > product.total_stock * 0.2) {
      action = 'reduce'
      totalExcessValue += excessStock * product.unit_price
    } else if (shortageStock > 0) {
      action = 'increase'
      totalShortageValue += shortageStock * product.unit_price
    }

    recommendations.push({
      productId: product.product_id,
      productName: product.product_name,
      currentStock: product.total_stock,
      optimalStock,
      excessStock,
      action,
      potentialSavings: excessStock * product.unit_price * 0.15 // 15% holding cost
    })
  }

  return {
    recommendations: recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings).slice(0, 20),
    summary: {
      totalExcessValue,
      totalShortageValue,
      optimizationPotential: totalExcessValue * 0.15 // 15% holding cost
    }
  }
}

async function analyzeTrends(
  supabaseClient: any,
  parameters: any,
  organizationId: string
): Promise<TrendAnalysis[]> {
  const { productId, periodDays = 180 } = parameters

  // Get movement history
  let query = supabaseClient
    .from('stock_movements')
    .select(`
      product_id,
      quantity,
      type,
      created_at,
      products (
        id,
        name
      )
    `)
    .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data: movements, error } = await query

  if (error) throw error

  // Analyze trends by product
  const productTrends = new Map<string, any>()

  for (const movement of movements || []) {
    const pid = movement.product_id
    if (!productTrends.has(pid)) {
      productTrends.set(pid, {
        product: movement.products,
        monthlyVolumes: new Map<string, number>()
      })
    }

    const month = movement.created_at.substring(0, 7) // YYYY-MM
    const current = productTrends.get(pid).monthlyVolumes.get(month) || 0
    const volume = movement.type === 'out' ? movement.quantity : -movement.quantity
    productTrends.get(pid).monthlyVolumes.set(month, current + volume)
  }

  const trends: TrendAnalysis[] = []

  for (const [productId, data] of productTrends) {
    const volumes = Array.from(data.monthlyVolumes.values())
    if (volumes.length < 3) continue // Need at least 3 months

    // Calculate trend using linear regression
    const trend = calculateLinearTrend(volumes)
    const avgMonthlyChange = trend.slope
    const trendStrength = Math.abs(trend.correlation)
    
    let trendType: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (trendStrength > 0.5) {
      trendType = avgMonthlyChange > 0 ? 'increasing' : 'decreasing'
    }

    const insights = []
    if (trendType === 'increasing' && trendStrength > 0.7) {
      insights.push('Strong growth trend detected. Consider increasing stock levels.')
    } else if (trendType === 'decreasing' && trendStrength > 0.7) {
      insights.push('Declining demand trend. Review stock levels to avoid excess inventory.')
    }

    trends.push({
      productId,
      productName: data.product.name,
      trend: trendType,
      trendStrength,
      averageMonthlyChange: avgMonthlyChange,
      projectedChange: avgMonthlyChange * 3, // 3-month projection
      insights
    })
  }

  return trends
}

async function analyzeSeasonality(
  supabaseClient: any,
  parameters: any,
  organizationId: string
): Promise<any> {
  // Simplified seasonality analysis
  // In production, use more sophisticated time series decomposition
  return {
    seasonal_patterns: [
      { month: 1, factor: 0.8, interpretation: 'Below average' },
      { month: 2, factor: 0.85, interpretation: 'Below average' },
      { month: 3, factor: 0.9, interpretation: 'Slightly below average' },
      { month: 4, factor: 1.0, interpretation: 'Average' },
      { month: 5, factor: 1.1, interpretation: 'Above average' },
      { month: 6, factor: 1.2, interpretation: 'Peak season' },
      { month: 7, factor: 1.15, interpretation: 'Above average' },
      { month: 8, factor: 1.1, interpretation: 'Above average' },
      { month: 9, factor: 1.0, interpretation: 'Average' },
      { month: 10, factor: 0.95, interpretation: 'Slightly below average' },
      { month: 11, factor: 1.3, interpretation: 'Peak season' },
      { month: 12, factor: 1.4, interpretation: 'Peak season' }
    ],
    recommendations: [
      'Increase stock levels 30% above average for November-December peak season',
      'Reduce orders by 20% during January-March slow period',
      'Monitor closely during transition periods (April, September)'
    ]
  }
}

// Helper functions
function calculateDailyDemand(movements: any[], periodDays: number): number[] {
  const dailyDemand = new Array(periodDays).fill(0)
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)

  for (const movement of movements) {
    const dayIndex = Math.floor((new Date(movement.created_at).getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
    if (dayIndex >= 0 && dayIndex < periodDays) {
      dailyDemand[dayIndex] += movement.quantity
    }
  }

  return dailyDemand
}

function calculateStandardDeviation(values: number[], mean: number): number {
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length
  return Math.sqrt(avgSquaredDiff)
}

function getSeasonalFactor(date: Date): number {
  const month = date.getMonth()
  const seasonalFactors = [0.8, 0.85, 0.9, 1.0, 1.1, 1.2, 1.15, 1.1, 1.0, 0.95, 1.3, 1.4]
  return seasonalFactors[month]
}

async function getCurrentStock(supabaseClient: any, productId: string, warehouseId?: string): Promise<number> {
  let query = supabaseClient
    .from('stock_levels')
    .select('quantity')
    .eq('product_id', productId)

  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId)
  }

  const { data, error } = await query

  if (error) throw error

  return data?.reduce((sum: number, sl: any) => sum + sl.quantity, 0) || 0
}

async function calculateTurnoverRate(supabaseClient: any, productId: string): Promise<number> {
  // Simplified calculation - in production, use the SQL function
  const { data } = await supabaseClient
    .rpc('calculate_inventory_turnover', {
      p_product_id: productId,
      p_period_days: 365
    })
    .single()

  return data?.turnover_rate || 4 // Default to 4 times per year
}

function calculateLinearTrend(values: number[]): { slope: number; correlation: number } {
  const n = values.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = values

  const sumX = x.reduce((sum, xi) => sum + xi, 0)
  const sumY = y.reduce((sum, yi) => sum + yi, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  return { slope, correlation }
}