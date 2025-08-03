import { supabase } from '@/lib/supabase'
import type { ClientData, Quote, QuoteItem } from '../types/quote.types'

interface GenerateDevisParams {
  clientData: {
    name: string
    email: string
    industry?: string
    companySize?: string
  }
  requirements: string
  estimatedBudget?: number
  items?: QuoteItem[]
}

interface DevisAIResponse {
  devis: {
    items: QuoteItem[]
    totalAmount: number
    margin: number
    validityDays: number
  }
  aiInsights: {
    marketPosition: string
    riskLevel: 'low' | 'medium' | 'high'
    suggestions: string[]
    competitiveAnalysis: string
  }
  suggestions: {
    pricing: string[]
    services: string[]
    terms: string[]
  }
}

export class AIDevisService {
  /**
   * Génère un devis avec l'IA basé sur les données client et les requirements
   */
  static async generateDevisWithAI(params: GenerateDevisParams): Promise<DevisAIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<DevisAIResponse>('ai-devis-generator', {
        body: params
      })

      if (error) {
        console.error('Error generating AI devis:', error)
        throw new Error(`Erreur lors de la génération du devis: ${error.message}`)
      }

      if (!data) {
        throw new Error('Aucune donnée retournée par le générateur de devis')
      }

      return data
    } catch (error) {
      console.error('AIDevisService error:', error)
      throw error
    }
  }

  /**
   * Optimise un devis existant avec l'IA
   */
  static async optimizeExistingDevis(devisId: string, optimizationGoals: string[] = ['margin', 'competitiveness']): Promise<DevisAIResponse> {
    try {
      // Récupérer le devis existant
      const { data: devis, error: fetchError } = await supabase
        .from('devis')
        .select('*')
        .eq('id', devisId)
        .single()

      if (fetchError || !devis) {
        throw new Error('Devis introuvable')
      }

      // Optimiser avec l'IA
      const { data, error } = await supabase.functions.invoke<DevisAIResponse>('ai-devis-generator', {
        body: {
          existingDevis: devis,
          optimizationGoals,
          action: 'optimize'
        }
      })

      if (error) {
        throw new Error(`Erreur lors de l'optimisation: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Optimize devis error:', error)
      throw error
    }
  }

  /**
   * Analyse la compétitivité d'un devis
   */
  static async analyzeCompetitiveness(devisData: Partial<Quote>, marketData?: any): Promise<{
    score: number
    analysis: string
    recommendations: string[]
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-devis-generator', {
        body: {
          devisData,
          marketData,
          action: 'analyze_competitiveness'
        }
      })

      if (error) {
        throw new Error(`Erreur d'analyse: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Analyze competitiveness error:', error)
      throw error
    }
  }

  /**
   * Génère des suggestions de cross-sell/up-sell
   */
  static async generateUpsellSuggestions(clientId: string, currentDevisId?: string): Promise<{
    suggestions: Array<{
      service: string
      reason: string
      estimatedValue: number
      probability: number
    }>
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-devis-generator', {
        body: {
          clientId,
          currentDevisId,
          action: 'generate_upsell'
        }
      })

      if (error) {
        throw new Error(`Erreur génération upsell: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Generate upsell error:', error)
      throw error
    }
  }
}