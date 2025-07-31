import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  TrendingUp, 
  Package,
  Clock,
  MapPin,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { AlertDashboardProps, StockAlert } from '../LowStockAlerts.types';
import { cn } from '@/lib/utils';

const COLORS = {
  critical: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};

export const AlertDashboard: React.FC<AlertDashboardProps> = ({ 
  filters, 
  onAlertClick 
}) => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['alert-dashboard', filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock dashboard data
      const criticalAlerts: StockAlert[] = [
        {
          id: '1',
          productId: 'p1',
          product: {
            id: 'p1',
            name: 'Wireless Headphones',
            sku: 'WH-001',
            category: 'Electronics',
            description: '',
            unitPrice: 99.99,
            currency: 'EUR',
            trackingType: 'serial',
            minStockLevel: 50,
            maxStockLevel: 500,
            reorderPoint: 100,
            reorderQuantity: 200,
            currentStock: 45,
            reservedStock: 10,
            availableStock: 35,
            images: [],
            supplierProducts: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          warehouseId: 'w1',
          warehouse: {
            id: 'w1',
            name: 'Main Warehouse',
            code: 'MW-001',
            type: 'main',
            address: {
              street: '123 Main St',
              city: 'Paris',
              postalCode: '75001',
              country: 'France',
              coordinates: { lat: 48.8566, lng: 2.3522 }
            },
            capacity: { total: 10000, used: 7500, unit: 'units' },
            zones: [],
            operatingHours: { monday: { open: '08:00', close: '18:00' } },
            contactEmail: 'warehouse@example.com',
            contactPhone: '+33123456789',
            features: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          severity: 'critical',
          status: 'active',
          currentStock: 45,
          minStockLevel: 50,
          reorderPoint: 100,
          daysUntilStockout: 3,
          suggestedOrderQuantity: 200,
          message: 'Stock critically low',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const alertsByCategory = [
        { category: 'Electronics', count: 8, value: 45000 },
        { category: 'Clothing', count: 5, value: 12000 },
        { category: 'Food & Beverage', count: 12, value: 23000 },
        { category: 'Home & Garden', count: 3, value: 8000 },
        { category: 'Other', count: 2, value: 3000 }
      ];

      const alertsByWarehouse = [
        { warehouse: 'Main Warehouse', critical: 5, warning: 8, info: 3 },
        { warehouse: 'Secondary Warehouse', critical: 2, warning: 4, info: 2 },
        { warehouse: 'Distribution Center', critical: 1, warning: 3, info: 1 }
      ];

      const alertTrend = [
        { date: 'Mon', new: 5, resolved: 3 },
        { date: 'Tue', new: 8, resolved: 6 },
        { date: 'Wed', new: 6, resolved: 7 },
        { date: 'Thu', new: 9, resolved: 5 },
        { date: 'Fri', new: 7, resolved: 8 },
        { date: 'Sat', new: 4, resolved: 4 },
        { date: 'Sun', new: 3, resolved: 2 }
      ];

      return {
        criticalAlerts,
        alertsByCategory,
        alertsByWarehouse,
        alertTrend,
        topProducts: [
          { name: 'Wireless Headphones', daysUntilStockout: 3, value: 4500 },
          { name: 'Gaming Mouse RGB', daysUntilStockout: 2, value: 2000 },
          { name: 'USB-C Cable 2m', daysUntilStockout: 7, value: 7000 },
          { name: 'Laptop Stand Pro', daysUntilStockout: 5, value: 3500 },
          { name: 'Webcam HD 1080p', daysUntilStockout: 4, value: 5600 }
        ]
      };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Critical Alerts Requiring Immediate Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData?.criticalAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onAlertClick?.(alert)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium">{alert.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.warehouse.name} • {alert.currentStock} units left
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">
                    {alert.daysUntilStockout} days
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    until stockout
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Alerts by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData?.alertsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.category}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dashboardData?.alertsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alert Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Alert Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.alertTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="new" fill="#ef4444" name="New Alerts" />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts by Warehouse */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Alerts by Warehouse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.alertsByWarehouse.map((warehouse) => (
              <div key={warehouse.warehouse} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{warehouse.warehouse}</p>
                  <div className="flex gap-2">
                    <Badge variant="destructive" className="gap-1">
                      {warehouse.critical} critical
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      {warehouse.warning} warning
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      {warehouse.info} info
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={(warehouse.critical / (warehouse.critical + warehouse.warning + warehouse.info)) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products at Risk */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Top 5 Products at Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData?.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-white font-bold",
                    product.daysUntilStockout <= 3 ? "bg-red-600" : 
                    product.daysUntilStockout <= 5 ? "bg-yellow-600" : 
                    "bg-blue-600"
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      €{product.value.toLocaleString()} at risk
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{product.daysUntilStockout} days</p>
                  <p className="text-xs text-muted-foreground">until stockout</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};