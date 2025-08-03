import { supabase } from '@/lib/supabase'

export interface ChurnPrediction {
  customerId: string
  churnProbability: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  timeframe: number // days until likely churn
  reasons: Array<{
    factor: string
    impact: number
    trend: 'improving' | 'stable' | 'worsening'
  }>
  preventiveActions: Array<{
    action: string
    expectedRetention: number
    cost: number
    roi: number
  }>
}

class ChurnPredictionService {
  private readonly FUNCTION_URL = '/churn-prediction'

  async predictChurn(customerId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'predict-single', customerId }
    })
    if (error) throw error
    return data as ChurnPrediction
  }

  async predictChurnBulk(customerIds: string[]) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'predict-bulk', customerIds }
    })
    if (error) throw error
    return data as {
      predictions: ChurnPrediction[]
      summary: {
        atRisk: number
        criticalCases: number
        potentialRevenueLoss: number
      }
    }
  }

  async analyzeChurnDrivers(period: 'month' | 'quarter' | 'year' = 'quarter') {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze-drivers', period }
    })
    if (error) throw error
    return data
  }

  async createRetentionCampaign(customerIds: string[]) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'retention-campaign', customerIds }
    })
    if (error) throw error
    return data
  }

  async monitorChurnSignals(realtime: boolean = true) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'monitor-signals', realtime }
    })
    if (error) throw error
    return data
  }
}

export const churnPredictionService = new ChurnPredictionService()