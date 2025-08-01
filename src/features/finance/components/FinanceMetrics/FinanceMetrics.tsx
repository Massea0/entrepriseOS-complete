'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  DollarSignIcon, 
  TrendingUpIcon, 
  AlertCircleIcon,
  CheckCircleIcon 
} from 'lucide-react'
import type { Money } from '../../types/finance.types'
import { formatCurrency } from '../../utils/finance.utils'

interface FinanceMetricsProps {
  totalAmount: Money
  paidAmount: Money
  overdueAmount: Money
  invoiceCount: {
    total: number
    draft: number
    sent: number
    paid: number
    overdue: number
  }
}

export const FinanceMetrics: React.FC<FinanceMetricsProps> = ({
  totalAmount,
  paidAmount,
  overdueAmount,
  invoiceCount
}) => {
  const metrics = [
    {
      title: 'Montant Total',
      value: formatCurrency(totalAmount.amount, totalAmount.currency),
      icon: DollarSignIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${invoiceCount.total} factures`
    },
    {
      title: 'Montant Payé',
      value: formatCurrency(paidAmount.amount, paidAmount.currency),
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `${invoiceCount.paid} factures payées`
    },
    {
      title: 'En Retard',
      value: formatCurrency(overdueAmount.amount, overdueAmount.currency),
      icon: AlertCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: `${invoiceCount.overdue} factures en retard`
    },
    {
      title: 'Taux de Recouvrement',
      value: totalAmount.amount > 0 
        ? `${Math.round((paidAmount.amount / totalAmount.amount) * 100)}%`
        : '0%',
      icon: TrendingUpIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Sur le total facturé'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metric.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}