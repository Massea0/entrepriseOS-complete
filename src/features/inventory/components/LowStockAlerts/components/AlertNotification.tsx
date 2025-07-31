import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  X, 
  Eye, 
  CheckCircle,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertNotificationProps } from '../LowStockAlerts.types';
import { cn } from '@/lib/utils';

export const AlertNotification: React.FC<AlertNotificationProps> = ({ 
  alert, 
  onDismiss,
  onAction 
}) => {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical':
        return 'border-red-600 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'border-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50 max-w-md"
    >
      <div className={cn(
        "rounded-lg border-2 shadow-lg p-4",
        getSeverityColor()
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getSeverityIcon()}
            <div>
              <h4 className="font-semibold">Low Stock Alert</h4>
              <Badge 
                variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                className="mt-1"
              >
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <p className="font-medium">{alert.product.name}</p>
          <p className="text-sm text-muted-foreground">{alert.message}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="font-medium">{alert.currentStock}</span>
              <span className="text-muted-foreground">units left</span>
            </span>
            <span className="text-red-600 font-medium">
              {alert.daysUntilStockout} days until stockout
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {alert.warehouse.name} • {alert.warehouse.address.city}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction?.('view')}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction?.('acknowledge')}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Acknowledge
          </Button>
          <Button
            size="sm"
            onClick={() => onAction?.('create-order')}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Order Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};