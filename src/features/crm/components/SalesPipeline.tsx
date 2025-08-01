'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCwIcon, FilterIcon } from 'lucide-react'
import type { Deal, Pipeline, Contact } from '../types/crm.types'

// Import des composants extraits
import { PipelineStage } from './PipelineStage'
import { DealForm } from './DealForm'
import { PipelineMetrics } from './PipelineMetrics'

// Import des hooks et utils
import { usePipeline } from '../hooks/usePipeline'
import { CRMUtils } from '../utils/crm.utils'
import { DEFAULT_PIPELINE, MOCK_DEALS, MOCK_CONTACTS } from '../mocks/crm.mocks'

interface SalesPipelineProps {
  pipeline?: Pipeline
  deals?: Deal[]
  contacts?: Contact[]
  onCreateDeal?: (deal: Partial<Deal>) => void
  onUpdateDeal?: (deal: Deal) => void
  onDeleteDeal?: (dealId: string) => void
  isLoading?: boolean
}

export const SalesPipeline: React.FC<SalesPipelineProps> = ({
  pipeline = DEFAULT_PIPELINE,
  deals = MOCK_DEALS as Deal[],
  contacts = MOCK_CONTACTS,
  onCreateDeal,
  onUpdateDeal,
  onDeleteDeal,
  isLoading = false
}) => {
  // Utilisation du hook personnalisé
  const {
    dealsByStage,
    pipelineMetrics,
    selectedDeal,
    setSelectedDeal,
    isFormOpen,
    setIsFormOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    selectedStage,
    handleDealDrop,
    handleAddDeal,
    handleEditDeal,
    handleViewDeal
  } = usePipeline({ pipeline, deals, contacts })

  // Gestion des filtres
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterPriority, setFilterPriority] = React.useState<string>('all')
  const [filterOwner, setFilterOwner] = React.useState<string>('all')

  // Filtrage des deals
  const filteredDealsByStage = React.useMemo(() => {
    const filtered = { ...dealsByStage }
    
    Object.keys(filtered).forEach(stage => {
      filtered[stage as keyof typeof filtered] = filtered[stage as keyof typeof filtered].filter(deal => {
        const matchSearch = searchTerm === '' || 
          deal.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchPriority = filterPriority === 'all' || deal.priority === filterPriority
        const matchOwner = filterOwner === 'all' || deal.ownerId === filterOwner
        
        return matchSearch && matchPriority && matchOwner
      })
    })
    
    return filtered
  }, [dealsByStage, searchTerm, filterPriority, filterOwner])

  // Gestion de la soumission du formulaire
  const handleFormSubmit = (dealData: Partial<Deal>) => {
    if (selectedDeal) {
      onUpdateDeal?.({ ...selectedDeal, ...dealData } as Deal)
    } else {
      onCreateDeal?.(dealData)
    }
    setSelectedDeal(null)
    setIsFormOpen(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un deal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="low">Faible</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterOwner} onValueChange={setFilterOwner}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="mock-user-admin">Admin</SelectItem>
            <SelectItem value="mock-user-manager">Manager</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <FilterIcon className="h-4 w-4 mr-2" />
          Plus de filtres
        </Button>

        <Button variant="outline" size="sm">
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Métriques du pipeline */}
      <PipelineMetrics metrics={pipelineMetrics} />

      {/* Pipeline stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pipeline.stages.map(stage => {
          const stageDeals = filteredDealsByStage[stage.id as keyof typeof filteredDealsByStage] || []
          const stageTotalValue = stageDeals.reduce((sum, deal) => sum + deal.value.amount, 0)
          
          return (
            <PipelineStage
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              contacts={contacts}
              color={CRMUtils.getStageColorHex(stage.id)}
              totalValue={stageTotalValue}
              onAddDeal={handleAddDeal}
              onEditDeal={handleEditDeal}
              onViewDeal={handleViewDeal}
              onMoveDeal={handleDealDrop}
            />
          )
        })}
      </div>

      {/* Formulaire de deal */}
      <DealForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedDeal(null)
        }}
        onSubmit={handleFormSubmit}
        initialDeal={selectedDeal}
        initialStage={selectedStage}
        contacts={contacts}
      />

      {/* Modal de vue du deal */}
      {isViewModalOpen && selectedDeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{selectedDeal.name}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valeur</p>
                  <p className="text-lg font-semibold">
                    {CRMUtils.formatCurrency(selectedDeal.value.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Probabilité</p>
                  <p className="text-lg font-semibold">{selectedDeal.probability}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priorité</p>
                  <p className="text-lg font-semibold capitalize">{selectedDeal.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Étape</p>
                  <p className="text-lg font-semibold">
                    {pipeline.stages.find(s => s.id === selectedDeal.stage)?.name}
                  </p>
                </div>
              </div>
              
              {selectedDeal.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-gray-700">{selectedDeal.description}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false)
                    setSelectedDeal(null)
                  }}
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEditDeal(selectedDeal)
                  }}
                >
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}