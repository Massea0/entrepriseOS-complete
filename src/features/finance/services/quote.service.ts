// quote.service.ts
// Service pour la gestion des devis avec intégration IA

import { supabase } from '@/lib/supabase'
import type {
  Quote,
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteFilters,
  QuoteAnalytics,
  AIQuoteGenerationParams,
  AIQuoteGenerationResponse,
  QuoteStatus
} from '../types'
import { getCurrentUser, getCompanyId } from '@/lib/supabase'

export class QuoteService {
  // ===============================
  // CRUD Operations
  // ===============================

  /**
   * Récupérer tous les devis avec filtres
   */
  static async getQuotes(filters?: QuoteFilters): Promise<Quote[]> {
    try {
      const companyId = await getCompanyId()
      if (!companyId) throw new Error('Company ID not found')

      let query = supabase
        .from('quotes')
        .select(`
          *,
          client:client_id(id, name, email, phone),
          created_by_user:created_by(id, first_name, last_name, email),
          approved_by_user:approved_by(id, first_name, last_name, email)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      // Appliquer les filtres
      if (filters) {
        if (filters.status?.length) {
          query = query.in('status', filters.status)
        }
        if (filters.clientId) {
          query = query.eq('client_id', filters.clientId)
        }
        if (filters.dateRange) {
          query = query
            .gte('created_at', filters.dateRange.start.toISOString())
            .lte('created_at', filters.dateRange.end.toISOString())
        }
        if (filters.minAmount !== undefined) {
          query = query.gte('total_amount', filters.minAmount)
        }
        if (filters.maxAmount !== undefined) {
          query = query.lte('total_amount', filters.maxAmount)
        }
        if (filters.aiGenerated !== undefined) {
          query = query.eq('ai_generated', filters.aiGenerated)
        }
        if (filters.search) {
          query = query.or(`quote_number.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`)
        }
      }

      const { data, error } = await query

      if (error) throw error

      // Transformer les données
      return data.map(this.transformQuoteFromDB)
    } catch (error) {
      console.error('Error fetching quotes:', error)
      throw error
    }
  }

  /**
   * Récupérer un devis par ID
   */
  static async getQuote(id: string): Promise<Quote> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          client:client_id(id, name, email, phone),
          created_by_user:created_by(id, first_name, last_name, email),
          approved_by_user:approved_by(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Quote not found')

      return this.transformQuoteFromDB(data)
    } catch (error) {
      console.error('Error fetching quote:', error)
      throw error
    }
  }

  /**
   * Créer un nouveau devis
   */
  static async createQuote(input: CreateQuoteInput): Promise<Quote> {
    try {
      const user = await getCurrentUser()
      const companyId = await getCompanyId()
      
      if (!user || !companyId) {
        throw new Error('User or company not found')
      }

      // Calculer les montants
      const subtotal = input.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice * (1 - item.discount / 100))
      }, 0)

      const validUntil = input.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('quotes')
        .insert({
          company_id: companyId,
          client_id: input.clientId,
          client_name: input.clientName,
          client_email: input.clientEmail,
          client_phone: input.clientPhone,
          client_address: input.clientAddress,
          valid_until: validUntil.toISOString(),
          currency: input.currency || 'EUR',
          subtotal,
          tax_rate: input.taxRate || 20,
          discount_type: input.discountType,
          discount_value: input.discountValue || 0,
          items: input.items,
          terms_conditions: input.termsConditions,
          notes: input.notes,
          created_by: user.id,
          status: 'draft'
        })
        .select(`
          *,
          client:client_id(id, name, email, phone),
          created_by_user:created_by(id, first_name, last_name, email)
        `)
        .single()

      if (error) throw error

      // Si demandé, générer avec IA
      if (input.useAI) {
        await this.enhanceQuoteWithAI(data.id)
      }

      return this.transformQuoteFromDB(data)
    } catch (error) {
      console.error('Error creating quote:', error)
      throw error
    }
  }

  /**
   * Mettre à jour un devis
   */
  static async updateQuote(id: string, input: UpdateQuoteInput): Promise<Quote> {
    try {
      const updateData: any = {}

      if (input.clientName !== undefined) updateData.client_name = input.clientName
      if (input.clientEmail !== undefined) updateData.client_email = input.clientEmail
      if (input.clientPhone !== undefined) updateData.client_phone = input.clientPhone
      if (input.clientAddress !== undefined) updateData.client_address = input.clientAddress
      if (input.validUntil !== undefined) updateData.valid_until = input.validUntil.toISOString()
      if (input.currency !== undefined) updateData.currency = input.currency
      if (input.taxRate !== undefined) updateData.tax_rate = input.taxRate
      if (input.discountType !== undefined) updateData.discount_type = input.discountType
      if (input.discountValue !== undefined) updateData.discount_value = input.discountValue
      if (input.termsConditions !== undefined) updateData.terms_conditions = input.termsConditions
      if (input.notes !== undefined) updateData.notes = input.notes
      if (input.status !== undefined) updateData.status = input.status
      if (input.rejectionReason !== undefined) updateData.rejection_reason = input.rejectionReason

      // Recalculer le subtotal si les items changent
      if (input.items) {
        updateData.items = input.items
        updateData.subtotal = input.items.reduce((sum, item) => {
          return sum + (item.quantity * item.unitPrice * (1 - item.discount / 100))
        }, 0)
      }

      const { data, error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          client:client_id(id, name, email, phone),
          created_by_user:created_by(id, first_name, last_name, email),
          approved_by_user:approved_by(id, first_name, last_name, email)
        `)
        .single()

      if (error) throw error

      return this.transformQuoteFromDB(data)
    } catch (error) {
      console.error('Error updating quote:', error)
      throw error
    }
  }

  /**
   * Supprimer un devis
   */
  static async deleteQuote(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id)
        .eq('status', 'draft') // Seulement les brouillons peuvent être supprimés

      if (error) throw error
    } catch (error) {
      console.error('Error deleting quote:', error)
      throw error
    }
  }

  // ===============================
  // AI Integration
  // ===============================

  /**
   * Générer un devis avec l'IA
   */
  static async generateQuoteWithAI(params: AIQuoteGenerationParams): Promise<Quote> {
    try {
      // Appeler l'Edge Function
      const { data: aiResponse, error } = await supabase.functions.invoke('quote-generator-ai', {
        body: {
          ...params,
          companyId: await getCompanyId(),
          includeHistoricalData: true
        }
      })

      if (error) throw error

      const response = aiResponse as AIQuoteGenerationResponse

      // Créer le devis avec les suggestions IA
      const quote = await this.createQuote({
        ...response.quote,
        useAI: false // Éviter la boucle
      })

      // Ajouter les métadonnées IA
      await supabase
        .from('quotes')
        .update({
          ai_generated: true,
          ai_suggestions: response.suggestions,
          ai_score: response.confidence,
          ai_insights: {
            alternatives: response.alternatives
          }
        })
        .eq('id', quote.id)

      return {
        ...quote,
        aiGenerated: true,
        aiSuggestions: response.suggestions,
        aiScore: response.confidence
      }
    } catch (error) {
      console.error('Error generating quote with AI:', error)
      throw error
    }
  }

  /**
   * Améliorer un devis existant avec l'IA
   */
  static async enhanceQuoteWithAI(quoteId: string): Promise<void> {
    try {
      const quote = await this.getQuote(quoteId)

      // Appeler l'Edge Function pour l'analyse
      const { data: analysis, error } = await supabase.functions.invoke('quote-analyzer', {
        body: {
          quote,
          analyzeConversion: true,
          suggestOptimizations: true,
          compareWithSimilar: true
        }
      })

      if (error) throw error

      // Mettre à jour avec les insights
      await supabase
        .from('quotes')
        .update({
          ai_suggestions: analysis.suggestions,
          ai_score: analysis.conversionProbability,
          ai_insights: analysis.insights
        })
        .eq('id', quoteId)
    } catch (error) {
      console.error('Error enhancing quote with AI:', error)
    }
  }

  // ===============================
  // Business Logic
  // ===============================

  /**
   * Envoyer un devis avec email personnalisé
   */
  static async sendQuote(quoteId: string): Promise<void> {
    try {
      const quote = await this.getQuote(quoteId)

      // Générer l'email avec l'IA
      const { data: emailContent, error: emailError } = await supabase.functions.invoke('email-generator', {
        body: {
          template: 'quote',
          context: {
            quote,
            client: quote.client,
            personalization: true
          },
          tone: 'professional',
          language: 'fr'
        }
      })

      if (emailError) throw emailError

      // Envoyer l'email via Edge Function
      const { error: sendError } = await supabase.functions.invoke('send-email', {
        body: {
          to: quote.clientEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          attachments: [{
            filename: `Devis-${quote.quoteNumber}.pdf`,
            content: await this.generatePDF(quoteId)
          }]
        }
      })

      if (sendError) throw sendError

      // Mettre à jour le statut
      await this.updateQuote(quoteId, {
        status: QuoteStatus.SENT
      })

      // Mettre à jour sent_at
      await supabase
        .from('quotes')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', quoteId)
    } catch (error) {
      console.error('Error sending quote:', error)
      throw error
    }
  }

  /**
   * Marquer un devis comme vu
   */
  static async markQuoteAsViewed(quoteId: string): Promise<void> {
    try {
      await supabase
        .from('quotes')
        .update({ 
          status: 'viewed',
          viewed_at: new Date().toISOString() 
        })
        .eq('id', quoteId)
        .eq('status', 'sent') // Seulement si envoyé
    } catch (error) {
      console.error('Error marking quote as viewed:', error)
    }
  }

  /**
   * Convertir un devis en facture
   */
  static async convertToInvoice(quoteId: string): Promise<string> {
    try {
      const quote = await this.getQuote(quoteId)

      if (quote.status !== QuoteStatus.ACCEPTED) {
        throw new Error('Only accepted quotes can be converted to invoices')
      }

      // Créer la facture
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          company_id: quote.companyId,
          client_id: quote.clientId,
          client_name: quote.clientName,
          client_email: quote.clientEmail,
          amount: quote.totalAmount,
          tax_amount: quote.taxAmount,
          currency: quote.currency,
          items: quote.items,
          quote_id: quoteId,
          status: 'draft',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Mettre à jour le devis
      await supabase
        .from('quotes')
        .update({ converted_to_invoice_id: invoice.id })
        .eq('id', quoteId)

      return invoice.id
    } catch (error) {
      console.error('Error converting quote to invoice:', error)
      throw error
    }
  }

  // ===============================
  // Analytics
  // ===============================

  /**
   * Obtenir les analytics des devis
   */
  static async getQuoteAnalytics(dateRange?: { start: Date; end: Date }): Promise<QuoteAnalytics> {
    try {
      const companyId = await getCompanyId()
      if (!companyId) throw new Error('Company ID not found')

      // Appeler la fonction RPC pour les analytics
      const { data, error } = await supabase.rpc('get_quote_analytics', {
        p_company_id: companyId,
        p_start_date: dateRange?.start.toISOString(),
        p_end_date: dateRange?.end.toISOString()
      })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching quote analytics:', error)
      
      // Fallback: calculer manuellement
      const quotes = await this.getQuotes()
      return this.calculateAnalytics(quotes)
    }
  }

  // ===============================
  // Helper Methods
  // ===============================

  /**
   * Transformer les données de la DB vers le type Quote
   */
  private static transformQuoteFromDB(data: any): Quote {
    return {
      id: data.id,
      companyId: data.company_id,
      quoteNumber: data.quote_number,
      clientId: data.client_id,
      client: data.client,
      clientName: data.client_name,
      clientEmail: data.client_email,
      clientPhone: data.client_phone,
      clientAddress: data.client_address,
      status: data.status,
      validUntil: new Date(data.valid_until),
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      viewedAt: data.viewed_at ? new Date(data.viewed_at) : undefined,
      respondedAt: data.responded_at ? new Date(data.responded_at) : undefined,
      currency: data.currency,
      subtotal: data.subtotal,
      taxRate: data.tax_rate,
      taxAmount: data.tax_amount,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      discountAmount: data.discount_amount,
      totalAmount: data.total_amount,
      items: data.items,
      termsConditions: data.terms_conditions,
      notes: data.notes,
      aiGenerated: data.ai_generated,
      aiSuggestions: data.ai_suggestions,
      aiScore: data.ai_score,
      aiInsights: data.ai_insights,
      createdBy: data.created_by,
      createdByUser: data.created_by_user,
      approvedBy: data.approved_by,
      approvedByUser: data.approved_by_user,
      convertedToInvoiceId: data.converted_to_invoice_id,
      rejectionReason: data.rejection_reason,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  /**
   * Générer un PDF pour le devis
   */
  private static async generatePDF(quoteId: string): Promise<string> {
    // TODO: Implémenter la génération PDF
    // Peut utiliser une Edge Function ou une librairie côté client
    return 'base64_pdf_content'
  }

  /**
   * Calculer les analytics manuellement
   */
  private static calculateAnalytics(quotes: Quote[]): QuoteAnalytics {
    const totalQuotes = quotes.length
    const acceptedQuotes = quotes.filter(q => q.status === QuoteStatus.ACCEPTED)
    const totalValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0)
    
    return {
      totalQuotes,
      totalValue,
      conversionRate: totalQuotes > 0 ? (acceptedQuotes.length / totalQuotes) * 100 : 0,
      averageValue: totalQuotes > 0 ? totalValue / totalQuotes : 0,
      averageClosingTime: 0, // TODO: Calculer
      topProducts: [], // TODO: Extraire des items
      rejectionReasons: [], // TODO: Grouper les raisons
      monthlyTrend: [] // TODO: Calculer la tendance
    }
  }
}