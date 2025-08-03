import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
export const routeOptimizationSchema = z.object({
  deliveries: z.array(z.object({
    id: z.string(),
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }),
    priority: z.enum(['urgent', 'normal', 'low']).default('normal'),
    timeWindow: z.object({
      start: z.string(),
      end: z.string()
    }).optional(),
    weight: z.number().optional(),
    volume: z.number().optional()
  })),
  vehicles: z.array(z.object({
    id: z.string(),
    capacity: z.object({
      weight: z.number(),
      volume: z.number()
    }),
    currentLocation: z.object({
      lat: z.number(),
      lng: z.number()
    }),
    driver: z.string(),
    costPerKm: z.number(),
    averageSpeed: z.number().default(50)
  })),
  constraints: z.object({
    maxDrivingHours: z.number().default(8),
    maxStops: z.number().optional(),
    avoidTraffic: z.boolean().default(true),
    optimizeFor: z.enum(['time', 'distance', 'cost', 'balanced']).default('balanced')
  }).optional()
})

// Types
export interface OptimizedRoute {
  vehicleId: string
  driverId: string
  totalDistance: number
  totalTime: number
  totalCost: number
  stops: Array<{
    deliveryId: string
    address: string
    arrivalTime: string
    departureTime: string
    waitTime: number
    sequence: number
    distance: number
    timeFromPrevious: number
  }>
  efficiency: {
    capacityUtilization: number
    timeUtilization: number
    costPerDelivery: number
  }
  alternativeRoutes?: Array<{
    totalDistance: number
    totalTime: number
    totalCost: number
    tradeoff: string
  }>
}

export interface TrafficPrediction {
  segment: {
    from: string
    to: string
  }
  predictions: Array<{
    time: string
    congestionLevel: 'low' | 'medium' | 'high' | 'severe'
    averageSpeed: number
    delay: number
  }>
  recommendation: string
}

export interface DeliveryAnalytics {
  onTimeRate: number
  averageDelay: number
  customerSatisfaction: number
  costPerKm: number
  emissionsPerDelivery: number
  trends: Array<{
    metric: string
    trend: 'improving' | 'stable' | 'declining'
    change: number
  }>
}

class RouteOptimizationService {
  private readonly FUNCTION_URL = '/route-optimization'

  // Optimize delivery routes
  async optimizeRoutes(params: z.infer<typeof routeOptimizationSchema>) {
    try {
      const validatedParams = routeOptimizationSchema.parse(params)

      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'optimize',
          ...validatedParams
        }
      })

      if (error) throw error

      return data as {
        routes: OptimizedRoute[]
        summary: {
          totalDeliveries: number
          totalDistance: number
          totalTime: number
          totalCost: number
          averageDeliveryTime: number
          unassignedDeliveries: string[]
        }
        savings: {
          distanceReduction: number
          timeReduction: number
          costReduction: number
          co2Reduction: number
        }
        warnings: string[]
      }
    } catch (error) {
      console.error('Error optimizing routes:', error)
      throw error
    }
  }

  // Real-time route adjustment
  async adjustRouteRealTime(vehicleId: string, newConditions: {
    trafficUpdate?: boolean
    newDelivery?: {
      id: string
      address: string
      coordinates: { lat: number; lng: number }
      priority: 'urgent' | 'normal'
    }
    vehicleIssue?: {
      type: 'breakdown' | 'accident' | 'delay'
      estimatedDelay: number
    }
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'real-time-adjust',
          vehicleId,
          ...newConditions
        }
      })

      if (error) throw error

      return data as {
        adjustedRoute: OptimizedRoute
        changes: Array<{
          type: 'add' | 'remove' | 'reorder'
          deliveryId: string
          reason: string
        }>
        impact: {
          additionalDistance: number
          additionalTime: number
          additionalCost: number
        }
        alternativeActions: string[]
      }
    } catch (error) {
      console.error('Error adjusting route in real-time:', error)
      throw error
    }
  }

  // Predict traffic patterns
  async predictTrafficPatterns(routes: Array<{
    from: { lat: number; lng: number }
    to: { lat: number; lng: number }
  }>, timeframe: 'today' | 'tomorrow' | 'week' = 'today') {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'predict-traffic',
          routes,
          timeframe
        }
      })

      if (error) throw error

      return data as {
        predictions: TrafficPrediction[]
        bestDepartureWindows: Array<{
          window: { start: string; end: string }
          expectedConditions: string
          confidence: number
        }>
        alternativeRoutes: Array<{
          route: string
          advantage: string
          timeGain: number
        }>
      }
    } catch (error) {
      console.error('Error predicting traffic patterns:', error)
      throw error
    }
  }

  // Multi-day route planning
  async planMultiDayRoutes(params: {
    deliveries: Array<{
      id: string
      address: string
      coordinates: { lat: number; lng: number }
      deliveryDate: string
      priority: 'urgent' | 'normal' | 'low'
    }>
    vehicles: Array<{
      id: string
      availability: Array<{ date: string; available: boolean }>
      homeBase: { lat: number; lng: number }
    }>
    planningHorizon: number // days
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'multi-day-planning',
          ...params
        }
      })

      if (error) throw error

      return data as {
        dailyPlans: Array<{
          date: string
          routes: OptimizedRoute[]
          summary: {
            deliveries: number
            totalDistance: number
            totalCost: number
            vehiclesUsed: number
          }
        }>
        optimization: {
          totalCost: number
          averageUtilization: number
          balanceScore: number // How well distributed the work is
        }
        recommendations: string[]
      }
    } catch (error) {
      console.error('Error planning multi-day routes:', error)
      throw error
    }
  }

  // Analyze delivery performance
  async analyzeDeliveryPerformance(period: 'week' | 'month' | 'quarter' = 'month') {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'analyze-performance',
          period
        }
      })

      if (error) throw error

      return data as {
        analytics: DeliveryAnalytics
        driverPerformance: Array<{
          driverId: string
          driverName: string
          deliveries: number
          onTimeRate: number
          customerRating: number
          efficiency: number
          safetyScore: number
        }>
        routeEfficiency: Array<{
          route: string
          frequency: number
          averageTime: number
          variability: number
          recommendation: string
        }>
        insights: Array<{
          type: 'opportunity' | 'issue' | 'trend'
          description: string
          impact: 'high' | 'medium' | 'low'
          action: string
        }>
      }
    } catch (error) {
      console.error('Error analyzing delivery performance:', error)
      throw error
    }
  }

  // Calculate emissions and suggest eco-routes
  async calculateEcoRoutes(deliveries: Array<{
    id: string
    coordinates: { lat: number; lng: number }
  }>, vehicleTypes: Array<{
    type: 'electric' | 'hybrid' | 'diesel' | 'gasoline'
    emissionFactor: number
  }>) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'eco-routes',
          deliveries,
          vehicleTypes
        }
      })

      if (error) throw error

      return data as {
        ecoRoutes: Array<{
          vehicleType: string
          route: OptimizedRoute
          emissions: {
            total: number
            perKm: number
            perDelivery: number
          }
          comparison: {
            vsStandard: number
            vsBestAlternative: number
          }
        }>
        recommendations: Array<{
          action: string
          emissionReduction: number
          costImpact: number
          feasibility: 'immediate' | 'short-term' | 'long-term'
        }>
        carbonOffset: {
          required: number
          cost: number
          projects: string[]
        }
      }
    } catch (error) {
      console.error('Error calculating eco-routes:', error)
      throw error
    }
  }

  // Dynamic pricing for deliveries
  async calculateDynamicPricing(params: {
    deliveries: Array<{
      distance: number
      urgency: 'standard' | 'express' | 'same-day'
      timeSlot?: string
      location: { lat: number; lng: number }
    }>
    demandLevel: 'low' | 'normal' | 'high' | 'peak'
    includeCompetitorPricing?: boolean
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'dynamic-pricing',
          ...params
        }
      })

      if (error) throw error

      return data as {
        pricing: Array<{
          basePrice: number
          surcharges: {
            urgency: number
            distance: number
            demand: number
            timeSlot: number
          }
          totalPrice: number
          profitMargin: number
          competitiveness: 'below' | 'at' | 'above' | 'premium'
        }>
        recommendations: {
          optimalPricePoint: number
          elasticityFactor: number
          expectedConversion: number
        }
        marketAnalysis?: {
          averagePrice: number
          position: number
          trend: string
        }
      }
    } catch (error) {
      console.error('Error calculating dynamic pricing:', error)
      throw error
    }
  }

  // Predict delivery delays
  async predictDeliveryDelays(activeRoutes: string[]) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'predict-delays',
          activeRoutes
        }
      })

      if (error) throw error

      return data as {
        predictions: Array<{
          routeId: string
          deliveryId: string
          estimatedDelay: number
          probability: number
          causes: Array<{
            factor: string
            impact: number
          }>
          mitigation: string
        }>
        alerts: Array<{
          severity: 'critical' | 'high' | 'medium' | 'low'
          message: string
          affectedDeliveries: string[]
          suggestedAction: string
        }>
      }
    } catch (error) {
      console.error('Error predicting delivery delays:', error)
      throw error
    }
  }
}

export const routeOptimizationService = new RouteOptimizationService()