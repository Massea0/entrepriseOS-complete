import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: LucideIcon
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red'
  format?: 'currency' | 'percentage' | 'number'
  className?: string
}

export function KPICard({
  title,
  value,
  change = 0,
  trend = 'stable',
  icon: Icon,
  color = 'blue',
  format = 'currency',
  className
}: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return new Intl.NumberFormat('fr-FR').format(val)
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />
      case 'down':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    if (change === 0) return 'text-gray-500'
    if (trend === 'up') {
      return format === 'percentage' && title.includes('Coût') 
        ? 'text-red-600' 
        : 'text-green-600'
    }
    return format === 'percentage' && title.includes('Coût')
      ? 'text-green-600'
      : 'text-red-600'
  }

  const getIconColor = () => {
    switch (color) {
      case 'green':
        return 'text-green-500 bg-green-100'
      case 'blue':
        return 'text-blue-500 bg-blue-100'
      case 'purple':
        return 'text-purple-500 bg-purple-100'
      case 'orange':
        return 'text-orange-500 bg-orange-100'
      case 'red':
        return 'text-red-500 bg-red-100'
      default:
        return 'text-gray-500 bg-gray-100'
    }
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
          <div className="text-2xl font-bold">
            {formatValue(value)}
          </div>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 text-sm', getTrendColor())}>
              {getTrendIcon()}
              <span>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">
                vs période précédente
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}