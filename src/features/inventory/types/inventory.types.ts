import { ReactNode } from 'react'
import { User } from '@/features/auth/types/auth.types'
import { Money, Currency } from '@/features/finance/types/finance.types'

// Core Inventory Types
export type ProductType = 
  | 'physical' | 'digital' | 'service' | 'bundle' | 'kit' | 'subscription'

export type ProductStatus = 
  | 'active' | 'inactive' | 'discontinued' | 'draft' | 'pending_approval'

export type UnitOfMeasure = 
  | 'piece' | 'kg' | 'g' | 'liter' | 'ml' | 'meter' | 'cm' | 'mm' 
  | 'pack' | 'box' | 'pallet' | 'case' | 'dozen' | 'pair' | 'set'

export type StockMovementType = 
  | 'in' | 'out' | 'transfer' | 'adjustment' | 'return' | 'damage' 
  | 'theft' | 'count' | 'correction' | 'assembly' | 'disassembly'

export type StockMovementStatus = 
  | 'pending' | 'confirmed' | 'cancelled' | 'partial' | 'completed'

export type CostingMethod = 
  | 'fifo' | 'lifo' | 'average' | 'standard' | 'specific'

export type ABCClassification = 'A' | 'B' | 'C' | 'unclassified'

export type StockStatus = 
  | 'available' | 'reserved' | 'damaged' | 'quarantine' | 'expired' | 'returned'

// Product Management
export interface Product {
  id: string
  companyId: string
  
  // Basic information
  sku: string
  name: string
  description?: string
  type: ProductType
  status: ProductStatus
  
  // Categorization
  category?: ProductCategory
  subcategory?: string
  brand?: string
  manufacturer?: string
  
  // Physical properties
  unitOfMeasure: UnitOfMeasure
  weight?: number
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz'
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit: 'cm' | 'mm' | 'inch'
  }
  
  // Identification
  barcode?: string
  qrCode?: string
  internalCode?: string
  externalCodes?: Record<string, string> // supplier codes, etc.
  
  // Inventory settings
  trackInventory: boolean
  trackSerial: boolean
  trackLot: boolean
  trackExpiration: boolean
  
  // Stock levels
  reorderPoint?: number
  reorderQuantity?: number
  minimumStock?: number
  maximumStock?: number
  safetyStock?: number
  
  // Costing
  costingMethod: CostingMethod
  standardCost?: Money
  averageCost?: Money
  lastCost?: Money
  
  // Pricing
  listPrice?: Money
  salePrice?: Money
  wholeSalePrice?: Money
  
  // Variants (for configurable products)
  hasVariants: boolean
  variantAttributes?: ProductVariantAttribute[]
  variants?: ProductVariant[]
  
  // Bundle/Kit (for composite products)
  isBundle: boolean
  bundleItems?: BundleItem[]
  
  // Images and documents
  images?: ProductImage[]
  documents?: ProductDocument[]
  
  // Supplier information
  primarySupplierId?: string
  suppliers?: ProductSupplier[]
  
  // Classification
  abcClassification?: ABCClassification
  velocityCode?: 'fast' | 'medium' | 'slow' | 'obsolete'
  
  // Compliance
  requiresCertification?: boolean
  certifications?: ProductCertification[]
  hazardous?: boolean
  hazardInfo?: HazardInformation
  
  // Custom fields
  customFields: Record<string, any>
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export interface ProductCategory {
  id: string
  companyId: string
  name: string
  description?: string
  parentId?: string
  level: number
  path: string
  isActive: boolean
  sortOrder: number
  customFields: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariantAttribute {
  id: string
  name: string
  type: 'color' | 'size' | 'material' | 'style' | 'custom'
  values: string[]
  required: boolean
  sortOrder: number
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name?: string
  
  // Variant-specific values
  attributeValues: Record<string, string>
  
  // Override parent product settings
  barcode?: string
  price?: Money
  cost?: Money
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit: 'cm' | 'mm' | 'inch'
  }
  
  // Stock settings (can override parent)
  reorderPoint?: number
  reorderQuantity?: number
  
  // Images specific to variant
  images?: ProductImage[]
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BundleItem {
  id: string
  productId: string
  product: Pick<Product, 'id' | 'name' | 'sku' | 'unitOfMeasure'>
  quantity: number
  isOptional: boolean
  sortOrder: number
}

export interface ProductImage {
  id: string
  url: string
  name: string
  alt?: string
  isPrimary: boolean
  sortOrder: number
  uploadedAt: Date
}

export interface ProductDocument {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'image' | 'other'
  url: string
  size: number
  uploadedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  uploadedAt: Date
}

export interface ProductSupplier {
  id: string
  supplierId: string
  supplierName: string
  supplierSku?: string
  isPrimary: boolean
  leadTimeDays: number
  minimumOrderQty?: number
  orderMultiple?: number
  cost: Money
  lastOrderDate?: Date
  isActive: boolean
}

export interface ProductCertification {
  id: string
  name: string
  certifyingBody: string
  certificationNumber: string
  issueDate: Date
  expiryDate?: Date
  documentUrl?: string
}

export interface HazardInformation {
  hazardClass?: string
  unNumber?: string
  packingGroup?: string
  properShippingName?: string
  hazardLabels?: string[]
  specialInstructions?: string
}

// Warehouse Management
export interface Warehouse {
  id: string
  companyId: string
  
  // Basic information
  code: string
  name: string
  description?: string
  type: 'main' | 'satellite' | 'virtual' | 'consignment' | 'dropship'
  
  // Location
  address: {
    street: string
    city: string
    state?: string
    postalCode: string
    country: string
    latitude?: number
    longitude?: number
  }
  
  // Contact information
  phone?: string
  email?: string
  managerName?: string
  managerPhone?: string
  
  // Configuration
  isActive: boolean
  isDefault: boolean
  allowNegativeStock: boolean
  requireLocationForStock: boolean
  
  // Operational settings
  timezone: string
  operatingHours?: {
    [key: string]: { // day of week
      open: string
      close: string
      isOpen: boolean
    }
  }
  
  // Zones and locations
  zones?: WarehouseZone[]
  defaultZoneId?: string
  
  // Custom fields
  customFields: Record<string, any>
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
}

export interface WarehouseZone {
  id: string
  warehouseId: string
  
  // Basic information
  code: string
  name: string
  description?: string
  type: 'receiving' | 'storage' | 'picking' | 'shipping' | 'returns' | 'damaged'
  
  // Physical layout
  aisles?: WarehouseAisle[]
  
  // Configuration
  isActive: boolean
  temperature?: {
    min: number
    max: number
    unit: 'celsius' | 'fahrenheit'
  }
  humidity?: {
    min: number
    max: number
  }
  
  // Capacity
  maxWeight?: number
  maxVolume?: number
  
  createdAt: Date
  updatedAt: Date
}

export interface WarehouseAisle {
  id: string
  zoneId: string
  
  // Basic information
  code: string
  name: string
  
  // Layout
  shelves?: WarehouseShelf[]
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WarehouseShelf {
  id: string
  aisleId: string
  
  // Basic information
  code: string
  name: string
  
  // Layout
  positions?: WarehousePosition[]
  
  // Physical properties
  levels: number
  weightCapacity?: number
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WarehousePosition {
  id: string
  shelfId: string
  
  // Location hierarchy
  warehouseId: string
  zoneId: string
  aisleId: string
  
  // Basic information
  code: string
  name: string
  fullPath: string // e.g., "WH01-A01-01-A"
  
  // Physical properties
  level: number
  sequence: number
  
  // Capacity
  maxWeight?: number
  maxVolume?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit: 'cm' | 'mm' | 'inch'
  }
  
  // Current status
  isOccupied: boolean
  isBlocked: boolean
  isActive: boolean
  
  // Configuration
  allowMixedProducts: boolean
  allowMixedLots: boolean
  pickingPriority: number
  
  createdAt: Date
  updatedAt: Date
}

// Stock Management
export interface StockLevel {
  id: string
  companyId: string
  
  // Product and location
  productId: string
  warehouseId: string
  locationId?: string // position ID
  
  // Serial/Lot tracking
  serialNumber?: string
  lotNumber?: string
  expirationDate?: Date
  
  // Quantities
  quantityOnHand: number
  quantityAvailable: number
  quantityReserved: number
  quantityAllocated: number
  quantityOnOrder: number
  quantityInTransit: number
  
  // Costing
  unitCost: Money
  totalValue: Money
  lastCostUpdate: Date
  
  // Status
  status: StockStatus
  
  // Quality
  qualityStatus?: 'pass' | 'fail' | 'pending' | 'quarantine'
  lastCountDate?: Date
  lastMovementDate?: Date
  
  // Custom fields
  customFields: Record<string, any>
  
  // System
  createdAt: Date
  updatedAt: Date
}

export interface StockMovement {
  id: string
  companyId: string
  
  // Movement details
  type: StockMovementType
  status: StockMovementStatus
  referenceNumber?: string
  
  // Product and location
  productId: string
  product: Pick<Product, 'id' | 'name' | 'sku' | 'unitOfMeasure'>
  
  // Source and destination
  fromWarehouseId?: string
  fromLocationId?: string
  toWarehouseId?: string
  toLocationId?: string
  
  // Serial/Lot tracking
  serialNumber?: string
  lotNumber?: string
  expirationDate?: Date
  
  // Quantities
  quantity: number
  unitCost?: Money
  totalCost?: Money
  
  // Reasons and references
  reason?: string
  referenceType?: 'purchase_order' | 'sales_order' | 'transfer' | 'adjustment' | 'return'
  referenceId?: string
  
  // Approval workflow
  requiresApproval: boolean
  approvedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  approvedAt?: Date
  
  // Quality control
  qualityCheck?: {
    status: 'pass' | 'fail' | 'pending'
    checkedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
    checkedAt: Date
    notes?: string
  }
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  processedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  processedAt?: Date
  
  notes?: string
}

export interface StockAdjustment {
  id: string
  companyId: string
  
  // Basic information
  adjustmentNumber: string
  type: 'count' | 'correction' | 'write_off' | 'write_on' | 'damage' | 'theft'
  status: 'draft' | 'pending_approval' | 'approved' | 'cancelled' | 'completed'
  
  // Reference
  reason: string
  referenceNumber?: string
  
  // Lines
  lines: StockAdjustmentLine[]
  
  // Totals
  totalLines: number
  totalAdjustmentValue: Money
  
  // Approval workflow
  requiresApproval: boolean
  approvedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  approvedAt?: Date
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  
  notes?: string
}

export interface StockAdjustmentLine {
  id: string
  adjustmentId: string
  
  // Product and location
  productId: string
  product: Pick<Product, 'id' | 'name' | 'sku' | 'unitOfMeasure'>
  warehouseId: string
  locationId?: string
  
  // Serial/Lot tracking
  serialNumber?: string
  lotNumber?: string
  
  // Quantities
  currentQuantity: number
  adjustedQuantity: number
  adjustmentQuantity: number // difference
  
  // Costing
  unitCost: Money
  adjustmentValue: Money
  
  // Reason
  reason?: string
  
  createdAt: Date
}

// Stock Transfer
export interface StockTransfer {
  id: string
  companyId: string
  
  // Basic information
  transferNumber: string
  status: 'draft' | 'pending' | 'in_transit' | 'received' | 'cancelled' | 'completed'
  type: 'internal' | 'inter_company' | 'consignment'
  
  // Source and destination
  fromWarehouseId: string
  fromWarehouse: Pick<Warehouse, 'id' | 'name' | 'code'>
  toWarehouseId: string
  toWarehouse: Pick<Warehouse, 'id' | 'name' | 'code'>
  
  // Dates
  requestedDate: Date
  shippedDate?: Date
  expectedDate?: Date
  receivedDate?: Date
  
  // Lines
  lines: StockTransferLine[]
  
  // Totals
  totalLines: number
  totalQuantity: number
  totalValue: Money
  
  // Shipping information
  shippingMethod?: string
  trackingNumber?: string
  carrier?: string
  
  // System
  requestedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  shippedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  receivedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
  
  notes?: string
}

export interface StockTransferLine {
  id: string
  transferId: string
  
  // Product
  productId: string
  product: Pick<Product, 'id' | 'name' | 'sku' | 'unitOfMeasure'>
  
  // Serial/Lot tracking
  serialNumber?: string
  lotNumber?: string
  
  // Quantities
  requestedQuantity: number
  shippedQuantity?: number
  receivedQuantity?: number
  
  // Costing
  unitCost: Money
  totalCost: Money
  
  // Status
  status: 'pending' | 'shipped' | 'received' | 'cancelled'
  
  createdAt: Date
}

// Inventory Analytics Types
export interface InventoryAnalytics {
  period: {
    start: Date
    end: Date
  }
  
  // Stock metrics
  totalProducts: number
  totalSkus: number
  totalValue: Money
  averageValue: Money
  
  // Movement metrics
  totalMovements: number
  inboundMovements: number
  outboundMovements: number
  totalInboundValue: Money
  totalOutboundValue: Money
  
  // Performance metrics
  stockTurnover: number
  daysSalesInventory: number
  inventoryAccuracy: number
  stockoutRate: number
  carryingCostRate: number
  
  // ABC Analysis
  abcAnalysis: {
    A: { count: number; value: Money; percentage: number }
    B: { count: number; value: Money; percentage: number }
    C: { count: number; value: Money; percentage: number }
  }
  
  // Top performing items
  topMovingProducts: Array<{
    product: Pick<Product, 'id' | 'name' | 'sku'>
    quantity: number
    value: Money
    frequency: number
  }>
  
  // Slow moving items
  slowMovingProducts: Array<{
    product: Pick<Product, 'id' | 'name' | 'sku'>
    daysSinceLastMovement: number
    quantityOnHand: number
    value: Money
  }>
  
  // Trend data
  stockValueTrend: Array<{
    date: Date
    value: Money
  }>
  
  movementTrend: Array<{
    date: Date
    inbound: number
    outbound: number
  }>
  
  // Warehouse breakdown
  warehouseMetrics: Array<{
    warehouse: Pick<Warehouse, 'id' | 'name' | 'code'>
    totalValue: Money
    utilization: number
    accuracy: number
  }>
}

// Search and Filter types
export interface ProductSearchFilters {
  query?: string
  categoryId?: string
  type?: ProductType[]
  status?: ProductStatus[]
  brand?: string[]
  supplierId?: string[]
  abcClassification?: ABCClassification[]
  hasStock?: boolean
  belowReorderPoint?: boolean
  priceRange?: {
    min: number
    max: number
    currency: Currency
  }
  warehouseId?: string
  tags?: string[]
}

export interface StockSearchFilters {
  query?: string
  productId?: string
  warehouseId?: string
  locationId?: string
  status?: StockStatus[]
  lotNumber?: string
  serialNumber?: string
  expirationBefore?: Date
  expirationAfter?: Date
  quantityRange?: {
    min: number
    max: number
  }
  lastMovementBefore?: Date
  lastMovementAfter?: Date
}

export interface MovementSearchFilters {
  query?: string
  type?: StockMovementType[]
  status?: StockMovementStatus[]
  productId?: string
  warehouseId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  createdBy?: string[]
  referenceNumber?: string
  referenceType?: string
}

// API Request Types
export interface CreateProductRequest {
  sku: string
  name: string
  description?: string
  type: ProductType
  categoryId?: string
  unitOfMeasure: UnitOfMeasure
  trackInventory?: boolean
  reorderPoint?: number
  reorderQuantity?: number
  standardCost?: Money
  listPrice?: Money
  supplierId?: string
  notes?: string
}

export interface CreateWarehouseRequest {
  code: string
  name: string
  description?: string
  type: 'main' | 'satellite' | 'virtual' | 'consignment' | 'dropship'
  address: {
    street: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  phone?: string
  email?: string
  timezone: string
}

export interface CreateStockMovementRequest {
  type: StockMovementType
  productId: string
  fromWarehouseId?: string
  toWarehouseId?: string
  fromLocationId?: string
  toLocationId?: string
  quantity: number
  unitCost?: Money
  reason?: string
  referenceType?: string
  referenceId?: string
  serialNumber?: string
  lotNumber?: string
  expirationDate?: Date
}

export interface CreateStockAdjustmentRequest {
  type: 'count' | 'correction' | 'write_off' | 'write_on' | 'damage' | 'theft'
  reason: string
  referenceNumber?: string
  lines: Array<{
    productId: string
    warehouseId: string
    locationId?: string
    currentQuantity: number
    adjustedQuantity: number
    serialNumber?: string
    lotNumber?: string
    reason?: string
  }>
  notes?: string
}

// Hook Return Types
export interface UseProductsReturn {
  products: Product[]
  isLoading: boolean
  error: string | null
  createProduct: (data: CreateProductRequest) => Promise<Product>
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
  searchProducts: (filters: ProductSearchFilters) => Promise<Product[]>
  refresh: () => Promise<void>
}

export interface UseWarehousesReturn {
  warehouses: Warehouse[]
  isLoading: boolean
  error: string | null
  createWarehouse: (data: CreateWarehouseRequest) => Promise<Warehouse>
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<Warehouse>
  deleteWarehouse: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface UseStockReturn {
  stockLevels: StockLevel[]
  isLoading: boolean
  error: string | null
  getStockByProduct: (productId: string, warehouseId?: string) => StockLevel[]
  updateStock: (id: string, data: Partial<StockLevel>) => Promise<StockLevel>
  searchStock: (filters: StockSearchFilters) => Promise<StockLevel[]>
  refresh: () => Promise<void>
}

export interface UseStockMovementsReturn {
  movements: StockMovement[]
  isLoading: boolean
  error: string | null
  createMovement: (data: CreateStockMovementRequest) => Promise<StockMovement>
  updateMovement: (id: string, data: Partial<StockMovement>) => Promise<StockMovement>
  deleteMovement: (id: string) => Promise<void>
  searchMovements: (filters: MovementSearchFilters) => Promise<StockMovement[]>
  refresh: () => Promise<void>
}

export interface UseInventoryAnalyticsReturn {
  analytics: InventoryAnalytics | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  updatePeriod: (start: Date, end: Date) => void
}