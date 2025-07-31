import { PurchaseOrder, Supplier, Product, Warehouse } from '../../types/inventory.types'
import { User } from '@/features/auth/types/auth.types'

export interface PurchaseOrderManagementProps {
  orders?: PurchaseOrder[]
  suppliers?: Supplier[]
  onOrderCreate?: (data: Partial<PurchaseOrder>) => Promise<void>
  onOrderUpdate?: (orderId: string, data: Partial<PurchaseOrder>) => Promise<void>
  onOrderDelete?: (orderId: string) => Promise<void>
  onOrderApprove?: (orderId: string, level: number) => Promise<void>
  onOrderReject?: (orderId: string, reason: string) => Promise<void>
  onOrderReceive?: (orderId: string, items: ReceiveItemData[]) => Promise<void>
  workflowEnabled?: boolean
  approvalLevels?: ApprovalLevel[]
  currentUser?: User
  isLoading?: boolean
  className?: string
}

export interface ApprovalLevel {
  level: number
  name: string
  approvers: User[]
  minAmount?: number
  maxAmount?: number
}

export interface PurchaseOrderFilters {
  search?: string
  status?: PurchaseOrder['status'] | 'all'
  supplierId?: string
  warehouseId?: string
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'all'
}

export interface OrderFormData {
  supplierId: string
  warehouseId: string
  expectedDate: Date
  items: OrderItemFormData[]
  notes?: string
  paymentTerms?: string
  shippingMethod?: string
  shippingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export interface OrderItemFormData {
  productId: string
  quantity: number
  unitPrice: number
  taxRate?: number
  discount?: number
  notes?: string
}

export interface ReceiveItemData {
  itemId: string
  receivedQuantity: number
  lotNumber?: string
  serialNumbers?: string[]
  expirationDate?: Date
  condition?: 'good' | 'damaged' | 'rejected'
  notes?: string
}

export interface OrderDetailsProps {
  order: PurchaseOrder
  onClose: () => void
  onApprove?: (level: number) => Promise<void>
  onReject?: (reason: string) => Promise<void>
  onReceive?: (items: ReceiveItemData[]) => Promise<void>
  onPrint?: () => void
  canApprove?: boolean
  canReject?: boolean
  canReceive?: boolean
  canEdit?: boolean
  approvalLevels?: ApprovalLevel[]
  currentUser?: User
}

export interface OrderListProps {
  orders: PurchaseOrder[]
  onOrderSelect: (order: PurchaseOrder) => void
  onOrderEdit?: (order: PurchaseOrder) => void
  onOrderDelete?: (order: PurchaseOrder) => void
  selectedOrderId?: string
  isLoading?: boolean
}

export interface OrderApprovalProps {
  order: PurchaseOrder
  approvalLevels: ApprovalLevel[]
  currentUser: User
  onApprove: (level: number) => Promise<void>
  onReject: (reason: string) => Promise<void>
  isLoading?: boolean
}

export interface OrderReceivingProps {
  order: PurchaseOrder
  onReceive: (items: ReceiveItemData[]) => Promise<void>
  onCancel: () => void
  warehouses?: Warehouse[]
  isLoading?: boolean
}

export interface SupplierSelectorProps {
  suppliers: Supplier[]
  selectedSupplierId?: string
  onSupplierSelect: (supplier: Supplier) => void
  onSupplierCreate?: () => void
  className?: string
}