import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PlusCircleIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Deal, DealStage, Contact } from '../types/crm.types'
import { CRMUtils } from '../utils/crm.utils'
import { DealCard } from './DealCard'

interface PipelineStageProps {
  stage: {
    id: string
    name: string
    probability: number
  }
  deals: Deal[]
  contacts: Contact[]
  color: string
  totalValue: number
  onAddDeal: (stage: DealStage) => void
  onEditDeal: (deal: Deal) => void
  onViewDeal: (deal: Deal) => void
  onMoveDeal: (dealId: string, newStage: DealStage) => void
}

export const PipelineStage: React.FC<PipelineStageProps> = ({
  stage,
  deals,
  contacts,
  color,
  totalValue,
  onAddDeal,
  onEditDeal,
  onViewDeal,
  onMoveDeal
}) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const dealId = e.dataTransfer.getData('text/plain')
    if (dealId) {
      onMoveDeal(dealId, stage.id as DealStage)
    }
  }

  return (
    <Card 
      className={cn(
        "flex-1 transition-all duration-200",
        isDragOver && "ring-2 ring-primary scale-[1.02]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h3 className="font-medium">{stage.name}</h3>
              <span className="text-xs text-muted-foreground">
                ({deals.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddDeal(stage.id as DealStage)}
              className="h-7"
            >
              <PlusCircleIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Stage metrics */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">
                {CRMUtils.formatCurrency(totalValue)}
              </span>
            </div>
            <Progress 
              value={stage.probability} 
              className="h-1.5"
            />
            <div className="text-xs text-right text-muted-foreground">
              {stage.probability}% de probabilité
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {deals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucun deal dans cette étape
            </div>
          ) : (
            deals.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                contacts={contacts}
                onEdit={onEditDeal}
                onView={onViewDeal}
                onMove={onMoveDeal}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}