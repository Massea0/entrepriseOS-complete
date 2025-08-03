import { supabase } from '@/lib/supabase'

export interface SalesForecast {
  period: string
  predictedRevenue: number
  confidence: number
  breakdown: {
    byProduct: Record<string, number>
    byRegion: Record<string, number>
    byChannel: Record<string, number>
  }
  opportunities: Array<{
    dealId: string
    probability: number
    expectedValue: number
    expectedCloseDate: string
  }>
  risks: Array<{
    factor: string
    impact: number
    mitigation: string
  }>
}

class SalesPredictionService {
  private readonly FUNCTION_URL = '/sales-prediction'

  async forecastSales(period: 'month' | 'quarter' | 'year', options?: any) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'forecast', period, options }
    })
    if (error) throw error
    return data as SalesForecast
  }

  async predictDealOutcome(dealId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'predict-deal', dealId }
    })
    if (error) throw error
    return data
  }

  async analyzeWinLossPatterns() {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'win-loss-analysis' }
    })
    if (error) throw error
    return data
  }

  async optimizeSalesPipeline() {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'optimize-pipeline' }
    })
    if (error) throw error
    return data
  }
}

export const salesPredictionService = new SalesPredictionService()