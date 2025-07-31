import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Info,
  Brain,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { DemandForecastingProps, ForecastData } from '../InventoryAnalytics.types';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

export const DemandForecasting: React.FC<DemandForecastingProps> = ({ 
  filters, 
  onProductClick 
}) => {
  const [forecastPeriod, setForecastPeriod] = useState<'30d' | '60d' | '90d'>('30d');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const { data: forecastData, isLoading } = useQuery({
    queryKey: ['inventory-demand-forecasting', filters, forecastPeriod],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Generate mock forecast data
      const products = [
        { 
          id: '1', 
          name: 'Laptop Pro X1', 
          currentStock: 234, 
          avgDemand: 45, 
          trend: 'increasing',
          seasonality: 'high',
          stockoutRisk: 'low' as const,
          reorderDays: 12,
          confidence: 92
        },
        { 
          id: '2', 
          name: 'Smart TV 55"', 
          currentStock: 56, 
          avgDemand: 23, 
          trend: 'stable',
          seasonality: 'medium',
          stockoutRisk: 'medium' as const,
          reorderDays: 5,
          confidence: 85
        },
        { 
          id: '3', 
          name: 'Wireless Headphones', 
          currentStock: 12, 
          avgDemand: 67, 
          trend: 'increasing',
          seasonality: 'high',
          stockoutRisk: 'high' as const,
          reorderDays: 2,
          confidence: 78
        },
        { 
          id: '4', 
          name: 'Gaming Console', 
          currentStock: 98, 
          avgDemand: 15, 
          trend: 'decreasing',
          seasonality: 'low',
          stockoutRisk: 'low' as const,
          reorderDays: 25,
          confidence: 88
        },
        { 
          id: '5', 
          name: 'Tablet Pro', 
          currentStock: 45, 
          avgDemand: 34, 
          trend: 'stable',
          seasonality: 'medium',
          stockoutRisk: 'medium' as const,
          reorderDays: 8,
          confidence: 81
        }
      ];

      const forecastDays = forecastPeriod === '30d' ? 30 : forecastPeriod === '60d' ? 60 : 90;
      
      const forecasts: ForecastData[] = products.map(p => {
        const forecastedDemand: number[] = [];
        const seasonalFactors = [1.0, 1.1, 1.2, 1.1, 0.9, 0.8, 0.9]; // Weekly pattern
        
        // Generate forecast data
        for (let i = 0; i < forecastDays; i++) {
          const baseDemand = p.avgDemand;
          const seasonalFactor = seasonalFactors[i % 7];
          const trendFactor = p.trend === 'increasing' ? 1 + (i * 0.01) : 
                             p.trend === 'decreasing' ? 1 - (i * 0.01) : 1;
          const randomVariation = 0.9 + Math.random() * 0.2;
          
          const demand = Math.round(baseDemand * seasonalFactor * trendFactor * randomVariation);
          forecastedDemand.push(demand);
        }
        
        const totalDemand = forecastedDemand.reduce((sum, d) => sum + d, 0);
        const reorderDate = addDays(new Date(), p.reorderDays);
        
        return {
          productId: p.id,
          productName: p.name,
          currentStock: p.currentStock,
          forecastedDemand,
          reorderDate,
          stockoutRisk: p.stockoutRisk,
          confidence: p.confidence,
          seasonalFactors: seasonalFactors.slice(0, forecastDays)
        };
      });

      // Calculate summary statistics
      const highRiskCount = forecasts.filter(f => f.stockoutRisk === 'high').length;
      const mediumRiskCount = forecasts.filter(f => f.stockoutRisk === 'medium').length;
      const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;

      return {
        forecasts,
        summary: {
          totalProducts: forecasts.length,
          highRiskProducts: highRiskCount,
          mediumRiskProducts: mediumRiskCount,
          averageConfidence: avgConfidence,
          forecastAccuracy: 87.5 // Historical accuracy
        }
      };
    }
  });

  const selectedForecast = selectedProduct 
    ? forecastData?.forecasts.find(f => f.productId === selectedProduct)
    : null;

  const getStockoutRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
    }
  };

  const getStockoutRiskBadgeVariant = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'outline';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
    }
  };

  // Prepare chart data for selected product
  const chartData = selectedForecast ? 
    selectedForecast.forecastedDemand.map((demand, index) => ({
      day: format(addDays(new Date(), index), 'MMM d'),
      demand,
      stock: Math.max(0, selectedForecast.currentStock - 
        selectedForecast.forecastedDemand.slice(0, index + 1).reduce((sum, d) => sum + d, 0))
    })) : [];

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
        <Brain className="h-4 w-4" />
        <AlertDescription>
          AI-powered demand forecasting uses historical data, seasonality patterns, and trends 
          to predict future inventory needs with {forecastData?.summary.forecastAccuracy}% accuracy.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {forecastData?.summary.totalProducts}
              </span>
              <span className="text-sm text-muted-foreground">items</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Risk Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-600">
                {forecastData?.summary.highRiskProducts}
              </span>
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medium Risk Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-yellow-600">
                {forecastData?.summary.mediumRiskProducts}
              </span>
              <Badge variant="secondary">
                Monitor
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Forecast Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {forecastData?.summary.averageConfidence.toFixed(0)}%
                </span>
              </div>
              <Progress value={forecastData?.summary.averageConfidence} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Forecast Period:</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={forecastPeriod === '30d' ? 'default' : 'outline'}
            onClick={() => setForecastPeriod('30d')}
          >
            30 Days
          </Button>
          <Button
            size="sm"
            variant={forecastPeriod === '60d' ? 'default' : 'outline'}
            onClick={() => setForecastPeriod('60d')}
          >
            60 Days
          </Button>
          <Button
            size="sm"
            variant={forecastPeriod === '90d' ? 'default' : 'outline'}
            onClick={() => setForecastPeriod('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Forecasts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Reorder In</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecastData?.forecasts.map((forecast) => (
                  <TableRow 
                    key={forecast.productId}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      selectedProduct === forecast.productId && "bg-muted/50"
                    )}
                    onClick={() => {
                      setSelectedProduct(forecast.productId);
                      onProductClick?.(forecast.productId);
                    }}
                  >
                    <TableCell className="font-medium">{forecast.productName}</TableCell>
                    <TableCell className="text-right">
                      {forecast.currentStock}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {Math.round((forecast.reorderDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStockoutRiskBadgeVariant(forecast.stockoutRisk)}>
                        {forecast.stockoutRisk === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {forecast.stockoutRisk.charAt(0).toUpperCase() + forecast.stockoutRisk.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        forecast.confidence >= 85 ? 'text-green-600' :
                        forecast.confidence >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      )}>
                        {forecast.confidence}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedForecast 
                ? `Forecast: ${selectedForecast.productName}`
                : 'Select a product to view forecast'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedForecast ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine 
                    y={0} 
                    stroke="red" 
                    strokeDasharray="3 3"
                    label="Stockout"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="stock" 
                    stackId="1"
                    stroke="#82ca9d" 
                    fill="#82ca9d"
                    name="Projected Stock"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="demand" 
                    stackId="2"
                    stroke="#8884d8" 
                    fill="#8884d8"
                    name="Forecasted Demand"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click on a product to view its demand forecast</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      {selectedForecast && (
        <Card>
          <CardHeader>
            <CardTitle>Forecast Insights: {selectedForecast.productName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Forecasted Demand</p>
                <p className="text-2xl font-bold">
                  {selectedForecast.forecastedDemand.reduce((sum, d) => sum + d, 0)} units
                </p>
                <p className="text-xs text-muted-foreground">
                  Next {forecastPeriod === '30d' ? '30' : forecastPeriod === '60d' ? '60' : '90'} days
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Average Daily Demand</p>
                <p className="text-2xl font-bold">
                  {(selectedForecast.forecastedDemand.reduce((sum, d) => sum + d, 0) / selectedForecast.forecastedDemand.length).toFixed(1)} units/day
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Recommended Reorder Date</p>
                <p className="text-2xl font-bold">
                  {format(selectedForecast.reorderDate, 'MMM d, yyyy')}
                </p>
                <p className={cn(
                  "text-xs",
                  getStockoutRiskColor(selectedForecast.stockoutRisk)
                )}>
                  {selectedForecast.stockoutRisk === 'high' ? 'Order immediately!' :
                   selectedForecast.stockoutRisk === 'medium' ? 'Monitor closely' :
                   'Sufficient stock'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};