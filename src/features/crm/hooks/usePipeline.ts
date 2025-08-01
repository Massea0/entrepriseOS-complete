import { useState, useMemo, useCallback } from 'react'
import { Deal, DealStage, Pipeline, Contact } from '../types/crm.types'
import { CRMUtils } from '../utils/crm.utils'

interface PipelineMetrics {
  totalValue: number
  weightedValue: number
  winRate: number
  averageDealSize: number
  averageSalesCycle: number
  totalDeals: number
}

interface UsePipelineProps {
  pipeline: Pipeline
  deals: Deal[]
  contacts: Contact[]
}

interface UsePipelineReturn {
  dealsByStage: Record<DealStage, Deal[]>
  pipelineMetrics: PipelineMetrics
  selectedDeal: Deal | null
  setSelectedDeal: (deal: Deal | null) => void
  isFormOpen: boolean
  setIsFormOpen: (open: boolean) => void
  isViewModalOpen: boolean
  setIsViewModalOpen: (open: boolean) => void
  selectedStage: DealStage
  setSelectedStage: (stage: DealStage) => void
  handleDealDrop: (dealId: string, newStage: DealStage) => void
  handleAddDeal: (stage: DealStage) => void
  handleEditDeal: (deal: Deal) => void
  handleViewDeal: (deal: Deal) => void
}

export function usePipeline({ pipeline, deals, contacts }: UsePipelineProps): UsePipelineReturn {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<DealStage>('lead')

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<DealStage, Deal[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: []
    }
    
    if (deals && Array.isArray(deals)) {
      deals.forEach(deal => {
        const stage = deal.stage as DealStage
        if (grouped[stage]) {
          grouped[stage].push(deal)
        }
      })
    }
    
    return grouped
  }, [deals])

  // Calculate pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const safeDeals = deals || []
    const totalValue = safeDeals.reduce((sum, deal) => sum + deal.value.amount, 0)
    const weightedValue = CRMUtils.calculateWeightedValue(safeDeals)
    const winRate = CRMUtils.calculateWinRate(safeDeals)
    const averageDealSize = safeDeals.length > 0 ? totalValue / safeDeals.length : 0
    const averageSalesCycle = CRMUtils.calculateAverageSalesCycle(safeDeals)

    return {
      totalValue,
      weightedValue,
      winRate,
      averageDealSize,
      averageSalesCycle,
      totalDeals: safeDeals.length
    }
  }, [deals])

  const handleDealDrop = useCallback((dealId: string, newStage: DealStage) => {
    // TODO: Implement deal stage update
    console.log('Move deal', dealId, 'to stage', newStage)
  }, [])

  const handleAddDeal = useCallback((stage: DealStage) => {
    setSelectedStage(stage)
    setSelectedDeal(null)
    setIsFormOpen(true)
  }, [])

  const handleEditDeal = useCallback((deal: Deal) => {
    setSelectedDeal(deal)
    setIsFormOpen(true)
  }, [])

  const handleViewDeal = useCallback((deal: Deal) => {
    setSelectedDeal(deal)
    setIsViewModalOpen(true)
  }, [])

  return {
    dealsByStage,
    pipelineMetrics,
    selectedDeal,
    setSelectedDeal,
    isFormOpen,
    setIsFormOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    selectedStage,
    setSelectedStage,
    handleDealDrop,
    handleAddDeal,
    handleEditDeal,
    handleViewDeal
  }
}