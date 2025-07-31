import { StockMovement, Product, Warehouse, WarehouseZone } from '../../types/inventory.types'

export interface StockMovementsProps {
  movements?: StockMovement[]
  filters?: StockMovementFilters
  onMovementCreate?: (data: Partial<StockMovement>) => Promise<void>
  onMovementCancel?: (movementId: string) => Promise<void>
  onMovementUpdate?: (movementId: string, data: Partial<StockMovement>) => Promise<void>
  onFiltersChange?: (filters: StockMovementFilters) => void
  showAdvancedFilters?: boolean
  exportOptions?: ExportFormat[]
  isLoading?: boolean
  className?: string
}

export interface StockMovementFilters {
  search?: string
  type?: StockMovement['type'] | 'all'
  status?: StockMovement['status'] | 'all'
  warehouseId?: string
  zoneId?: string
  productId?: string
  dateFrom?: Date
  dateTo?: Date
  minQuantity?: number
  maxQuantity?: number
  userId?: string
}

export type ExportFormat = 'PDF' | 'Excel' | 'CSV'

export interface MovementFormData {
  type: StockMovement['type']
  productId: string
  quantity: number
  fromWarehouseId?: string
  fromZoneId?: string
  fromPositionId?: string
  toWarehouseId?: string
  toZoneId?: string
  toPositionId?: string
  reason?: string
  reference?: string
  notes?: string
  scheduledDate?: Date
}

export interface MovementDetailsProps {
  movement: StockMovement
  onClose: () => void
  onCancel?: () => Promise<void>
  onApprove?: () => Promise<void>
  canEdit?: boolean
  canCancel?: boolean
  canApprove?: boolean
}

export interface MovementTimelineProps {
  movements: StockMovement[]
  groupBy?: 'day' | 'week' | 'month'
  onMovementClick?: (movement: StockMovement) => void
  className?: string
}

export interface MovementStatsProps {
  movements: StockMovement[]
  period?: 'day' | 'week' | 'month' | 'year'
  className?: string
}

export interface BulkMovementProps {
  onSubmit: (movements: MovementFormData[]) => Promise<void>
  onCancel: () => void
  warehouses?: Warehouse[]
  products?: Product[]
  isLoading?: boolean
}

export interface MovementFiltersPanelProps {
  filters: StockMovementFilters
  onFiltersChange: (filters: StockMovementFilters) => void
  warehouses?: Warehouse[]
  products?: Product[]
  showAdvanced?: boolean
  onReset?: () => void
  className?: string
}