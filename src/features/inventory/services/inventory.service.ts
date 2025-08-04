import { ky } from '@/services/api'
import { InventoryMockService } from './inventory-mock.service'
import type {
  Product,
  Warehouse,
  StockLevel,
  StockMovement,
  StockAdjustment,
  StockTransfer,
  InventoryAnalytics,
  ProductCategory,
  ProductVariant,
  CreateProductRequest,
  CreateWarehouseRequest,
  CreateStockMovementRequest,
  CreateStockAdjustmentRequest,
  ProductSearchFilters,
  StockSearchFilters,
  MovementSearchFilters,
  ProductType,
  ProductStatus,
  UnitOfMeasure,
  StockMovementType,
  StockMovementStatus,
  CostingMethod,
  ABCClassification,
  StockStatus
} from '../types/inventory.types'

// Utiliser le mode mock
const USE_MOCK = true
import type {
  Supplier,
  PurchaseOrder,
  GoodsReceipt,
  SupplierAnalytics,
  CreateSupplierRequest,
  CreatePurchaseOrderRequest,
  CreateGoodsReceiptRequest,
  SupplierSearchFilters,
  PurchaseOrderSearchFilters,
  SupplierType,
  SupplierStatus,
  PaymentTerms,
  PurchaseOrderStatus
} from '../types/supplier.types'
import { supabase } from '@/lib/supabase';
import { 
  Product, 
  Warehouse, 
  StockMovement,
  PurchaseOrder,
  PurchaseOrderItem
} from '../types/inventory.types';
import { stockMovementApi, purchaseOrderApi } from '../api/inventory.api';

/**
 * Inventory Service
 * Handles all inventory-related API calls and business logic
 */
export class InventoryService {
  private static readonly ENDPOINTS = {
    // Products
    PRODUCTS: 'inventory/products',
    PRODUCT_BY_ID: (id: string) => `inventory/products/${id}`,
    PRODUCT_VARIANTS: (id: string) => `inventory/products/${id}/variants`,
    PRODUCT_CATEGORIES: 'inventory/product-categories',
    PRODUCT_SEARCH: 'inventory/products/search',
    PRODUCT_IMPORT: 'inventory/products/import',
    PRODUCT_EXPORT: 'inventory/products/export',
    PRODUCT_DUPLICATE: (id: string) => `inventory/products/${id}/duplicate`,
    
    // Warehouses
    WAREHOUSES: 'inventory/warehouses',
    WAREHOUSE_BY_ID: (id: string) => `inventory/warehouses/${id}`,
    WAREHOUSE_ZONES: (id: string) => `inventory/warehouses/${id}/zones`,
    WAREHOUSE_LOCATIONS: (id: string) => `inventory/warehouses/${id}/locations`,
    WAREHOUSE_LAYOUT: (id: string) => `inventory/warehouses/${id}/layout`,
    
    // Stock Management
    STOCK_LEVELS: 'inventory/stock-levels',
    STOCK_BY_PRODUCT: (productId: string) => `inventory/stock-levels/product/${productId}`,
    STOCK_BY_WAREHOUSE: (warehouseId: string) => `inventory/stock-levels/warehouse/${warehouseId}`,
    STOCK_SEARCH: 'inventory/stock-levels/search',
    STOCK_AVAILABILITY: 'inventory/stock-levels/availability',
    STOCK_VALUATION: 'inventory/stock-levels/valuation',
    
    // Stock Movements
    STOCK_MOVEMENTS: 'inventory/stock-movements',
    MOVEMENT_BY_ID: (id: string) => `inventory/stock-movements/${id}`,
    MOVEMENT_SEARCH: 'inventory/stock-movements/search',
    MOVEMENT_APPROVE: (id: string) => `inventory/stock-movements/${id}/approve`,
    MOVEMENT_CANCEL: (id: string) => `inventory/stock-movements/${id}/cancel`,
    
    // Stock Adjustments
    STOCK_ADJUSTMENTS: 'inventory/stock-adjustments',
    ADJUSTMENT_BY_ID: (id: string) => `inventory/stock-adjustments/${id}`,
    ADJUSTMENT_APPROVE: (id: string) => `inventory/stock-adjustments/${id}/approve`,
    ADJUSTMENT_PROCESS: (id: string) => `inventory/stock-adjustments/${id}/process`,
    
    // Stock Transfers
    STOCK_TRANSFERS: 'inventory/stock-transfers',
    TRANSFER_BY_ID: (id: string) => `inventory/stock-transfers/${id}`,
    TRANSFER_SHIP: (id: string) => `inventory/stock-transfers/${id}/ship`,
    TRANSFER_RECEIVE: (id: string) => `inventory/stock-transfers/${id}/receive`,
    
    // Suppliers
    SUPPLIERS: 'inventory/suppliers',
    SUPPLIER_BY_ID: (id: string) => `inventory/suppliers/${id}`,
    SUPPLIER_PRODUCTS: (id: string) => `inventory/suppliers/${id}/products`,
    SUPPLIER_CONTACTS: (id: string) => `inventory/suppliers/${id}/contacts`,
    SUPPLIER_SEARCH: 'inventory/suppliers/search',
    SUPPLIER_PERFORMANCE: (id: string) => `inventory/suppliers/${id}/performance`,
    
    // Purchase Orders
    PURCHASE_ORDERS: 'inventory/purchase-orders',
    PO_BY_ID: (id: string) => `inventory/purchase-orders/${id}`,
    PO_SEARCH: 'inventory/purchase-orders/search',
    PO_APPROVE: (id: string) => `inventory/purchase-orders/${id}/approve`,
    PO_SEND: (id: string) => `inventory/purchase-orders/${id}/send`,
    PO_CANCEL: (id: string) => `inventory/purchase-orders/${id}/cancel`,
    PO_ACKNOWLEDGE: (id: string) => `inventory/purchase-orders/${id}/acknowledge`,
    
    // Goods Receipts
    GOODS_RECEIPTS: 'inventory/goods-receipts',
    RECEIPT_BY_ID: (id: string) => `inventory/goods-receipts/${id}`,
    RECEIPT_COMPLETE: (id: string) => `inventory/goods-receipts/${id}/complete`,
    
    // Analytics
    INVENTORY_ANALYTICS: 'inventory/analytics',
    SUPPLIER_ANALYTICS: 'inventory/analytics/suppliers',
    ABC_ANALYSIS: 'inventory/analytics/abc-analysis',
    STOCK_TURNOVER: 'inventory/analytics/stock-turnover',
    SLOW_MOVING: 'inventory/analytics/slow-moving',
    REORDER_REPORT: 'inventory/analytics/reorder-report',
    
    // Costing
    COSTING_UPDATE: 'inventory/costing/update',
    COSTING_RECALCULATE: 'inventory/costing/recalculate',
    COST_VARIANCE: 'inventory/analytics/cost-variance',
    
    // Alerts and Notifications
    LOW_STOCK_ALERTS: 'inventory/alerts/low-stock',
    EXPIRATION_ALERTS: 'inventory/alerts/expiration',
    REORDER_ALERTS: 'inventory/alerts/reorder',
    
    // File uploads
    UPLOAD_PRODUCT_IMAGE: 'inventory/uploads/product-image',
    UPLOAD_DOCUMENT: 'inventory/uploads/document',
    
    // Integrations
    BARCODE_LOOKUP: 'inventory/barcode/lookup',
    BARCODE_GENERATE: 'inventory/barcode/generate',
    
    // Bulk operations
    BULK_UPDATE_STOCK: 'inventory/bulk/update-stock',
    BULK_ADJUST_PRICES: 'inventory/bulk/adjust-prices',
    BULK_IMPORT: 'inventory/bulk/import',
    
    // Reporting
    INVENTORY_REPORT: 'inventory/reports/inventory',
    MOVEMENT_REPORT: 'inventory/reports/movements',
    SUPPLIER_REPORT: 'inventory/reports/suppliers',
    EXPORT_REPORT: (type: string) => `inventory/reports/${type}/export`
  } as const

  // Product Management

  /**
   * Get all products
   */
  static async getProducts(params?: {
    type?: ProductType[]
    status?: ProductStatus[]
    categoryId?: string
    warehouseId?: string
    hasStock?: boolean
    page?: number
    limit?: number
  }): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.PRODUCTS}?${searchParams.toString()}`).json<{
      products: Product[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Get product by ID
   */
  static async getProduct(id: string): Promise<Product> {
    const response = await ky.get(this.ENDPOINTS.PRODUCT_BY_ID(id)).json<Product>()
    return response
  }

  /**
   * Create new product
   */
  static async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await ky.post(this.ENDPOINTS.PRODUCTS, {
      json: data
    }).json<Product>()
    return response
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await ky.patch(this.ENDPOINTS.PRODUCT_BY_ID(id), {
      json: data
    }).json<Product>()
    return response
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: string): Promise<void> {
    await ky.delete(this.ENDPOINTS.PRODUCT_BY_ID(id))
  }

  /**
   * Search products
   */
  static async searchProducts(filters: ProductSearchFilters): Promise<Product[]> {
    const response = await ky.post(this.ENDPOINTS.PRODUCT_SEARCH, {
      json: filters
    }).json<Product[]>()
    return response
  }

  /**
   * Get product categories
   */
  static async getProductCategories(): Promise<ProductCategory[]> {
    const response = await ky.get(this.ENDPOINTS.PRODUCT_CATEGORIES).json<ProductCategory[]>()
    return response
  }

  /**
   * Create product variant
   */
  static async createProductVariant(productId: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    const response = await ky.post(this.ENDPOINTS.PRODUCT_VARIANTS(productId), {
      json: data
    }).json<ProductVariant>()
    return response
  }

  /**
   * Duplicate product
   */
  static async duplicateProduct(id: string, newSku: string, newName?: string): Promise<Product> {
    const response = await ky.post(this.ENDPOINTS.PRODUCT_DUPLICATE(id), {
      json: { newSku, newName }
    }).json<Product>()
    return response
  }

  // Warehouse Management

  /**
   * Get all warehouses
   */
  static async getWarehouses(): Promise<Warehouse[]> {
    if (USE_MOCK) {
      const result = await InventoryMockService.getWarehouses()
      return result.data
    }
    const response = await ky.get(this.ENDPOINTS.WAREHOUSES).json<Warehouse[]>()
    return response
  }

  /**
   * Get warehouse by ID
   */
  static async getWarehouse(id: string): Promise<Warehouse> {
    if (USE_MOCK) {
      return InventoryMockService.getWarehouse(id)
    }
    const response = await ky.get(this.ENDPOINTS.WAREHOUSE_BY_ID(id)).json<Warehouse>()
    return response
  }

  /**
   * Create warehouse
   */
  static async createWarehouse(data: CreateWarehouseRequest): Promise<Warehouse> {
    if (USE_MOCK) {
      return InventoryMockService.createWarehouse(data as any)
    }
    const response = await ky.post(this.ENDPOINTS.WAREHOUSES, {
      json: data
    }).json<Warehouse>()
    return response
  }

  /**
   * Update warehouse
   */
  static async updateWarehouse(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await ky.patch(this.ENDPOINTS.WAREHOUSE_BY_ID(id), {
      json: data
    }).json<Warehouse>()
    return response
  }

  /**
   * Get warehouse layout
   */
  static async getWarehouseLayout(warehouseId: string): Promise<any> {
    const response = await ky.get(this.ENDPOINTS.WAREHOUSE_LAYOUT(warehouseId)).json<any>()
    return response
  }

  // Stock Management

  /**
   * Get stock levels
   */
  static async getStockLevels(params?: {
    productId?: string
    warehouseId?: string
    locationId?: string
    status?: StockStatus[]
    lowStock?: boolean
    page?: number
    limit?: number
  }): Promise<{ stockLevels: StockLevel[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.STOCK_LEVELS}?${searchParams.toString()}`).json<{
      stockLevels: StockLevel[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Get stock by product
   */
  static async getStockByProduct(productId: string, warehouseId?: string): Promise<StockLevel[]> {
    const url = warehouseId 
      ? `${this.ENDPOINTS.STOCK_BY_PRODUCT(productId)}?warehouseId=${warehouseId}`
      : this.ENDPOINTS.STOCK_BY_PRODUCT(productId)
    
    const response = await ky.get(url).json<StockLevel[]>()
    return response
  }

  /**
   * Get stock availability
   */
  static async getStockAvailability(productId: string, quantity: number, warehouseId?: string): Promise<{
    available: boolean
    quantityAvailable: number
    alternatives?: Array<{
      warehouseId: string
      warehouseName: string
      quantityAvailable: number
    }>
  }> {
    const searchParams = new URLSearchParams({
      productId,
      quantity: quantity.toString()
    })
    
    if (warehouseId) {
      searchParams.append('warehouseId', warehouseId)
    }

    const response = await ky.get(
      `${this.ENDPOINTS.STOCK_AVAILABILITY}?${searchParams.toString()}`
    ).json<{
      available: boolean
      quantityAvailable: number
      alternatives?: Array<{
        warehouseId: string
        warehouseName: string
        quantityAvailable: number
      }>
    }>()
    
    return response
  }

  /**
   * Search stock
   */
  static async searchStock(filters: StockSearchFilters): Promise<StockLevel[]> {
    const response = await ky.post(this.ENDPOINTS.STOCK_SEARCH, {
      json: filters
    }).json<StockLevel[]>()
    return response
  }

  // Stock Movements

  /**
   * Get stock movements
   */
  static async getStockMovements(params?: {
    type?: StockMovementType[]
    status?: StockMovementStatus[]
    productId?: string
    warehouseId?: string
    dateRange?: { start: Date; end: Date }
    page?: number
    limit?: number
  }): Promise<{ movements: StockMovement[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (key === 'dateRange' && value) {
          const range = value as { start: Date; end: Date }
          searchParams.append('startDate', range.start.toISOString())
          searchParams.append('endDate', range.end.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.STOCK_MOVEMENTS}?${searchParams.toString()}`).json<{
      movements: StockMovement[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create stock movement
   */
  static async createStockMovement(data: CreateStockMovementRequest): Promise<StockMovement> {
    const response = await ky.post(this.ENDPOINTS.STOCK_MOVEMENTS, {
      json: data
    }).json<StockMovement>()
    return response
  }

  /**
   * Update stock movement
   */
  static async updateStockMovement(id: string, data: Partial<StockMovement>): Promise<StockMovement> {
    const response = await ky.patch(this.ENDPOINTS.MOVEMENT_BY_ID(id), {
      json: data
    }).json<StockMovement>()
    return response
  }

  /**
   * Approve stock movement
   */
  static async approveStockMovement(id: string, comments?: string): Promise<StockMovement> {
    const response = await ky.post(this.ENDPOINTS.MOVEMENT_APPROVE(id), {
      json: { comments }
    }).json<StockMovement>()
    return response
  }

  /**
   * Cancel stock movement
   */
  static async cancelStockMovement(id: string, reason?: string): Promise<StockMovement> {
    const response = await ky.post(this.ENDPOINTS.MOVEMENT_CANCEL(id), {
      json: { reason }
    }).json<StockMovement>()
    return response
  }

  // Stock Adjustments

  /**
   * Get stock adjustments
   */
  static async getStockAdjustments(): Promise<StockAdjustment[]> {
    const response = await ky.get(this.ENDPOINTS.STOCK_ADJUSTMENTS).json<StockAdjustment[]>()
    return response
  }

  /**
   * Create stock adjustment
   */
  static async createStockAdjustment(data: CreateStockAdjustmentRequest): Promise<StockAdjustment> {
    const response = await ky.post(this.ENDPOINTS.STOCK_ADJUSTMENTS, {
      json: data
    }).json<StockAdjustment>()
    return response
  }

  /**
   * Approve stock adjustment
   */
  static async approveStockAdjustment(id: string, comments?: string): Promise<StockAdjustment> {
    const response = await ky.post(this.ENDPOINTS.ADJUSTMENT_APPROVE(id), {
      json: { comments }
    }).json<StockAdjustment>()
    return response
  }

  /**
   * Process stock adjustment
   */
  static async processStockAdjustment(id: string): Promise<StockAdjustment> {
    const response = await ky.post(this.ENDPOINTS.ADJUSTMENT_PROCESS(id)).json<StockAdjustment>()
    return response
  }

  // Stock Transfers

  /**
   * Get stock transfers
   */
  static async getStockTransfers(): Promise<StockTransfer[]> {
    const response = await ky.get(this.ENDPOINTS.STOCK_TRANSFERS).json<StockTransfer[]>()
    return response
  }

  /**
   * Create stock transfer
   */
  static async createStockTransfer(data: Partial<StockTransfer>): Promise<StockTransfer> {
    const response = await ky.post(this.ENDPOINTS.STOCK_TRANSFERS, {
      json: data
    }).json<StockTransfer>()
    return response
  }

  /**
   * Ship stock transfer
   */
  static async shipStockTransfer(id: string, shippingData: {
    shippingMethod?: string
    trackingNumber?: string
    carrier?: string
  }): Promise<StockTransfer> {
    const response = await ky.post(this.ENDPOINTS.TRANSFER_SHIP(id), {
      json: shippingData
    }).json<StockTransfer>()
    return response
  }

  /**
   * Receive stock transfer
   */
  static async receiveStockTransfer(id: string, receiptData: {
    receivedQuantities: Record<string, number> // lineId -> quantity
    notes?: string
  }): Promise<StockTransfer> {
    const response = await ky.post(this.ENDPOINTS.TRANSFER_RECEIVE(id), {
      json: receiptData
    }).json<StockTransfer>()
    return response
  }

  // Supplier Management

  /**
   * Get all suppliers
   */
  static async getSuppliers(params?: {
    type?: SupplierType[]
    status?: SupplierStatus[]
    isPreferred?: boolean
    page?: number
    limit?: number
  }): Promise<{ suppliers: Supplier[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.SUPPLIERS}?${searchParams.toString()}`).json<{
      suppliers: Supplier[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create supplier
   */
  static async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    const response = await ky.post(this.ENDPOINTS.SUPPLIERS, {
      json: data
    }).json<Supplier>()
    return response
  }

  /**
   * Update supplier
   */
  static async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await ky.patch(this.ENDPOINTS.SUPPLIER_BY_ID(id), {
      json: data
    }).json<Supplier>()
    return response
  }

  /**
   * Get supplier performance
   */
  static async getSupplierPerformance(id: string, period?: { start: Date; end: Date }): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (period) {
      searchParams.append('startDate', period.start.toISOString())
      searchParams.append('endDate', period.end.toISOString())
    }

    const url = searchParams.toString() 
      ? `${this.ENDPOINTS.SUPPLIER_PERFORMANCE(id)}?${searchParams.toString()}`
      : this.ENDPOINTS.SUPPLIER_PERFORMANCE(id)

    const response = await ky.get(url).json<any>()
    return response
  }

  // Purchase Orders

  /**
   * Get purchase orders
   */
  static async getPurchaseOrders(params?: {
    status?: PurchaseOrderStatus[]
    supplierId?: string[]
    dateRange?: { start: Date; end: Date }
    page?: number
    limit?: number
  }): Promise<{ purchaseOrders: PurchaseOrder[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (key === 'dateRange' && value) {
          const range = value as { start: Date; end: Date }
          searchParams.append('startDate', range.start.toISOString())
          searchParams.append('endDate', range.end.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.PURCHASE_ORDERS}?${searchParams.toString()}`).json<{
      purchaseOrders: PurchaseOrder[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create purchase order
   */
  static async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const response = await ky.post(this.ENDPOINTS.PURCHASE_ORDERS, {
      json: data
    }).json<PurchaseOrder>()
    return response
  }

  /**
   * Update purchase order
   */
  static async updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await ky.patch(this.ENDPOINTS.PO_BY_ID(id), {
      json: data
    }).json<PurchaseOrder>()
    return response
  }

  /**
   * Approve purchase order
   */
  static async approvePurchaseOrder(id: string, comments?: string): Promise<PurchaseOrder> {
    const response = await ky.post(this.ENDPOINTS.PO_APPROVE(id), {
      json: { comments }
    }).json<PurchaseOrder>()
    return response
  }

  /**
   * Send purchase order
   */
  static async sendPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await ky.post(this.ENDPOINTS.PO_SEND(id)).json<PurchaseOrder>()
    return response
  }

  /**
   * Cancel purchase order
   */
  static async cancelPurchaseOrder(id: string, reason?: string): Promise<PurchaseOrder> {
    const response = await ky.post(this.ENDPOINTS.PO_CANCEL(id), {
      json: { reason }
    }).json<PurchaseOrder>()
    return response
  }

  // Goods Receipts

  /**
   * Get goods receipts
   */
  static async getGoodsReceipts(): Promise<GoodsReceipt[]> {
    const response = await ky.get(this.ENDPOINTS.GOODS_RECEIPTS).json<GoodsReceipt[]>()
    return response
  }

  /**
   * Create goods receipt
   */
  static async createGoodsReceipt(data: CreateGoodsReceiptRequest): Promise<GoodsReceipt> {
    const response = await ky.post(this.ENDPOINTS.GOODS_RECEIPTS, {
      json: data
    }).json<GoodsReceipt>()
    return response
  }

  /**
   * Complete goods receipt
   */
  static async completeGoodsReceipt(id: string): Promise<GoodsReceipt> {
    const response = await ky.post(this.ENDPOINTS.RECEIPT_COMPLETE(id)).json<GoodsReceipt>()
    return response
  }

  // Analytics

  /**
   * Get inventory analytics
   */
  static async getInventoryAnalytics(
    startDate: Date,
    endDate: Date,
    warehouseId?: string
  ): Promise<InventoryAnalytics> {
    const searchParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    if (warehouseId) {
      searchParams.append('warehouseId', warehouseId)
    }

    const response = await ky.get(
      `${this.ENDPOINTS.INVENTORY_ANALYTICS}?${searchParams.toString()}`
    ).json<InventoryAnalytics>()
    
    return response
  }

  /**
   * Get supplier analytics
   */
  static async getSupplierAnalytics(
    startDate: Date,
    endDate: Date,
    supplierId?: string
  ): Promise<SupplierAnalytics> {
    const searchParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    if (supplierId) {
      searchParams.append('supplierId', supplierId)
    }

    const response = await ky.get(
      `${this.ENDPOINTS.SUPPLIER_ANALYTICS}?${searchParams.toString()}`
    ).json<SupplierAnalytics>()
    
    return response
  }

  /**
   * Run ABC analysis
   */
  static async runAbcAnalysis(warehouseId?: string): Promise<any> {
    const searchParams = new URLSearchParams()
    
    if (warehouseId) {
      searchParams.append('warehouseId', warehouseId)
    }

    const url = searchParams.toString() 
      ? `${this.ENDPOINTS.ABC_ANALYSIS}?${searchParams.toString()}`
      : this.ENDPOINTS.ABC_ANALYSIS

    const response = await ky.post(url).json<any>()
    return response
  }

  /**
   * Get stock turnover analysis
   */
  static async getStockTurnoverAnalysis(period: { start: Date; end: Date }): Promise<any> {
    const response = await ky.post(this.ENDPOINTS.STOCK_TURNOVER, {
      json: { period }
    }).json<any>()
    return response
  }

  /**
   * Get slow moving items
   */
  static async getSlowMovingItems(daysSinceMovement: number = 90): Promise<any[]> {
    const response = await ky.get(
      `${this.ENDPOINTS.SLOW_MOVING}?days=${daysSinceMovement}`
    ).json<any[]>()
    return response
  }

  /**
   * Get reorder report
   */
  static async getReorderReport(warehouseId?: string): Promise<any[]> {
    const url = warehouseId 
      ? `${this.ENDPOINTS.REORDER_REPORT}?warehouseId=${warehouseId}`
      : this.ENDPOINTS.REORDER_REPORT

    const response = await ky.get(url).json<any[]>()
    return response
  }

  // Costing

  /**
   * Update product costing
   */
  static async updateProductCosting(productId: string, method: CostingMethod): Promise<void> {
    await ky.post(this.ENDPOINTS.COSTING_UPDATE, {
      json: { productId, method }
    })
  }

  /**
   * Recalculate all costing
   */
  static async recalculateCosting(warehouseId?: string): Promise<void> {
    const data = warehouseId ? { warehouseId } : {}
    await ky.post(this.ENDPOINTS.COSTING_RECALCULATE, {
      json: data
    })
  }

  // Alerts

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(warehouseId?: string): Promise<any[]> {
    const url = warehouseId 
      ? `${this.ENDPOINTS.LOW_STOCK_ALERTS}?warehouseId=${warehouseId}`
      : this.ENDPOINTS.LOW_STOCK_ALERTS

    const response = await ky.get(url).json<any[]>()
    return response
  }

  /**
   * Get expiration alerts
   */
  static async getExpirationAlerts(daysBefore: number = 30): Promise<any[]> {
    const response = await ky.get(
      `${this.ENDPOINTS.EXPIRATION_ALERTS}?daysBefore=${daysBefore}`
    ).json<any[]>()
    return response
  }

  /**
   * Get reorder alerts
   */
  static async getReorderAlerts(): Promise<any[]> {
    const response = await ky.get(this.ENDPOINTS.REORDER_ALERTS).json<any[]>()
    return response
  }

  // File uploads

  /**
   * Upload product image
   */
  static async uploadProductImage(productId: string, file: File): Promise<{ url: string; id: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)

    const response = await ky.post(this.ENDPOINTS.UPLOAD_PRODUCT_IMAGE, {
      body: formData
    }).json<{ url: string; id: string }>()
    
    return response
  }

  /**
   * Upload document
   */
  static async uploadDocument(
    entityType: 'product' | 'supplier' | 'warehouse',
    entityId: string,
    file: File,
    documentType?: string
  ): Promise<{ url: string; id: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entityType', entityType)
    formData.append('entityId', entityId)
    
    if (documentType) {
      formData.append('documentType', documentType)
    }

    const response = await ky.post(this.ENDPOINTS.UPLOAD_DOCUMENT, {
      body: formData
    }).json<{ url: string; id: string }>()
    
    return response
  }

  // Barcode operations

  /**
   * Lookup product by barcode
   */
  static async lookupByBarcode(barcode: string): Promise<Product | null> {
    try {
      const response = await ky.get(`${this.ENDPOINTS.BARCODE_LOOKUP}?barcode=${barcode}`).json<Product>()
      return response
    } catch {
      return null
    }
  }

  /**
   * Generate barcode for product
   */
  static async generateBarcode(productId: string, format: 'EAN13' | 'CODE128' = 'EAN13'): Promise<{
    barcode: string
    imageUrl: string
  }> {
    const response = await ky.post(this.ENDPOINTS.BARCODE_GENERATE, {
      json: { productId, format }
    }).json<{ barcode: string; imageUrl: string }>()
    return response
  }

  // Bulk operations

  /**
   * Bulk update stock levels
   */
  static async bulkUpdateStock(updates: Array<{
    productId: string
    warehouseId: string
    quantity: number
    reason?: string
  }>): Promise<{ success: number; failed: number; errors: string[] }> {
    const response = await ky.post(this.ENDPOINTS.BULK_UPDATE_STOCK, {
      json: { updates }
    }).json<{ success: number; failed: number; errors: string[] }>()
    return response
  }

  /**
   * Bulk adjust prices
   */
  static async bulkAdjustPrices(adjustments: Array<{
    productId: string
    adjustmentType: 'percentage' | 'fixed'
    adjustmentValue: number
    priceType: 'cost' | 'list' | 'sale'
  }>): Promise<{ success: number; failed: number; errors: string[] }> {
    const response = await ky.post(this.ENDPOINTS.BULK_ADJUST_PRICES, {
      json: { adjustments }
    }).json<{ success: number; failed: number; errors: string[] }>()
    return response
  }

  // Reporting

  /**
   * Export inventory report
   */
  static async exportInventoryReport(
    format: 'csv' | 'excel' | 'pdf',
    filters?: any
  ): Promise<{ downloadUrl: string }> {
    const response = await ky.post(this.ENDPOINTS.EXPORT_REPORT('inventory'), {
      json: { format, filters }
    }).json<{ downloadUrl: string }>()
    return response
  }

  /**
   * Export movement report
   */
  static async exportMovementReport(
    format: 'csv' | 'excel' | 'pdf',
    dateRange: { start: Date; end: Date },
    filters?: any
  ): Promise<{ downloadUrl: string }> {
    const response = await ky.post(this.ENDPOINTS.EXPORT_REPORT('movements'), {
      json: { format, dateRange, filters }
    }).json<{ downloadUrl: string }>()
    return response
  }

  /**
   * Import products from file
   */
  static async importProducts(file: File, mapping: Record<string, string>): Promise<{
    imported: number
    failed: number
    errors: string[]
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mapping', JSON.stringify(mapping))

    const response = await ky.post(this.ENDPOINTS.PRODUCT_IMPORT, {
      body: formData
    }).json<{
      imported: number
      failed: number
      errors: string[]
    }>()
    
    return response
  }

  /**
   * Transfer stock between warehouses
   */
  static async transferStock(params: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    fromPositionId?: string;
    toPositionId?: string;
    lotNumber?: string;
    serialNumbers?: string[];
    reason?: string;
  }) {
    const movements: Omit<StockMovement, 'id' | 'createdAt' | 'createdBy'>[] = [{
      type: 'transfer',
      productId: params.productId,
      quantity: params.quantity,
      fromWarehouseId: params.fromWarehouseId,
      fromPositionId: params.fromPositionId,
      toWarehouseId: params.toWarehouseId,
      toPositionId: params.toPositionId,
      lotNumber: params.lotNumber,
      serialNumbers: params.serialNumbers,
      reason: params.reason
    }];

    return stockMovementApi.create(movements);
  }

  /**
   * Adjust stock levels (for corrections, damages, etc.)
   */
  static async adjustStock(params: {
    productId: string;
    warehouseId: string;
    quantity: number; // positive for increase, negative for decrease
    positionId?: string;
    reason: string;
    type?: 'adjustment' | 'damage' | 'theft' | 'correction';
  }) {
    const movements: Omit<StockMovement, 'id' | 'createdAt' | 'createdBy'>[] = [{
      type: params.type || 'adjustment',
      productId: params.productId,
      quantity: Math.abs(params.quantity),
      fromWarehouseId: params.quantity < 0 ? params.warehouseId : undefined,
      fromPositionId: params.quantity < 0 ? params.positionId : undefined,
      toWarehouseId: params.quantity > 0 ? params.warehouseId : undefined,
      toPositionId: params.quantity > 0 ? params.positionId : undefined,
      reason: params.reason
    }];

    return stockMovementApi.create(movements);
  }

  /**
   * Perform stock count and create adjustments
   */
  static async performStockCount(params: {
    counts: {
      productId: string;
      warehouseId: string;
      positionId?: string;
      countedQuantity: number;
      expectedQuantity: number;
    }[];
    reason?: string;
  }) {
    const movements: Omit<StockMovement, 'id' | 'createdAt' | 'createdBy'>[] = [];

    for (const count of params.counts) {
      const difference = count.countedQuantity - count.expectedQuantity;
      
      if (difference !== 0) {
        movements.push({
          type: 'count',
          productId: count.productId,
          quantity: Math.abs(difference),
          fromWarehouseId: difference < 0 ? count.warehouseId : undefined,
          fromPositionId: difference < 0 ? count.positionId : undefined,
          toWarehouseId: difference > 0 ? count.warehouseId : undefined,
          toPositionId: difference > 0 ? count.positionId : undefined,
          reason: params.reason || `Stock count adjustment: ${difference > 0 ? 'surplus' : 'shortage'} of ${Math.abs(difference)} units`
        });
      }
    }

    if (movements.length > 0) {
      return stockMovementApi.create(movements);
    }

    return { success: true, movements: [] };
  }

  /**
   * Create and receive a purchase order in one operation
   */
  static async quickReceivePurchaseOrder(params: {
    supplierId: string;
    warehouseId: string;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      taxRate?: number;
    }[];
    notes?: string;
  }) {
    // Create purchase order
    const order = await purchaseOrderApi.create({
      supplierId: params.supplierId,
      warehouseId: params.warehouseId,
      status: 'draft',
      orderDate: new Date(),
      expectedDate: new Date(),
      subtotal: 0,
      taxAmount: 0,
      shippingCost: 0,
      totalAmount: 0,
      currency: 'EUR',
      notes: params.notes
    });

    // Add items
    const items: Omit<PurchaseOrderItem, 'id' | 'createdAt' | 'updatedAt'>[] = params.items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate || 0,
      discountRate: 0,
      totalAmount: item.quantity * item.unitPrice,
      receivedQuantity: 0
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(items);

    if (itemsError) throw itemsError;

    // Approve order
    await purchaseOrderApi.approve(order.id);

    // Receive order
    const receiveItems = items.map((item, index) => ({
      itemId: `temp-${index}`, // This would be the actual item ID from the insert
      receivedQuantity: item.quantity
    }));

    // Create stock movements
    const movements: Omit<StockMovement, 'id' | 'createdAt' | 'createdBy'>[] = params.items.map(item => ({
      type: 'in',
      productId: item.productId,
      quantity: item.quantity,
      toWarehouseId: params.warehouseId,
      referenceType: 'purchase_order',
      referenceId: order.id,
      cost: item.unitPrice,
      reason: `Received from PO #${order.orderNumber}`
    }));

    await stockMovementApi.create(movements);

    return order;
  }

  /**
   * Calculate reorder suggestions based on current stock levels
   */
  static async getReorderSuggestions(warehouseId?: string) {
    // Get products with low stock
    const { data: lowStockProducts, error } = await supabase
      .from('v_low_stock_products')
      .select('*');

    if (error) throw error;

    // Get supplier information for each product
    const suggestions = [];

    for (const product of lowStockProducts || []) {
      const { data: supplierProducts } = await supabase
        .from('supplier_products')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .eq('product_id', product.product_id)
        .eq('is_preferred', true)
        .single();

      suggestions.push({
        product: {
          id: product.product_id,
          name: product.product_name,
          sku: product.sku
        },
        currentStock: product.total_stock,
        reorderPoint: product.reorder_point,
        suggestedQuantity: product.reorder_quantity,
        preferredSupplier: supplierProducts?.supplier,
        unitCost: supplierProducts?.cost || 0,
        leadTimeDays: supplierProducts?.lead_time_days || 0,
        urgency: product.stock_status === 'critical' ? 'high' : 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Optimize warehouse space by suggesting product relocations
   */
  static async optimizeWarehouseSpace(warehouseId: string) {
    // Get warehouse zones and their utilization
    const { data: zones } = await supabase
      .from('warehouse_zones')
      .select(`
        *,
        positions:warehouse_positions(
          *,
          stock_levels:stock_levels(
            *,
            product:products(*)
          )
        )
      `)
      .eq('warehouse_id', warehouseId);

    // Analyze space utilization and suggest optimizations
    const suggestions = [];

    for (const zone of zones || []) {
      const utilization = zone.positions.reduce((acc: number, pos: any) => {
        const stockVolume = pos.stock_levels.reduce((vol: number, sl: any) => {
          return vol + (sl.quantity * (sl.product.dimensions?.volume || 1));
        }, 0);
        return acc + stockVolume;
      }, 0);

      const capacity = (zone.capacity as any).total || 0;
      const utilizationRate = capacity > 0 ? (utilization / capacity) * 100 : 0;

      if (utilizationRate < 30) {
        suggestions.push({
          type: 'underutilized',
          zone: zone.name,
          currentUtilization: utilizationRate,
          recommendation: 'Consider consolidating products from other zones'
        });
      } else if (utilizationRate > 90) {
        suggestions.push({
          type: 'overutilized',
          zone: zone.name,
          currentUtilization: utilizationRate,
          recommendation: 'Consider moving slow-moving items to less utilized zones'
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate inventory report
   */
  static async generateInventoryReport(params: {
    warehouseId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    // Get inventory value
    const { data: inventoryValue } = await supabase
      .rpc('get_inventory_value', {
        p_warehouse_id: params.warehouseId,
        p_category: params.categoryId
      });

    // Get movement summary
    let movementsQuery = supabase
      .from('stock_movements')
      .select('type, quantity, cost');

    if (params.warehouseId) {
      movementsQuery = movementsQuery.or(
        `from_warehouse_id.eq.${params.warehouseId},to_warehouse_id.eq.${params.warehouseId}`
      );
    }
    if (params.startDate) {
      movementsQuery = movementsQuery.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      movementsQuery = movementsQuery.lte('created_at', params.endDate);
    }

    const { data: movements } = await movementsQuery;

    // Calculate movement statistics
    const movementStats = movements?.reduce((acc: any, mov: any) => {
      if (!acc[mov.type]) {
        acc[mov.type] = { count: 0, quantity: 0, value: 0 };
      }
      acc[mov.type].count++;
      acc[mov.type].quantity += mov.quantity;
      acc[mov.type].value += (mov.quantity * (mov.cost || 0));
      return acc;
    }, {});

    // Get top products by value
    const { data: topProducts } = await supabase
      .from('v_product_stock_summary')
      .select('*')
      .order('total_stock * unit_price', { ascending: false })
      .limit(10);

    return {
      summary: inventoryValue,
      movements: movementStats,
      topProducts,
      generatedAt: new Date()
    };
  }
}

/**
 * Inventory Utilities
 * Helper functions for inventory calculations and formatting
 */
export class InventoryUtils {
  /**
   * Calculate stock turnover ratio
   */
  static calculateStockTurnover(costOfGoodsSold: number, averageInventoryValue: number): number {
    if (averageInventoryValue === 0) return 0
    return costOfGoodsSold / averageInventoryValue
  }

  /**
   * Calculate days sales inventory
   */
  static calculateDaysSalesInventory(averageInventoryValue: number, costOfGoodsSold: number): number {
    const turnover = this.calculateStockTurnover(costOfGoodsSold, averageInventoryValue)
    if (turnover === 0) return 0
    return 365 / turnover
  }

  /**
   * Calculate reorder point
   */
  static calculateReorderPoint(
    averageDailyUsage: number,
    leadTimeDays: number,
    safetyStock: number = 0
  ): number {
    return (averageDailyUsage * leadTimeDays) + safetyStock
  }

  /**
   * Calculate Economic Order Quantity (EOQ)
   */
  static calculateEOQ(
    annualDemand: number,
    orderingCost: number,
    holdingCostPerUnit: number
  ): number {
    if (holdingCostPerUnit === 0) return 0
    return Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit)
  }

  /**
   * Calculate ABC classification
   */
  static calculateAbcClassification(
    products: Array<{ id: string; value: number }>
  ): Record<string, ABCClassification> {
    // Sort by value descending
    const sorted = products.sort((a, b) => b.value - a.value)
    const totalValue = sorted.reduce((sum, p) => sum + p.value, 0)
    
    const result: Record<string, ABCClassification> = {}
    let cumulativeValue = 0
    
    for (const product of sorted) {
      cumulativeValue += product.value
      const percentage = (cumulativeValue / totalValue) * 100
      
      if (percentage <= 80) {
        result[product.id] = 'A'
      } else if (percentage <= 95) {
        result[product.id] = 'B'
      } else {
        result[product.id] = 'C'
      }
    }
    
    return result
  }

  /**
   * Calculate weighted average cost
   */
  static calculateWeightedAverageCost(
    movements: Array<{ quantity: number; unitCost: number; date: Date }>
  ): number {
    const inboundMovements = movements.filter(m => m.quantity > 0)
    
    const totalQuantity = inboundMovements.reduce((sum, m) => sum + m.quantity, 0)
    const totalValue = inboundMovements.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0)
    
    if (totalQuantity === 0) return 0
    return totalValue / totalQuantity
  }

  /**
   * Calculate FIFO cost
   */
  static calculateFifoCost(
    movements: Array<{ quantity: number; unitCost: number; date: Date }>,
    quantityToValue: number
  ): number {
    const inboundMovements = movements
      .filter(m => m.quantity > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
    
    let remainingQuantity = quantityToValue
    let totalCost = 0
    
    for (const movement of inboundMovements) {
      if (remainingQuantity <= 0) break
      
      const quantityToUse = Math.min(remainingQuantity, movement.quantity)
      totalCost += quantityToUse * movement.unitCost
      remainingQuantity -= quantityToUse
    }
    
    return quantityToValue > 0 ? totalCost / quantityToValue : 0
  }

  /**
   * Calculate LIFO cost
   */
  static calculateLifoCost(
    movements: Array<{ quantity: number; unitCost: number; date: Date }>,
    quantityToValue: number
  ): number {
    const inboundMovements = movements
      .filter(m => m.quantity > 0)
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // Descending order
    
    let remainingQuantity = quantityToValue
    let totalCost = 0
    
    for (const movement of inboundMovements) {
      if (remainingQuantity <= 0) break
      
      const quantityToUse = Math.min(remainingQuantity, movement.quantity)
      totalCost += quantityToUse * movement.unitCost
      remainingQuantity -= quantityToUse
    }
    
    return quantityToValue > 0 ? totalCost / quantityToValue : 0
  }

  /**
   * Format stock status
   */
  static formatStockStatus(status: StockStatus): string {
    const labels = {
      available: 'Disponible',
      reserved: 'Réservé',
      damaged: 'Endommagé',
      quarantine: 'Quarantaine',
      expired: 'Expiré',
      returned: 'Retourné'
    }
    return labels[status] || status
  }

  /**
   * Get stock status color
   */
  static getStockStatusColor(status: StockStatus): string {
    const colors = {
      available: 'text-green-600 bg-green-100',
      reserved: 'text-blue-600 bg-blue-100',
      damaged: 'text-red-600 bg-red-100',
      quarantine: 'text-yellow-600 bg-yellow-100',
      expired: 'text-gray-600 bg-gray-100',
      returned: 'text-orange-600 bg-orange-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Format product type
   */
  static formatProductType(type: ProductType): string {
    const labels = {
      physical: 'Physique',
      digital: 'Numérique',
      service: 'Service',
      bundle: 'Bundle',
      kit: 'Kit',
      subscription: 'Abonnement'
    }
    return labels[type] || type
  }

  /**
   * Format unit of measure
   */
  static formatUnitOfMeasure(uom: UnitOfMeasure): string {
    const labels = {
      piece: 'Pièce',
      kg: 'Kilogramme',
      g: 'Gramme',
      liter: 'Litre',
      ml: 'Millilitre',
      meter: 'Mètre',
      cm: 'Centimètre',
      mm: 'Millimètre',
      pack: 'Pack',
      box: 'Boîte',
      pallet: 'Palette',
      case: 'Caisse',
      dozen: 'Douzaine',
      pair: 'Paire',
      set: 'Ensemble'
    }
    return labels[uom] || uom
  }

  /**
   * Check if product needs reorder
   */
  static needsReorder(stockLevel: StockLevel, product: Product): boolean {
    if (!product.reorderPoint) return false
    return stockLevel.quantityAvailable <= product.reorderPoint
  }

  /**
   * Calculate safety stock
   */
  static calculateSafetyStock(
    averageDailyUsage: number,
    leadTimeDays: number,
    serviceLevel: number = 0.95
  ): number {
    // Simplified calculation - in practice would use standard deviation
    const zScore = serviceLevel >= 0.95 ? 1.65 : 1.28
    const leadTimeDemand = averageDailyUsage * leadTimeDays
    const variability = leadTimeDemand * 0.2 // Assume 20% variability
    
    return Math.ceil(zScore * variability)
  }

  /**
   * Generate SKU
   */
  static generateSku(
    prefix: string,
    category?: string,
    sequence?: number
  ): string {
    const parts = [prefix.toUpperCase()]
    
    if (category) {
      parts.push(category.toUpperCase().slice(0, 3))
    }
    
    const seqNum = sequence || Math.floor(Math.random() * 10000)
    parts.push(seqNum.toString().padStart(4, '0'))
    
    return parts.join('-')
  }

  /**
   * Validate barcode
   */
  static validateBarcode(barcode: string, format: 'EAN13' | 'CODE128' = 'EAN13'): boolean {
    if (format === 'EAN13') {
      return /^\d{13}$/.test(barcode) && this.validateEan13CheckDigit(barcode)
    }
    
    if (format === 'CODE128') {
      return /^[\x00-\x7F]+$/.test(barcode) && barcode.length >= 1
    }
    
    return false
  }

  /**
   * Validate EAN13 check digit
   */
  private static validateEan13CheckDigit(barcode: string): boolean {
    const digits = barcode.split('').map(Number)
    const checkDigit = digits.pop()
    
    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3)
    }
    
    const calculatedCheckDigit = (10 - (sum % 10)) % 10
    return calculatedCheckDigit === checkDigit
  }

  /**
   * Calculate carrying cost
   */
  static calculateCarryingCost(
    averageInventoryValue: number,
    carryingCostRate: number
  ): number {
    return averageInventoryValue * (carryingCostRate / 100)
  }

  /**
   * Calculate stockout cost
   */
  static calculateStockoutCost(
    stockouts: number,
    averageOrderValue: number,
    stockoutRate: number = 0.1
  ): number {
    return stockouts * averageOrderValue * stockoutRate
  }

  /**
   * Format movement type
   */
  static formatMovementType(type: StockMovementType): string {
    const labels = {
      in: 'Entrée',
      out: 'Sortie',
      transfer: 'Transfert',
      adjustment: 'Ajustement',
      return: 'Retour',
      damage: 'Dommage',
      theft: 'Vol',
      count: 'Comptage',
      correction: 'Correction',
      assembly: 'Assemblage',
      disassembly: 'Désassemblage'
    }
    return labels[type] || type
  }

  /**
   * Get movement type color
   */
  static getMovementTypeColor(type: StockMovementType): string {
    const colors = {
      in: 'text-green-600 bg-green-100',
      out: 'text-red-600 bg-red-100',
      transfer: 'text-blue-600 bg-blue-100',
      adjustment: 'text-yellow-600 bg-yellow-100',
      return: 'text-orange-600 bg-orange-100',
      damage: 'text-red-600 bg-red-100',
      theft: 'text-red-600 bg-red-100',
      count: 'text-purple-600 bg-purple-100',
      correction: 'text-gray-600 bg-gray-100',
      assembly: 'text-indigo-600 bg-indigo-100',
      disassembly: 'text-pink-600 bg-pink-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }
}