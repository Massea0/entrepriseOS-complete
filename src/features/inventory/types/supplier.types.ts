import { ReactNode } from 'react'
import { User } from '@/features/auth/types/auth.types'
import { Money, Currency } from '@/features/finance/types/finance.types'
import { Product } from './inventory.types'

// Supplier Management Types
export type SupplierType = 
  | 'manufacturer' | 'distributor' | 'wholesaler' | 'retailer' | 'service_provider' | 'consultant'

export type SupplierStatus = 
  | 'active' | 'inactive' | 'pending_approval' | 'suspended' | 'blacklisted'

export type SupplierCategory = 
  | 'raw_materials' | 'finished_goods' | 'services' | 'equipment' | 'utilities' | 'maintenance'

export type PaymentTerms = 
  | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90' | 'due_on_receipt' | 'prepaid' | 'custom'

export type ShippingMethod = 
  | 'standard' | 'express' | 'overnight' | 'freight' | 'pickup' | 'dropship' | 'custom'

export type SupplierRating = 'excellent' | 'good' | 'fair' | 'poor' | 'unrated'

// Purchase Order Types
export type PurchaseOrderStatus = 
  | 'draft' | 'pending_approval' | 'approved' | 'sent' | 'acknowledged' 
  | 'partially_received' | 'received' | 'cancelled' | 'closed'

export type PurchaseOrderType = 
  | 'standard' | 'blanket' | 'contract' | 'emergency' | 'consignment'

export type ApprovalStatus = 
  | 'pending' | 'approved' | 'rejected' | 'escalated'

// Receiving Types
export type ReceivingStatus = 
  | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'partial'

export type QualityStatus = 
  | 'pending' | 'passed' | 'failed' | 'conditional' | 'quarantine'

// Supplier Management
export interface Supplier {
  id: string
  companyId: string
  
  // Basic information
  code: string
  name: string
  legalName?: string
  type: SupplierType
  category: SupplierCategory
  status: SupplierStatus
  
  // Contact information
  primaryContact: SupplierContact
  contacts: SupplierContact[]
  
  // Address information
  addresses: SupplierAddress[]
  
  // Business details
  taxId?: string
  registrationNumber?: string
  website?: string
  industry?: string
  businessSize?: 'small' | 'medium' | 'large' | 'enterprise'
  yearEstablished?: number
  
  // Financial information
  paymentTerms: PaymentTerms
  creditLimit?: Money
  currency: Currency
  bankDetails?: SupplierBankDetails
  
  // Shipping and logistics
  preferredShippingMethod: ShippingMethod
  shippingTerms?: string // Incoterms
  leadTimeDays: number
  minimumOrderAmount?: Money
  
  // Performance metrics
  rating: SupplierRating
  performanceScore?: number // 0-100
  onTimeDeliveryRate?: number // percentage
  qualityRating?: number // 1-5
  responseTime?: number // hours
  
  // Certifications and compliance
  certifications: SupplierCertification[]
  insuranceCertificates: InsuranceCertificate[]
  complianceChecks: ComplianceCheck[]
  
  // Product catalog
  products: SupplierProduct[]
  
  // Documents
  documents: SupplierDocument[]
  
  // Configuration
  isPreferredSupplier: boolean
  isApproved: boolean
  autoApprovalLimit?: Money
  
  // Custom fields
  customFields: Record<string, any>
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  approvedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  
  notes?: string
}

export interface SupplierContact {
  id: string
  supplierId: string
  
  // Personal information
  firstName: string
  lastName: string
  title?: string
  department?: string
  
  // Contact details
  email: string
  phone?: string
  mobile?: string
  fax?: string
  
  // Preferences
  isPrimary: boolean
  receiveOrders: boolean
  receiveInvoices: boolean
  receivePayments: boolean
  
  // Communication
  preferredMethod: 'email' | 'phone' | 'fax'
  timezone?: string
  language?: string
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SupplierAddress {
  id: string
  supplierId: string
  
  // Address details
  type: 'billing' | 'shipping' | 'returns' | 'correspondence'
  name?: string
  street: string
  street2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  
  // Geo coordinates
  latitude?: number
  longitude?: number
  
  // Configuration
  isDefault: boolean
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface SupplierBankDetails {
  bankName: string
  accountNumber: string
  routingNumber?: string
  swiftCode?: string
  iban?: string
  currency: Currency
  isActive: boolean
}

export interface SupplierCertification {
  id: string
  name: string
  certifyingBody: string
  certificateNumber: string
  issueDate: Date
  expiryDate?: Date
  isRequired: boolean
  documentUrl?: string
  verifiedAt?: Date
  verifiedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
}

export interface InsuranceCertificate {
  id: string
  type: 'general_liability' | 'product_liability' | 'workers_comp' | 'auto' | 'other'
  provider: string
  policyNumber: string
  coverageAmount: Money
  effectiveDate: Date
  expiryDate: Date
  documentUrl?: string
  isRequired: boolean
}

export interface ComplianceCheck {
  id: string
  type: 'background' | 'financial' | 'quality' | 'security' | 'environmental'
  status: 'pending' | 'passed' | 'failed' | 'expired'
  checkedDate: Date
  expiryDate?: Date
  checkedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  score?: number
  notes?: string
}

export interface SupplierProduct {
  id: string
  supplierId: string
  productId?: string // Link to internal product if exists
  
  // Product details
  supplierSku: string
  name: string
  description?: string
  category?: string
  brand?: string
  
  // Pricing
  cost: Money
  listPrice?: Money
  discountTiers?: PricingTier[]
  
  // Ordering
  minimumOrderQty: number
  orderMultiple?: number
  leadTimeDays: number
  
  // Product specifications
  unitOfMeasure: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit: 'cm' | 'mm' | 'inch'
  }
  
  // Availability
  isActive: boolean
  isPreferred: boolean
  lastOrderDate?: Date
  lastPriceUpdate: Date
  
  createdAt: Date
  updatedAt: Date
}

export interface PricingTier {
  minQuantity: number
  maxQuantity?: number
  unitPrice: Money
  discountPercent?: number
}

export interface SupplierDocument {
  id: string
  supplierId: string
  
  // Document details
  type: 'contract' | 'certificate' | 'catalog' | 'quote' | 'invoice' | 'other'
  name: string
  description?: string
  
  // File information
  fileName: string
  fileSize: number
  mimeType: string
  url: string
  
  // Metadata
  version?: string
  expiryDate?: Date
  isPublic: boolean
  
  // System
  uploadedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  uploadedAt: Date
}

// Purchase Order Management
export interface PurchaseOrder {
  id: string
  companyId: string
  
  // Basic information
  orderNumber: string
  type: PurchaseOrderType
  status: PurchaseOrderStatus
  
  // Supplier information
  supplierId: string
  supplier: Pick<Supplier, 'id' | 'name' | 'code' | 'paymentTerms' | 'currency'>
  supplierContact?: SupplierContact
  
  // Order details
  orderDate: Date
  requestedDate: Date
  expectedDate?: Date
  deliveryDate?: Date
  
  // Delivery information
  deliveryAddress: SupplierAddress
  billingAddress: SupplierAddress
  shippingMethod: ShippingMethod
  shippingTerms?: string
  
  // Financial details
  currency: Currency
  exchangeRate?: number
  
  // Lines
  lines: PurchaseOrderLine[]
  
  // Totals
  subtotal: Money
  totalDiscount: Money
  totalTax: Money
  shippingCost: Money
  totalAmount: Money
  
  // Terms and conditions
  paymentTerms: PaymentTerms
  notes?: string
  internalNotes?: string
  termsAndConditions?: string
  
  // Approval workflow
  approvalWorkflow: PurchaseOrderApproval[]
  currentApprovalLevel: number
  requiresApproval: boolean
  
  // Receiving tracking
  receivingStatus: ReceivingStatus
  receipts: GoodsReceipt[]
  
  // References
  requisitionId?: string
  contractId?: string
  projectId?: string
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  approvedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  sentBy?: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  sentAt?: Date
}

export interface PurchaseOrderLine {
  id: string
  purchaseOrderId: string
  lineNumber: number
  
  // Product information
  productId?: string
  supplierProductId?: string
  product?: Pick<Product, 'id' | 'name' | 'sku' | 'unitOfMeasure'>
  
  // Line details
  description: string
  quantity: number
  unitPrice: Money
  discount?: number
  discountAmount?: Money
  
  // Totals
  lineTotal: Money
  
  // Delivery
  requestedDate: Date
  promisedDate?: Date
  
  // Receiving tracking
  quantityReceived: number
  quantityInvoiced: number
  quantityReturned: number
  
  // Status
  status: 'pending' | 'acknowledged' | 'shipped' | 'received' | 'cancelled'
  
  // Product specifications
  specifications?: Record<string, any>
  
  // Notes
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseOrderApproval {
  id: string
  purchaseOrderId: string
  
  // Approval details
  level: number
  approverId: string
  approver: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
  
  // Status
  status: ApprovalStatus
  requiredAmount?: Money
  actualAmount: Money
  
  // Timing
  requestedAt: Date
  respondedAt?: Date
  dueDate?: Date
  
  // Response
  comments?: string
  
  // System
  createdAt: Date
}

// Goods Receipt/Receiving
export interface GoodsReceipt {
  id: string
  companyId: string
  
  // Basic information
  receiptNumber: string
  status: ReceivingStatus
  type: 'standard' | 'return' | 'exchange'
  
  // Purchase order reference
  purchaseOrderId: string
  purchaseOrder: Pick<PurchaseOrder, 'id' | 'orderNumber' | 'supplier'>
  
  // Receipt details
  receivedDate: Date
  receivedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  
  // Delivery information
  warehouseId: string
  carrier?: string
  trackingNumber?: string
  packingSlipNumber?: string
  
  // Lines
  lines: GoodsReceiptLine[]
  
  // Quality control
  qualityInspection?: QualityInspection
  
  // Totals
  totalLines: number
  totalQuantity: number
  totalValue: Money
  
  // Documents
  documents: ReceiptDocument[]
  
  // System
  createdAt: Date
  updatedAt: Date
  
  notes?: string
}

export interface GoodsReceiptLine {
  id: string
  goodsReceiptId: string
  purchaseOrderLineId: string
  
  // Product information
  productId: string
  product: Pick<Product, 'id' | 'name' | 'sku' | 'unitOfMeasure'>
  
  // Quantities
  orderedQuantity: number
  receivedQuantity: number
  acceptedQuantity: number
  rejectedQuantity: number
  
  // Quality
  qualityStatus: QualityStatus
  qualityNotes?: string
  
  // Serial/Lot tracking
  serialNumbers?: string[]
  lotNumbers?: string[]
  expirationDates?: Date[]
  
  // Costing
  unitCost: Money
  totalCost: Money
  
  // Location
  locationId?: string
  
  // Damage/Issues
  damageReported: boolean
  damageDescription?: string
  damagePhotos?: string[]
  
  createdAt: Date
}

export interface QualityInspection {
  id: string
  goodsReceiptId: string
  
  // Inspector information
  inspectedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  inspectedAt: Date
  
  // Overall result
  status: QualityStatus
  overallScore?: number // 1-10
  
  // Inspection criteria
  criteria: QualityInspectionCriteria[]
  
  // Results
  passed: boolean
  requiresReInspection: boolean
  actionRequired?: 'accept' | 'return' | 'quarantine' | 'partial_accept'
  
  // Documentation
  photos?: string[]
  documents?: string[]
  
  notes?: string
}

export interface QualityInspectionCriteria {
  id: string
  name: string
  description?: string
  type: 'visual' | 'measurement' | 'functional' | 'documentation'
  
  // Expected vs Actual
  expectedValue?: string
  actualValue?: string
  tolerance?: string
  
  // Result
  passed: boolean
  score?: number
  
  notes?: string
}

export interface ReceiptDocument {
  id: string
  goodsReceiptId: string
  
  // Document details
  type: 'packing_slip' | 'delivery_note' | 'invoice' | 'certificate' | 'photo' | 'other'
  name: string
  
  // File information
  fileName: string
  fileSize: number
  mimeType: string
  url: string
  
  // System
  uploadedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  uploadedAt: Date
}

// Purchase Requisition
export interface PurchaseRequisition {
  id: string
  companyId: string
  
  // Basic information
  requisitionNumber: string
  status: 'draft' | 'pending_approval' | 'approved' | 'partially_ordered' | 'ordered' | 'cancelled'
  type: 'standard' | 'emergency' | 'blanket'
  
  // Request details
  requestedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  department?: string
  requestedDate: Date
  requiredDate: Date
  
  // Business justification
  purpose: string
  justification?: string
  budgetCode?: string
  projectId?: string
  
  // Lines
  lines: PurchaseRequisitionLine[]
  
  // Totals
  totalLines: number
  estimatedTotal: Money
  
  // Approval workflow
  approvalWorkflow: RequisitionApproval[]
  currentApprovalLevel: number
  
  // Purchase orders created
  purchaseOrders: string[] // PO IDs
  
  // System
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  
  notes?: string
}

export interface PurchaseRequisitionLine {
  id: string
  requisitionId: string
  lineNumber: number
  
  // Product/Service details
  productId?: string
  description: string
  category?: string
  
  // Quantities and pricing
  quantity: number
  unitOfMeasure: string
  estimatedUnitPrice?: Money
  estimatedTotal?: Money
  
  // Supplier preference
  preferredSupplierId?: string
  alternativeSuppliers?: string[]
  
  // Delivery
  requiredDate: Date
  deliveryLocation?: string
  
  // Status
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
  
  // Purchase order reference
  purchaseOrderId?: string
  purchaseOrderLineId?: string
  
  // Specifications
  specifications?: Record<string, any>
  
  notes?: string
  createdAt: Date
}

export interface RequisitionApproval {
  id: string
  requisitionId: string
  
  // Approval details
  level: number
  approverId: string
  approver: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
  
  // Status
  status: ApprovalStatus
  
  // Timing
  requestedAt: Date
  respondedAt?: Date
  
  // Response
  comments?: string
  
  createdAt: Date
}

// Analytics and Reporting
export interface SupplierAnalytics {
  period: {
    start: Date
    end: Date
  }
  
  // Supplier metrics
  totalSuppliers: number
  activeSuppliers: number
  newSuppliers: number
  
  // Purchase metrics
  totalPurchaseOrders: number
  totalPurchaseValue: Money
  averageOrderValue: Money
  
  // Performance metrics
  averageLeadTime: number
  onTimeDeliveryRate: number
  qualityScore: number
  costSavings: Money
  
  // Top suppliers
  topSuppliersBySpend: Array<{
    supplier: Pick<Supplier, 'id' | 'name' | 'code'>
    totalSpend: Money
    orderCount: number
    avgLeadTime: number
    onTimeRate: number
  }>
  
  // Category breakdown
  spendByCategory: Array<{
    category: SupplierCategory
    spend: Money
    percentage: number
    supplierCount: number
  }>
  
  // Trend data
  purchaseTrend: Array<{
    date: Date
    orderCount: number
    totalValue: Money
  }>
  
  leadTimeTrend: Array<{
    date: Date
    averageLeadTime: number
  }>
  
  // Supplier performance
  supplierPerformance: Array<{
    supplier: Pick<Supplier, 'id' | 'name' | 'code'>
    performanceScore: number
    onTimeRate: number
    qualityScore: number
    responseTime: number
    riskScore: number
  }>
}

// Search and Filter Types
export interface SupplierSearchFilters {
  query?: string
  type?: SupplierType[]
  category?: SupplierCategory[]
  status?: SupplierStatus[]
  rating?: SupplierRating[]
  isPreferred?: boolean
  isApproved?: boolean
  country?: string[]
  paymentTerms?: PaymentTerms[]
  tags?: string[]
}

export interface PurchaseOrderSearchFilters {
  query?: string
  status?: PurchaseOrderStatus[]
  type?: PurchaseOrderType[]
  supplierId?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
    currency: Currency
  }
  createdBy?: string[]
  approvedBy?: string[]
  warehouseId?: string[]
}

// API Request Types
export interface CreateSupplierRequest {
  code: string
  name: string
  type: SupplierType
  category: SupplierCategory
  primaryContact: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  address: {
    street: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  paymentTerms: PaymentTerms
  currency: Currency
  leadTimeDays: number
  notes?: string
}

export interface CreatePurchaseOrderRequest {
  supplierId: string
  type?: PurchaseOrderType
  requestedDate: Date
  deliveryAddressId?: string
  shippingMethod?: ShippingMethod
  lines: Array<{
    productId?: string
    description: string
    quantity: number
    unitPrice: Money
    requestedDate?: Date
  }>
  notes?: string
  termsAndConditions?: string
}

export interface CreateGoodsReceiptRequest {
  purchaseOrderId: string
  receivedDate: Date
  warehouseId: string
  carrier?: string
  trackingNumber?: string
  lines: Array<{
    purchaseOrderLineId: string
    receivedQuantity: number
    acceptedQuantity: number
    rejectedQuantity?: number
    qualityStatus?: QualityStatus
    serialNumbers?: string[]
    lotNumbers?: string[]
    expirationDates?: Date[]
    locationId?: string
    damageReported?: boolean
    damageDescription?: string
  }>
  notes?: string
}

// Hook Return Types
export interface UseSuppliersReturn {
  suppliers: Supplier[]
  isLoading: boolean
  error: string | null
  createSupplier: (data: CreateSupplierRequest) => Promise<Supplier>
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<Supplier>
  deleteSupplier: (id: string) => Promise<void>
  searchSuppliers: (filters: SupplierSearchFilters) => Promise<Supplier[]>
  refresh: () => Promise<void>
}

export interface UsePurchaseOrdersReturn {
  purchaseOrders: PurchaseOrder[]
  isLoading: boolean
  error: string | null
  createPurchaseOrder: (data: CreatePurchaseOrderRequest) => Promise<PurchaseOrder>
  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrder>) => Promise<PurchaseOrder>
  deletePurchaseOrder: (id: string) => Promise<void>
  approvePurchaseOrder: (id: string, comments?: string) => Promise<PurchaseOrder>
  sendPurchaseOrder: (id: string) => Promise<PurchaseOrder>
  cancelPurchaseOrder: (id: string, reason?: string) => Promise<PurchaseOrder>
  searchPurchaseOrders: (filters: PurchaseOrderSearchFilters) => Promise<PurchaseOrder[]>
  refresh: () => Promise<void>
}

export interface UseGoodsReceiptsReturn {
  receipts: GoodsReceipt[]
  isLoading: boolean
  error: string | null
  createGoodsReceipt: (data: CreateGoodsReceiptRequest) => Promise<GoodsReceipt>
  updateGoodsReceipt: (id: string, data: Partial<GoodsReceipt>) => Promise<GoodsReceipt>
  deleteGoodsReceipt: (id: string) => Promise<void>
  completeReceipt: (id: string) => Promise<GoodsReceipt>
  refresh: () => Promise<void>
}

export interface UseSupplierAnalyticsReturn {
  analytics: SupplierAnalytics | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  updatePeriod: (start: Date, end: Date) => void
}