import { supabase } from '@/lib/supabase'

export interface CustomerSegment {
  id: string
  name: string
  description: string
  size: number
  value: number
  characteristics: Array<{
    attribute: string
    value: any
    importance: number
  }>
  behavior: {
    purchaseFrequency: number
    averageOrderValue: number
    lifetimeValue: number
    churnRisk: number
  }
  recommendations: string[]
}

class CustomerSegmentationService {
  private readonly FUNCTION_URL = '/customer-segmentation'

  async segmentCustomers(method: 'value' | 'behavior' | 'demographic' | 'ai_auto' = 'ai_auto') {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'segment', method }
    })
    if (error) throw error
    return data as {
      segments: CustomerSegment[]
      coverage: number
      quality: number
    }
  }

  async analyzeSegmentEvolution(segmentId: string, period: 'month' | 'quarter' | 'year') {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze-evolution', segmentId, period }
    })
    if (error) throw error
    return data
  }

  async getSegmentationInsights() {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'get-insights' }
    })
    if (error) throw error
    return data
  }

  async createPersonalizedCampaigns(segmentId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'create-campaigns', segmentId }
    })
    if (error) throw error
    return data
  }

  async predictSegmentMigration(customerId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'predict-migration', customerId }
    })
    if (error) throw error
    return data
  }
}

export const customerSegmentationService = new CustomerSegmentationService()