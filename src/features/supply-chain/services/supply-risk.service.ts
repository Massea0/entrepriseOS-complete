import { supabase } from '@/lib/supabase'

export interface SupplyChainRisk {
  id: string
  type: 'supplier' | 'transport' | 'demand' | 'geopolitical' | 'natural' | 'financial'
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  impact: {
    financial: number
    operational: number
    reputational: number
  }
  affectedElements: string[]
  mitigation: {
    strategies: string[]
    cost: number
    effectiveness: number
  }
}

class SupplyRiskService {
  private readonly FUNCTION_URL = '/supply-risk-analysis'

  async analyzeSupplyChainRisks(scope: 'full' | 'suppliers' | 'logistics' | 'inventory') {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze-risks', scope }
    })
    if (error) throw error
    return data as {
      risks: SupplyChainRisk[]
      riskScore: number
      criticalRisks: number
      recommendations: string[]
    }
  }

  async predictDisruptions(timeframe: 'week' | 'month' | 'quarter') {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'predict-disruptions', timeframe }
    })
    if (error) throw error
    return data
  }

  async createContingencyPlans(riskIds: string[]) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'create-contingency', riskIds }
    })
    if (error) throw error
    return data
  }

  async monitorRiskIndicators() {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'monitor-indicators' }
    })
    if (error) throw error
    return data
  }
}

export const supplyRiskService = new SupplyRiskService()