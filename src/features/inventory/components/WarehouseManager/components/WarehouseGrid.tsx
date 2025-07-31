import React from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  MapPin, 
  Package, 
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { cn } from '@/lib/utils'

import { Warehouse } from '../../../types/inventory.types'
import { WarehouseGridProps } from '../WarehouseManager.types'
import { CapacityIndicator } from './CapacityIndicator'

export const WarehouseGrid: React.FC<WarehouseGridProps> = ({
  warehouses,
  selectedWarehouseId,
  onWarehouseSelect,
  onWarehouseEdit,
  onWarehouseDelete,
  isLoading
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {warehouses.map((warehouse, index) => (
        <motion.div
          key={warehouse.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className={cn(
              'p-6 cursor-pointer transition-all hover:shadow-lg',
              selectedWarehouseId === warehouse.id && 'ring-2 ring-primary'
            )}
            onClick={() => onWarehouseSelect(warehouse)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  warehouse.status === 'active' ? 'bg-primary/10' : 'bg-muted'
                )}>
                  <Building2 className={cn(
                    'h-6 w-6',
                    warehouse.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{warehouse.name}</h3>
                  <p className="text-sm text-muted-foreground">{warehouse.code}</p>
                </div>
              </div>
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
            </div>

            <div className="space-y-3">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
                  {warehouse.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Localisation</span>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3" />
                  {warehouse.address?.city || 'Non défini'}
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Capacité</span>
                  <span className="text-sm font-medium">
                    {Math.round((warehouse.usedCapacity || 0) / (warehouse.totalCapacity || 1) * 100)}%
                  </span>
                </div>
                <CapacityIndicator
                  used={warehouse.usedCapacity || 0}
                  total={warehouse.totalCapacity || 0}
                  size="sm"
                />
              </div>

              {/* Zones */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Zones</span>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{warehouse.zones?.length || 0}</span>
                </div>
              </div>

              {/* Analytics Preview */}
              {warehouse.analytics && (
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rotation stock</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="font-medium">{warehouse.analytics.stockTurnover || 0}x</span>
                    </div>
                  </div>
                  {warehouse.analytics.lowStockItems && warehouse.analytics.lowStockItems > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>{warehouse.analytics.lowStockItems} articles en rupture</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}