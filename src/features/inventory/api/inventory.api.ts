import { supabase } from '@/lib/supabase';
import {
  Warehouse,
  WarehouseZone,
  WarehousePosition,
  Product,
  Supplier,
  SupplierProduct,
  StockLevel,
  StockMovement,
  PurchaseOrder,
  PurchaseOrderItem,
  StockAlert,
  AlertThreshold
} from '../types/inventory.types';

// Warehouse API
export const warehouseApi = {
  async list() {
    const { data, error } = await supabase
      .from('warehouses')
      .select(`
        *,
        zones:warehouse_zones(count)
      `)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('warehouses')
      .select(`
        *,
        zones:warehouse_zones(
          *,
          positions:warehouse_positions(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(warehouse: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('warehouses')
      .insert(warehouse)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, warehouse: Partial<Warehouse>) {
    const { data, error } = await supabase
      .from('warehouses')
      .update(warehouse)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Zone API
export const zoneApi = {
  async create(zone: Omit<WarehouseZone, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('warehouse_zones')
      .insert(zone)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, zone: Partial<WarehouseZone>) {
    const { data, error } = await supabase
      .from('warehouse_zones')
      .update(zone)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('warehouse_zones')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Position API
export const positionApi = {
  async create(position: Omit<WarehousePosition, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('warehouse_positions')
      .insert(position)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, position: Partial<WarehousePosition>) {
    const { data, error } = await supabase
      .from('warehouse_positions')
      .update(position)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('warehouse_positions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Product API
export const productApi = {
  async list(filters?: {
    category?: string;
    status?: string;
    search?: string;
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        stock_levels:stock_levels(
          warehouse_id,
          quantity,
          reserved_quantity,
          available_quantity
        ),
        supplier_products:supplier_products(
          supplier:suppliers(*)
        )
      `);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('name');
    
    if (error) throw error;
    return data;
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        stock_levels:stock_levels(
          *,
          warehouse:warehouses(*)
        ),
        supplier_products:supplier_products(
          *,
          supplier:suppliers(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'currentStock' | 'reservedStock' | 'availableStock'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async bulkUpdate(productIds: string[], updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .in('id', productIds)
      .select();
    
    if (error) throw error;
    return data;
  },

  async bulkDelete(productIds: string[]) {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', productIds);
    
    if (error) throw error;
  }
};

// Stock Movement API
export const stockMovementApi = {
  async list(filters?: {
    productId?: string;
    warehouseId?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(*),
        from_warehouse:warehouses!from_warehouse_id(*),
        to_warehouse:warehouses!to_warehouse_id(*),
        created_by:auth.users!created_by(email)
      `);

    if (filters?.productId) {
      query = query.eq('product_id', filters.productId);
    }
    if (filters?.warehouseId) {
      query = query.or(`from_warehouse_id.eq.${filters.warehouseId},to_warehouse_id.eq.${filters.warehouseId}`);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(movements: Omit<StockMovement, 'id' | 'createdAt' | 'createdBy'>[]) {
    const { data, error } = await supabase.functions.invoke('inventory-stock-updates', {
      body: {
        type: movements[0].type,
        movements: movements.map(m => ({
          productId: m.productId,
          quantity: m.quantity,
          fromWarehouseId: m.fromWarehouseId,
          fromPositionId: m.fromPositionId,
          toWarehouseId: m.toWarehouseId,
          toPositionId: m.toPositionId,
          lotNumber: m.lotNumber,
          serialNumbers: m.serialNumbers,
          cost: m.cost
        })),
        reference: movements[0].referenceType ? {
          type: movements[0].referenceType,
          id: movements[0].referenceId
        } : undefined,
        notes: movements[0].reason
      }
    });

    if (error) throw error;
    return data;
  }
};

// Purchase Order API
export const purchaseOrderApi = {
  async list(filters?: {
    status?: string;
    supplierId?: string;
    warehouseId?: string;
  }) {
    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        warehouse:warehouses(*),
        items:purchase_order_items(count)
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }
    if (filters?.warehouseId) {
      query = query.eq('warehouse_id', filters.warehouseId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        warehouse:warehouses(*),
        items:purchase_order_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, order: Partial<PurchaseOrder>) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(order)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async approve(id: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({
        status: 'approved',
        approvedBy: (await supabase.auth.getUser()).data.user?.id,
        approvedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async receive(id: string, items: { itemId: string; receivedQuantity: number }[]) {
    // Update received quantities
    for (const item of items) {
      const { error } = await supabase
        .from('purchase_order_items')
        .update({ received_quantity: item.receivedQuantity })
        .eq('id', item.itemId);
      
      if (error) throw error;
    }

    // Update order status
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({
        status: 'received',
        receivedBy: (await supabase.auth.getUser()).data.user?.id,
        receivedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Stock Alert API
export const stockAlertApi = {
  async list(filters?: {
    severity?: string[];
    status?: string[];
    warehouseId?: string;
  }) {
    let query = supabase
      .from('stock_alerts')
      .select(`
        *,
        product:products(*),
        warehouse:warehouses(*)
      `);

    if (filters?.severity?.length) {
      query = query.in('severity', filters.severity);
    }
    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.warehouseId) {
      query = query.eq('warehouse_id', filters.warehouseId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async acknowledge(id: string) {
    const { data, error } = await supabase
      .from('stock_alerts')
      .update({
        status: 'acknowledged',
        acknowledgedBy: (await supabase.auth.getUser()).data.user?.id,
        acknowledgedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async resolve(id: string) {
    const { data, error } = await supabase
      .from('stock_alerts')
      .update({
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async snooze(id: string, until: Date) {
    const { data, error } = await supabase
      .from('stock_alerts')
      .update({
        status: 'snoozed',
        snoozedUntil: until.toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Analytics API
export const analyticsApi = {
  async getInventoryValue(warehouseId?: string) {
    const { data, error } = await supabase
      .rpc('get_inventory_value', {
        p_warehouse_id: warehouseId
      });
    
    if (error) throw error;
    return data;
  },

  async getABCAnalysis(periodDays: number = 90) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', user?.id)
      .single();

    const { data, error } = await supabase
      .rpc('perform_abc_analysis', {
        p_organization_id: profile?.organization_id,
        p_period_days: periodDays
      });
    
    if (error) throw error;
    return data;
  },

  async getTurnoverRate(productId: string, warehouseId?: string, periodDays: number = 365) {
    const { data, error } = await supabase
      .rpc('calculate_inventory_turnover', {
        p_product_id: productId,
        p_warehouse_id: warehouseId,
        p_period_days: periodDays
      });
    
    if (error) throw error;
    return data;
  },

  async forecast(params: {
    productId?: string;
    warehouseId?: string;
    forecastDays?: number;
  }) {
    const { data, error } = await supabase.functions.invoke('inventory-analytics-engine', {
      body: {
        type: 'forecast',
        parameters: params
      }
    });
    
    if (error) throw error;
    return data;
  },

  async optimize(params: {
    warehouseId?: string;
    categoryId?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('inventory-analytics-engine', {
      body: {
        type: 'optimization',
        parameters: params
      }
    });
    
    if (error) throw error;
    return data;
  },

  async analyzeTrends(params: {
    productId?: string;
    periodDays?: number;
  }) {
    const { data, error } = await supabase.functions.invoke('inventory-analytics-engine', {
      body: {
        type: 'trends',
        parameters: params
      }
    });
    
    if (error) throw error;
    return data;
  }
};

// Costing API
export const costingApi = {
  async calculate(params: {
    method: 'FIFO' | 'LIFO' | 'AVERAGE';
    productId?: string;
    warehouseId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('inventory-costing-engine', {
      body: params
    });
    
    if (error) throw error;
    return data;
  }
};