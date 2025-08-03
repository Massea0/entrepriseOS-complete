import { supabase } from '@/lib/supabase'

export interface TransportCostOptimization {
  currentCosts: {
    total: number
    perKm: number
    perDelivery: number
    byVehicleType: Record<string, number>
  }
  optimizations: Array<{
    strategy: string
    savings: number
    implementation: string
    timeline: string
  }>
  recommendations: {
    fleetComposition: string[]
    routeConsolidation: string[]
    carrierNegotiation: string[]
  }
}

class TransportCostService {
  private readonly FUNCTION_URL = '/transport-cost-optimization'

  async optimizeTransportCosts(params: {
    period: 'month' | 'quarter' | 'year'
    includeExternalCarriers?: boolean
  }) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'optimize-costs', ...params }
    })
    if (error) throw error
    return data as TransportCostOptimization
  }

  async analyzeCarrierPerformance(carrierId?: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze-carriers', carrierId }
    })
    if (error) throw error
    return data
  }

  async simulateCostScenarios(scenarios: Array<{
    type: 'fuel_increase' | 'fleet_expansion' | 'route_change'
    parameters: Record<string, any>
  }>) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'simulate-scenarios', scenarios }
    })
    if (error) throw error
    return data
  }
}

export const transportCostService = new TransportCostService()