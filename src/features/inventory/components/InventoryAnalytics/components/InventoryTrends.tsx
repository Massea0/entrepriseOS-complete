import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Package,
  DollarSign,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Brush
} from 'recharts';
import { InventoryTrendsProps, InventoryTrend } from '../InventoryAnalytics.types';
import { format, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

export const InventoryTrends: React.FC<InventoryTrendsProps> = ({ filters }) => {
  const [trendView, setTrendView] = useState<'value' | 'items' | 'categories'>('value');
  const [compareMode, setCompareMode] = useState(false);

  const { data: trendsData, isLoading } = useQuery({
    queryKey: ['inventory-trends', filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock trend data for the last 12 months
      const trends: InventoryTrend[] = [];
      const categories = ['Electronics', 'Clothing', 'Food & Beverage', 'Home & Garden', 'Other'];
      
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const baseValue = 1000000 + (11 - i) * 50000;
        const baseItems = 10000 + (11 - i) * 500;
        
        const categoryData: { [key: string]: { value: number; items: number } } = {};
        categories.forEach((cat, idx) => {
          const categoryBase = baseValue * (0.3 - idx * 0.05);
          const itemsBase = baseItems * (0.3 - idx * 0.05);
          categoryData[cat] = {
            value: Math.round(categoryBase + Math.random() * categoryBase * 0.2),
            items: Math.round(itemsBase + Math.random() * itemsBase * 0.2)
          };
        });
        
        trends.push({
          date: format(date, 'yyyy-MM-dd'),
          totalValue: Object.values(categoryData).reduce((sum, cat) => sum + cat.value, 0),
          totalItems: Object.values(categoryData).reduce((sum, cat) => sum + cat.items, 0),
          categories: categoryData
        });
      }

      // Calculate growth rates
      const currentMonth = trends[trends.length - 1];
      const previousMonth = trends[trends.length - 2];
      const yearAgo = trends[0];
      
      const monthlyGrowth = {
        value: ((currentMonth.totalValue - previousMonth.totalValue) / previousMonth.totalValue) * 100,
        items: ((currentMonth.totalItems - previousMonth.totalItems) / previousMonth.totalItems) * 100
      };
      
      const yearlyGrowth = {
        value: ((currentMonth.totalValue - yearAgo.totalValue) / yearAgo.totalValue) * 100,
        items: ((currentMonth.totalItems - yearAgo.totalItems) / yearAgo.totalItems) * 100
      };

      // Category performance
      const categoryPerformance = categories.map(cat => {
        const current = currentMonth.categories[cat];
        const previous = previousMonth.categories[cat];
        return {
          name: cat,
          value: current.value,
          items: current.items,
          valueGrowth: ((current.value - previous.value) / previous.value) * 100,
          itemsGrowth: ((current.items - previous.items) / previous.items) * 100
        };
      });

      return {
        trends,
        summary: {
          currentValue: currentMonth.totalValue,
          currentItems: currentMonth.totalItems,
          monthlyGrowth,
          yearlyGrowth,
          averageValue: trends.reduce((sum, t) => sum + t.totalValue, 0) / trends.length,
          averageItems: trends.reduce((sum, t) => sum + t.totalItems, 0) / trends.length
        },
        categoryPerformance
      };
    }
  });

  // Prepare chart data
  const chartData = trendsData?.trends.map(trend => ({
    date: format(new Date(trend.date), 'MMM yyyy'),
    value: trend.totalValue,
    items: trend.totalItems,
    ...Object.entries(trend.categories).reduce((acc, [cat, data]) => ({
      ...acc,
      [`${cat}_value`]: data.value,
      [`${cat}_items`]: data.items
    }), {})
  })) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  €{(trendsData?.summary.currentValue / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {trendsData?.summary.monthlyGrowth.value > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={cn(
                  trendsData?.summary.monthlyGrowth.value > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {trendsData?.summary.monthlyGrowth.value > 0 ? '+' : ''}
                  {trendsData?.summary.monthlyGrowth.value.toFixed(1)}% MoM
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items in Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {trendsData?.summary.currentItems.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {trendsData?.summary.monthlyGrowth.items > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={cn(
                  trendsData?.summary.monthlyGrowth.items > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {trendsData?.summary.monthlyGrowth.items > 0 ? '+' : ''}
                  {trendsData?.summary.monthlyGrowth.items.toFixed(1)}% MoM
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Year-over-Year Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  +{trendsData?.summary.yearlyGrowth.value.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Value increased by €{((trendsData?.summary.currentValue - trendsData?.trends[0].totalValue) / 1000000).toFixed(2)}M
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Monthly Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  €{(trendsData?.summary.averageValue / 1000000).toFixed(2)}M
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Over last 12 months
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <Tabs value={trendView} onValueChange={(v) => setTrendView(v as any)}>
          <TabsList>
            <TabsTrigger value="value">
              <DollarSign className="h-4 w-4 mr-2" />
              Inventory Value
            </TabsTrigger>
            <TabsTrigger value="items">
              <Package className="h-4 w-4 mr-2" />
              Item Count
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Activity className="h-4 w-4 mr-2" />
              Category Breakdown
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant={compareMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCompareMode(!compareMode)}
        >
          Compare Categories
        </Button>
      </div>

      {/* Trend Charts */}
      <Card>
        <CardHeader>
          <CardTitle>
            {trendView === 'value' && 'Inventory Value Trend'}
            {trendView === 'items' && 'Item Count Trend'}
            {trendView === 'categories' && 'Category Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendView === 'value' && (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => `€${(value / 1000000).toFixed(2)}M`}
                />
                <Legend />
                {compareMode ? (
                  <>
                    <Area type="monotone" dataKey="Electronics_value" stackId="1" stroke="#8884d8" fill="#8884d8" name="Electronics" />
                    <Area type="monotone" dataKey="Clothing_value" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Clothing" />
                    <Area type="monotone" dataKey="Food & Beverage_value" stackId="1" stroke="#ffc658" fill="#ffc658" name="Food & Beverage" />
                    <Area type="monotone" dataKey="Home & Garden_value" stackId="1" stroke="#ff8042" fill="#ff8042" name="Home & Garden" />
                    <Area type="monotone" dataKey="Other_value" stackId="1" stroke="#a4de6c" fill="#a4de6c" name="Other" />
                  </>
                ) : (
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" name="Total Value" />
                )}
                <Brush dataKey="date" height={30} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {trendView === 'items' && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString()}
                />
                <Legend />
                {compareMode ? (
                  <>
                    <Line type="monotone" dataKey="Electronics_items" stroke="#8884d8" name="Electronics" strokeWidth={2} />
                    <Line type="monotone" dataKey="Clothing_items" stroke="#82ca9d" name="Clothing" strokeWidth={2} />
                    <Line type="monotone" dataKey="Food & Beverage_items" stroke="#ffc658" name="Food & Beverage" strokeWidth={2} />
                    <Line type="monotone" dataKey="Home & Garden_items" stroke="#ff8042" name="Home & Garden" strokeWidth={2} />
                    <Line type="monotone" dataKey="Other_items" stroke="#a4de6c" name="Other" strokeWidth={2} />
                  </>
                ) : (
                  <Line type="monotone" dataKey="items" stroke="#8884d8" name="Total Items" strokeWidth={2} />
                )}
                <Brush dataKey="date" height={30} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {trendView === 'categories' && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={trendsData?.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="value" fill="#8884d8" name="Value (€)" />
                <Bar yAxisId="right" dataKey="valueGrowth" fill="#82ca9d" name="Growth (%)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Category Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Category</th>
                  <th className="text-right py-2">Current Value</th>
                  <th className="text-right py-2">Value Growth</th>
                  <th className="text-right py-2">Current Items</th>
                  <th className="text-right py-2">Items Growth</th>
                </tr>
              </thead>
              <tbody>
                {trendsData?.categoryPerformance.map((cat) => (
                  <tr key={cat.name} className="border-b">
                    <td className="py-2 font-medium">{cat.name}</td>
                    <td className="text-right py-2">€{(cat.value / 1000).toFixed(0)}k</td>
                    <td className="text-right py-2">
                      <span className={cn(
                        cat.valueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {cat.valueGrowth > 0 ? '+' : ''}{cat.valueGrowth.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-2">{cat.items.toLocaleString()}</td>
                    <td className="text-right py-2">
                      <span className={cn(
                        cat.itemsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {cat.itemsGrowth > 0 ? '+' : ''}{cat.itemsGrowth.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};