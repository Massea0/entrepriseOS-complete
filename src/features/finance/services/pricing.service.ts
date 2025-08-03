import { supabase } from '@/lib/supabase'

interface ProductData {
  name: string
  description?: string
  cost: number
  category: string
  currentPrice?: number
  features?: string[]
  competitorPrices?: Array<{
    competitor: string
    price: number
  }>
}

interface MarketContext {
  sector: string
  region?: string
  seasonality?: 'high' | 'normal' | 'low'
  demand: 'high' | 'medium' | 'low'
  competitors?: string[]
  marketShare?: number
}

interface PricingOptimizationResponse {
  optimizedPrice: number
  currentPrice?: number
  priceRange: {
    min: number
    max: number
    recommended: number
  }
  margin: {
    amount: number
    percentage: number
  }
  justification: string
  marketPositioning: 'premium' | 'competitive' | 'budget'
  elasticity: {
    score: number
    sensitivity: 'high' | 'medium' | 'low'
  }
  projections: {
    volume: number
    revenue: number
    profit: number
  }
}

interface PricingScenario {
  price: number
  volume: number
  revenue: number
  profit: number
  marketShare: number
  riskLevel: 'low' | 'medium' | 'high'
}

export class PricingService {
  /**
   * Optimise le prix d'un produit/service
   */
  static async optimizePricing(productData: ProductData, marketContext: MarketContext): Promise<PricingOptimizationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<PricingOptimizationResponse>('pricing-optimizer', {
        body: {
          productData,
          marketContext
        }
      })

      if (error) {
        console.error('Error optimizing pricing:', error)
        throw new Error(`Erreur d'optimisation des prix: ${error.message}`)
      }

      if (!data) {
        throw new Error('Aucune optimisation de prix retournée')
      }

      // Sauvegarder l'historique d'optimisation
      await this.savePricingHistory(productData.name, data)

      return data
    } catch (error) {
      console.error('PricingService error:', error)
      throw error
    }
  }

  /**
   * Simule différents scénarios de prix
   */
  static async simulatePricingScenarios(
    productData: ProductData,
    pricePoints: number[]
  ): Promise<{
    scenarios: PricingScenario[]
    optimalScenario: PricingScenario
    breakEvenPoint: number
    maxProfitPoint: number
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('pricing-optimizer', {
        body: {
          productData,
          pricePoints,
          action: 'simulate_scenarios'
        }
      })

      if (error) {
        throw new Error(`Erreur simulation: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Simulate scenarios error:', error)
      throw error
    }
  }

  /**
   * Analyse l'élasticité des prix
   */
  static async analyzePriceElasticity(
    productData: ProductData,
    historicalData?: Array<{ price: number; volume: number; date: string }>
  ): Promise<{
    elasticityCoefficient: number
    sensitivity: 'elastic' | 'inelastic' | 'unit_elastic'
    optimalPricePoint: number
    demandCurve: Array<{ price: number; expectedVolume: number }>
    insights: string[]
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('pricing-optimizer', {
        body: {
          productData,
          historicalData,
          action: 'analyze_elasticity'
        }
      })

      if (error) {
        throw new Error(`Erreur analyse élasticité: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Analyze elasticity error:', error)
      throw error
    }
  }

  /**
   * Optimisation de prix par bundle
   */
  static async optimizeBundlePricing(
    products: ProductData[],
    bundleStrategy: 'discount' | 'value' | 'premium'
  ): Promise<{
    bundlePrice: number
    individualTotal: number
    discount: {
      amount: number
      percentage: number
    }
    projectedUplift: number
    crossSellProbability: number
    recommendations: string[]
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('pricing-optimizer', {
        body: {
          products,
          bundleStrategy,
          action: 'optimize_bundle'
        }
      })

      if (error) {
        throw new Error(`Erreur bundle pricing: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Bundle pricing error:', error)
      throw error
    }
  }

  /**
   * Analyse de la compétitivité des prix
   */
  static async analyzeCompetitivePricing(
    productData: ProductData,
    competitorData: Array<{ name: string; price: number; features: string[] }>
  ): Promise<{
    competitivePosition: 'leader' | 'challenger' | 'follower'
    priceGap: {
      average: number
      min: number
      max: number
    }
    valueScore: number
    recommendations: Array<{
      action: string
      impact: 'high' | 'medium' | 'low'
      expectedResult: string
    }>
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('pricing-optimizer', {
        body: {
          productData,
          competitorData,
          action: 'analyze_competition'
        }
      })

      if (error) {
        throw new Error(`Erreur analyse concurrentielle: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Competitive analysis error:', error)
      throw error
    }
  }

  /**
   * Sauvegarde l'historique des optimisations de prix
   */
  private static async savePricingHistory(productName: string, optimization: PricingOptimizationResponse): Promise<void> {
    try {
      const { error } = await supabase
        .from('pricing_history')
        .insert({
          product_name: productName,
          optimized_price: optimization.optimizedPrice,
          margin_percentage: optimization.margin.percentage,
          market_positioning: optimization.marketPositioning,
          justification: optimization.justification,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving pricing history:', error)
      }
    } catch (error) {
      console.error('Save pricing history error:', error)
    }
  }
}