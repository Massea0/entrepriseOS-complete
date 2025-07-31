// Export all API modules
export * from './inventory.api';

// Re-export API namespaces for convenience
export {
  warehouseApi,
  zoneApi,
  positionApi,
  productApi,
  stockMovementApi,
  purchaseOrderApi,
  stockAlertApi,
  analyticsApi,
  costingApi
} from './inventory.api';