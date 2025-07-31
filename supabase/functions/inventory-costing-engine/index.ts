import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CostingRequest {
  method: 'FIFO' | 'LIFO' | 'AVERAGE';
  productId?: string;
  warehouseId?: string;
  startDate?: string;
  endDate?: string;
}

interface CostingResponse {
  method: string;
  results: ProductCosting[];
  summary: {
    totalValue: number;
    totalQuantity: number;
    averageCost: number;
    currency: string;
  };
}

interface ProductCosting {
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  costLayers?: CostLayer[];
}

interface CostLayer {
  date: string;
  quantity: number;
  unitCost: number;
  remainingQuantity: number;
  source: string;
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

    const request: CostingRequest = await req.json()
    const results: ProductCosting[] = []

    // Build query for stock levels
    let stockQuery = supabaseClient
      .from('stock_levels')
      .select(`
        quantity,
        product_id,
        warehouse_id,
        products (
          id,
          name,
          sku,
          unit_price,
          currency
        ),
        warehouses (
          id,
          name
        )
      `)
      .gt('quantity', 0)

    if (request.productId) {
      stockQuery = stockQuery.eq('product_id', request.productId)
    }
    if (request.warehouseId) {
      stockQuery = stockQuery.eq('warehouse_id', request.warehouseId)
    }

    const { data: stockLevels, error: stockError } = await stockQuery

    if (stockError) {
      throw stockError
    }

    // Process each stock level
    for (const stock of stockLevels || []) {
      const costing = await calculateProductCosting(
        supabaseClient,
        stock.product_id,
        stock.warehouse_id,
        stock.quantity,
        request.method,
        request.startDate,
        request.endDate,
        profile.organization_id
      )

      results.push({
        productId: stock.product_id,
        productName: stock.products.name,
        sku: stock.products.sku,
        warehouseId: stock.warehouse_id,
        warehouseName: stock.warehouses.name,
        quantity: stock.quantity,
        unitCost: costing.unitCost,
        totalValue: costing.totalValue,
        costLayers: costing.layers
      })
    }

    // Calculate summary
    const summary = {
      totalValue: results.reduce((sum, r) => sum + r.totalValue, 0),
      totalQuantity: results.reduce((sum, r) => sum + r.quantity, 0),
      averageCost: 0,
      currency: stockLevels?.[0]?.products?.currency || 'EUR'
    }
    summary.averageCost = summary.totalQuantity > 0 
      ? summary.totalValue / summary.totalQuantity 
      : 0

    const response: CostingResponse = {
      method: request.method,
      results,
      summary
    }

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

async function calculateProductCosting(
  supabaseClient: any,
  productId: string,
  warehouseId: string,
  currentQuantity: number,
  method: string,
  startDate?: string,
  endDate?: string,
  organizationId?: string
): Promise<{ unitCost: number; totalValue: number; layers: CostLayer[] }> {
  // Get incoming movements (purchases, transfers in, adjustments in)
  let movementsQuery = supabaseClient
    .from('stock_movements')
    .select('*')
    .eq('product_id', productId)
    .eq('to_warehouse_id', warehouseId)
    .in('type', ['in', 'transfer', 'adjustment'])
    .order('created_at', { ascending: method === 'FIFO' })

  if (startDate) {
    movementsQuery = movementsQuery.gte('created_at', startDate)
  }
  if (endDate) {
    movementsQuery = movementsQuery.lte('created_at', endDate)
  }

  const { data: movements, error } = await movementsQuery

  if (error) {
    throw error
  }

  const layers: CostLayer[] = []
  let remainingQuantity = currentQuantity
  let totalValue = 0

  if (method === 'AVERAGE') {
    // Calculate weighted average cost
    const totalQuantityIn = movements?.reduce((sum, m) => sum + m.quantity, 0) || 0
    const totalCostIn = movements?.reduce((sum, m) => sum + (m.quantity * (m.cost || 0)), 0) || 0
    const avgCost = totalQuantityIn > 0 ? totalCostIn / totalQuantityIn : 0

    return {
      unitCost: avgCost,
      totalValue: currentQuantity * avgCost,
      layers: [{
        date: new Date().toISOString(),
        quantity: currentQuantity,
        unitCost: avgCost,
        remainingQuantity: currentQuantity,
        source: 'Average Cost'
      }]
    }
  }

  // FIFO or LIFO processing
  for (const movement of movements || []) {
    if (remainingQuantity <= 0) break

    const quantityFromLayer = Math.min(movement.quantity, remainingQuantity)
    const layerCost = movement.cost || 0

    layers.push({
      date: movement.created_at,
      quantity: movement.quantity,
      unitCost: layerCost,
      remainingQuantity: quantityFromLayer,
      source: `${movement.type} - ${movement.reference_type || 'Manual'}`
    })

    totalValue += quantityFromLayer * layerCost
    remainingQuantity -= quantityFromLayer
  }

  // If there's still remaining quantity, use product's default price
  if (remainingQuantity > 0) {
    const { data: product } = await supabaseClient
      .from('products')
      .select('unit_price')
      .eq('id', productId)
      .single()

    const defaultPrice = product?.unit_price || 0
    totalValue += remainingQuantity * defaultPrice

    layers.push({
      date: new Date().toISOString(),
      quantity: remainingQuantity,
      unitCost: defaultPrice,
      remainingQuantity: remainingQuantity,
      source: 'Default Price'
    })
  }

  const unitCost = currentQuantity > 0 ? totalValue / currentQuantity : 0

  return { unitCost, totalValue, layers }
}