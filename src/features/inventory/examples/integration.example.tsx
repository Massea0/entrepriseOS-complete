/**
 * Example: Using the Inventory Integration Layer
 * This file demonstrates how to use the inventory hooks and services
 */

import React from 'react';
import { 
  useProducts, 
  useCreateProduct,
  useWarehouses,
  useCreateStockMovement,
  useStockAlerts,
  useForecast,
  useABCAnalysis
} from '../hooks';
import { InventoryService } from '../services';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Example 1: Product List Component
export function ProductListExample() {
  const { data: products, isLoading, error } = useProducts({
    category: 'Electronics',
    status: 'active'
  });

  const createProduct = useCreateProduct();

  const handleCreateProduct = async () => {
    await createProduct.mutateAsync({
      name: 'New Product',
      sku: 'SKU-001',
      category: 'Electronics',
      description: 'A new product',
      unitPrice: 99.99,
      currency: 'EUR',
      trackingType: 'serial',
      minStockLevel: 10,
      maxStockLevel: 100,
      reorderPoint: 20,
      reorderQuantity: 50,
      supplierProducts: []
    });
  };

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      <Button onClick={handleCreateProduct}>Create Product</Button>
      <ul>
        {products?.map(product => (
          <li key={product.id}>
            {product.name} - Stock: {product.currentStock}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Example 2: Stock Transfer Component
export function StockTransferExample() {
  const { data: warehouses } = useWarehouses();
  const createMovement = useCreateStockMovement();

  const handleTransfer = async () => {
    try {
      await InventoryService.transferStock({
        productId: 'product-id',
        fromWarehouseId: 'warehouse-1',
        toWarehouseId: 'warehouse-2',
        quantity: 10,
        reason: 'Balancing stock levels'
      });
      
      toast.success('Stock transferred successfully');
    } catch (error) {
      toast.error('Failed to transfer stock');
    }
  };

  return (
    <div>
      <h3>Transfer Stock</h3>
      <Button onClick={handleTransfer}>Transfer 10 units</Button>
    </div>
  );
}

// Example 3: Stock Alerts Dashboard
export function StockAlertsExample() {
  const { data: alerts } = useStockAlerts({
    severity: ['critical', 'warning'],
    status: ['active']
  });

  return (
    <div>
      <h3>Active Stock Alerts</h3>
      {alerts?.map(alert => (
        <div key={alert.id} className="p-4 border rounded mb-2">
          <h4>{alert.product.name}</h4>
          <p>Severity: {alert.severity}</p>
          <p>Current Stock: {alert.currentStock}</p>
          <p>{alert.message}</p>
        </div>
      ))}
    </div>
  );
}

// Example 4: Demand Forecasting
export function DemandForecastExample({ productId }: { productId: string }) {
  const { data: forecast } = useForecast({
    productId,
    forecastDays: 30
  });

  if (!forecast) return null;

  return (
    <div>
      <h3>30-Day Demand Forecast</h3>
      {forecast.forecasts.map((f: any) => (
        <div key={f.date}>
          {f.date}: {f.predictedDemand} units
          (Range: {f.lowerBound} - {f.upperBound})
        </div>
      ))}
      <div>
        <h4>Recommendations:</h4>
        <p>Reorder Date: {forecast.recommendations.reorderDate}</p>
        <p>Reorder Quantity: {forecast.recommendations.reorderQuantity}</p>
        <p>Safety Stock: {forecast.recommendations.safetyStock}</p>
        <p>Stockout Risk: {forecast.recommendations.stockoutRisk}</p>
      </div>
    </div>
  );
}

// Example 5: ABC Analysis
export function ABCAnalysisExample() {
  const { data: analysis } = useABCAnalysis(90);

  if (!analysis) return null;

  const aItems = analysis.filter((item: any) => item.category === 'A');
  const bItems = analysis.filter((item: any) => item.category === 'B');
  const cItems = analysis.filter((item: any) => item.category === 'C');

  return (
    <div>
      <h3>ABC Analysis (Last 90 Days)</h3>
      
      <div>
        <h4>Category A ({aItems.length} items - 80% of revenue)</h4>
        {aItems.map((item: any) => (
          <div key={item.product.id}>
            {item.product.name}: €{item.revenue.toFixed(2)}
          </div>
        ))}
      </div>

      <div>
        <h4>Category B ({bItems.length} items - 15% of revenue)</h4>
        {bItems.map((item: any) => (
          <div key={item.product.id}>
            {item.product.name}: €{item.revenue.toFixed(2)}
          </div>
        ))}
      </div>

      <div>
        <h4>Category C ({cItems.length} items - 5% of revenue)</h4>
        {cItems.map((item: any) => (
          <div key={item.product.id}>
            {item.product.name}: €{item.revenue.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 6: Complex Operations
export function ComplexOperationsExample() {
  const handleStockCount = async () => {
    try {
      await InventoryService.performStockCount({
        counts: [
          {
            productId: 'product-1',
            warehouseId: 'warehouse-1',
            countedQuantity: 95,
            expectedQuantity: 100
          },
          {
            productId: 'product-2',
            warehouseId: 'warehouse-1',
            countedQuantity: 205,
            expectedQuantity: 200
          }
        ],
        reason: 'Monthly stock count'
      });

      toast.success('Stock count completed');
    } catch (error) {
      toast.error('Stock count failed');
    }
  };

  const handleQuickReceive = async () => {
    try {
      const order = await InventoryService.quickReceivePurchaseOrder({
        supplierId: 'supplier-1',
        warehouseId: 'warehouse-1',
        items: [
          {
            productId: 'product-1',
            quantity: 100,
            unitPrice: 25.50
          }
        ],
        notes: 'Urgent restock'
      });

      toast.success(`Order ${order.orderNumber} created and received`);
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const handleGetReorderSuggestions = async () => {
    try {
      const suggestions = await InventoryService.getReorderSuggestions();
      console.log('Reorder suggestions:', suggestions);
      toast.success(`Found ${suggestions.length} reorder suggestions`);
    } catch (error) {
      toast.error('Failed to get suggestions');
    }
  };

  return (
    <div className="space-y-4">
      <h3>Complex Operations</h3>
      
      <Button onClick={handleStockCount}>
        Perform Stock Count
      </Button>

      <Button onClick={handleQuickReceive}>
        Quick Receive Order
      </Button>

      <Button onClick={handleGetReorderSuggestions}>
        Get Reorder Suggestions
      </Button>
    </div>
  );
}

// Example 7: Real-time Updates
export function RealTimeUpdatesExample() {
  // Stock alerts refresh every minute automatically
  const { data: alerts } = useStockAlerts(
    { status: ['active'] },
    // This is handled by the hook's refetchInterval
  );

  // You can also manually refetch
  const { data: products, refetch } = useProducts();

  return (
    <div>
      <h3>Real-time Updates</h3>
      <p>Active Alerts: {alerts?.length || 0}</p>
      <p>Total Products: {products?.length || 0}</p>
      <Button onClick={() => refetch()}>Refresh Products</Button>
    </div>
  );
}