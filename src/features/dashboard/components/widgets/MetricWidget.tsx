'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  MinusIcon,
  RefreshCwIcon,
  MoreVerticalIcon,
  TargetIcon
} from 'lucide-react'
import type { WidgetProps, MetricWidgetConfig } from '../../types/dashboard.types'
import { useWidgetData } from '../../hooks/useDashboard'

interface MetricWidgetProps extends WidgetProps<MetricWidgetConfig> {}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  config,
  isEditing = false,
  onUpdate,
  onRemove,
  onRefresh,
  className
}) => {
  const { data, isLoading, error, lastUpdated, refresh } = useWidgetData(config.id)
  const widgetData = data || config.data

  // Format value based on format type
  const formatValue = (value: number | string, format?: string, precision?: number) => {
    if (typeof value === 'string') return value

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: precision || 0,
          maximumFractionDigits: precision || 2
        }).format(value)
      
      case 'percentage':
        return `${value.toFixed(precision || 1)}%`
      
      case 'number':
      default:
        return new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: precision || 0,
          maximumFractionDigits: precision || 0
        }).format(value)
    }
  }

  // Calculate trend
  const calculateTrend = () => {
    if (!widgetData.previousValue || !widgetData.trendPercentage) {
      return null
    }

    const change = widgetData.trendPercentage
    const isPositive = change > 0
    const isNegative = change < 0

    return {
      change: Math.abs(change),
      isPositive,
      isNegative,
      isStable: !isPositive && !isNegative
    }
  }

  const trend = calculateTrend()

  // Get trend icon
  const getTrendIcon = () => {
    if (!trend) return null

    if (trend.isPositive) {
      return <TrendingUpIcon className="h-4 w-4" />
    } else if (trend.isNegative) {
      return <TrendingDownIcon className="h-4 w-4" />
    } else {
      return <MinusIcon className="h-4 w-4" />
    }
  }

  // Get trend color classes
  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'

    if (trend.isPositive) {
      return 'text-success'
    } else if (trend.isNegative) {
      return 'text-destructive'
    } else {
      return 'text-muted-foreground'
    }
  }

  // Get card color based on config
  const getCardColor = () => {
    switch (config.color) {
      case 'primary':
        return 'border-l-primary'
      case 'success':
        return 'border-l-success'
      case 'warning':
        return 'border-l-warning'
      case 'destructive':
        return 'border-l-destructive'
      default:
        return 'border-l-muted'
    }
  }

  // Calculate progress towards target
  const getTargetProgress = () => {
    if (!widgetData.target || typeof widgetData.value !== 'number') {
      return null
    }

    const progress = (widgetData.value / widgetData.target) * 100
    return Math.min(progress, 100)
  }

  const targetProgress = getTargetProgress()

  const handleRefresh = () => {
    onRefresh?.()
    refresh()
  }

  if (error) {
    return (
      <Card className={cn('border-l-4 border-l-destructive', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-destructive">
            Erreur de chargement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-2"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-l-4', getCardColor(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {config.title}
        </CardTitle>
        
        <div className="flex items-center space-x-1">
          {isLoading && (
            <RefreshCwIcon className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {isEditing && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-6 w-6 p-0"
              >
                <RefreshCwIcon className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {/* Open settings */}}
                className="h-6 w-6 p-0"
              >
                <MoreVerticalIcon className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {/* Main value */}
          <div className="flex items-baseline space-x-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatValue(widgetData.value, widgetData.format, widgetData.precision)}
              </div>
            )}
            
            {widgetData.unit && !isLoading && (
              <span className="text-sm text-muted-foreground">
                {widgetData.unit}
              </span>
            )}
          </div>

          {/* Trend indicator */}
          {trend && !isLoading && (
            <div className={cn('flex items-center space-x-1', getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {trend.change.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs période précédente
              </span>
            </div>
          )}

          {/* Target progress */}
          {targetProgress !== null && !isLoading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center">
                  <TargetIcon className="h-3 w-3 mr-1" />
                  Objectif
                </span>
                <span className="font-medium">
                  {formatValue(widgetData.target!, widgetData.format, widgetData.precision)}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    targetProgress >= 100 ? 'bg-success' : 
                    targetProgress >= 75 ? 'bg-warning' : 'bg-primary'
                  )}
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {targetProgress.toFixed(0)}% de l'objectif atteint
              </div>
            </div>
          )}

          {/* Last updated */}
          {lastUpdated && !isLoading && (
            <div className="text-xs text-muted-foreground">
              Mis à jour {new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(
                Math.floor((lastUpdated.getTime() - Date.now()) / (1000 * 60)), 
                'minute'
              )}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

MetricWidget.displayName = 'MetricWidget'