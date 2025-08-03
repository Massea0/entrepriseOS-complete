import { supabase } from '@/lib/supabase'

export type MessageTemplate = 
  | 'devis_sent' 
  | 'devis_reminder' 
  | 'devis_followup'
  | 'contract_ready'
  | 'payment_reminder'
  | 'thank_you'
  | 'custom'

export type CommunicationChannel = 'email' | 'sms' | 'both'
export type MessageLanguage = 'fr' | 'en' | 'es' | 'de'

interface ClientCommunicationResponse {
  messageId: string
  content: {
    subject?: string
    body: string
    htmlBody?: string
    attachments?: string[]
  }
  scheduledAt: string
  channel: CommunicationChannel
  status: 'scheduled' | 'sent' | 'failed' | 'pending'
  personalization: {
    tokens: Record<string, string>
    score: number // Score de personnalisation 0-100
  }
  aiEnhancements?: {
    tone: 'formal' | 'friendly' | 'neutral'
    readabilityScore: number
    estimatedEngagement: number
  }
}

interface CommunicationParams {
  clientId: string
  template: MessageTemplate
  language?: MessageLanguage
  channel?: CommunicationChannel
  customContent?: string
  variables?: Record<string, any>
  scheduledDate?: string
}

export class ClientCommunicationService {
  /**
   * Envoie une communication automatisée à un client
   */
  static async sendAutomatedMessage(params: CommunicationParams): Promise<ClientCommunicationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<ClientCommunicationResponse>('client-communication-automation', {
        body: {
          clientId: params.clientId,
          template: params.template,
          language: params.language || 'fr',
          channel: params.channel || 'email',
          customContent: params.customContent,
          variables: params.variables,
          scheduledDate: params.scheduledDate
        }
      })

      if (error) {
        console.error('Error sending automated message:', error)
        throw new Error(`Erreur envoi message: ${error.message}`)
      }

      if (!data) {
        throw new Error('Aucun message généré')
      }

      // Sauvegarder l'historique de communication
      await this.saveCommunicationHistory(params.clientId, data)

      return data
    } catch (error) {
      console.error('ClientCommunicationService error:', error)
      throw error
    }
  }

  /**
   * Génère un message personnalisé avec l'IA
   */
  static async generatePersonalizedMessage(
    clientId: string,
    context: {
      purpose: string
      tone?: 'formal' | 'friendly' | 'neutral'
      includeData?: string[]
      maxLength?: number
    }
  ): Promise<{
    message: {
      subject: string
      body: string
      htmlBody: string
    }
    personalizationScore: number
    suggestions: string[]
    alternativeVersions: Array<{
      tone: string
      content: string
    }>
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('client-communication-automation', {
        body: {
          clientId,
          context,
          action: 'generate_personalized'
        }
      })

      if (error) {
        throw new Error(`Erreur personnalisation: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Generate personalized error:', error)
      throw error
    }
  }

  /**
   * Planifie une séquence de communications
   */
  static async scheduleSequence(
    clientId: string,
    sequence: Array<{
      template: MessageTemplate
      delayDays: number
      condition?: string
    }>
  ): Promise<{
    sequenceId: string
    scheduledMessages: Array<{
      messageId: string
      template: MessageTemplate
      scheduledDate: string
      status: string
    }>
    estimatedCompletionDate: string
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('client-communication-automation', {
        body: {
          clientId,
          sequence,
          action: 'schedule_sequence'
        }
      })

      if (error) {
        throw new Error(`Erreur planification séquence: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Schedule sequence error:', error)
      throw error
    }
  }

  /**
   * Analyse l'engagement client
   */
  static async analyzeEngagement(
    clientId: string,
    period?: { start: string; end: string }
  ): Promise<{
    engagementScore: number
    metrics: {
      emailOpenRate: number
      clickRate: number
      responseRate: number
      averageResponseTime: string
    }
    trends: Array<{
      metric: string
      trend: 'up' | 'down' | 'stable'
      change: number
    }>
    recommendations: Array<{
      action: string
      expectedImpact: string
      priority: 'high' | 'medium' | 'low'
    }>
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('client-communication-automation', {
        body: {
          clientId,
          period,
          action: 'analyze_engagement'
        }
      })

      if (error) {
        throw new Error(`Erreur analyse engagement: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Analyze engagement error:', error)
      throw error
    }
  }

  /**
   * Optimise le timing des communications
   */
  static async optimizeTiming(
    clientId: string,
    messageType: MessageTemplate
  ): Promise<{
    optimalTime: {
      dayOfWeek: string
      hour: number
      timezone: string
    }
    reasoning: string
    historicalPerformance: Array<{
      time: string
      openRate: number
      clickRate: number
    }>
    confidence: number
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('client-communication-automation', {
        body: {
          clientId,
          messageType,
          action: 'optimize_timing'
        }
      })

      if (error) {
        throw new Error(`Erreur optimisation timing: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Optimize timing error:', error)
      throw error
    }
  }

  /**
   * Gestion des préférences de communication
   */
  static async updateCommunicationPreferences(
    clientId: string,
    preferences: {
      channels?: CommunicationChannel[]
      frequency?: 'daily' | 'weekly' | 'monthly' | 'minimal'
      language?: MessageLanguage
      unsubscribeCategories?: string[]
    }
  ): Promise<{
    updated: boolean
    preferences: Record<string, any>
    effectiveDate: string
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('client-communication-automation', {
        body: {
          clientId,
          preferences,
          action: 'update_preferences'
        }
      })

      if (error) {
        throw new Error(`Erreur mise à jour préférences: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Update preferences error:', error)
      throw error
    }
  }

  /**
   * Sauvegarde l'historique de communication
   */
  private static async saveCommunicationHistory(
    clientId: string,
    communication: ClientCommunicationResponse
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('communication_history')
        .insert({
          client_id: clientId,
          message_id: communication.messageId,
          template: communication.content,
          channel: communication.channel,
          status: communication.status,
          scheduled_at: communication.scheduledAt,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving communication history:', error)
      }
    } catch (error) {
      console.error('Save history error:', error)
    }
  }
}