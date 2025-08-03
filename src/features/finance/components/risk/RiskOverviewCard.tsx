import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskOverviewCardProps {
  title: string
  value: number
  format?: 'number' | 'score' | 'percentage'
  icon: LucideIcon
  trend?: number
  color?: 'blue' | 'orange' | 'red' | 'green' | 'purple'
  className?: string
}

export function RiskOverviewCard({
  title,
  value,
  format = 'number',
  icon: Icon,
  trend,
  color = 'blue',
  className
}: RiskOverviewCardProps) {
  const formatValue = () => {
    switch (format) {
      case 'score':
        return (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{value}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        )
      case 'percentage':
        return <div className="text-3xl font-bold">{value}%</div>
      default:
        return <div className="text-3xl font-bold">{value}</div>
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend > 0) return <TrendingUp className="h-4 w-4" />
    if (trend < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'
    
    // Pour les risques, une tendance négative est positive
    if (title.includes('Risque') || title.includes('Critique')) {
      return trend < 0 ? 'text-green-600' : 'text-red-600'
    }
    
    // Pour les autres métriques, une tendance positive est positive
    return trend > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getIconColor = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-500 bg-blue-100'
      case 'orange':
        return 'text-orange-500 bg-orange-100'
      case 'red':
        return 'text-red-500 bg-red-100'
      case 'green':
        return 'text-green-500 bg-green-100'
      case 'purple':
        return 'text-purple-500 bg-purple-100'
      default:
        return 'text-gray-500 bg-gray-100'
    }
  }

  const getRiskLevelColor = () => {
    if (format !== 'score') return ''
    
    if (value >= 70) return 'text-red-600'
    if (value >= 50) return 'text-orange-600'
    if (value >= 30) return 'text-yellow-600'
    return 'text-green-600'
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
          <div className={cn(format === 'score' && getRiskLevelColor())}>
            {formatValue()}
          </div>
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 text-sm', getTrendColor())}>
              {getTrendIcon()}
              <span>
                {Math.abs(trend)}%
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