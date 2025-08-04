import { MOCK_WAREHOUSES, MOCK_ZONES } from '../mocks/warehouse.mocks'
import { MOCK_PRODUCTS, MOCK_STOCK_MOVEMENTS } from '../mocks/inventory.mocks'
import type { Warehouse, Product, StockMovement } from '../types/inventory.types'

export class InventoryMockService {
  // Warehouses
  static async getWarehouses() {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      data: MOCK_WAREHOUSES,
      total: MOCK_WAREHOUSES.length
    }
  }

  static async getWarehouse(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const warehouse = MOCK_WAREHOUSES.find(w => w.id === id)
    if (!warehouse) throw new Error('Warehouse not found')
    return warehouse
  }

  static async createWarehouse(data: Partial<Warehouse>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newWarehouse: Warehouse = {
      id: `warehouse-${Date.now()}`,
      name: data.name || 'Nouvel Entrepôt',
      code: data.code || `WH-${Date.now()}`,
      type: data.type || 'storage',
      status: 'active',
      address: data.address || {
        street: '',
        city: '',
        postalCode: '',
        country: 'France'
      },
      capacity: data.capacity || { total: 1000, used: 0, unit: 'palettes' },
      zones: [],
      operatingHours: data.operatingHours || {},
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      features: data.features || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    MOCK_WAREHOUSES.push(newWarehouse)
    return newWarehouse
  }

  static async updateWarehouse(id: string, data: Partial<Warehouse>) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const index = MOCK_WAREHOUSES.findIndex(w => w.id === id)
    if (index === -1) throw new Error('Warehouse not found')
    
    MOCK_WAREHOUSES[index] = {
      ...MOCK_WAREHOUSES[index],
      ...data,
      updatedAt: new Date()
    }
    return MOCK_WAREHOUSES[index]
  }

  static async deleteWarehouse(id: string) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const index = MOCK_WAREHOUSES.findIndex(w => w.id === id)
    if (index === -1) throw new Error('Warehouse not found')
    MOCK_WAREHOUSES.splice(index, 1)
  }

  // Products
  static async getProducts() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      data: MOCK_PRODUCTS,
      total: MOCK_PRODUCTS.length
    }
  }

  static async getProduct(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const product = MOCK_PRODUCTS.find(p => p.id === id)
    if (!product) throw new Error('Product not found')
    return product
  }

  // Stock Movements
  static async getStockMovements() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      data: MOCK_STOCK_MOVEMENTS,
      total: MOCK_STOCK_MOVEMENTS.length
    }
  }

  static async createStockMovement(data: Partial<StockMovement>) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newMovement: StockMovement = {
      id: `movement-${Date.now()}`,
      type: data.type || 'in',
      status: 'pending',
      productId: data.productId || '',
      product: data.product,
      warehouseId: data.warehouseId || '',
      warehouse: data.warehouse,
      quantity: data.quantity || 0,
      reference: data.reference || `MOV-${Date.now()}`,
      date: data.date || new Date(),
      createdBy: data.createdBy || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    MOCK_STOCK_MOVEMENTS.unshift(newMovement)
    return newMovement
  }

  // Analytics
  static async getWarehouseStats(warehouseId?: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (warehouseId) {
      const warehouse = MOCK_WAREHOUSES.find(w => w.id === warehouseId)
      return warehouse?.stats || {}
    }

    // Stats globales
    return {
      totalWarehouses: MOCK_WAREHOUSES.length,
      totalCapacity: MOCK_WAREHOUSES.reduce((acc, w) => acc + w.capacity.total, 0),
      totalUsed: MOCK_WAREHOUSES.reduce((acc, w) => acc + w.capacity.used, 0),
      totalProducts: MOCK_WAREHOUSES.reduce((acc, w) => acc + (w.stats?.totalProducts || 0), 0),
      totalValue: MOCK_WAREHOUSES.reduce((acc, w) => acc + (w.stats?.totalValue || 0), 0),
      utilizationRate: Math.round(
        (MOCK_WAREHOUSES.reduce((acc, w) => acc + w.capacity.used, 0) / 
         MOCK_WAREHOUSES.reduce((acc, w) => acc + w.capacity.total, 0)) * 100
      ),
      topWarehouses: MOCK_WAREHOUSES
        .sort((a, b) => (b.stats?.totalValue || 0) - (a.stats?.totalValue || 0))
        .slice(0, 3)
        .map(w => ({
          id: w.id,
          name: w.name,
          value: w.stats?.totalValue || 0,
          utilization: Math.round((w.capacity.used / w.capacity.total) * 100)
        }))
    }
  }
}