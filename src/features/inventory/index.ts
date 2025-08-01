// Services
export { InventoryService } from './services/inventory.service'
export { InventoryAnalyticsService } from './services/inventory-analytics.service'

// Components
export { ProductCatalog } from './components/ProductCatalog/ProductCatalog'
export { StockMovements } from './components/StockMovements/StockMovements'
// export { WarehouseManagement } from './components/WarehouseManagement'
// export { PurchaseOrderManagement } from './components/PurchaseOrderManagement'
// export { InventoryAnalytics } from './components/InventoryAnalytics'

// Hooks
export { useInventory } from './hooks/useInventory'
export { useInventoryAnalytics } from './hooks/useInventoryAnalytics'

// Types
export type {
  Product,
  ProductVariant,
  ProductCategory,
  ProductBundle,
  Warehouse,
  WarehouseZone,
  WarehouseLocation,
  StockLevel,
  StockMovement,
  StockMovementType,
  StockMovementReason,
  StockAdjustment,
  Supplier,
  SupplierProduct,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  InventoryTransaction,
  InventoryTransactionType,
  LowStockAlert,
  InventoryValuation,
  InventoryReport,
  InventoryMetrics,
  ProductStatus,
  TrackingMethod,
  ReplenishmentRule,
  CreateProductRequest,
  UpdateProductRequest,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  CreateStockMovementRequest,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  StockTransferRequest,
  StockAdjustmentRequest,
  BulkImportRequest
} from './types/inventory.types'