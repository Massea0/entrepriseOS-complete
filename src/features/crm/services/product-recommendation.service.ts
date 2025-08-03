import { supabase } from '@/lib/supabase'

export interface ProductRecommendation {
  productId: string
  productName: string
  score: number
  reasoning: string[]
  crossSellProbability: number
  expectedRevenue: number
  timing: 'immediate' | 'short_term' | 'long_term'
}

class ProductRecommendationService {
  private readonly FUNCTION_URL = '/product-recommendation'

  async getRecommendations(customerId: string, context?: 'upsell' | 'cross_sell' | 'renewal') {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'recommend', customerId, context }
    })
    if (error) throw error
    return data as {
      recommendations: ProductRecommendation[]
      bundles: Array<{
        products: string[]
        discount: number
        value: number
      }>
    }
  }

  async analyzeProductAffinity() {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze-affinity' }
    })
    if (error) throw error
    return data
  }

  async personalizeOffers(customerId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'personalize-offers', customerId }
    })
    if (error) throw error
    return data
  }
}

export const productRecommendationService = new ProductRecommendationService()