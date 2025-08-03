import { supabase } from '@/lib/supabase'

export interface WellbeingAnalytics {
  employeeId: string
  overallScore: number
  dimensions: {
    workLifeBalance: number
    stress: number
    engagement: number
    satisfaction: number
    burnoutRisk: number
  }
  trends: {
    direction: 'improving' | 'stable' | 'declining'
    change: number
  }
  recommendations: Array<{
    action: string
    impact: 'high' | 'medium' | 'low'
    urgency: 'immediate' | 'soon' | 'monitor'
  }>
}

class WellbeingAnalyticsService {
  private readonly FUNCTION_URL = '/wellbeing-analytics'

  async analyzeWellbeing(employeeId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze', employeeId }
    })
    if (error) throw error
    return data as WellbeingAnalytics
  }

  async detectBurnoutRisk(teamId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'burnout-detection', teamId }
    })
    if (error) throw error
    return data
  }

  async generateWellbeingReport(scope: 'company' | 'department' | 'team', id: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'generate-report', scope, id }
    })
    if (error) throw error
    return data
  }
}

export const wellbeingAnalyticsService = new WellbeingAnalyticsService()