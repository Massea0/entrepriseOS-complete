import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  Clock,
  Package,
  AlertCircle
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { StockMovement } from '../../../types/inventory.types'
import { MovementStatsProps } from '../StockMovements.types'

export const MovementStats: React.FC<MovementStatsProps> = ({ 
  movements, 
  period = 'day',
  className 
}) => {
  // Calculate stats
  const stats = React.useMemo(() => {
    const now = new Date()
    const periodStart = new Date(now)
    
    switch (period) {
      case 'day':
        periodStart.setHours(0, 0, 0, 0)
        break
      case 'week':
        periodStart.setDate(now.getDate() - 7)
        break
      case 'month':
        periodStart.setMonth(now.getMonth() - 1)
        break
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1)
        break
    }

    const periodMovements = movements.filter(m => 
      new Date(m.createdAt) >= periodStart
    )

    const totalIn = periodMovements
      .filter(m => m.type === 'in')
      .reduce((sum, m) => sum + m.quantity, 0)
    
    const totalOut = periodMovements
      .filter(m => m.type === 'out')
      .reduce((sum, m) => sum + m.quantity, 0)
    
    const totalTransfers = periodMovements
      .filter(m => m.type === 'transfer').length
    
    const pendingCount = movements
      .filter(m => m.status === 'pending').length

    const totalValue = periodMovements
      .reduce((sum, m) => {
        const value = m.quantity * (m.product?.averageCost?.amount || 0)
        return sum + (m.type === 'out' ? -value : value)
      }, 0)

    return {
      totalMovements: periodMovements.length,
      totalIn,
      totalOut,
      totalTransfers,
      pendingCount,
      netFlow: totalIn - totalOut,
      totalValue
    }
  }, [movements, period])

  const cards = [
    {
      title: 'Mouvements totaux',
      value: stats.totalMovements,
      subValue: `Cette ${period === 'day' ? 'journée' : 'période'}`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Entrées',
      value: stats.totalIn.toLocaleString(),
      subValue: 'unités',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Sorties',
      value: stats.totalOut.toLocaleString(),
      subValue: 'unités',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Transferts',
      value: stats.totalTransfers,
      subValue: 'mouvements',
      icon: ArrowRightLeft,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'En attente',
      value: stats.pendingCount,
      subValue: stats.pendingCount > 0 ? 'à traiter' : 'tout est traité',
      icon: Clock,
      color: stats.pendingCount > 0 ? 'text-orange-600' : 'text-gray-600',
      bgColor: stats.pendingCount > 0 ? 'bg-orange-100' : 'bg-gray-100'
    },
    {
      title: 'Flux net',
      value: stats.netFlow > 0 ? `+${stats.netFlow}` : stats.netFlow.toString(),
      subValue: stats.netFlow > 0 ? 'Stock en hausse' : stats.netFlow < 0 ? 'Stock en baisse' : 'Stable',
      icon: stats.netFlow > 0 ? TrendingUp : stats.netFlow < 0 ? TrendingDown : ArrowRightLeft,
      color: stats.netFlow > 0 ? 'text-green-600' : stats.netFlow < 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: stats.netFlow > 0 ? 'bg-green-100' : stats.netFlow < 0 ? 'bg-red-100' : 'bg-gray-100'
    }
  ]

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4', className)}>
      {cards.map((card, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
              {card.subValue && (
                <p className="text-xs text-muted-foreground">{card.subValue}</p>
              )}
            </div>
            <div className={cn('p-2 rounded-lg', card.bgColor)}>
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}