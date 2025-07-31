import React from 'react';
import { 
  AlertTriangle, 
  Package, 
  MapPin, 
  Clock,
  TrendingDown,
  ShoppingCart,
  History,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AlertDetailsProps } from '../LowStockAlerts.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export const AlertDetails: React.FC<AlertDetailsProps> = ({ 
  alert, 
  onStatusChange,
  onCreateOrder 
}) => {
  // Mock historical data for stock levels
  const stockHistory = [
    { date: 'Day -7', stock: 150 },
    { date: 'Day -6', stock: 135 },
    { date: 'Day -5', stock: 120 },
    { date: 'Day -4', stock: 95 },
    { date: 'Day -3', stock: 75 },
    { date: 'Day -2', stock: 60 },
    { date: 'Day -1', stock: 52 },
    { date: 'Today', stock: alert.currentStock }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stockPercentage = (alert.currentStock / alert.minStockLevel) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{alert.product.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>SKU: {alert.product.sku}</span>
              <span>•</span>
              <span>{alert.warehouse.name}</span>
            </div>
          </div>
          <Badge className={cn('gap-1', getSeverityColor(alert.severity))}>
            <AlertTriangle className="h-3 w-3" />
            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Message */}
        <div className="p-4 rounded-lg bg-muted">
          <p className="font-medium">{alert.message}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Created {format(alert.createdAt, 'MMM d, yyyy HH:mm')}
          </p>
        </div>

        {/* Stock Level Overview */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            Stock Level Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-bold">{alert.currentStock} units</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Days Until Stockout</p>
              <p className="text-2xl font-bold text-red-600">{alert.daysUntilStockout} days</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Stock Level</span>
              <span>{stockPercentage.toFixed(0)}% of minimum</span>
            </div>
            <Progress 
              value={stockPercentage} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>Min: {alert.minStockLevel}</span>
              <span>Reorder: {alert.reorderPoint}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Stock History Chart */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <History className="h-4 w-4" />
            Stock Level History
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stockHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <ReferenceLine 
                y={alert.minStockLevel} 
                stroke="red" 
                strokeDasharray="3 3"
                label="Min Stock"
              />
              <ReferenceLine 
                y={alert.reorderPoint} 
                stroke="orange" 
                strokeDasharray="3 3"
                label="Reorder Point"
              />
              <Line 
                type="monotone" 
                dataKey="stock" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Separator />

        {/* Product Details */}
        <div className="space-y-4">
          <h3 className="font-semibold">Product Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{alert.product.category}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Unit Price</p>
              <p className="font-medium">€{alert.product.unitPrice}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tracking Type</p>
              <p className="font-medium capitalize">{alert.product.trackingType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Suggested Order Qty</p>
              <p className="font-medium">{alert.suggestedOrderQuantity} units</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Warehouse Details */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Warehouse Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{alert.warehouse.address.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{alert.warehouse.type}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onCreateOrder}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Create Purchase Order
          </Button>
          <Button
            variant="outline"
            onClick={() => onStatusChange?.('acknowledged')}
            disabled={alert.status === 'acknowledged'}
          >
            Acknowledge
          </Button>
          <Button
            variant="outline"
            onClick={() => onStatusChange?.('snoozed')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Snooze
          </Button>
          <Button
            variant="outline"
            onClick={() => onStatusChange?.('resolved')}
            disabled={alert.status === 'resolved'}
          >
            Mark Resolved
          </Button>
        </div>

        {/* Status History */}
        {alert.acknowledgedAt && (
          <div className="text-sm text-muted-foreground">
            <p>Acknowledged by {alert.acknowledgedBy} on {format(alert.acknowledgedAt, 'MMM d, yyyy HH:mm')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};