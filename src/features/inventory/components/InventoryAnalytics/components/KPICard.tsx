import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { KPICardProps } from '../InventoryAnalytics.types';

export const KPICard: React.FC<KPICardProps> = ({ metric, className }) => {
  const isPositiveChange = metric.changeType === 'increase' && metric.change > 0;
  const isNegativeChange = metric.changeType === 'decrease' && metric.change < 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn('relative overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {metric.icon}
                {metric.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">
                  {typeof metric.value === 'number' 
                    ? metric.value.toLocaleString() 
                    : metric.value}
                </h3>
                {metric.unit && (
                  <span className="text-sm text-muted-foreground">
                    {metric.unit}
                  </span>
                )}
              </div>
              {metric.change !== 0 && (
                <div className={cn(
                  'flex items-center gap-1 text-sm',
                  isPositiveChange && 'text-green-600',
                  isNegativeChange && 'text-red-600',
                  !isPositiveChange && !isNegativeChange && 'text-muted-foreground'
                )}>
                  {isPositiveChange ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : isNegativeChange ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  <span>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">
                    vs last period
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -right-4 -bottom-4 opacity-5">
            {React.cloneElement(metric.icon as React.ReactElement, {
              className: 'h-24 w-24'
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};