import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Info,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TurnoverAnalysisProps, TurnoverMetrics } from '../InventoryAnalytics.types';
import { cn } from '@/lib/utils';

export const TurnoverAnalysis: React.FC<TurnoverAnalysisProps> = ({ 
  filters, 
  onProductClick 
}) => {
  const [sortBy, setSortBy] = useState<'turnover' | 'value' | 'days'>('turnover');
  const [view, setView] = useState<'table' | 'chart'>('table');

  const { data: turnoverData, isLoading } = useQuery({
    queryKey: ['inventory-turnover-analysis', filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock turnover data
      const products = [
        { id: '1', name: 'Fast Moving Item A', turnover: 12.5, value: 45000, cogs: 540000, days: 29, trend: 'up' as const },
        { id: '2', name: 'Fast Moving Item B', turnover: 10.2, value: 38000, cogs: 387600, days: 36, trend: 'up' as const },
        { id: '3', name: 'Regular Item C', turnover: 8.5, value: 52000, cogs: 442000, days: 43, trend: 'stable' as const },
        { id: '4', name: 'Regular Item D', turnover: 6.8, value: 41000, cogs: 278800, days: 54, trend: 'stable' as const },
        { id: '5', name: 'Slow Moving Item E', turnover: 4.2, value: 67000, cogs: 281400, days: 87, trend: 'down' as const },
        { id: '6', name: 'Slow Moving Item F', turnover: 3.5, value: 55000, cogs: 192500, days: 104, trend: 'down' as const },
        { id: '7', name: 'Very Slow Item G', turnover: 2.1, value: 89000, cogs: 186900, days: 174, trend: 'down' as const },
        { id: '8', name: 'Dead Stock Item H', turnover: 0.8, value: 120000, cogs: 96000, days: 456, trend: 'down' as const },
        { id: '9', name: 'Regular Item I', turnover: 7.5, value: 34000, cogs: 255000, days: 49, trend: 'stable' as const },
        { id: '10', name: 'Fast Moving Item J', turnover: 11.3, value: 28000, cogs: 316400, days: 32, trend: 'up' as const }
      ];

      const metrics: TurnoverMetrics[] = products.map(p => ({
        productId: p.id,
        productName: p.name,
        turnoverRate: p.turnover,
        averageStockValue: p.value,
        costOfGoodsSold: p.cogs,
        daysInInventory: p.days,
        stockRotations: Math.floor(p.turnover),
        trend: p.trend
      }));

      // Calculate summary statistics
      const avgTurnover = metrics.reduce((sum, m) => sum + m.turnoverRate, 0) / metrics.length;
      const totalValue = metrics.reduce((sum, m) => sum + m.averageStockValue, 0);
      const totalCOGS = metrics.reduce((sum, m) => sum + m.costOfGoodsSold, 0);

      return {
        metrics,
        summary: {
          averageTurnover: avgTurnover,
          totalInventoryValue: totalValue,
          totalCOGS: totalCOGS,
          fastMoving: metrics.filter(m => m.turnoverRate > 8).length,
          slowMoving: metrics.filter(m => m.turnoverRate < 4).length,
          deadStock: metrics.filter(m => m.turnoverRate < 1).length,
          optimalTurnover: 8 // Industry benchmark
        },
        distribution: [
          { range: '0-2', count: metrics.filter(m => m.turnoverRate <= 2).length, label: 'Dead Stock' },
          { range: '2-4', count: metrics.filter(m => m.turnoverRate > 2 && m.turnoverRate <= 4).length, label: 'Slow Moving' },
          { range: '4-8', count: metrics.filter(m => m.turnoverRate > 4 && m.turnoverRate <= 8).length, label: 'Regular' },
          { range: '8+', count: metrics.filter(m => m.turnoverRate > 8).length, label: 'Fast Moving' }
        ]
      };
    }
  });

  const sortedMetrics = [...(turnoverData?.metrics || [])].sort((a, b) => {
    switch (sortBy) {
      case 'turnover':
        return b.turnoverRate - a.turnoverRate;
      case 'value':
        return b.averageStockValue - a.averageStockValue;
      case 'days':
        return a.daysInInventory - b.daysInInventory;
      default:
        return 0;
    }
  });

  const getTurnoverColor = (rate: number) => {
    if (rate >= 8) return '#10b981'; // green
    if (rate >= 4) return '#3b82f6'; // blue
    if (rate >= 2) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

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
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Inventory turnover measures how many times inventory is sold and replaced over a period. 
          Higher turnover rates indicate efficient inventory management.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Turnover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {turnoverData?.summary.averageTurnover.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">times/year</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Benchmark: {turnoverData?.summary.optimalTurnover}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fast Moving Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">
                {turnoverData?.summary.fastMoving}
              </span>
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {'>'}8 turns
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Slow Moving Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-yellow-600">
                {turnoverData?.summary.slowMoving}
              </span>
              <Badge variant="outline" className="text-yellow-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                {'<'}4 turns
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dead Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-600">
                {turnoverData?.summary.deadStock}
              </span>
              <Badge variant="outline" className="text-red-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {'<'}1 turn
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'table' | 'chart')}>
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="chart">Chart View</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          {/* Sorting Options */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={sortBy === 'turnover' ? 'default' : 'outline'}
              onClick={() => setSortBy('turnover')}
            >
              Sort by Turnover
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'value' ? 'default' : 'outline'}
              onClick={() => setSortBy('value')}
            >
              Sort by Value
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'days' ? 'default' : 'outline'}
              onClick={() => setSortBy('days')}
            >
              Sort by Days
            </Button>
          </div>

          {/* Turnover Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Turnover Rate</TableHead>
                    <TableHead className="text-right">Avg. Stock Value</TableHead>
                    <TableHead className="text-right">COGS</TableHead>
                    <TableHead className="text-right">Days in Inventory</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMetrics.map((metric) => (
                    <TableRow 
                      key={metric.productId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onProductClick?.(metric.productId)}
                    >
                      <TableCell className="font-medium">{metric.productName}</TableCell>
                      <TableCell className="text-right">
                        <span 
                          className="font-semibold"
                          style={{ color: getTurnoverColor(metric.turnoverRate) }}
                        >
                          {metric.turnoverRate.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        €{metric.averageStockValue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        €{metric.costOfGoodsSold.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {metric.daysInInventory}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mx-auto" />}
                        {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 mx-auto" />}
                        {metric.trend === 'stable' && <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            metric.turnoverRate >= 8 ? 'default' :
                            metric.turnoverRate >= 4 ? 'secondary' :
                            metric.turnoverRate >= 2 ? 'outline' :
                            'destructive'
                          }
                        >
                          {metric.turnoverRate >= 8 ? 'Fast' :
                           metric.turnoverRate >= 4 ? 'Regular' :
                           metric.turnoverRate >= 2 ? 'Slow' :
                           'Dead Stock'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          {/* Turnover Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Turnover Rate Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={turnoverData?.distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Products">
                    {turnoverData?.distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.label === 'Fast Moving' ? '#10b981' :
                          entry.label === 'Regular' ? '#3b82f6' :
                          entry.label === 'Slow Moving' ? '#f59e0b' :
                          '#ef4444'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Turnover vs Value Scatter */}
          <Card>
            <CardHeader>
              <CardTitle>Turnover Rate vs Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="turnoverRate" 
                    name="Turnover Rate" 
                    unit=" times"
                  />
                  <YAxis 
                    dataKey="averageStockValue" 
                    name="Stock Value" 
                    unit="€"
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Stock Value') return `€${value.toLocaleString()}`;
                      if (name === 'Turnover Rate') return `${value} times`;
                      return value;
                    }}
                  />
                  <Scatter 
                    name="Products" 
                    data={turnoverData?.metrics}
                    fill="#8884d8"
                  >
                    {turnoverData?.metrics.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getTurnoverColor(entry.turnoverRate)} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};