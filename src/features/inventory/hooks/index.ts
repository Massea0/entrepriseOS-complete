// Export all inventory hooks
export * from './useInventory';

// Re-export commonly used hooks with shorter names
export {
  // Warehouse
  useWarehouses,
  useWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
  
  // Zone
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
  
  // Product
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkUpdateProducts,
  useBulkDeleteProducts,
  
  // Stock Movement
  useStockMovements,
  useCreateStockMovement,
  
  // Purchase Order
  usePurchaseOrders,
  usePurchaseOrder,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useApprovePurchaseOrder,
  useReceivePurchaseOrder,
  
  // Stock Alert
  useStockAlerts,
  useAcknowledgeAlert,
  useResolveAlert,
  useSnoozeAlert,
  
  // Analytics
  useInventoryValue,
  useABCAnalysis,
  useTurnoverRate,
  useForecast,
  useOptimization,
  useTrendAnalysis,
  
  // Costing
  useCosting
} from './useInventory';