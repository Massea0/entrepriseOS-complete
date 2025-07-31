import { Warehouse, WarehouseZone, WarehousePosition } from '../../types/inventory.types'

export type ViewMode = 'grid' | 'map' | 'list'

export interface WarehouseManagerProps {
  warehouses?: Warehouse[]
  selectedWarehouse?: Warehouse | null
  onWarehouseSelect?: (warehouse: Warehouse) => void
  onWarehouseCreate?: (data: Partial<Warehouse>) => Promise<void>
  onWarehouseUpdate?: (id: string, data: Partial<Warehouse>) => Promise<void>
  onWarehouseDelete?: (id: string) => Promise<void>
  onZoneCreate?: (warehouseId: string, data: Partial<WarehouseZone>) => Promise<void>
  onZoneUpdate?: (warehouseId: string, zoneId: string, data: Partial<WarehouseZone>) => Promise<void>
  onZoneDelete?: (warehouseId: string, zoneId: string) => Promise<void>
  onPositionUpdate?: (warehouseId: string, zoneId: string, positionId: string, data: Partial<WarehousePosition>) => Promise<void>
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  isLoading?: boolean
  className?: string
}

export interface WarehouseCardProps {
  warehouse: Warehouse
  isSelected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
  className?: string
}

export interface WarehouseGridProps {
  warehouses: Warehouse[]
  selectedWarehouseId?: string
  onWarehouseSelect: (warehouse: Warehouse) => void
  onWarehouseEdit?: (warehouse: Warehouse) => void
  onWarehouseDelete?: (warehouse: Warehouse) => void
  isLoading?: boolean
}

export interface WarehouseMapProps {
  warehouse: Warehouse
  onZoneClick?: (zone: WarehouseZone) => void
  onPositionClick?: (zone: WarehouseZone, position: WarehousePosition) => void
  selectedZoneId?: string
  selectedPositionId?: string
  showCapacity?: boolean
  showHeatmap?: boolean
  className?: string
}

export interface ZoneManagerProps {
  warehouse: Warehouse
  zones: WarehouseZone[]
  onZoneCreate?: (data: Partial<WarehouseZone>) => Promise<void>
  onZoneUpdate?: (zoneId: string, data: Partial<WarehouseZone>) => Promise<void>
  onZoneDelete?: (zoneId: string) => Promise<void>
  onPositionUpdate?: (zoneId: string, positionId: string, data: Partial<WarehousePosition>) => Promise<void>
  selectedZoneId?: string
  onZoneSelect?: (zone: WarehouseZone) => void
  className?: string
}

export interface PositionTrackerProps {
  zone: WarehouseZone
  positions: WarehousePosition[]
  onPositionUpdate?: (positionId: string, data: Partial<WarehousePosition>) => Promise<void>
  onPositionSelect?: (position: WarehousePosition) => void
  selectedPositionId?: string
  showOccupancy?: boolean
  className?: string
}

export interface CapacityIndicatorProps {
  used: number
  total: number
  unit?: string
  showPercentage?: boolean
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface WarehouseFormData {
  name: string
  code: string
  type: 'main' | 'satellite' | 'distribution' | 'transit'
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  contact: {
    name?: string
    email?: string
    phone?: string
  }
  operatingHours?: {
    monday?: { open: string; close: string }
    tuesday?: { open: string; close: string }
    wednesday?: { open: string; close: string }
    thursday?: { open: string; close: string }
    friday?: { open: string; close: string }
    saturday?: { open: string; close: string }
    sunday?: { open: string; close: string }
  }
  configuration?: {
    enableBarcodeScanning?: boolean
    enableRFID?: boolean
    enableAutomatedPicking?: boolean
    defaultPickingStrategy?: 'fifo' | 'lifo' | 'fefo' | 'nearest'
  }
}

export interface ZoneFormData {
  name: string
  code: string
  type: 'storage' | 'picking' | 'receiving' | 'shipping' | 'quarantine' | 'returns'
  temperature?: 'ambient' | 'refrigerated' | 'frozen'
  securityLevel?: 'standard' | 'restricted' | 'high-security'
  maxWeight?: number
  maxVolume?: number
  aisles?: number
  shelves?: number
  positions?: number
}