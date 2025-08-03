import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
export const supplierEvaluationSchema = z.object({
  supplierId: z.string().uuid(),
  evaluationPeriod: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  criteria: z.array(z.enum([
    'quality',
    'delivery',
    'price',
    'communication',
    'sustainability',
    'innovation',
    'financialStability',
    'compliance'
  ])).optional()
})

export const supplierComparisonSchema = z.object({
  supplierIds: z.array(z.string().uuid()).min(2),
  category: z.string().optional(),
  weights: z.object({
    quality: z.number().min(0).max(1).default(0.25),
    delivery: z.number().min(0).max(1).default(0.25),
    price: z.number().min(0).max(1).default(0.25),
    sustainability: z.number().min(0).max(1).default(0.25)
  }).optional()
})

// Types
export interface SupplierScore {
  supplierId: string
  supplierName: string
  overallScore: number
  scoreBreakdown: {
    quality: number
    delivery: number
    price: number
    communication: number
    sustainability: number
    innovation: number
    financialStability: number
    compliance: number
  }
  trend: 'improving' | 'stable' | 'declining'
  percentile: number // Position among all suppliers
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export interface SupplierRisk {
  type: 'financial' | 'operational' | 'compliance' | 'geopolitical' | 'environmental'
  level: 'low' | 'medium' | 'high' | 'critical'
  description: string
  probability: number
  impact: number
  mitigation: string[]
}

export interface SupplierPerformance {
  kpis: {
    onTimeDeliveryRate: number
    qualityAcceptanceRate: number
    priceStability: number
    responseTime: number
    defectRate: number
    leadTimeVariability: number
  }
  historicalTrends: Array<{
    month: string
    score: number
    incidents: number
  }>
  predictions: {
    nextQuarterScore: number
    riskOfDegradation: number
    improvementPotential: number
  }
}

export interface AlternativeSupplier {
  id: string
  name: string
  score: number
  advantages: string[]
  switchingCost: number
  leadTime: number
  minimumOrderQuantity: number
  priceComparison: number // % vs current
}

class SupplierScoringService {
  private readonly FUNCTION_URL = '/supplier-scoring'

  // Evaluate supplier performance
  async evaluateSupplier(params: z.infer<typeof supplierEvaluationSchema>) {
    try {
      const validatedParams = supplierEvaluationSchema.parse(params)

      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'evaluate',
          ...validatedParams
        }
      })

      if (error) throw error

      return data as {
        score: SupplierScore
        performance: SupplierPerformance
        risks: SupplierRisk[]
        contractCompliance: {
          complianceRate: number
          violations: Array<{
            clause: string
            severity: string
            date: string
          }>
        }
        financialHealth: {
          creditScore: number
          paymentHistory: string
          riskIndicators: string[]
        }
      }
    } catch (error) {
      console.error('Error evaluating supplier:', error)
      throw error
    }
  }

  // Compare multiple suppliers
  async compareSuppliers(params: z.infer<typeof supplierComparisonSchema>) {
    try {
      const validatedParams = supplierComparisonSchema.parse(params)

      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'compare',
          ...validatedParams
        }
      })

      if (error) throw error

      return data as {
        comparison: Array<{
          supplier: SupplierScore
          ranking: number
          competitiveAdvantages: string[]
          gaps: string[]
        }>
        winner: {
          supplierId: string
          supplierName: string
          winningFactors: string[]
        }
        recommendations: {
          preferred: string
          alternative: string
          negotiationPoints: string[]
        }
        visualization: {
          radarChartData: any
          comparisonMatrix: any
        }
      }
    } catch (error) {
      console.error('Error comparing suppliers:', error)
      throw error
    }
  }

  // Find alternative suppliers
  async findAlternativeSuppliers(currentSupplierId: string, requirements: {
    productCategory: string
    minScore?: number
    maxLeadTime?: number
    location?: string
    certifications?: string[]
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'find-alternatives',
          currentSupplierId,
          ...requirements
        }
      })

      if (error) throw error

      return data as {
        alternatives: AlternativeSupplier[]
        marketAnalysis: {
          totalSuppliers: number
          averageScore: number
          priceRange: { min: number; max: number }
          geographicDistribution: Record<string, number>
        }
        switchingAnalysis: {
          estimatedTime: number
          totalCost: number
          risks: string[]
          benefits: string[]
        }
      }
    } catch (error) {
      console.error('Error finding alternative suppliers:', error)
      throw error
    }
  }

  // Predict supplier risks
  async predictSupplierRisks(supplierId: string, timeframe: 'month' | 'quarter' | 'year' = 'quarter') {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'predict-risks',
          supplierId,
          timeframe
        }
      })

      if (error) throw error

      return data as {
        riskProfile: {
          overallRiskLevel: 'low' | 'medium' | 'high' | 'critical'
          riskScore: number
          trend: 'increasing' | 'stable' | 'decreasing'
        }
        predictedRisks: SupplierRisk[]
        earlyWarnings: Array<{
          indicator: string
          currentValue: number
          threshold: number
          expectedDate: string
        }>
        mitigationPlan: {
          immediateActions: string[]
          preventiveMeasures: string[]
          contingencyPlans: Array<{
            scenario: string
            actions: string[]
            alternativeSuppliers: string[]
          }>
        }
      }
    } catch (error) {
      console.error('Error predicting supplier risks:', error)
      throw error
    }
  }

  // Optimize supplier portfolio
  async optimizeSupplierPortfolio(params: {
    productCategories: string[]
    constraints: {
      maxSuppliers?: number
      minDiversification?: number
      budgetLimit?: number
      riskTolerance: 'low' | 'medium' | 'high'
    }
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'optimize-portfolio',
          ...params
        }
      })

      if (error) throw error

      return data as {
        optimizedPortfolio: Array<{
          category: string
          suppliers: Array<{
            supplierId: string
            supplierName: string
            allocation: number // percentage
            role: 'primary' | 'secondary' | 'backup'
          }>
        }>
        improvements: {
          riskReduction: number
          costSavings: number
          qualityImprovement: number
          supplierConsolidation: number
        }
        transitionPlan: Array<{
          action: string
          timeline: string
          impact: string
          priority: 'high' | 'medium' | 'low'
        }>
      }
    } catch (error) {
      console.error('Error optimizing supplier portfolio:', error)
      throw error
    }
  }

  // Analyze supplier sustainability
  async analyzeSupplierSustainability(supplierId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'analyze-sustainability',
          supplierId
        }
      })

      if (error) throw error

      return data as {
        sustainabilityScore: number
        certifications: Array<{
          name: string
          validUntil: string
          scope: string
        }>
        environmentalImpact: {
          carbonFootprint: number
          waterUsage: number
          wasteGeneration: number
          renewableEnergy: number
        }
        socialResponsibility: {
          laborPractices: number
          communityImpact: number
          diversityScore: number
        }
        improvements: Array<{
          area: string
          currentState: string
          recommendation: string
          impact: 'high' | 'medium' | 'low'
        }>
        benchmarking: {
          industryAverage: number
          percentile: number
          leaders: string[]
        }
      }
    } catch (error) {
      console.error('Error analyzing supplier sustainability:', error)
      throw error
    }
  }

  // Generate supplier scorecard
  async generateSupplierScorecard(supplierId: string, options?: {
    period?: string
    format?: 'pdf' | 'excel' | 'interactive'
    includeComparison?: boolean
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'generate-scorecard',
          supplierId,
          ...options
        }
      })

      if (error) throw error

      return data as {
        scorecardUrl: string
        summary: {
          overallGrade: string
          keyStrengths: string[]
          improvementAreas: string[]
          trend: string
        }
        nextReviewDate: string
      }
    } catch (error) {
      console.error('Error generating supplier scorecard:', error)
      throw error
    }
  }

  // Monitor supplier compliance
  async monitorSupplierCompliance(supplierId: string, regulations: string[]) {
    try {
      const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
        body: {
          action: 'monitor-compliance',
          supplierId,
          regulations
        }
      })

      if (error) throw error

      return data as {
        complianceStatus: {
          overall: 'compliant' | 'partial' | 'non-compliant'
          score: number
          lastAudit: string
        }
        regulationDetails: Array<{
          regulation: string
          status: 'compliant' | 'partial' | 'non-compliant'
          gaps: string[]
          deadline: string
        }>
        alerts: Array<{
          type: 'expiring' | 'violation' | 'new-requirement'
          description: string
          urgency: 'immediate' | 'soon' | 'upcoming'
          action: string
        }>
        documentation: {
          required: string[]
          missing: string[]
          expiring: Array<{
            document: string
            expiryDate: string
          }>
        }
      }
    } catch (error) {
      console.error('Error monitoring supplier compliance:', error)
      throw error
    }
  }
}

export const supplierScoringService = new SupplierScoringService()