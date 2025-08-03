import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
export const demandForecastSchema = z.object({
  productIds: z.array(z.string().uuid()).optional(),
  categories: z.array(z.string()).optional(),
  forecastPeriod: z.object({
    start: z.string(),
    end: z.string()
  }),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  includeExternalFactors: z.boolean().default(true),
  confidenceLevel: z.number().min(0.8).max(0.99).default(0.95)
})

// Types
export interface DemandForecast {
  productId: string
  productName: string
  category: string
  forecasts: Array<{
    date: string
    predictedDemand: number
    confidenceInterval: {
      lower: number
      upper: number
    }
    seasonalityFactor: number
    trendComponent: number
  }>
  accuracy: {
    mape: number // Mean Absolute Percentage Error
    rmse: number // Root Mean Square Error
    confidenceScore: number
  }
  drivers: Array<{
    factor: string
    impact: number
    direction: 'positive' | 'negative'
  }>
}

export interface MarketTrend {
  trend: string
  impact: 'high' | 'medium' | 'low'
  affectedProducts: string[]
  timeframe: string
  confidence: number
  recommendations: string[]
}

export interface DemandAnomaly {
  date: string
  productId: string
  type: 'spike' | 'drop' | 'shift' | 'new_pattern'
  magnitude: number
  possibleCauses: string[]
  recommendedActions: string[]
}

export interface SeasonalAnalysis {
  patterns: Array<{
    name: string
    startMonth: number
    endMonth: number
    peakMonth: number
    averageIncrease: number
  }>
  holidays: Array<{
    name: string
    date: string
    expectedImpact: number
    affectedCategories: string[]
  }>
  recommendations: string[]
}

class DemandForecastingService {
  private readonly FUNCTION_URL = '/demand-forecasting'

  // Generate demand forecasts
  async generateForecasts(params: z.infer<typeof demandForecastSchema>) {
    try {
      const validatedParams = demandForecastSchema.parse(params)

      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'forecast',
          ...validatedParams
        }
      })

      if (error) throw error

      return data as {
        forecasts: DemandForecast[]
        summary: {
          totalProducts: number
          averageGrowth: number
          volatilityIndex: number
          seasonalProducts: number
        }
        marketTrends: MarketTrend[]
        externalFactors: Array<{
          factor: string
          impact: string
          affectedPeriod: string
        }>
        recommendations: {
          inventory: string[]
          pricing: string[]
          promotion: string[]
        }
      }
    } catch (error) {
      console.error('Error generating demand forecasts:', error)
      throw error
    }
  }

  // Analyze seasonal patterns
  async analyzeSeasonalPatterns(params: {
    productIds?: string[]
    historicalPeriod: number // months
    includeHolidays?: boolean
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'seasonal-analysis',
          ...params
        }
      })

      if (error) throw error

      return data as {
        analysis: SeasonalAnalysis
        productPatterns: Array<{
          productId: string
          productName: string
          seasonality: 'high' | 'medium' | 'low' | 'none'
          patterns: Array<{
            period: string
            multiplier: number
            reliability: number
          }>
        }>
        opportunities: Array<{
          period: string
          products: string[]
          strategy: string
          expectedRevenue: number
        }>
      }
    } catch (error) {
      console.error('Error analyzing seasonal patterns:', error)
      throw error
    }
  }

  // Detect demand anomalies
  async detectDemandAnomalies(params: {
    timeframe: 'realtime' | 'daily' | 'weekly'
    sensitivity: 'high' | 'medium' | 'low'
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'detect-anomalies',
          ...params
        }
      })

      if (error) throw error

      return data as {
        anomalies: DemandAnomaly[]
        alerts: Array<{
          severity: 'critical' | 'high' | 'medium' | 'low'
          message: string
          affectedProducts: string[]
          suggestedAction: string
        }>
        patterns: Array<{
          pattern: string
          frequency: string
          products: string[]
          implication: string
        }>
      }
    } catch (error) {
      console.error('Error detecting demand anomalies:', error)
      throw error
    }
  }

  // What-if scenario analysis
  async runScenarioAnalysis(scenarios: Array<{
    name: string
    type: 'price_change' | 'promotion' | 'competition' | 'market_event' | 'supply_disruption'
    parameters: Record<string, any>
    duration: number // days
  }>) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'scenario-analysis',
          scenarios
        }
      })

      if (error) throw error

      return data as {
        results: Array<{
          scenario: string
          impact: {
            demand: Array<{
              productId: string
              baselineDemand: number
              scenarioDemand: number
              changePercent: number
            }>
            revenue: {
              baseline: number
              scenario: number
              difference: number
            }
            inventory: {
              stockoutRisk: number
              excessInventory: number
              optimalLevel: number
            }
          }
          confidence: number
          risks: string[]
          opportunities: string[]
        }>
        recommendations: {
          bestScenario: string
          avoidScenarios: string[]
          mitigationStrategies: string[]
        }
      }
    } catch (error) {
      console.error('Error running scenario analysis:', error)
      throw error
    }
  }

  // Collaborative demand planning
  async collaborativePlanning(params: {
    stakeholders: Array<{
      type: 'sales' | 'marketing' | 'operations' | 'finance'
      input: Record<string, any>
    }>
    planningHorizon: number // months
    consensusMethod: 'average' | 'weighted' | 'ml_optimized'
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'collaborative-planning',
          ...params
        }
      })

      if (error) throw error

      return data as {
        consensusForecast: DemandForecast[]
        alignment: {
          score: number
          disagreements: Array<{
            productId: string
            variance: number
            stakeholders: string[]
          }>
        }
        adjustments: Array<{
          productId: string
          originalForecast: number
          adjustedForecast: number
          reason: string
          confidence: number
        }>
        actionPlan: {
          supply: string[]
          marketing: string[]
          sales: string[]
          finance: string[]
        }
      }
    } catch (error) {
      console.error('Error in collaborative planning:', error)
      throw error
    }
  }

  // New product demand forecasting
  async forecastNewProduct(params: {
    productAttributes: {
      category: string
      pricePoint: number
      features: string[]
      targetMarket: string
    }
    similarProducts?: string[]
    launchDate: string
    marketingBudget?: number
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'new-product-forecast',
          ...params
        }
      })

      if (error) throw error

      return data as {
        forecast: {
          firstMonth: number
          firstQuarter: number
          firstYear: number
          growthCurve: Array<{
            month: number
            demand: number
            confidence: number
          }>
        }
        benchmarks: Array<{
          product: string
          similarity: number
          performance: string
        }>
        risks: Array<{
          risk: string
          probability: number
          impact: number
          mitigation: string
        }>
        recommendations: {
          initialInventory: number
          reorderPoint: number
          marketingFocus: string[]
          pricingStrategy: string
        }
      }
    } catch (error) {
      console.error('Error forecasting new product demand:', error)
      throw error
    }
  }

  // Real-time demand sensing
  async realTimeDemandSensing(params: {
    dataStreams: Array<{
      source: 'pos' | 'online' | 'social' | 'weather' | 'events'
      weight: number
    }>
    updateFrequency: 'hourly' | 'daily' | 'realtime'
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'demand-sensing',
          ...params
        }
      })

      if (error) throw error

      return data as {
        currentDemand: Array<{
          productId: string
          actualDemand: number
          forecastedDemand: number
          variance: number
          trend: 'increasing' | 'stable' | 'decreasing'
        }>
        signals: Array<{
          source: string
          signal: string
          strength: number
          affectedProducts: string[]
          actionRequired: boolean
        }>
        adjustments: Array<{
          productId: string
          originalForecast: number
          adjustedForecast: number
          confidence: number
        }>
        alerts: Array<{
          type: 'stockout_risk' | 'demand_surge' | 'trend_shift'
          products: string[]
          urgency: 'immediate' | 'today' | 'this_week'
          recommendation: string
        }>
      }
    } catch (error) {
      console.error('Error in real-time demand sensing:', error)
      throw error
    }
  }

  // Export demand forecasts
  async exportForecasts(params: {
    forecastIds: string[]
    format: 'excel' | 'csv' | 'pdf' | 'api'
    includeCharts?: boolean
    language?: 'fr' | 'en'
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'export-forecasts',
          ...params
        }
      })

      if (error) throw error

      return data as {
        exportUrl: string
        expiresAt: string
        summary: {
          products: number
          period: string
          accuracy: number
        }
      }
    } catch (error) {
      console.error('Error exporting forecasts:', error)
      throw error
    }
  }
}

export const demandForecastingService = new DemandForecastingService()