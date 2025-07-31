import React from 'react'
import {
  Package,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Grid3X3,
  CheckCircle
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ProductStats {
  totalProducts: number
  activeProducts: number
  totalValue: number
  outOfStock: number
  lowStock: number
  categories: number
}

interface ProductStatsProps {
  stats: ProductStats
  className?: string
}

export const ProductStats: React.FC<ProductStatsProps> = ({ stats, className }) => {
  const cards = [
    {
      title: 'Total Produits',
      value: stats.totalProducts,
      subValue: `${stats.activeProducts} actifs`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Valeur Stock',
      value: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(stats.totalValue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Rupture Stock',
      value: stats.outOfStock,
      subValue: stats.outOfStock > 0 ? 'produits' : 'Tout en stock',
      icon: AlertCircle,
      color: stats.outOfStock > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: stats.outOfStock > 0 ? 'bg-red-100' : 'bg-gray-100'
    },
    {
      title: 'Stock Faible',
      value: stats.lowStock,
      subValue: stats.lowStock > 0 ? 'à réapprovisionner' : 'Stock optimal',
      icon: TrendingUp,
      color: stats.lowStock > 0 ? 'text-orange-600' : 'text-green-600',
      bgColor: stats.lowStock > 0 ? 'bg-orange-100' : 'bg-green-100'
    },
    {
      title: 'Catégories',
      value: stats.categories,
      icon: Grid3X3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Disponibilité',
      value: `${Math.round(((stats.totalProducts - stats.outOfStock) / stats.totalProducts) * 100)}%`,
      subValue: 'en stock',
      icon: CheckCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
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