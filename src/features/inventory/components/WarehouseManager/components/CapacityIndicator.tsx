import React from 'react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { CapacityIndicatorProps } from '../WarehouseManager.types'

export const CapacityIndicator: React.FC<CapacityIndicatorProps> = ({
  used,
  total,
  unit = 'm³',
  showPercentage = true,
  showDetails = false,
  size = 'md',
  className
}) => {
  const percentage = total > 0 ? (used / total) * 100 : 0
  const isOverCapacity = percentage > 100
  const isCritical = percentage > 90
  const isWarning = percentage > 75

  const getColor = () => {
    if (isOverCapacity) return 'bg-red-500'
    if (isCritical) return 'bg-orange-500'
    if (isWarning) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="relative">
        <Progress 
          value={Math.min(percentage, 100)} 
          className={cn(sizeClasses[size], 'bg-muted')}
          indicatorClassName={getColor()}
        />
        {isOverCapacity && (
          <div 
            className="absolute top-0 right-0 h-full bg-red-500/50"
            style={{ width: `${((percentage - 100) / percentage) * 100}%` }}
          />
        )}
      </div>
      
      {(showPercentage || showDetails) && (
        <div className="flex items-center justify-between text-xs">
          {showDetails && (
            <span className="text-muted-foreground">
              {used.toLocaleString()} / {total.toLocaleString()} {unit}
            </span>
          )}
          {showPercentage && (
            <span className={cn(
              'font-medium',
              isOverCapacity && 'text-red-600',
              isCritical && !isOverCapacity && 'text-orange-600',
              isWarning && !isCritical && !isOverCapacity && 'text-yellow-600'
            )}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}