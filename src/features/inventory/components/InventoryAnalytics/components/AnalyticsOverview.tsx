import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
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
import { AnalyticsOverviewProps, KPIMetric } from '../InventoryAnalytics.types';
import { KPICard } from './KPICard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ filters }) => {
  const { data: overviewData, isLoading } = useQuery({
    queryKey: ['inventory-analytics-overview', filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        kpis: [
          {
            label: 'Total Inventory Value',
            value: 1245678,
            change: 12.5,
            changeType: 'increase' as const,
            unit: '€',
            icon: <DollarSign className="h-4 w-4" />
          },
          {
            label: 'Total SKUs',
            value: 3456,
            change: 5.2,
            changeType: 'increase' as const,
            icon: <Package className="h-4 w-4" />
          },
          {
            label: 'Average Turnover Rate',
            value: 4.8,
            change: -2.3,
            changeType: 'decrease' as const,
            unit: 'times/year',
            icon: <RotateCcw className="h-4 w-4" />
          },
          {
            label: 'Low Stock Items',
            value: 89,
            change: 15.7,
            changeType: 'increase' as const,
            icon: <AlertTriangle className="h-4 w-4" />
          },
          {
            label: 'Pending Orders',
            value: 234,
            change: -8.4,
            changeType: 'decrease' as const,
            icon: <ShoppingCart className="h-4 w-4" />
          },
          {
            label: 'Stock Accuracy',
            value: '98.5%',
            change: 0.8,
            changeType: 'increase' as const,
            icon: <TrendingUp className="h-4 w-4" />
          }
        ] as KPIMetric[],
        inventoryByCategory: [
          { name: 'Electronics', value: 456789, items: 1234 },
          { name: 'Clothing', value: 234567, items: 2345 },
          { name: 'Food & Beverage', value: 345678, items: 3456 },
          { name: 'Home & Garden', value: 123456, items: 1234 },
          { name: 'Other', value: 85188, items: 567 }
        ],
        inventoryTrend: [
          { month: 'Jan', value: 980000, items: 8900 },
          { month: 'Feb', value: 1020000, items: 9200 },
          { month: 'Mar', value: 1100000, items: 9800 },
          { month: 'Apr', value: 1150000, items: 10200 },
          { month: 'May', value: 1200000, items: 10800 },
          { month: 'Jun', value: 1245678, items: 11234 }
        ],
        topMovingProducts: [
          { name: 'Laptop Pro X1', movement: 234, value: 234567 },
          { name: 'Winter Jacket Premium', movement: 189, value: 45678 },
          { name: 'Organic Coffee Beans', movement: 167, value: 23456 },
          { name: 'Smart Home Hub', movement: 145, value: 34567 },
          { name: 'Garden Tool Set', movement: 123, value: 12345 }
        ]
      };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewData?.kpis.map((metric, index) => (
          <KPICard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Value Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overviewData?.inventoryTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [
                    `€${value.toLocaleString()}`,
                    'Value'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  name="Inventory Value"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overviewData?.inventoryByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: €${(entry.value / 1000).toFixed(0)}k`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {overviewData?.inventoryByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `€${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Moving Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Moving Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={overviewData?.topMovingProducts}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="movement" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'movement' ? `${value} units` : `€${value.toLocaleString()}`,
                    name === 'movement' ? 'Movement' : 'Value'
                  ]}
                />
                <Bar dataKey="movement" fill="#8884d8" name="Units Moved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Levels by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Levels by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData?.inventoryByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="items" fill="#82ca9d" name="Items in Stock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};