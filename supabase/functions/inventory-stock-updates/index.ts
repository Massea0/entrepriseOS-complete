import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StockUpdateRequest {
  type: 'receive' | 'ship' | 'transfer' | 'adjust' | 'count';
  movements: StockMovement[];
  reference?: {
    type: string;
    id: string;
  };
  notes?: string;
}

interface StockMovement {
  productId: string;
  quantity: number;
  fromWarehouseId?: string;
  fromPositionId?: string;
  toWarehouseId?: string;
  toPositionId?: string;
  lotNumber?: string;
  serialNumbers?: string[];
  cost?: number;
}

interface StockUpdateResponse {
  success: boolean;
  movements: any[];
  alerts: any[];
  errors?: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get user's organization
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    const request: StockUpdateRequest = await req.json()
    const response: StockUpdateResponse = {
      success: false,
      movements: [],
      alerts: [],
      errors: []
    }

    // Start a transaction
    const { data: movements, error: movementError } = await supabaseClient.rpc(
      'process_stock_movements',
      {
        p_movements: request.movements.map(m => ({
          ...m,
          type: mapMovementType(request.type),
          reference_type: request.reference?.type,
          reference_id: request.reference?.id,
          reason: request.notes,
          created_by: user.id,
          organization_id: profile.organization_id
        }))
      }
    )

    if (movementError) {
      throw movementError
    }

    response.movements = movements || []

    // Check for stock alerts
    const affectedProducts = [...new Set(request.movements.map(m => m.productId))]
    const affectedWarehouses = [...new Set([
      ...request.movements.map(m => m.fromWarehouseId).filter(Boolean),
      ...request.movements.map(m => m.toWarehouseId).filter(Boolean)
    ])]

    for (const productId of affectedProducts) {
      for (const warehouseId of affectedWarehouses) {
        const { data: stockLevel } = await supabaseClient
          .from('stock_levels')
          .select('quantity, product:products(min_stock_level, reorder_point, name)')
          .eq('product_id', productId)
          .eq('warehouse_id', warehouseId)
          .single()

        if (stockLevel && stockLevel.product) {
          const currentStock = stockLevel.quantity
          const { min_stock_level, reorder_point, name } = stockLevel.product

          if (currentStock < min_stock_level) {
            // Create critical alert
            const { data: alert } = await supabaseClient
              .from('stock_alerts')
              .upsert({
                product_id: productId,
                warehouse_id: warehouseId,
                severity: 'critical',
                status: 'active',
                current_stock: currentStock,
                min_stock_level,
                reorder_point,
                message: `Critical: ${name} stock at ${currentStock} units, below minimum level of ${min_stock_level}`,
                organization_id: profile.organization_id
              }, {
                onConflict: 'product_id,warehouse_id',
                ignoreDuplicates: false
              })
              .select()

            if (alert) {
              response.alerts.push(alert)
            }
          } else if (currentStock < reorder_point) {
            // Create warning alert
            const { data: alert } = await supabaseClient
              .from('stock_alerts')
              .upsert({
                product_id: productId,
                warehouse_id: warehouseId,
                severity: 'warning',
                status: 'active',
                current_stock: currentStock,
                min_stock_level,
                reorder_point,
                message: `Warning: ${name} stock at ${currentStock} units, below reorder point of ${reorder_point}`,
                organization_id: profile.organization_id
              }, {
                onConflict: 'product_id,warehouse_id',
                ignoreDuplicates: false
              })
              .select()

            if (alert) {
              response.alerts.push(alert)
            }
          } else {
            // Clear any existing alerts
            await supabaseClient
              .from('stock_alerts')
              .update({ status: 'resolved', resolved_at: new Date().toISOString() })
              .eq('product_id', productId)
              .eq('warehouse_id', warehouseId)
              .eq('status', 'active')
          }
        }
      }
    }

    // Update warehouse capacity if needed
    for (const warehouseId of affectedWarehouses) {
      await updateWarehouseCapacity(supabaseClient, warehouseId)
    }

    response.success = true

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function mapMovementType(type: string): string {
  const typeMap: Record<string, string> = {
    'receive': 'in',
    'ship': 'out',
    'transfer': 'transfer',
    'adjust': 'adjustment',
    'count': 'count'
  }
  return typeMap[type] || type
}

async function updateWarehouseCapacity(supabaseClient: any, warehouseId: string) {
  // Calculate total items in warehouse
  const { data: stockLevels } = await supabaseClient
    .from('stock_levels')
    .select('quantity')
    .eq('warehouse_id', warehouseId)

  const totalItems = stockLevels?.reduce((sum: number, sl: any) => sum + sl.quantity, 0) || 0

  // Update warehouse capacity
  const { data: warehouse } = await supabaseClient
    .from('warehouses')
    .select('capacity')
    .eq('id', warehouseId)
    .single()

  if (warehouse) {
    const capacity = warehouse.capacity
    capacity.used = totalItems

    await supabaseClient
      .from('warehouses')
      .update({ capacity })
      .eq('id', warehouseId)
  }
}