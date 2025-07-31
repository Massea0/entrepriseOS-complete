import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  warehouseApi,
  zoneApi,
  positionApi,
  productApi,
  stockMovementApi,
  purchaseOrderApi,
  stockAlertApi,
  analyticsApi,
  costingApi
} from '../api/inventory.api';
import {
  Warehouse,
  WarehouseZone,
  WarehousePosition,
  Product,
  StockMovement,
  PurchaseOrder,
  StockAlert
} from '../types/inventory.types';

// Warehouse hooks
export const useWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouseApi.list
  });
};

export const useWarehouse = (id: string) => {
  return useQuery({
    queryKey: ['warehouses', id],
    queryFn: () => warehouseApi.get(id),
    enabled: !!id
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: warehouseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create warehouse');
      console.error(error);
    }
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Warehouse> }) => 
      warehouseApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses', id] });
      toast.success('Warehouse updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update warehouse');
      console.error(error);
    }
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: warehouseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete warehouse');
      console.error(error);
    }
  });
};

// Zone hooks
export const useCreateZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: zoneApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses', variables.warehouseId] });
      toast.success('Zone created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create zone');
      console.error(error);
    }
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WarehouseZone> }) => 
      zoneApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Zone updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update zone');
      console.error(error);
    }
  });
};

export const useDeleteZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: zoneApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Zone deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete zone');
      console.error(error);
    }
  });
};

// Product hooks
export const useProducts = (filters?: {
  category?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.list(filters)
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.get(id),
    enabled: !!id
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create product');
      console.error(error);
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      productApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error(error);
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete product');
      console.error(error);
    }
  });
};

export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productIds, updates }: { productIds: string[]; updates: Partial<Product> }) => 
      productApi.bulkUpdate(productIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Products updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update products');
      console.error(error);
    }
  });
};

export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Products deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete products');
      console.error(error);
    }
  });
};

// Stock Movement hooks
export const useStockMovements = (filters?: {
  productId?: string;
  warehouseId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['stock-movements', filters],
    queryFn: () => stockMovementApi.list(filters)
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockMovementApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
      toast.success('Stock movement created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create stock movement');
      console.error(error);
    }
  });
};

// Purchase Order hooks
export const usePurchaseOrders = (filters?: {
  status?: string;
  supplierId?: string;
  warehouseId?: string;
}) => {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: () => purchaseOrderApi.list(filters)
  });
};

export const usePurchaseOrder = (id: string) => {
  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => purchaseOrderApi.get(id),
    enabled: !!id
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: purchaseOrderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase order created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create purchase order');
      console.error(error);
    }
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PurchaseOrder> }) => 
      purchaseOrderApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
      toast.success('Purchase order updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update purchase order');
      console.error(error);
    }
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: purchaseOrderApi.approve,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
      toast.success('Purchase order approved successfully');
    },
    onError: (error) => {
      toast.error('Failed to approve purchase order');
      console.error(error);
    }
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: { itemId: string; receivedQuantity: number }[] }) => 
      purchaseOrderApi.receive(id, items),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      toast.success('Purchase order received successfully');
    },
    onError: (error) => {
      toast.error('Failed to receive purchase order');
      console.error(error);
    }
  });
};

// Stock Alert hooks
export const useStockAlerts = (filters?: {
  severity?: string[];
  status?: string[];
  warehouseId?: string;
}) => {
  return useQuery({
    queryKey: ['stock-alerts', filters],
    queryFn: () => stockAlertApi.list(filters),
    refetchInterval: 60000 // Refresh every minute
  });
};

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockAlertApi.acknowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
      toast.success('Alert acknowledged');
    },
    onError: (error) => {
      toast.error('Failed to acknowledge alert');
      console.error(error);
    }
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockAlertApi.resolve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
      toast.success('Alert resolved');
    },
    onError: (error) => {
      toast.error('Failed to resolve alert');
      console.error(error);
    }
  });
};

export const useSnoozeAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, until }: { id: string; until: Date }) => 
      stockAlertApi.snooze(id, until),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
      toast.success('Alert snoozed');
    },
    onError: (error) => {
      toast.error('Failed to snooze alert');
      console.error(error);
    }
  });
};

// Analytics hooks
export const useInventoryValue = (warehouseId?: string) => {
  return useQuery({
    queryKey: ['inventory-value', warehouseId],
    queryFn: () => analyticsApi.getInventoryValue(warehouseId)
  });
};

export const useABCAnalysis = (periodDays: number = 90) => {
  return useQuery({
    queryKey: ['abc-analysis', periodDays],
    queryFn: () => analyticsApi.getABCAnalysis(periodDays)
  });
};

export const useTurnoverRate = (productId: string, warehouseId?: string, periodDays: number = 365) => {
  return useQuery({
    queryKey: ['turnover-rate', productId, warehouseId, periodDays],
    queryFn: () => analyticsApi.getTurnoverRate(productId, warehouseId, periodDays),
    enabled: !!productId
  });
};

export const useForecast = (params: {
  productId?: string;
  warehouseId?: string;
  forecastDays?: number;
}) => {
  return useQuery({
    queryKey: ['forecast', params],
    queryFn: () => analyticsApi.forecast(params),
    enabled: !!params.productId || !!params.warehouseId
  });
};

export const useOptimization = (params: {
  warehouseId?: string;
  categoryId?: string;
}) => {
  return useQuery({
    queryKey: ['optimization', params],
    queryFn: () => analyticsApi.optimize(params)
  });
};

export const useTrendAnalysis = (params: {
  productId?: string;
  periodDays?: number;
}) => {
  return useQuery({
    queryKey: ['trend-analysis', params],
    queryFn: () => analyticsApi.analyzeTrends(params)
  });
};

// Costing hooks
export const useCosting = (params: {
  method: 'FIFO' | 'LIFO' | 'AVERAGE';
  productId?: string;
  warehouseId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['costing', params],
    queryFn: () => costingApi.calculate(params)
  });
};