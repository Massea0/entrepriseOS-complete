import React from 'react'
import { 
  Building2, 
  Package, 
  TrendingUp, 
  AlertCircle,
  Activity,
  Layers
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WarehouseStats {
  totalWarehouses: number
  activeWarehouses: number
  totalCapacity: number
  usedCapacity: number
  utilizationRate: number
  totalZones: number
}

interface WarehouseStatsProps {
  stats: WarehouseStats
  className?: string
}

export const WarehouseStats: React.FC<WarehouseStatsProps> = ({ stats, className }) => {
  const cards = [
    {
      title: 'Total Entrepôts',
      value: stats.totalWarehouses,
      subValue: `${stats.activeWarehouses} actifs`,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Capacité Totale',
      value: stats.totalCapacity.toLocaleString(),
      subValue: 'm³',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Utilisation',
      value: `${Math.round(stats.utilizationRate)}%`,
      subValue: `${stats.usedCapacity.toLocaleString()} m³ utilisés`,
      icon: TrendingUp,
      color: stats.utilizationRate > 90 ? 'text-red-600' : stats.utilizationRate > 75 ? 'text-orange-600' : 'text-green-600',
      bgColor: stats.utilizationRate > 90 ? 'bg-red-100' : stats.utilizationRate > 75 ? 'bg-orange-100' : 'bg-green-100'
    },
    {
      title: 'Zones Totales',
      value: stats.totalZones,
      subValue: 'zones configurées',
      icon: Layers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {cards.map((card, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
              {card.subValue && (
                <p className="text-xs text-muted-foreground">{card.subValue}</p>
              )}
            </div>
            <div className={cn('p-3 rounded-lg', card.bgColor)}>
              <card.icon className={cn('h-5 w-5', card.color)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}