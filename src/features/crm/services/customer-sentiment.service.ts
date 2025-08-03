import { supabase } from '@/lib/supabase'

export interface SentimentAnalysis {
  customerId: string
  overallSentiment: 'positive' | 'neutral' | 'negative'
  score: number // -1 to 1
  emotions: {
    satisfaction: number
    frustration: number
    loyalty: number
    excitement: number
  }
  topics: Array<{
    topic: string
    sentiment: 'positive' | 'neutral' | 'negative'
    mentions: number
  }>
  trends: {
    direction: 'improving' | 'stable' | 'declining'
    change: number
  }
}

class CustomerSentimentService {
  private readonly FUNCTION_URL = '/customer-sentiment'

  async analyzeSentiment(customerId: string, sources?: ('emails' | 'calls' | 'chat' | 'social')[]) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze', customerId, sources }
    })
    if (error) throw error
    return data as SentimentAnalysis
  }

  async analyzeConversation(conversationId: string, type: 'email' | 'call' | 'chat') {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze-conversation', conversationId, type }
    })
    if (error) throw error
    return data
  }

  async getSentimentTrends(period: 'week' | 'month' | 'quarter' = 'month') {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'get-trends', period }
    })
    if (error) throw error
    return data
  }

  async generateSentimentReport(customerIds?: string[]) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'generate-report', customerIds }
    })
    if (error) throw error
    return data
  }
}

export const customerSentimentService = new CustomerSentimentService()