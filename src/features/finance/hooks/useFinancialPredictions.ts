// useFinancialPredictions.ts
// Hook pour les prédictions financières avec IA

import { useQuery, useMutation } from '@tanstack/react-query'
import { useState, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getCompanyId } from '@/lib/supabase'
import type { FinancialPrediction, FinancialInsight, FinanceDashboardData } from '../types'
import { toast } from '@/hooks/use-toast'

interface PredictionTimeframe {
  timeframe: 'week' | 'month' | 'quarter' | 'year'
  label: string
  days: number
}

const TIMEFRAMES: PredictionTimeframe[] = [
  { timeframe: 'week', label: 'Semaine', days: 7 },
  { timeframe: 'month', label: 'Mois', days: 30 },
  { timeframe: 'quarter', label: 'Trimestre', days: 90 },
  { timeframe: 'year', label: 'Année', days: 365 }
]

/**
 * Hook pour les prédictions financières avec IA
 */
export function useFinancialPredictions(
  initialTimeframe: 'week' | 'month' | 'quarter' | 'year' = 'quarter'
) {
  const [timeframe, setTimeframe] = useState(initialTimeframe)

  // Récupérer les prédictions
  const {
    data: predictions,
    isLoading: isLoadingPredictions,
    error: predictionsError,
    refetch: refetchPredictions
  } = useQuery({
    queryKey: ['financial-predictions', timeframe],
    queryFn: async () => {
      const companyId = await getCompanyId()
      if (!companyId) throw new Error('Company ID not found')

      const { data, error } = await supabase.functions.invoke('financial-predictions', {
        body: {
          companyId,
          timeframe,
          includeInsights: true,
          includeRecommendations: true
        }
      })

      if (error) throw error
      return data as {
        predictions: FinancialPrediction[]
        insights: FinancialInsight[]
        dashboardData: FinanceDashboardData
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  })

  // Générer un rapport de prédiction
  const generateReportMutation = useMutation({
    mutationFn: async (format: 'pdf' | 'excel' | 'csv') => {
      const companyId = await getCompanyId()
      
      const { data, error } = await supabase.functions.invoke('generate-financial-report', {
        body: {
          companyId,
          timeframe,
          format,
          includePredictions: true,
          includeCharts: true
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Télécharger le rapport
      const blob = new Blob([data.content], { type: data.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-financier-${timeframe}.${data.format}`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Rapport généré',
        description: 'Le rapport a été téléchargé avec succès.'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de générer le rapport: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Demander une analyse approfondie
  const requestDeepAnalysisMutation = useMutation({
    mutationFn: async (metric: string) => {
      const companyId = await getCompanyId()
      
      const { data, error } = await supabase.functions.invoke('deep-financial-analysis', {
        body: {
          companyId,
          metric,
          timeframe,
          analyzeFactors: true,
          generateScenarios: true
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: (analysis) => {
      toast({
        title: 'Analyse approfondie',
        description: `${analysis.factors.length} facteurs identifiés, ${analysis.scenarios.length} scénarios générés.`
      })
    }
  })

  // Exécuter une action recommandée
  const executeRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { data, error } = await supabase.functions.invoke('execute-financial-action', {
        body: {
          recommendationId,
          validate: true
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      refetchPredictions()
      toast({
        title: 'Action exécutée',
        description: 'La recommandation a été appliquée avec succès.'
      })
    }
  })

  // Métriques calculées
  const metrics = useMemo(() => {
    if (!predictions) return null

    const { dashboardData } = predictions

    return {
      // Variation des revenus
      revenueGrowth: dashboardData.revenue.change,
      revenueGrowthLabel: dashboardData.revenue.change > 0 ? 'en hausse' : 'en baisse',
      
      // Santé financière
      healthScore: dashboardData.healthScore.overall,
      healthLabel: dashboardData.healthScore.overall >= 80 ? 'Excellente' :
                   dashboardData.healthScore.overall >= 60 ? 'Bonne' :
                   dashboardData.healthScore.overall >= 40 ? 'Moyenne' : 'Faible',
      
      // Trésorerie
      cashRunway: dashboardData.cashFlow.runway,
      cashAlert: dashboardData.cashFlow.runway < 3,
      
      // Efficacité
      collectionPeriod: dashboardData.receivables.averageCollectionPeriod,
      paymentPeriod: dashboardData.payables.averagePaymentPeriod,
      workingCapital: dashboardData.receivables.total - dashboardData.payables.total
    }
  }, [predictions])

  // Insights prioritaires
  const priorityInsights = useMemo(() => {
    if (!predictions) return []
    
    return predictions.insights
      .filter(insight => insight.priority === 'high' || insight.priority === 'critical')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      .slice(0, 5)
  }, [predictions])

  // Actions recommandées
  const recommendedActions = useMemo(() => {
    if (!predictions) return []
    
    return predictions.insights
      .flatMap(insight => insight.recommendations.map(rec => ({
        id: `${insight.id}-${rec}`,
        insightId: insight.id,
        action: rec,
        priority: insight.priority,
        impact: insight.impact
      })))
      .slice(0, 10)
  }, [predictions])

  // Callbacks
  const generateReport = useCallback(
    (format: 'pdf' | 'excel' | 'csv') => generateReportMutation.mutate(format),
    [generateReportMutation]
  )

  const analyzeMetric = useCallback(
    (metric: string) => requestDeepAnalysisMutation.mutate(metric),
    [requestDeepAnalysisMutation]
  )

  const executeAction = useCallback(
    (recommendationId: string) => executeRecommendationMutation.mutate(recommendationId),
    [executeRecommendationMutation]
  )

  return {
    // Data
    predictions: predictions?.predictions || [],
    insights: predictions?.insights || [],
    dashboardData: predictions?.dashboardData,
    metrics,
    priorityInsights,
    recommendedActions,
    
    // State
    timeframe,
    timeframes: TIMEFRAMES,
    isLoading: isLoadingPredictions,
    error: predictionsError,
    isGeneratingReport: generateReportMutation.isLoading,
    isAnalyzing: requestDeepAnalysisMutation.isLoading,
    isExecutingAction: executeRecommendationMutation.isLoading,
    
    // Actions
    setTimeframe,
    generateReport,
    analyzeMetric,
    executeAction,
    refetch: refetchPredictions
  }
}

/**
 * Hook pour les alertes financières en temps réel
 */
export function useFinancialAlerts() {
  const [alerts, setAlerts] = useState<Array<{
    id: string
    type: 'warning' | 'danger' | 'info'
    title: string
    message: string
    timestamp: Date
  }>>([])

  // S'abonner aux alertes en temps réel
  useQuery({
    queryKey: ['financial-alerts-subscription'],
    queryFn: async () => {
      const companyId = await getCompanyId()
      if (!companyId) return null

      const channel = supabase
        .channel(`financial-alerts-${companyId}`)
        .on('broadcast', { event: 'financial-alert' }, (payload) => {
          setAlerts(prev => [{
            id: crypto.randomUUID(),
            type: payload.payload.type,
            title: payload.payload.title,
            message: payload.payload.message,
            timestamp: new Date()
          }, ...prev].slice(0, 10)) // Garder max 10 alertes

          // Toast pour les alertes critiques
          if (payload.payload.type === 'danger') {
            toast({
              title: payload.payload.title,
              description: payload.payload.message,
              variant: 'destructive'
            })
          }
        })
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    },
    staleTime: Infinity
  })

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])

  const clearAllAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return {
    alerts,
    dismissAlert,
    clearAllAlerts
  }
}