// useQuotes.ts
// Hook personnalisé pour la gestion des devis

import { useCallback } from 'react'
import { useFinanceStore } from '../store'
import { Quote, QuoteStatus } from '../types'
import { AIDevisService } from '../services'

export function useQuotes() {
  const {
    quotes,
    selectedQuote,
    isLoadingQuotes,
    setQuotes,
    addQuote,
    updateQuote,
    deleteQuote,
    selectQuote,
    setLoadingQuotes,
  } = useFinanceStore()

  const generateQuoteWithAI = useCallback(async (clientData: any, requirements: string[]) => {
    setLoadingQuotes(true)
    try {
      const result = await AIDevisService.generateDevis(clientData, requirements)
      const newQuote: Quote = {
        id: `QUOTE-${Date.now()}`,
        number: result.devisNumber,
        clientId: clientData.id || 'CLIENT-1',
        clientName: clientData.name,
        clientEmail: clientData.email,
        status: 'draft' as QuoteStatus,
        items: result.items.map((item: any) => ({
          id: `ITEM-${Date.now()}-${Math.random()}`,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountRate: 0,
          taxRate: item.taxRate || 20,
          totalAmount: item.quantity * item.unitPrice
        })),
        subtotalAmount: result.subtotal,
        discountAmount: result.discount,
        taxAmount: result.tax,
        totalAmount: result.total,
        validUntil: result.validUntil,
        terms: result.terms,
        notes: result.notes,
        isAIGenerated: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      addQuote(newQuote)
      return newQuote
    } catch (error) {
      console.error('Error generating quote with AI:', error)
      throw error
    } finally {
      setLoadingQuotes(false)
    }
  }, [addQuote, setLoadingQuotes])

  const optimizeQuote = useCallback(async (quoteId: string, objective: string) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (!quote) return null

    setLoadingQuotes(true)
    try {
      const result = await AIDevisService.optimizeDevis(quote, objective)
      const optimizedQuote = {
        ...quote,
        items: result.optimizedItems,
        totalAmount: result.newTotal,
        aiOptimizations: result.suggestions,
        updatedAt: new Date().toISOString(),
      }
      
      updateQuote(quoteId, optimizedQuote)
      return optimizedQuote
    } catch (error) {
      console.error('Error optimizing quote:', error)
      throw error
    } finally {
      setLoadingQuotes(false)
    }
  }, [quotes, updateQuote, setLoadingQuotes])

  const getQuotesByStatus = useCallback((status: QuoteStatus) => {
    return quotes.filter(quote => quote.status === status)
  }, [quotes])

  const getTotalRevenue = useCallback(() => {
    return quotes
      .filter(quote => quote.status === 'accepted')
      .reduce((sum, quote) => sum + quote.totalAmount, 0)
  }, [quotes])

  return {
    quotes,
    selectedQuote,
    isLoadingQuotes,
    generateQuoteWithAI,
    optimizeQuote,
    addQuote,
    updateQuote,
    deleteQuote,
    selectQuote,
    getQuotesByStatus,
    getTotalRevenue,
  }
}

/**
 * Hook pour un devis spécifique
 */
export function useQuote(quoteId: string) {
  const queryClient = useFinanceStore()

  const {
    data: quote,
    isLoading,
    error
  } = useFinanceStore()

  // Marquer comme vu
  const markAsViewedMutation = useCallback(() => {
    // This mutation is not directly available in useFinanceStore,
    // so it would require a separate mutation hook or direct service call.
    // For now, we'll just invalidate the query.
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quote, quoteId] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
  }, [queryClient, quoteId])

  return {
    quote,
    isLoading,
    error,
    markAsViewed: markAsViewedMutation
  }
}

/**
 * Hook pour l'amélioration IA d'un devis
 */
export function useQuoteAIEnhancement(quoteId: string) {
  const queryClient = useFinanceStore()

  const enhanceMutation = useCallback(async () => {
    // This mutation is not directly available in useFinanceStore,
    // so it would require a separate mutation hook or direct service call.
    // For now, we'll just invalidate the query.
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quote, quoteId] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
    // toast({
    //   title: 'Analyse IA terminée',
    //   description: 'Le devis a été enrichi avec des suggestions IA.'
    // })
  }, [queryClient, quoteId])

  return {
    enhance: enhanceMutation,
    isEnhancing: false // No direct loading state in useFinanceStore
  }
}