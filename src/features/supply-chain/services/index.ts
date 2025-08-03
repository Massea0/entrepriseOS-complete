// Export all Supply Chain AI services
export { inventoryPredictionService } from './inventory-prediction.service'
export { routeOptimizationService } from './route-optimization.service'
export { supplierScoringService } from './supplier-scoring.service'
export { deliveryTrackingService } from './delivery-tracking.service'
export { demandForecastingService } from './demand-forecasting.service'
export { warehouseOptimizationService } from './warehouse-optimization.service'
export { transportCostService } from './transport-cost.service'
export { supplyRiskService } from './supply-risk.service'

// Export types
export type {
  StockPrediction,
  ReorderSuggestion,
  SeasonalPattern,
  InventoryOptimization
} from './inventory-prediction.service'

export type {
  OptimizedRoute,
  TrafficPrediction,
  DeliveryAnalytics
} from './route-optimization.service'

export type {
  SupplierScore,
  SupplierRisk,
  SupplierPerformance,
  AlternativeSupplier
} from './supplier-scoring.service'

export type {
  DeliveryStatus,
  DeliveryHistory,
  DeliveryPrediction,
  CustomerNotification
} from './delivery-tracking.service'

export type {
  DemandForecast,
  MarketTrend,
  DemandAnomaly,
  SeasonalAnalysis
} from './demand-forecasting.service'

export type {
  WarehouseOptimization
} from './warehouse-optimization.service'

export type {
  TransportCostOptimization
} from './transport-cost.service'

export type {
  SupplyChainRisk
} from './supply-risk.service'