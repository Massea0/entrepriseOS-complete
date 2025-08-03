import { supabase } from '@/lib/supabase'

export interface PerformanceAnalysis {
  employeeId: string
  overallScore: number
  ratings: {
    productivity: number
    quality: number
    collaboration: number
    innovation: number
    leadership: number
  }
  achievements: string[]
  areasOfImprovement: string[]
  recommendations: Array<{
    action: string
    expectedImpact: string
    timeframe: string
  }>
  peerComparison: {
    percentile: number
    strengths: string[]
    opportunities: string[]
  }
}

class PerformanceAnalyzerService {
  private readonly FUNCTION_URL = '/performance-analyzer'

  async analyzePerformance(employeeId: string, period: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze', employeeId, period }
    })
    if (error) throw error
    return data as PerformanceAnalysis
  }

  async generateReview(employeeId: string, reviewerId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'generate-review', employeeId, reviewerId }
    })
    if (error) throw error
    return data
  }

  async identifyHighPerformers(criteria?: any) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'identify-high-performers', criteria }
    })
    if (error) throw error
    return data
  }

  async predictPromotion(employeeId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'predict-promotion', employeeId }
    })
    if (error) throw error
    return data
  }
}

export const performanceAnalyzerService = new PerformanceAnalyzerService()