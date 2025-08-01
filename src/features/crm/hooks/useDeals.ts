import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Deal, CreateDealRequest, DealSearchFilters } from '../types/crm.types'
import { CRMService } from '../services/crm.service'
import { useToast } from '@/hooks/use-toast'

interface UseDealsProps {
  filters?: DealSearchFilters
}

export function useDeals({ filters }: UseDealsProps = {}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Query for fetching deals
  const {
    data: deals,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['deals', filters],
    queryFn: () => CRMService.searchDeals(filters || {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: (data: CreateDealRequest) => CRMService.createDeal(data),
    onSuccess: (newDeal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      toast({
        title: 'Deal créé',
        description: `Le deal "${newDeal.name}" a été créé avec succès.`
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le deal: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deal> }) =>
      CRMService.updateDeal(id, data),
    onSuccess: (updatedDeal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      queryClient.invalidateQueries({ queryKey: ['deal', updatedDeal.id] })
      toast({
        title: 'Deal mis à jour',
        description: `Le deal "${updatedDeal.name}" a été mis à jour.`
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le deal: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Delete deal mutation
  const deleteDealMutation = useMutation({
    mutationFn: (id: string) => CRMService.deleteDeal(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      toast({
        title: 'Deal supprimé',
        description: 'Le deal a été supprimé avec succès.'
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer le deal: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  // Move deal to different stage
  const moveDealMutation = useMutation({
    mutationFn: ({ id, stage, notes }: { id: string; stage: string; notes?: string }) =>
      CRMService.moveDeal(id, stage, notes),
    onMutate: async ({ id, stage }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['deals'] })

      // Snapshot previous value
      const previousDeals = queryClient.getQueryData<Deal[]>(['deals', filters])

      // Optimistically update
      queryClient.setQueryData<Deal[]>(['deals', filters], (old) => {
        if (!old) return []
        return old.map(deal =>
          deal.id === id ? { ...deal, stage } : deal
        )
      })

      // Return context with snapshot
      return { previousDeals }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousDeals) {
        queryClient.setQueryData(['deals', filters], context.previousDeals)
      }
      toast({
        title: 'Erreur',
        description: `Impossible de déplacer le deal: ${err.message}`,
        variant: 'destructive'
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
    onSuccess: () => {
      toast({
        title: 'Deal déplacé',
        description: 'Le deal a été déplacé avec succès.'
      })
    }
  })

  return {
    // Data
    deals: deals || [],
    isLoading,
    error,

    // Actions
    createDeal: createDealMutation.mutate,
    updateDeal: updateDealMutation.mutate,
    deleteDeal: deleteDealMutation.mutate,
    moveDeal: moveDealMutation.mutate,
    refetch,

    // Mutation states
    isCreating: createDealMutation.isPending,
    isUpdating: updateDealMutation.isPending,
    isDeleting: deleteDealMutation.isPending,
    isMoving: moveDealMutation.isPending
  }
}