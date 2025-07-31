import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  TrendingUp, 
  DollarSign,
  Info,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { ABCAnalysisProps, ABCAnalysisItem } from '../InventoryAnalytics.types';
import { cn } from '@/lib/utils';

export const ABCAnalysis: React.FC<ABCAnalysisProps> = ({ 
  filters, 
  onProductClick 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'A' | 'B' | 'C'>('all');

  const { data: abcData, isLoading } = useQuery({
    queryKey: ['inventory-abc-analysis', filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock ABC analysis data
      const products = [
        { id: '1', name: 'Laptop Pro X1', sku: 'LPX1', revenue: 456789, quantity: 234 },
        { id: '2', name: 'Smart TV 55"', sku: 'STV55', revenue: 345678, quantity: 156 },
        { id: '3', name: 'Wireless Headphones', sku: 'WH200', revenue: 234567, quantity: 567 },
        { id: '4', name: 'Gaming Console', sku: 'GC500', revenue: 198765, quantity: 98 },
        { id: '5', name: 'Tablet Pro', sku: 'TP10', revenue: 156789, quantity: 123 },
        { id: '6', name: 'Smart Watch', sku: 'SW300', revenue: 134567, quantity: 234 },
        { id: '7', name: 'Camera DSLR', sku: 'CD200', revenue: 123456, quantity: 45 },
        { id: '8', name: 'Bluetooth Speaker', sku: 'BS100', revenue: 98765, quantity: 345 },
        { id: '9', name: 'USB-C Hub', sku: 'UCH50', revenue: 87654, quantity: 678 },
        { id: '10', name: 'Wireless Mouse', sku: 'WM20', revenue: 76543, quantity: 890 },
        { id: '11', name: 'Keyboard Mechanical', sku: 'KM100', revenue: 65432, quantity: 456 },
        { id: '12', name: 'Monitor 27"', sku: 'M27', revenue: 54321, quantity: 67 },
        { id: '13', name: 'Webcam HD', sku: 'WHD', revenue: 43210, quantity: 234 },
        { id: '14', name: 'External SSD', sku: 'ESSD1', revenue: 32109, quantity: 123 },
        { id: '15', name: 'Power Bank', sku: 'PB20K', revenue: 21098, quantity: 567 }
      ];

      const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
      let cumulativePercentage = 0;

      const abcItems: ABCAnalysisItem[] = products.map(p => {
        const percentage = (p.revenue / totalRevenue) * 100;
        cumulativePercentage += percentage;
        
        let category: 'A' | 'B' | 'C';
        if (cumulativePercentage <= 70) {
          category = 'A';
        } else if (cumulativePercentage <= 90) {
          category = 'B';
        } else {
          category = 'C';
        }

        return {
          product: {
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: 'Electronics',
            description: '',
            unitPrice: p.revenue / p.quantity,
            currency: 'EUR',
            trackingType: 'serial',
            minStockLevel: 10,
            maxStockLevel: 100,
            reorderPoint: 20,
            reorderQuantity: 50,
            currentStock: Math.floor(Math.random() * 100),
            reservedStock: Math.floor(Math.random() * 20),
            availableStock: Math.floor(Math.random() * 80),
            images: [],
            supplierProducts: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          revenue: p.revenue,
          quantity: p.quantity,
          percentage,
          cumulativePercentage,
          category
        };
      });

      return {
        items: abcItems,
        summary: {
          categoryA: {
            count: abcItems.filter(i => i.category === 'A').length,
            revenue: abcItems.filter(i => i.category === 'A').reduce((sum, i) => sum + i.revenue, 0),
            percentage: abcItems.filter(i => i.category === 'A').reduce((sum, i) => sum + i.percentage, 0)
          },
          categoryB: {
            count: abcItems.filter(i => i.category === 'B').length,
            revenue: abcItems.filter(i => i.category === 'B').reduce((sum, i) => sum + i.revenue, 0),
            percentage: abcItems.filter(i => i.category === 'B').reduce((sum, i) => sum + i.percentage, 0)
          },
          categoryC: {
            count: abcItems.filter(i => i.category === 'C').length,
            revenue: abcItems.filter(i => i.category === 'C').reduce((sum, i) => sum + i.revenue, 0),
            percentage: abcItems.filter(i => i.category === 'C').reduce((sum, i) => sum + i.percentage, 0)
          },
          totalRevenue,
          totalItems: products.length
        }
      };
    }
  });

  const filteredItems = abcData?.items.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  const handleExport = () => {
    console.log('Exporting ABC analysis...');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          ABC Analysis categorizes products based on their revenue contribution. 
          Category A (70% revenue), Category B (20% revenue), Category C (10% revenue).
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={cn(
            "cursor-pointer transition-colors",
            selectedCategory === 'A' && "border-primary"
          )}
          onClick={() => setSelectedCategory(selectedCategory === 'A' ? 'all' : 'A')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Category A
              <Badge className="bg-green-100 text-green-800">High Value</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Products</span>
                <span className="font-medium">{abcData?.summary.categoryA.count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">€{abcData?.summary.categoryA.revenue.toLocaleString()}</span>
              </div>
              <Progress value={abcData?.summary.categoryA.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {abcData?.summary.categoryA.percentage.toFixed(1)}% of total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer transition-colors",
            selectedCategory === 'B' && "border-primary"
          )}
          onClick={() => setSelectedCategory(selectedCategory === 'B' ? 'all' : 'B')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Category B
              <Badge className="bg-yellow-100 text-yellow-800">Medium Value</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Products</span>
                <span className="font-medium">{abcData?.summary.categoryB.count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">€{abcData?.summary.categoryB.revenue.toLocaleString()}</span>
              </div>
              <Progress value={abcData?.summary.categoryB.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {abcData?.summary.categoryB.percentage.toFixed(1)}% of total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer transition-colors",
            selectedCategory === 'C' && "border-primary"
          )}
          onClick={() => setSelectedCategory(selectedCategory === 'C' ? 'all' : 'C')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Category C
              <Badge className="bg-red-100 text-red-800">Low Value</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Products</span>
                <span className="font-medium">{abcData?.summary.categoryC.count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">€{abcData?.summary.categoryC.revenue.toLocaleString()}</span>
              </div>
              <Progress value={abcData?.summary.categoryC.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {abcData?.summary.categoryC.percentage.toFixed(1)}% of total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pareto Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Revenue Distribution (Pareto Chart)
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={abcData?.items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="product.name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'Revenue') return [`€${value.toLocaleString()}`, name];
                  if (name === 'Cumulative %') return [`${value.toFixed(1)}%`, name];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="revenue" 
                fill="#8884d8" 
                name="Revenue"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="cumulativePercentage" 
                stroke="#ff7300" 
                name="Cumulative %"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCategory === 'all' 
              ? 'All Products' 
              : `Category ${selectedCategory} Products`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
                <TableHead className="text-right">Cumulative %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow 
                  key={item.product.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onProductClick?.(item.product)}
                >
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell>{item.product.sku}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        item.category === 'A' ? 'default' : 
                        item.category === 'B' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    €{item.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.percentage.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {item.cumulativePercentage.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};