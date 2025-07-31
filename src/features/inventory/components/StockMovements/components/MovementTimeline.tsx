import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isYesterday, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Package,
  Calendar,
  Clock,
  MapPin,
  User
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import { StockMovement } from '../../../types/inventory.types'
import { MovementTimelineProps } from '../StockMovements.types'

const MOVEMENT_TYPE_ICONS = {
  in: TrendingUp,
  out: TrendingDown,
  transfer: ArrowRight,
  adjustment: Package,
  return: Package,
  damage: Package,
  theft: Package,
  count: Package,
  correction: Package,
  assembly: Package,
  disassembly: Package
}

const MOVEMENT_TYPE_COLORS = {
  in: 'bg-green-100 text-green-600',
  out: 'bg-red-100 text-red-600',
  transfer: 'bg-blue-100 text-blue-600',
  adjustment: 'bg-orange-100 text-orange-600',
  return: 'bg-purple-100 text-purple-600',
  damage: 'bg-red-100 text-red-600',
  theft: 'bg-red-100 text-red-600',
  count: 'bg-gray-100 text-gray-600',
  correction: 'bg-yellow-100 text-yellow-600',
  assembly: 'bg-indigo-100 text-indigo-600',
  disassembly: 'bg-indigo-100 text-indigo-600'
}

export const MovementTimeline: React.FC<MovementTimelineProps> = ({
  movements,
  groupBy = 'day',
  onMovementClick,
  className
}) => {
  // Group movements by date
  const groupedMovements = useMemo(() => {
    const groups: Record<string, StockMovement[]> = {}

    movements.forEach(movement => {
      const date = new Date(movement.createdAt)
      let key: string

      switch (groupBy) {
        case 'day':
          key = format(date, 'yyyy-MM-dd')
          break
        case 'week':
          key = format(date, 'yyyy-ww')
          break
        case 'month':
          key = format(date, 'yyyy-MM')
          break
        default:
          key = format(date, 'yyyy-MM-dd')
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(movement)
    })

    // Sort groups by date descending
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, movements]) => ({
        key,
        date: new Date(movements[0].createdAt),
        movements: movements.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }))
  }, [movements, groupBy])

  const formatGroupDate = (date: Date) => {
    if (groupBy === 'day') {
      if (isToday(date)) return "Aujourd'hui"
      if (isYesterday(date)) return 'Hier'
      return format(date, 'EEEE d MMMM yyyy', { locale: fr })
    }
    if (groupBy === 'week') {
      return `Semaine du ${format(date, 'd MMMM yyyy', { locale: fr })}`
    }
    return format(date, 'MMMM yyyy', { locale: fr })
  }

  return (
    <div className={cn('space-y-8', className)}>
      {groupedMovements.map((group, groupIndex) => (
        <div key={group.key} className="relative">
          {/* Date Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">
                {formatGroupDate(group.date)}
              </h3>
              <Badge variant="secondary" className="ml-auto">
                {group.movements.length} mouvement{group.movements.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative pl-12 space-y-4">
            {/* Vertical Line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            {group.movements.map((movement, index) => {
              const Icon = MOVEMENT_TYPE_ICONS[movement.type]
              const isLast = index === group.movements.length - 1

              return (
                <motion.div
                  key={movement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Timeline Dot */}
                  <div className={cn(
                    'absolute -left-7 w-10 h-10 rounded-full flex items-center justify-center',
                    MOVEMENT_TYPE_COLORS[movement.type]
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Movement Card */}
                  <Card
                    className={cn(
                      'p-4 cursor-pointer transition-all hover:shadow-md',
                      movement.status === 'cancelled' && 'opacity-60'
                    )}
                    onClick={() => onMovementClick?.(movement)}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground">
                              {movement.reference}
                            </span>
                            <Badge variant={movement.status === 'completed' ? 'default' : 'secondary'}>
                              {movement.status === 'pending' && 'En attente'}
                              {movement.status === 'confirmed' && 'Confirmé'}
                              {movement.status === 'cancelled' && 'Annulé'}
                              {movement.status === 'completed' && 'Complété'}
                            </Badge>
                          </div>
                          <h4 className="font-medium">
                            {movement.product?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            SKU: {movement.product?.sku}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            {movement.type === 'in' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : movement.type === 'out' ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <ArrowRight className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="font-semibold text-lg">
                              {movement.quantity}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {movement.product?.unitOfMeasure}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(movement.createdAt), 'HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {/* Location */}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {movement.type === 'transfer' ? (
                            <span>
                              {movement.fromWarehouse?.name} → {movement.toWarehouse?.name}
                            </span>
                          ) : (
                            <span>
                              {movement.warehouse?.name || movement.toWarehouse?.name || movement.fromWarehouse?.name}
                            </span>
                          )}
                        </div>

                        {/* User */}
                        {movement.createdBy && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{movement.createdBy.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {movement.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          "{movement.notes}"
                        </p>
                      )}

                      {/* Reason */}
                      {movement.reason && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Raison: {movement.reason}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Connection Line to Next Item */}
                  {!isLast && (
                    <div className="absolute left-5 top-full h-4 w-px bg-border" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}

      {movements.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun mouvement</h3>
          <p className="text-muted-foreground">
            Il n'y a pas encore de mouvements de stock enregistrés
          </p>
        </Card>
      )}
    </div>
  )
}