import { supabase } from '@/lib/supabase'

export interface ChatbotResponse {
  message: string
  confidence: number
  suggestedActions?: string[]
  escalate: boolean
  sentiment: 'positive' | 'neutral' | 'negative'
  category: string
  relatedArticles?: Array<{
    title: string
    url: string
    relevance: number
  }>
}

class SupportChatbotService {
  private readonly FUNCTION_URL = '/support-chatbot'

  async processMessage(message: string, customerId: string, context?: any) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'process', message, customerId, context }
    })
    if (error) throw error
    return data as ChatbotResponse
  }

  async trainChatbot(conversations: Array<{ question: string; answer: string }>) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'train', conversations }
    })
    if (error) throw error
    return data
  }

  async getFrequentQuestions(limit: number = 10) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'frequent-questions', limit }
    })
    if (error) throw error
    return data
  }

  async analyzeConversationQuality(conversationId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze-quality', conversationId }
    })
    if (error) throw error
    return data
  }
}

export const supportChatbotService = new SupportChatbotService()