import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTimelineProps, StockAlert } from '../LowStockAlerts.types';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

export const AlertTimeline: React.FC<AlertTimelineProps> = ({ 
  alerts, 
  dateRange 
}) => {
  // Group alerts by date
  const groupedAlerts = alerts.reduce((groups, alert) => {
    const date = format(alert.createdAt, 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(alert);
    return groups;
  }, {} as Record<string, StockAlert[]>);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'acknowledged':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'snoozed':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.entries(groupedAlerts)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dayAlerts]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {getDateLabel(date)}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                
                <div className="space-y-3">
                  {dayAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-1">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{alert.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.warehouse.name} • {format(alert.createdAt, 'HH:mm')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(alert.status)}
                            <Badge 
                              variant={
                                alert.status === 'active' ? 'destructive' :
                                alert.status === 'acknowledged' ? 'secondary' :
                                'outline'
                              }
                            >
                              {alert.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {alert.currentStock} units
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.daysUntilStockout} days left
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
        
        {alerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No alerts in the selected time period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};