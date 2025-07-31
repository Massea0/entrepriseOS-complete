import React from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  MapPin, 
  Package, 
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
  Clock,
  Users
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { cn } from '@/lib/utils'

import { Warehouse } from '../../../types/inventory.types'
import { CapacityIndicator } from './CapacityIndicator'

interface WarehouseListProps {
  warehouses: Warehouse[]
  selectedWarehouseId?: string
  onWarehouseSelect: (warehouse: Warehouse) => void
  onWarehouseEdit?: (warehouse: Warehouse) => void
  onWarehouseDelete?: (warehouse: Warehouse) => void
}

export const WarehouseList: React.FC<WarehouseListProps> = ({
  warehouses,
  selectedWarehouseId,
  onWarehouseSelect,
  onWarehouseEdit,
  onWarehouseDelete
}) => {
  if (!warehouses.length) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun entrepôt trouvé</h3>
        <p className="text-muted-foreground">
          Créez votre premier entrepôt pour commencer à gérer votre inventaire
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {warehouses.map((warehouse, index) => (
        <motion.div
          key={warehouse.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className={cn(
              'p-4 cursor-pointer transition-all hover:shadow-md',
              selectedWarehouseId === warehouse.id && 'ring-2 ring-primary'
            )}
            onClick={() => onWarehouseSelect(warehouse)}
          >
            <div className="flex items-center gap-4">
              {/* Icon and Status */}
              <div className={cn(
                'p-3 rounded-lg shrink-0',
                warehouse.status === 'active' ? 'bg-primary/10' : 'bg-muted'
              )}>
                <Building2 className={cn(
                  'h-6 w-6',
                  warehouse.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{warehouse.name}</h3>
                      <Badge 
                        variant={warehouse.status === 'active' ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {warehouse.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono">{warehouse.code}</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {warehouse.address?.city || 'Non défini'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {warehouse.zones?.length || 0} zones
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="w-32 shrink-0">
                    <CapacityIndicator
                      used={warehouse.usedCapacity || 0}
                      total={warehouse.totalCapacity || 0}
                      size="sm"
                      showPercentage
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            onWarehouseEdit?.(warehouse)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            onWarehouseDelete?.(warehouse)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Additional Info */}
                {warehouse.operatingHours && (
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {warehouse.operatingHours.monday?.open} - {warehouse.operatingHours.monday?.close}
                    </div>
                    {warehouse.contact?.name && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {warehouse.contact.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}