import React from 'react'
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Send,
  Package,
  TrendingUp,
  CreditCard
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  sentOrders: number
  receivedOrders: number
  totalAmount: number
  pendingAmount: number
}

interface OrderStatsProps {
  stats: OrderStats
  className?: string
}

export const OrderStats: React.FC<OrderStatsProps> = ({ stats, className }) => {
  const cards = [
    {
      title: 'Total Commandes',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'En attente',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Approuvées',
      value: stats.approvedOrders,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Envoyées',
      value: stats.sentOrders,
      icon: Send,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Reçues',
      value: stats.receivedOrders,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Montant Total',
      value: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(stats.totalAmount),
      subValue: stats.pendingAmount > 0 ? `${new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(stats.pendingAmount)} en attente` : undefined,
      icon: CreditCard,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
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