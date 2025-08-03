import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
export const leadScoringSchema = z.object({
  leadId: z.string().uuid().optional(),
  leadData: z.object({
    company: z.object({
      name: z.string(),
      size: z.enum(['startup', 'smb', 'midmarket', 'enterprise']),
      industry: z.string(),
      revenue: z.number().optional(),
      location: z.string()
    }),
    contact: z.object({
      name: z.string(),
      title: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      linkedinUrl: z.string().optional()
    }),
    engagement: z.object({
      websiteVisits: z.number().default(0),
      emailsOpened: z.number().default(0),
      contentDownloads: z.number().default(0),
      demoRequested: z.boolean().default(false),
      lastActivity: z.string().optional()
    }),
    source: z.string()
  }).optional()
})

// Types
export interface LeadScore {
  leadId: string
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  category: 'hot' | 'warm' | 'cold'
  factors: {
    demographic: number
    firmographic: number
    behavioral: number
    engagement: number
  }
  insights: string[]
  nextBestActions: Array<{
    action: string
    priority: 'high' | 'medium' | 'low'
    expectedImpact: number
  }>
  conversionProbability: number
  estimatedDealSize: number
  recommendedAssignee: {
    id: string
    name: string
    reason: string
  }
}

export interface LeadTrend {
  leadId: string
  scoreHistory: Array<{
    date: string
    score: number
    trigger: string
  }>
  momentum: 'increasing' | 'stable' | 'decreasing'
  projectedScore: number
  riskOfDisengagement: number
}

export interface LeadSegment {
  id: string
  name: string
  criteria: Record<string, any>
  leadCount: number
  averageScore: number
  conversionRate: number
  characteristics: string[]
}

class LeadScoringService {
  private readonly FUNCTION_URL = '/lead-scoring'

  // Score a single lead
  async scoreLead(params: z.infer<typeof leadScoringSchema>) {
    try {
      const validatedParams = leadScoringSchema.parse(params)

      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'score-lead',
          ...validatedParams
        }
      })

      if (error) throw error

      return data as {
        score: LeadScore
        comparison: {
          vsAverage: number
          percentile: number
          similarLeads: Array<{
            leadId: string
            score: number
            outcome: string
          }>
        }
        recommendations: {
          nurturing: string[]
          content: string[]
          timing: {
            bestContactTime: string
            urgency: 'immediate' | 'within_24h' | 'within_week' | 'long_term'
          }
        }
      }
    } catch (error) {
      console.error('Error scoring lead:', error)
      throw error
    }
  }

  // Bulk score multiple leads
  async scoreLeadsBulk(leadIds: string[]) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'bulk-score',
          leadIds
        }
      })

      if (error) throw error

      return data as {
        scores: LeadScore[]
        summary: {
          totalLeads: number
          averageScore: number
          distribution: {
            hot: number
            warm: number
            cold: number
          }
          topOpportunities: string[]
        }
        segments: LeadSegment[]
      }
    } catch (error) {
      console.error('Error bulk scoring leads:', error)
      throw error
    }
  }

  // Analyze lead trends
  async analyzeLeadTrends(leadId: string, period: 'week' | 'month' | 'quarter' = 'month') {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'analyze-trends',
          leadId,
          period
        }
      })

      if (error) throw error

      return data as {
        trend: LeadTrend
        triggers: Array<{
          event: string
          impact: number
          date: string
          recommendation: string
        }>
        forecast: {
          nextWeekScore: number
          conversionLikelihood: number
          optimalActions: string[]
        }
      }
    } catch (error) {
      console.error('Error analyzing lead trends:', error)
      throw error
    }
  }

  // Predict lead conversion
  async predictConversion(leadIds: string[]) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'predict-conversion',
          leadIds
        }
      })

      if (error) throw error

      return data as {
        predictions: Array<{
          leadId: string
          willConvert: boolean
          probability: number
          timeToConversion: number // days
          requiredActions: string[]
          dealSize: {
            min: number
            expected: number
            max: number
          }
        }>
        insights: {
          commonPatterns: string[]
          successFactors: string[]
          riskFactors: string[]
        }
      }
    } catch (error) {
      console.error('Error predicting conversion:', error)
      throw error
    }
  }

  // Segment leads automatically
  async segmentLeads(criteria?: {
    includeScoring?: boolean
    includeBehavior?: boolean
    customAttributes?: string[]
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'segment-leads',
          ...criteria
        }
      })

      if (error) throw error

      return data as {
        segments: LeadSegment[]
        recommendations: Array<{
          segment: string
          strategy: string
          expectedROI: number
          resources: string[]
        }>
        migrations: Array<{
          leadId: string
          fromSegment: string
          toSegment: string
          reason: string
        }>
      }
    } catch (error) {
      console.error('Error segmenting leads:', error)
      throw error
    }
  }

  // Get lead recommendations
  async getLeadRecommendations(leadId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'get-recommendations',
          leadId
        }
      })

      if (error) throw error

      return data as {
        immediate: Array<{
          action: string
          channel: 'email' | 'phone' | 'linkedin' | 'meeting'
          template: string
          timing: string
          expectedResponse: number
        }>
        nurturing: {
          track: 'fast' | 'standard' | 'slow'
          content: Array<{
            type: string
            topic: string
            format: string
            sendDate: string
          }>
          touchpoints: number
          duration: number // days
        }
        upsell: Array<{
          product: string
          probability: number
          approach: string
        }>
      }
    } catch (error) {
      console.error('Error getting lead recommendations:', error)
      throw error
    }
  }

  // Analyze competitor mentions
  async analyzeCompetitorMentions(leadId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'analyze-competitors',
          leadId
        }
      })

      if (error) throw error

      return data as {
        competitors: Array<{
          name: string
          mentionCount: number
          sentiment: 'positive' | 'neutral' | 'negative'
          inUse: boolean
          switchingSignals: string[]
        }>
        winProbability: number
        differentiators: string[]
        counterStrategies: Array<{
          competitor: string
          approach: string
          keyPoints: string[]
        }>
      }
    } catch (error) {
      console.error('Error analyzing competitor mentions:', error)
      throw error
    }
  }

  // Calculate lead attribution
  async calculateAttribution(leadId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'calculate-attribution',
          leadId
        }
      })

      if (error) throw error

      return data as {
        touchpoints: Array<{
          channel: string
          timestamp: string
          influence: number
          type: 'first' | 'last' | 'assist'
        }>
        attribution: {
          firstTouch: { channel: string; impact: number }
          lastTouch: { channel: string; impact: number }
          multiTouch: Record<string, number>
        }
        roi: {
          byChannel: Record<string, number>
          total: number
          projectedLTV: number
        }
      }
    } catch (error) {
      console.error('Error calculating attribution:', error)
      throw error
    }
  }

  // Real-time lead alerts
  async setupLeadAlerts(criteria: {
    scoreThreshold?: number
    behaviors?: string[]
    engagement?: string[]
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'setup-alerts',
          ...criteria
        }
      })

      if (error) throw error

      return data as {
        alertId: string
        active: boolean
        conditions: any[]
        notificationChannels: string[]
      }
    } catch (error) {
      console.error('Error setting up lead alerts:', error)
      throw error
    }
  }
}

export const leadScoringService = new LeadScoringService()