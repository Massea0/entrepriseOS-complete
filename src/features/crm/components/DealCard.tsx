import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MoreVerticalIcon,
  EditIcon,
  EyeIcon,
  DollarSignIcon,
  CalendarIcon,
  AlertCircleIcon
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils/cn'
import { Deal, DealStage, Contact } from '../types/crm.types'
import { CRMUtils, FinanceUtils } from '../utils/crm.utils'

interface DealCardProps {
  deal: Deal
  contacts: Contact[]
  onEdit?: (deal: Deal) => void
  onView?: (deal: Deal) => void
  onMove?: (dealId: string, stage: DealStage) => void
  className?: string
}

export const DealCard: React.FC<DealCardProps> = ({ 
  deal, 
  contacts, 
  onEdit, 
  onView, 
  onMove, 
  className 
}) => {
  const [isDragging, setIsDragging] = useState(false)
  
  const daysUntilClose = CRMUtils.daysUntilClose(deal.expectedCloseDate)
  const isOverdue = CRMUtils.isDealOverdue(deal)
  const dealAge = CRMUtils.calculateDealAge(deal)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', deal.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const contact = contacts.find(c => c.id === deal.contactId)

  return (
    <Card
      className={cn(
        'cursor-move transition-all hover:shadow-md group',
        isDragging && 'opacity-50 rotate-2',
        isOverdue && 'border-red-200 bg-red-50/50',
        className
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm line-clamp-2">
              {deal.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {CRMUtils.formatContactName(contact || deal.contactId)}
            </p>
            {deal.companyId && (
              <p className="text-xs text-muted-foreground">
                Company {deal.companyId}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <Badge className={CRMUtils.getDealPriorityColor(deal.priority)}>
              {deal.priority}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                >
                  <MoreVerticalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(deal)}>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(deal)}>
                  <EditIcon className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Value and Probability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-lg font-bold">
            <DollarSignIcon className="h-4 w-4 text-green-600" />
            <span>{FinanceUtils.formatMoney(deal.value)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {deal.probability}% prob.
          </div>
        </div>

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {deal.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                +{deal.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            <span className={cn(
              isOverdue && 'text-red-600 font-medium'
            )}>
              {isOverdue ? (
                <>
                  <AlertCircleIcon className="h-3 w-3 inline mr-1" />
                  En retard de {Math.abs(daysUntilClose)}j
                </>
              ) : (
                `${daysUntilClose}j restants`
              )}
            </span>
          </div>
          <span className="text-muted-foreground">
            Créé il y a {dealAge}j
          </span>
        </div>
      </CardContent>
    </Card>
  )
}