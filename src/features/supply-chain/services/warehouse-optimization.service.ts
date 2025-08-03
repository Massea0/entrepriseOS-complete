import { supabase } from '@/lib/supabase'

export interface WarehouseOptimization {
  layout: {
    zones: Array<{
      id: string
      type: 'receiving' | 'storage' | 'picking' | 'shipping'
      efficiency: number
      recommendations: string[]
    }>
    flowEfficiency: number
    spaceUtilization: number
  }
  inventory: {
    abcAnalysis: Record<string, 'A' | 'B' | 'C'>
    placementOptimization: Array<{
      productId: string
      currentLocation: string
      optimalLocation: string
      efficiency: number
    }>
  }
}

class WarehouseOptimizationService {
  private readonly FUNCTION_URL = '/warehouse-optimization'

  async optimizeWarehouseLayout(warehouseId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'optimize-layout', warehouseId }
    })
    if (error) throw error
    return data as WarehouseOptimization
  }

  async optimizeInventoryPlacement(warehouseId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'optimize-placement', warehouseId }
    })
    if (error) throw error
    return data
  }

  async analyzePicking(warehouseId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze-picking', warehouseId }
    })
    if (error) throw error
    return data
  }
}

export const warehouseOptimizationService = new WarehouseOptimizationService()