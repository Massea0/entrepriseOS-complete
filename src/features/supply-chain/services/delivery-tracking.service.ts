import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
export const deliveryTrackingSchema = z.object({
  trackingNumber: z.string(),
  includeHistory: z.boolean().default(true),
  includePredictions: z.boolean().default(true)
})

export const deliveryUpdateSchema = z.object({
  deliveryId: z.string().uuid(),
  status: z.enum(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned']),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional()
  }),
  notes: z.string().optional(),
  photo: z.string().optional()
})

// Types
export interface DeliveryStatus {
  deliveryId: string
  trackingNumber: string
  currentStatus: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
  currentLocation: {
    lat: number
    lng: number
    address: string
    timestamp: string
  }
  estimatedDelivery: {
    date: string
    timeWindow: { start: string; end: string }
    confidence: number
  }
  customer: {
    name: string
    address: string
    phone: string
    preferences: {
      deliveryWindow: string
      specialInstructions: string
    }
  }
  vehicle: {
    id: string
    driver: string
    type: string
    currentCapacity: number
  }
}

export interface DeliveryHistory {
  timestamp: string
  status: string
  location: {
    lat: number
    lng: number
    address: string
  }
  event: string
  duration: number // minutes at this status
  actor: string // driver, system, customer
}

export interface DeliveryPrediction {
  type: 'delay' | 'early' | 'on_time' | 'failure_risk'
  probability: number
  estimatedImpact: {
    minutes: number
    newETA: string
  }
  causes: Array<{
    factor: string
    contribution: number
  }>
  recommendations: string[]
}

export interface CustomerNotification {
  type: 'sms' | 'email' | 'push' | 'whatsapp'
  template: string
  personalizedMessage: string
  scheduledTime: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export interface DeliveryAnalytics {
  successRate: number
  averageDeliveryTime: number
  customerSatisfaction: number
  commonIssues: Array<{
    issue: string
    frequency: number
    impact: string
  }>
  performanceByDriver: Array<{
    driverId: string
    name: string
    deliveries: number
    successRate: number
    avgTime: number
    rating: number
  }>
}

class DeliveryTrackingService {
  private readonly FUNCTION_URL = '/delivery-tracking'

  // Track single delivery
  async trackDelivery(params: z.infer<typeof deliveryTrackingSchema>) {
    try {
      const validatedParams = deliveryTrackingSchema.parse(params)

      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'track',
          ...validatedParams
        }
      })

      if (error) throw error

      return data as {
        status: DeliveryStatus
        history: DeliveryHistory[]
        predictions: DeliveryPrediction[]
        nextMilestone: {
          event: string
          estimatedTime: string
          distance: number
        }
        customerCommunication: {
          lastNotification: string
          nextScheduled: string
          preferences: string[]
        }
      }
    } catch (error) {
      console.error('Error tracking delivery:', error)
      throw error
    }
  }

  // Track multiple deliveries
  async trackMultipleDeliveries(trackingNumbers: string[]) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'track-multiple',
          trackingNumbers
        }
      })

      if (error) throw error

      return data as {
        deliveries: Array<{
          trackingNumber: string
          status: DeliveryStatus
          eta: string
          riskLevel: 'low' | 'medium' | 'high'
        }>
        summary: {
          total: number
          onTime: number
          delayed: number
          delivered: number
          issues: number
        }
        alerts: Array<{
          deliveryId: string
          type: string
          message: string
          severity: 'info' | 'warning' | 'critical'
        }>
      }
    } catch (error) {
      console.error('Error tracking multiple deliveries:', error)
      throw error
    }
  }

  // Update delivery status
  async updateDeliveryStatus(params: z.infer<typeof deliveryUpdateSchema>) {
    try {
      const validatedParams = deliveryUpdateSchema.parse(params)

      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'update-status',
          ...validatedParams
        }
      })

      if (error) throw error

      return data as {
        updated: boolean
        newStatus: DeliveryStatus
        notifications: CustomerNotification[]
        nextSteps: string[]
      }
    } catch (error) {
      console.error('Error updating delivery status:', error)
      throw error
    }
  }

  // Get real-time location updates
  async subscribeToLocationUpdates(deliveryIds: string[], callback: (update: {
    deliveryId: string
    location: { lat: number; lng: number }
    speed: number
    heading: number
    timestamp: string
  }) => void) {
    // This would typically use WebSocket or SSE
    // For now, we'll simulate with polling
    const channel = supabase
      .channel('delivery-locations')
      .on('broadcast', { event: 'location-update' }, (payload) => {
        if (deliveryIds.includes(payload.deliveryId)) {
          callback(payload)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Predict delivery issues
  async predictDeliveryIssues(routeId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'predict-issues',
          routeId
        }
      })

      if (error) throw error

      return data as {
        predictions: Array<{
          deliveryId: string
          issue: {
            type: 'delay' | 'wrong_address' | 'customer_unavailable' | 'traffic' | 'weather'
            probability: number
            estimatedImpact: string
          }
          preventiveActions: string[]
          alternativeSolutions: Array<{
            solution: string
            feasibility: number
            impact: string
          }>
        }>
        routeAdjustments: {
          recommended: boolean
          newSequence: string[]
          timeSaved: number
          explanation: string
        }
      }
    } catch (error) {
      console.error('Error predicting delivery issues:', error)
      throw error
    }
  }

  // Optimize customer notifications
  async optimizeCustomerNotifications(deliveryId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'optimize-notifications',
          deliveryId
        }
      })

      if (error) throw error

      return data as {
        notificationPlan: Array<{
          timing: string
          channel: 'sms' | 'email' | 'push' | 'whatsapp'
          message: string
          personalization: {
            customerName: boolean
            estimatedTime: boolean
            driverName: boolean
            trackingLink: boolean
          }
        }>
        customerPreferences: {
          preferredChannel: string
          optimalTiming: string[]
          language: string
          detailLevel: 'minimal' | 'standard' | 'detailed'
        }
        expectedEngagement: {
          openRate: number
          responseRate: number
          satisfactionImpact: number
        }
      }
    } catch (error) {
      console.error('Error optimizing customer notifications:', error)
      throw error
    }
  }

  // Analyze delivery performance
  async analyzeDeliveryPerformance(params: {
    period: 'day' | 'week' | 'month' | 'quarter'
    groupBy?: 'driver' | 'route' | 'customer' | 'time'
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'analyze-performance',
          ...params
        }
      })

      if (error) throw error

      return data as {
        analytics: DeliveryAnalytics
        insights: Array<{
          type: 'trend' | 'anomaly' | 'opportunity' | 'issue'
          description: string
          impact: 'positive' | 'negative' | 'neutral'
          recommendation: string
          priority: number
        }>
        benchmarks: {
          industryAverage: {
            deliveryTime: number
            successRate: number
            customerSatisfaction: number
          }
          companyPerformance: {
            vsIndustry: number
            vsPreviousPeriod: number
            vsTarget: number
          }
        }
        forecasts: {
          nextPeriod: {
            expectedVolume: number
            successRate: number
            challenges: string[]
          }
        }
      }
    } catch (error) {
      console.error('Error analyzing delivery performance:', error)
      throw error
    }
  }

  // Handle failed deliveries
  async handleFailedDelivery(deliveryId: string, reason: string) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'handle-failure',
          deliveryId,
          reason
        }
      })

      if (error) throw error

      return data as {
        rescheduleOptions: Array<{
          date: string
          timeSlot: string
          availability: number
          customerPreference: boolean
        }>
        alternativeOptions: Array<{
          type: 'pickup' | 'neighbor' | 'locker' | 'reschedule'
          details: string
          customerAcceptance: number
        }>
        customerCommunication: {
          message: string
          channels: string[]
          sent: boolean
        }
        rootCauseAnalysis: {
          primaryCause: string
          contributingFactors: string[]
          preventionMeasures: string[]
        }
      }
    } catch (error) {
      console.error('Error handling failed delivery:', error)
      throw error
    }
  }

  // Generate proof of delivery
  async generateProofOfDelivery(deliveryId: string, data: {
    signature?: string
    photo?: string
    notes?: string
    recipientName?: string
  }) {
    try {
      const { data: result, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'generate-pod',
          deliveryId,
          ...data
        }
      })

      if (error) throw error

      return result as {
        podUrl: string
        documentId: string
        timestamp: string
        verification: {
          signatureValid: boolean
          locationVerified: boolean
          photoQuality: 'good' | 'acceptable' | 'poor'
        }
        archived: boolean
      }
    } catch (error) {
      console.error('Error generating proof of delivery:', error)
      throw error
    }
  }

  // Customer feedback collection
  async collectCustomerFeedback(deliveryId: string, feedback: {
    rating: number
    comment?: string
    issues?: string[]
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'collect-feedback',
          deliveryId,
          ...feedback
        }
      })

      if (error) throw error

      return data as {
        processed: boolean
        sentiment: 'positive' | 'neutral' | 'negative'
        actionItems: string[]
        driverNotified: boolean
        improvementSuggestions: string[]
      }
    } catch (error) {
      console.error('Error collecting customer feedback:', error)
      throw error
    }
  }
}

export const deliveryTrackingService = new DeliveryTrackingService()