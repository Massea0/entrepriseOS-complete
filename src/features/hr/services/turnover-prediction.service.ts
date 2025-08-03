import { supabase } from '@/lib/supabase'

export interface TurnoverPrediction {
  employeeId: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  timeframe: number // months
  factors: Array<{
    factor: string
    impact: number
    trend: string
  }>
  retentionStrategies: Array<{
    strategy: string
    effectiveness: number
    cost: number
  }>
}

class TurnoverPredictionService {
  private readonly FUNCTION_URL = '/turnover-prediction'

  async predictTurnover(employeeId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'predict-single', employeeId }
    })
    if (error) throw error
    return data as TurnoverPrediction
  }

  async analyzeDepartmentRisk(departmentId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'department-analysis', departmentId }
    })
    if (error) throw error
    return data
  }

  async createRetentionPlan(employeeIds: string[]) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'retention-plan', employeeIds }
    })
    if (error) throw error
    return data
  }
}

export const turnoverPredictionService = new TurnoverPredictionService()