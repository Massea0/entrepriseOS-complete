// useQuotes.ts
// Hook personnalisé pour la gestion des devis

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo } from 'react'
import { QuoteService } from '../services'
import type {
  Quote,
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteFilters,
  QuoteAnalytics,
  AIQuoteGenerationParams,
  QuoteStatus
} from '../types'
import { toast } from '@/hooks/use-toast'

// Clés pour React Query
const QUERY_KEYS = {
  quotes: 'quotes',
  quote: 'quote',
  analytics: 'quote-analytics'
} as const

/**
 * Hook principal pour la gestion des devis
 */
export function useQuotes(initialFilters?: QuoteFilters) {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<QuoteFilters>(initialFilters || {})

  // ===============================
  // Queries
  // ===============================

  // Récupérer tous les devis
  const {
    data: quotes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [QUERY_KEYS.quotes, filters],
    queryFn: () => QuoteService.getQuotes(filters),
    staleTime: 30000, // 30 secondes
    cacheTime: 5 * 60 * 1000 // 5 minutes
  })

  // Récupérer les analytics
  const { data: analytics } = useQuery({
    queryKey: [QUERY_KEYS.analytics],
    queryFn: () => QuoteService.getQuoteAnalytics(),
    staleTime: 60000, // 1 minute
    cacheTime: 10 * 60 * 1000 // 10 minutes
  })

  // ===============================
  // Mutations
  // ===============================

  // Créer un devis
  const createQuoteMutation = useMutation({
    mutationFn: (input: CreateQuoteInput) => QuoteService.createQuote(input),
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] })
      toast({
        title: 'Devis créé',
        description: `Le devis ${newQuote.quoteNumber} a été créé avec succès.`
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le devis: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Mettre à jour un devis
  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateQuoteInput }) =>
      QuoteService.updateQuote(id, input),
    onSuccess: (updatedQuote) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quote, updatedQuote.id] })
      toast({
        title: 'Devis mis à jour',
        description: 'Les modifications ont été enregistrées.'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le devis: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Supprimer un devis
  const deleteQuoteMutation = useMutation({
    mutationFn: (id: string) => QuoteService.deleteQuote(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] })
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.quote, deletedId] })
      toast({
        title: 'Devis supprimé',
        description: 'Le devis a été supprimé avec succès.'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer le devis: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Générer avec IA
  const generateWithAIMutation = useMutation({
    mutationFn: (params: AIQuoteGenerationParams) =>
      QuoteService.generateQuoteWithAI(params),
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] })
      toast({
        title: 'Devis généré par IA',
        description: `Le devis ${newQuote.quoteNumber} a été créé avec un score de confiance de ${newQuote.aiScore}%.`,
        variant: 'default'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur IA',
        description: `Impossible de générer le devis: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Envoyer un devis
  const sendQuoteMutation = useMutation({
    mutationFn: (quoteId: string) => QuoteService.sendQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
      toast({
        title: 'Devis envoyé',
        description: 'Le devis a été envoyé au client avec succès.'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur d\'envoi',
        description: `Impossible d'envoyer le devis: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Convertir en facture
  const convertToInvoiceMutation = useMutation({
    mutationFn: (quoteId: string) => QuoteService.convertToInvoice(quoteId),
    onSuccess: (invoiceId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
      toast({
        title: 'Conversion réussie',
        description: 'Le devis a été converti en facture.',
        action: {
          label: 'Voir la facture',
          onClick: () => window.location.href = `/finance/invoices/${invoiceId}`
        }
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur de conversion',
        description: `Impossible de convertir le devis: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // ===============================
  // Callbacks
  // ===============================

  const createQuote = useCallback(
    (input: CreateQuoteInput) => createQuoteMutation.mutate(input),
    [createQuoteMutation]
  )

  const updateQuote = useCallback(
    (id: string, input: UpdateQuoteInput) => updateQuoteMutation.mutate({ id, input }),
    [updateQuoteMutation]
  )

  const deleteQuote = useCallback(
    (id: string) => deleteQuoteMutation.mutate(id),
    [deleteQuoteMutation]
  )

  const generateWithAI = useCallback(
    (params: AIQuoteGenerationParams) => generateWithAIMutation.mutate(params),
    [generateWithAIMutation]
  )

  const sendQuote = useCallback(
    (quoteId: string) => sendQuoteMutation.mutate(quoteId),
    [sendQuoteMutation]
  )

  const convertToInvoice = useCallback(
    (quoteId: string) => convertToInvoiceMutation.mutate(quoteId),
    [convertToInvoiceMutation]
  )

  const updateStatus = useCallback(
    (quoteId: string, status: QuoteStatus) => {
      updateQuoteMutation.mutate({ id: quoteId, input: { status } })
    },
    [updateQuoteMutation]
  )

  // ===============================
  // Computed values
  // ===============================

  const stats = useMemo(() => {
    const draft = quotes.filter(q => q.status === QuoteStatus.DRAFT).length
    const sent = quotes.filter(q => q.status === QuoteStatus.SENT).length
    const viewed = quotes.filter(q => q.status === QuoteStatus.VIEWED).length
    const accepted = quotes.filter(q => q.status === QuoteStatus.ACCEPTED).length
    const rejected = quotes.filter(q => q.status === QuoteStatus.REJECTED).length
    const expired = quotes.filter(q => q.status === QuoteStatus.EXPIRED).length

    return {
      total: quotes.length,
      draft,
      sent,
      viewed,
      accepted,
      rejected,
      expired,
      pendingResponse: sent + viewed,
      conversionRate: quotes.length > 0 ? (accepted / quotes.length) * 100 : 0
    }
  }, [quotes])

  return {
    // Data
    quotes,
    analytics,
    stats,
    filters,
    
    // State
    isLoading,
    error,
    isCreating: createQuoteMutation.isLoading,
    isUpdating: updateQuoteMutation.isLoading,
    isDeleting: deleteQuoteMutation.isLoading,
    isGenerating: generateWithAIMutation.isLoading,
    isSending: sendQuoteMutation.isLoading,
    isConverting: convertToInvoiceMutation.isLoading,
    
    // Actions
    createQuote,
    updateQuote,
    deleteQuote,
    generateWithAI,
    sendQuote,
    convertToInvoice,
    updateStatus,
    setFilters,
    refetch
  }
}

/**
 * Hook pour un devis spécifique
 */
export function useQuote(quoteId: string) {
  const queryClient = useQueryClient()

  const {
    data: quote,
    isLoading,
    error
  } = useQuery({
    queryKey: [QUERY_KEYS.quote, quoteId],
    queryFn: () => QuoteService.getQuote(quoteId),
    enabled: !!quoteId,
    staleTime: 30000
  })

  // Marquer comme vu
  const markAsViewedMutation = useMutation({
    mutationFn: () => QuoteService.markQuoteAsViewed(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quote, quoteId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
    }
  })

  return {
    quote,
    isLoading,
    error,
    markAsViewed: markAsViewedMutation.mutate
  }
}

/**
 * Hook pour l'amélioration IA d'un devis
 */
export function useQuoteAIEnhancement(quoteId: string) {
  const queryClient = useQueryClient()

  const enhanceMutation = useMutation({
    mutationFn: () => QuoteService.enhanceQuoteWithAI(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quote, quoteId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.quotes] })
      toast({
        title: 'Analyse IA terminée',
        description: 'Le devis a été enrichi avec des suggestions IA.'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur IA',
        description: `Impossible d'analyser le devis: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  return {
    enhance: enhanceMutation.mutate,
    isEnhancing: enhanceMutation.isLoading
  }
}