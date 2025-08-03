import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingOverviewCardProps {
  title: string
  value: number
  format?: 'currency' | 'percentage' | 'number' | 'fraction'
  total?: number // Pour le format fraction
  icon: LucideIcon
  trend?: number
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  className?: string
}

export function PricingOverviewCard({
  title,
  value,
  format = 'number',
  total,
  icon: Icon,
  trend,
  color = 'blue',
  className
}: PricingOverviewCardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return (
          <div className="text-3xl font-bold">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value)}
          </div>
        )
      case 'percentage':
        return (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{value.toFixed(1)}</span>
            <span className="text-lg text-muted-foreground">%</span>
          </div>
        )
      case 'fraction':
        return (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{value}</span>
            <span className="text-lg text-muted-foreground">/ {total}</span>
          </div>
        )
      default:
        return <div className="text-3xl font-bold">{value.toLocaleString('fr-FR')}</div>
    }
  }

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="h-4 w-4" />
    return trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground'
    // Pour les métriques positives (revenus, marges), une hausse est positive
    return trend > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getIconColor = () => {
    const colors = {
      blue: 'text-blue-500 bg-blue-100',
      green: 'text-green-500 bg-green-100',
      orange: 'text-orange-500 bg-orange-100',
      purple: 'text-purple-500 bg-purple-100',
      red: 'text-red-500 bg-red-100'
    }
    return colors[color] || colors.blue
  }

  const getProgressBar = () => {
    if (format !== 'fraction' || !total) return null
    const percentage = (value / total) * 100
    
    return (
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progression</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all duration-500',
              color === 'green' && 'bg-green-500',
              color === 'blue' && 'bg-blue-500',
              color === 'orange' && 'bg-orange-500',
              color === 'purple' && 'bg-purple-500',
              color === 'red' && 'bg-red-500'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', getIconColor())}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {formatValue()}
          {trend !== undefined && trend !== 0 && (
            <div className={cn('flex items-center gap-1 text-sm', getTrendColor())}>
              {getTrendIcon()}
              <span>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">
                vs période précédente
              </span>
            </div>
          )}
          {getProgressBar()}
        </div>
      </CardContent>
    </Card>
  )
}