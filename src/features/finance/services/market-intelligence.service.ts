import { supabase } from '@/lib/supabase'

export type MarketPeriod = 'week' | 'month' | 'quarter' | 'year'
export type TrendDirection = 'up' | 'down' | 'stable'

interface MarketTrend {
  indicator: string
  value: number
  change: number
  direction: TrendDirection
  significance: 'high' | 'medium' | 'low'
  insight: string
}

interface Opportunity {
  type: 'new_market' | 'price_gap' | 'demand_surge' | 'competitor_weakness'
  description: string
  potential: number // Valeur potentielle estimée
  probability: number // 0-100
  timeframe: string
  actionRequired: string
}

interface Threat {
  type: 'new_competitor' | 'price_war' | 'regulation' | 'demand_drop'
  description: string
  impact: 'critical' | 'high' | 'medium' | 'low'
  likelihood: number // 0-100
  mitigation: string
}

interface MarketIntelligenceResponse {
  sector: string
  period: MarketPeriod
  timestamp: string
  trends: MarketTrend[]
  opportunities: Opportunity[]
  threats: Threat[]
  competitorAnalysis: {
    mainCompetitors: Array<{
      name: string
      marketShare: number
      strengths: string[]
      weaknesses: string[]
    }>
    marketPosition: 'leader' | 'challenger' | 'follower' | 'niche'
  }
  predictions: {
    shortTerm: string // 1-3 mois
    mediumTerm: string // 3-12 mois
    longTerm: string // 1-3 ans
  }
  recommendations: string[]
}

export class MarketIntelligenceService {
  /**
   * Obtient l'intelligence de marché pour un secteur
   */
  static async getMarketInsights(
    sector: string,
    period: MarketPeriod = 'quarter',
    includeCompetitors: boolean = true
  ): Promise<MarketIntelligenceResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<MarketIntelligenceResponse>('market-intelligence', {
        body: {
          sector,
          period,
          includeCompetitors
        }
      })

      if (error) {
        console.error('Error getting market insights:', error)
        throw new Error(`Erreur intelligence de marché: ${error.message}`)
      }

      if (!data) {
        throw new Error('Aucune donnée de marché retournée')
      }

      // Sauvegarder les insights pour l'historique
      await this.saveMarketInsights(sector, data)

      return data
    } catch (error) {
      console.error('MarketIntelligenceService error:', error)
      throw error
    }
  }

  /**
   * Analyse comparative sectorielle
   */
  static async compareSectors(
    sectors: string[],
    metrics: string[] = ['growth', 'profitability', 'competition']
  ): Promise<{
    comparison: Array<{
      sector: string
      metrics: Record<string, number>
      ranking: number
      insights: string[]
    }>
    bestPerformer: string
    recommendations: string[]
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('market-intelligence', {
        body: {
          sectors,
          metrics,
          action: 'compare_sectors'
        }
      })

      if (error) {
        throw new Error(`Erreur comparaison: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Compare sectors error:', error)
      throw error
    }
  }

  /**
   * Détection d'opportunités en temps réel
   */
  static async detectOpportunities(
    sector: string,
    criteria: {
      minPotential?: number
      riskTolerance?: 'low' | 'medium' | 'high'
      timeHorizon?: 'short' | 'medium' | 'long'
    }
  ): Promise<{
    opportunities: Opportunity[]
    totalPotential: number
    topRecommendation: {
      opportunity: Opportunity
      rationale: string
      actionPlan: string[]
    }
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('market-intelligence', {
        body: {
          sector,
          criteria,
          action: 'detect_opportunities'
        }
      })

      if (error) {
        throw new Error(`Erreur détection opportunités: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Detect opportunities error:', error)
      throw error
    }
  }

  /**
   * Alerte sur les menaces du marché
   */
  static async monitorThreats(
    sector: string,
    alertLevel: 'all' | 'high' | 'critical' = 'high'
  ): Promise<{
    activeThreats: Threat[]
    riskScore: number // Score global de risque 0-100
    alerts: Array<{
      message: string
      severity: 'info' | 'warning' | 'critical'
      actionRequired: boolean
    }>
    contingencyPlan: string[]
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('market-intelligence', {
        body: {
          sector,
          alertLevel,
          action: 'monitor_threats'
        }
      })

      if (error) {
        throw new Error(`Erreur surveillance menaces: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Monitor threats error:', error)
      throw error
    }
  }

  /**
   * Prévisions de marché basées sur l'IA
   */
  static async generateMarketForecast(
    sector: string,
    forecastPeriod: '3months' | '6months' | '1year' | '3years'
  ): Promise<{
    forecast: {
      growth: { min: number; expected: number; max: number }
      marketSize: { current: number; projected: number }
      keyDrivers: string[]
      risks: string[]
    }
    scenarios: {
      optimistic: { probability: number; description: string }
      realistic: { probability: number; description: string }
      pessimistic: { probability: number; description: string }
    }
    confidenceLevel: number
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('market-intelligence', {
        body: {
          sector,
          forecastPeriod,
          action: 'generate_forecast'
        }
      })

      if (error) {
        throw new Error(`Erreur prévisions: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Generate forecast error:', error)
      throw error
    }
  }

  /**
   * Sauvegarde les insights de marché
   */
  private static async saveMarketInsights(sector: string, insights: MarketIntelligenceResponse): Promise<void> {
    try {
      const { error } = await supabase
        .from('market_insights')
        .insert({
          sector,
          period: insights.period,
          trends: insights.trends,
          opportunities: insights.opportunities,
          threats: insights.threats,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving market insights:', error)
      }
    } catch (error) {
      console.error('Save insights error:', error)
    }
  }
}