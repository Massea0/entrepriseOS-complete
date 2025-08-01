// useContracts.ts
// Hook personnalisé pour la gestion des contrats

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo } from 'react'
import { ContractService } from '../services'
import type {
  Contract,
  CreateContractInput,
  UpdateContractInput,
  ContractFilters,
  ContractAnalytics,
  AIContractAnalysisParams,
  AIContractAnalysisResponse,
  ContractStatus,
  ContractTemplate,
  Signature
} from '../types'
import { toast } from '@/hooks/use-toast'

// Clés pour React Query
const QUERY_KEYS = {
  contracts: 'contracts',
  contract: 'contract',
  templates: 'contract-templates',
  analytics: 'contract-analytics'
} as const

/**
 * Hook principal pour la gestion des contrats
 */
export function useContracts(initialFilters?: ContractFilters) {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<ContractFilters>(initialFilters || {})

  // ===============================
  // Queries
  // ===============================

  // Récupérer tous les contrats
  const {
    data: contracts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [QUERY_KEYS.contracts, filters],
    queryFn: () => ContractService.getContracts(filters),
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000
  })

  // Récupérer les analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: [QUERY_KEYS.analytics],
    queryFn: () => ContractService.getContractAnalytics(),
    staleTime: 60000,
    cacheTime: 10 * 60 * 1000
  })

  // ===============================
  // Mutations
  // ===============================

  // Créer un contrat
  const createContractMutation = useMutation({
    mutationFn: (input: CreateContractInput) => ContractService.createContract(input),
    onSuccess: (newContract) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contracts] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] })
      toast({
        title: 'Contrat créé',
        description: `Le contrat ${newContract.contractNumber} a été créé avec succès.`
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le contrat: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Mettre à jour un contrat
  const updateContractMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContractInput }) =>
      ContractService.updateContract(id, input),
    onSuccess: (updatedContract) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contracts] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contract, updatedContract.id] })
      toast({
        title: 'Contrat mis à jour',
        description: 'Les modifications ont été enregistrées.'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le contrat: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Supprimer un contrat
  const deleteContractMutation = useMutation({
    mutationFn: (id: string) => ContractService.deleteContract(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contracts] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] })
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.contract, deletedId] })
      toast({
        title: 'Contrat supprimé',
        description: 'Le contrat a été supprimé avec succès.'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer le contrat: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Analyser avec IA
  const analyzeWithAIMutation = useMutation({
    mutationFn: (contractId: string) => ContractService.analyzeContractWithAI(contractId),
    onSuccess: (analysis, contractId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contract, contractId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contracts] })
      
      const riskLevel = analysis.riskScore > 75 ? 'critique' :
                       analysis.riskScore > 50 ? 'élevé' :
                       analysis.riskScore > 25 ? 'moyen' : 'faible'
      
      toast({
        title: 'Analyse IA terminée',
        description: `Score de risque: ${analysis.riskScore}/100 (${riskLevel})`,
        variant: analysis.riskScore > 50 ? 'destructive' : 'default'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur IA',
        description: `Impossible d'analyser le contrat: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Initier signature électronique
  const initiateSignatureMutation = useMutation({
    mutationFn: ({ contractId, signers }: {
      contractId: string
      signers: Array<{ email: string; name: string; role: string; company?: string }>
    }) => ContractService.initiateESignature(contractId, signers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contracts] })
      toast({
        title: 'Workflow de signature initié',
        description: 'Les demandes de signature ont été envoyées.'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'initier la signature: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // ===============================
  // Callbacks
  // ===============================

  const createContract = useCallback(
    (input: CreateContractInput) => createContractMutation.mutate(input),
    [createContractMutation]
  )

  const updateContract = useCallback(
    (id: string, input: UpdateContractInput) => updateContractMutation.mutate({ id, input }),
    [updateContractMutation]
  )

  const deleteContract = useCallback(
    (id: string) => deleteContractMutation.mutate(id),
    [deleteContractMutation]
  )

  const analyzeContract = useCallback(
    (contractId: string) => analyzeWithAIMutation.mutate(contractId),
    [analyzeWithAIMutation]
  )

  const initiateSignature = useCallback(
    (contractId: string, signers: Array<{ email: string; name: string; role: string; company?: string }>) =>
      initiateSignatureMutation.mutate({ contractId, signers }),
    [initiateSignatureMutation]
  )

  const updateStatus = useCallback(
    (contractId: string, status: ContractStatus) => {
      updateContractMutation.mutate({ id: contractId, input: { status } })
    },
    [updateContractMutation]
  )

  // ===============================
  // Computed values
  // ===============================

  const stats = useMemo(() => {
    const draft = contracts.filter(c => c.status === ContractStatus.DRAFT).length
    const active = contracts.filter(c => c.status === ContractStatus.ACTIVE).length
    const expired = contracts.filter(c => c.status === ContractStatus.EXPIRED).length
    const pendingSignature = contracts.filter(c => c.status === ContractStatus.PENDING_SIGNATURE).length
    
    const totalValue = contracts
      .filter(c => c.status === ContractStatus.ACTIVE)
      .reduce((sum, c) => sum + (c.contractValue || 0), 0)

    return {
      total: contracts.length,
      draft,
      active,
      expired,
      pendingSignature,
      totalValue
    }
  }, [contracts])

  const riskAlerts = useMemo(() => {
    return contracts
      .filter(c => c.riskScore && c.riskScore > 50)
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
      .slice(0, 5)
  }, [contracts])

  return {
    // Data
    contracts,
    analytics,
    stats,
    riskAlerts,
    filters,
    
    // State
    isLoading,
    isLoadingAnalytics,
    error,
    isCreating: createContractMutation.isLoading,
    isUpdating: updateContractMutation.isLoading,
    isDeleting: deleteContractMutation.isLoading,
    isAnalyzing: analyzeWithAIMutation.isLoading,
    isInitiatingSignature: initiateSignatureMutation.isLoading,
    
    // Actions
    createContract,
    updateContract,
    deleteContract,
    analyzeContract,
    initiateSignature,
    updateStatus,
    setFilters,
    refetch
  }
}

/**
 * Hook pour un contrat spécifique
 */
export function useContract(contractId: string) {
  const queryClient = useQueryClient()

  const {
    data: contract,
    isLoading,
    error
  } = useQuery({
    queryKey: [QUERY_KEYS.contract, contractId],
    queryFn: () => ContractService.getContract(contractId),
    enabled: !!contractId,
    staleTime: 30000
  })

  // Enregistrer une signature
  const recordSignatureMutation = useMutation({
    mutationFn: ({ signerEmail, signature }: { signerEmail: string; signature: string }) =>
      ContractService.recordSignature(contractId, signerEmail, signature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contract, contractId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contracts] })
      toast({
        title: 'Signature enregistrée',
        description: 'La signature a été enregistrée avec succès.'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'enregistrer la signature: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Calculer le score de risque
  const calculateRiskMutation = useMutation({
    mutationFn: () => ContractService.calculateRiskScore(contractId),
    onSuccess: (riskScore) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contract, contractId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contracts] })
      toast({
        title: 'Score de risque calculé',
        description: `Score: ${riskScore}/100`
      })
    }
  })

  return {
    contract,
    isLoading,
    error,
    recordSignature: recordSignatureMutation.mutate,
    calculateRisk: calculateRiskMutation.mutate,
    isRecordingSignature: recordSignatureMutation.isLoading,
    isCalculatingRisk: calculateRiskMutation.isLoading
  }
}

/**
 * Hook pour les templates de contrat
 */
export function useContractTemplates(type?: string) {
  const queryClient = useQueryClient()

  const {
    data: templates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: [QUERY_KEYS.templates, type],
    queryFn: () => ContractService.getTemplates(type),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Générer un contrat depuis un template
  const generateFromTemplateMutation = useMutation({
    mutationFn: ({
      templateId,
      clientId,
      customFields
    }: {
      templateId: string
      clientId: string
      customFields: Record<string, any>
    }) => ContractService.generateContractFromTemplate(templateId, clientId, customFields),
    onSuccess: (newContract) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.contracts] })
      toast({
        title: 'Contrat généré',
        description: `Le contrat ${newContract.contractNumber} a été créé depuis le template.`
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de générer le contrat: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  return {
    templates,
    isLoading,
    error,
    generateFromTemplate: generateFromTemplateMutation.mutate,
    isGenerating: generateFromTemplateMutation.isLoading
  }
}

/**
 * Hook pour l'analyse IA d'un contrat
 */
export function useContractAnalysis() {
  const analyzeMutation = useMutation({
    mutationFn: (params: AIContractAnalysisParams) =>
      ContractService.analyzeContractWithAI(params.contractId!),
    onSuccess: (analysis) => {
      toast({
        title: 'Analyse complète',
        description: `${analysis.recommendations.length} recommandations générées.`
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur d\'analyse',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  return {
    analyze: analyzeMutation.mutate,
    analysis: analyzeMutation.data,
    isAnalyzing: analyzeMutation.isLoading,
    error: analyzeMutation.error
  }
}