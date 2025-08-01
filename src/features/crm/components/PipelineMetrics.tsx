import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon, TargetIcon, ClockIcon, BarChartIcon } from 'lucide-react'
import { CRMUtils } from '../utils/crm.utils'

interface PipelineMetricsProps {
  metrics: {
    totalValue: number
    weightedValue: number
    winRate: number
    averageDealSize: number
    averageSalesCycle: number
    totalDeals: number
  }
}

export const PipelineMetrics: React.FC<PipelineMetricsProps> = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Valeur totale',
      value: CRMUtils.formatCurrency(metrics.totalValue),
      icon: DollarSignIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Valeur pondérée',
      value: CRMUtils.formatCurrency(metrics.weightedValue),
      icon: TargetIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subtext: `${Math.round((metrics.weightedValue / metrics.totalValue) * 100)}% du total`
    },
    {
      title: 'Taux de conversion',
      value: `${metrics.winRate.toFixed(1)}%`,
      icon: metrics.winRate >= 50 ? TrendingUpIcon : TrendingDownIcon,
      color: metrics.winRate >= 50 ? 'text-green-600' : 'text-red-600',
      bgColor: metrics.winRate >= 50 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      title: 'Valeur moyenne',
      value: CRMUtils.formatCurrency(metrics.averageDealSize),
      icon: BarChartIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      subtext: `${metrics.totalDeals} deals actifs`
    },
    {
      title: 'Cycle de vente',
      value: `${metrics.averageSalesCycle}j`,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      subtext: 'En moyenne'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {metric.value}
                  </p>
                  {metric.subtext && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.subtext}
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}