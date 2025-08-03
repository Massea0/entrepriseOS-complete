// Types pour la gestion d'entrepôt

export interface Warehouse {
  id: string
  name: string
  code: string
  type: 'central' | 'regional' | 'local'
  address: {
    street: string
    city: string
    postalCode: string
    country: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  capacity: {
    total: number
    used: number
    unit: 'm3' | 'm2' | 'pallets'
  }
  zones: WarehouseZone[]
  manager: {
    id: string
    name: string
    email: string
    phone: string
  }
  operatingHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  temperature?: {
    min: number
    max: number
    controlled: boolean
  }
  certifications: string[]
  status: 'active' | 'maintenance' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface WarehouseZone {
  id: string
  name: string
  type: 'storage' | 'picking' | 'packing' | 'shipping' | 'receiving'
  capacity: number
  currentOccupancy: number
  temperature?: {
    min: number
    max: number
  }
  hazmatApproved: boolean
  securityLevel: 'low' | 'medium' | 'high'
}

export interface StockItem {
  id: string
  productId: string
  productName: string
  sku: string
  warehouseId: string
  zoneId: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  unit: string
  batchNumber?: string
  serialNumbers?: string[]
  expirationDate?: string
  costPrice: number
  location: {
    row: string
    rack: string
    level: string
    position: string
  }
  lastInventoryDate: string
  minimumStock: number
  maximumStock: number
  reorderPoint: number
  reorderQuantity: number
  status: 'available' | 'reserved' | 'quarantine' | 'damaged' | 'expired'
}

export interface StockMovement {
  id: string
  type: 'in' | 'out' | 'transfer' | 'adjustment'
  sourceWarehouseId?: string
  sourceZoneId?: string
  destinationWarehouseId?: string
  destinationZoneId?: string
  items: StockMovementItem[]
  reason: string
  referenceType: 'purchase' | 'sale' | 'transfer' | 'return' | 'adjustment' | 'damage'
  referenceId?: string
  performedBy: {
    id: string
    name: string
  }
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
  completedAt?: string
}

export interface StockMovementItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unit: string
  batchNumber?: string
  serialNumbers?: string[]
  fromLocation?: string
  toLocation?: string
}

export interface InventoryCount {
  id: string
  warehouseId: string
  type: 'full' | 'cycle' | 'spot'
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  plannedDate: string
  startedAt?: string
  completedAt?: string
  performedBy: string[]
  items: InventoryCountItem[]
  discrepancies: number
  accuracy: number
  notes?: string
}

export interface InventoryCountItem {
  productId: string
  sku: string
  location: string
  systemQuantity: number
  countedQuantity: number
  difference: number
  status: 'pending' | 'counted' | 'verified' | 'adjusted'
  notes?: string
}