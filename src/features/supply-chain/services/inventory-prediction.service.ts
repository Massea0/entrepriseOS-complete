import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
export const inventoryPredictionSchema = z.object({
  warehouseId: z.string().uuid(),
  productIds: z.array(z.string().uuid()).optional(),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  includeSeasonality: z.boolean().default(true),
  confidenceLevel: z.number().min(0).max(1).default(0.95)
})

export const reorderSuggestionSchema = z.object({
  warehouseId: z.string().uuid(),
  urgencyLevel: z.enum(['all', 'urgent', 'normal']).default('all'),
  budgetLimit: z.number().optional()
})

// Types
export interface StockPrediction {
  productId: string
  productName: string
  currentStock: number
  predictedDemand: number
  recommendedStock: number
  reorderPoint: number
  safetyStock: number
  stockoutRisk: number
  overStockRisk: number
  confidence: number
  timeframe: string
  insights: string[]
}

export interface ReorderSuggestion {
  productId: string
  productName: string
  currentStock: number
  reorderQuantity: number
  urgency: 'critical' | 'high' | 'medium' | 'low'
  estimatedCost: number
  supplier: {
    id: string
    name: string
    leadTime: number
    reliability: number
  }
  expectedDelivery: string
  reasoning: string
}

export interface SeasonalPattern {
  month: number
  demandMultiplier: number
  confidence: number
}

export interface InventoryOptimization {
  totalValue: number
  turnoverRate: number
  carryingCost: number
  stockoutCost: number
  recommendations: {
    action: string
    impact: string
    priority: number
  }[]
}

class InventoryPredictionService {
  private readonly FUNCTION_URL = '/inventory-prediction'

  // Predict future stock needs
  async predictStockNeeds(params: z.infer<typeof inventoryPredictionSchema>) {
    try {
      const validatedParams = inventoryPredictionSchema.parse(params)

      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'predict',
          ...validatedParams
        }
      })

      if (error) throw error

      return data as {
        predictions: StockPrediction[]
        summary: {
          totalProducts: number
          criticalItems: number
          overStockedItems: number
          totalValue: number
          averageStockoutRisk: number
        }
        seasonalPatterns: SeasonalPattern[]
        recommendations: string[]
      }
    } catch (error) {
      console.error('Error predicting stock needs:', error)
      throw error
    }
  }

  // Get reorder suggestions
  async getReorderSuggestions(params: z.infer<typeof reorderSuggestionSchema>) {
    try {
      const validatedParams = reorderSuggestionSchema.parse(params)

      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'reorder-suggestions',
          ...validatedParams
        }
      })

      if (error) throw error

      return data as {
        suggestions: ReorderSuggestion[]
        summary: {
          totalItems: number
          totalCost: number
          criticalItems: number
          averageLeadTime: number
        }
        budgetAnalysis: {
          required: number
          available: number
          shortfall: number
        }
      }
    } catch (error) {
      console.error('Error getting reorder suggestions:', error)
      throw error
    }
  }

  // Analyze inventory turnover
  async analyzeInventoryTurnover(warehouseId: string, period: 'month' | 'quarter' | 'year' = 'quarter') {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'analyze-turnover',
          warehouseId,
          period
        }
      })

      if (error) throw error

      return data as {
        turnoverRate: number
        averageDaysInInventory: number
        slowMovingItems: Array<{
          productId: string
          productName: string
          daysInStock: number
          value: number
          recommendation: string
        }>
        fastMovingItems: Array<{
          productId: string
          productName: string
          turnoverRate: number
          stockoutFrequency: number
        }>
        optimization: InventoryOptimization
      }
    } catch (error) {
      console.error('Error analyzing inventory turnover:', error)
      throw error
    }
  }

  // Predict seasonal demand
  async predictSeasonalDemand(productId: string, years: number = 2) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'seasonal-demand',
          productId,
          years
        }
      })

      if (error) throw error

      return data as {
        patterns: SeasonalPattern[]
        peaks: Array<{
          month: string
          expectedDemand: number
          confidence: number
        }>
        valleys: Array<{
          month: string
          expectedDemand: number
          confidence: number
        }>
        yearOverYear: {
          growth: number
          trend: 'increasing' | 'stable' | 'decreasing'
        }
        recommendations: string[]
      }
    } catch (error) {
      console.error('Error predicting seasonal demand:', error)
      throw error
    }
  }

  // Optimize safety stock levels
  async optimizeSafetyStock(warehouseId: string, serviceLevel: number = 0.95) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'optimize-safety-stock',
          warehouseId,
          serviceLevel
        }
      })

      if (error) throw error

      return data as {
        optimizations: Array<{
          productId: string
          productName: string
          currentSafetyStock: number
          optimalSafetyStock: number
          costImpact: number
          serviceImprovement: number
        }>
        summary: {
          totalCostSavings: number
          averageServiceImprovement: number
          productsOptimized: number
        }
      }
    } catch (error) {
      console.error('Error optimizing safety stock:', error)
      throw error
    }
  }

  // Detect anomalies in inventory
  async detectInventoryAnomalies(warehouseId: string, sensitivity: 'high' | 'medium' | 'low' = 'medium') {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'detect-anomalies',
          warehouseId,
          sensitivity
        }
      })

      if (error) throw error

      return data as {
        anomalies: Array<{
          type: 'sudden_spike' | 'unusual_decline' | 'pattern_break' | 'outlier'
          productId: string
          productName: string
          detected: string
          severity: 'critical' | 'high' | 'medium' | 'low'
          description: string
          recommendation: string
        }>
        patterns: Array<{
          pattern: string
          affectedProducts: number
          likelihood: number
          impact: string
        }>
      }
    } catch (error) {
      console.error('Error detecting inventory anomalies:', error)
      throw error
    }
  }

  // Generate inventory forecast report
  async generateForecastReport(warehouseId: string, options?: {
    includeCharts?: boolean
    format?: 'pdf' | 'excel' | 'json'
    language?: 'fr' | 'en'
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'generate-report',
          warehouseId,
          ...options
        }
      })

      if (error) throw error

      return data as {
        reportUrl: string
        summary: {
          forecastAccuracy: number
          keyInsights: string[]
          criticalActions: string[]
        }
      }
    } catch (error) {
      console.error('Error generating forecast report:', error)
      throw error
    }
  }

  // Calculate optimal order quantities (EOQ)
  async calculateOptimalOrderQuantities(warehouseId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'calculate-eoq',
          warehouseId
        }
      })

      if (error) throw error

      return data as {
        calculations: Array<{
          productId: string
          productName: string
          currentOrderQuantity: number
          optimalOrderQuantity: number
          orderFrequency: number
          annualCostSaving: number
          holdingCost: number
          orderingCost: number
        }>
        totalSavings: number
        implementation: {
          steps: string[]
          timeline: string
          expectedROI: number
        }
      }
    } catch (error) {
      console.error('Error calculating optimal order quantities:', error)
      throw error
    }
  }
}

export const inventoryPredictionService = new InventoryPredictionService()