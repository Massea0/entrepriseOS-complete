import { supabase } from '@/lib/supabase'
import type { Contract } from '../types/contract.types'

export type AnalysisType = 'financial' | 'legal' | 'operational' | 'all'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

interface RiskFactor {
  category: string
  description: string
  impact: RiskLevel
  probability: number
  mitigation: string
}

interface RiskAnalysisResponse {
  riskScore: number // 0-100
  riskLevel: RiskLevel
  factors: RiskFactor[]
  recommendations: string[]
  summary: string
  financialExposure?: number
  legalCompliance?: {
    compliant: boolean
    issues: string[]
  }
}

interface ContractRiskParams {
  contractId: string
  analysisType?: AnalysisType
  includeHistoricalData?: boolean
  compareWithTemplates?: boolean
}

export class ContractRiskService {
  /**
   * Analyse les risques d'un contrat
   */
  static async analyzeContractRisk(params: ContractRiskParams): Promise<RiskAnalysisResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<RiskAnalysisResponse>('contract-risk-analyzer', {
        body: {
          contractId: params.contractId,
          analysisType: params.analysisType || 'all',
          includeHistoricalData: params.includeHistoricalData ?? true,
          compareWithTemplates: params.compareWithTemplates ?? true
        }
      })

      if (error) {
        console.error('Error analyzing contract risk:', error)
        throw new Error(`Erreur d'analyse de risque: ${error.message}`)
      }

      if (!data) {
        throw new Error('Aucune analyse de risque retournée')
      }

      // Sauvegarder l'analyse dans la base de données
      await this.saveRiskAnalysis(params.contractId, data)

      return data
    } catch (error) {
      console.error('ContractRiskService error:', error)
      throw error
    }
  }

  /**
   * Analyse comparative de plusieurs contrats
   */
  static async compareContractsRisk(contractIds: string[]): Promise<{
    comparison: Array<{
      contractId: string
      riskScore: number
      riskLevel: RiskLevel
      keyDifferences: string[]
    }>
    averageRisk: number
    recommendations: string[]
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-risk-analyzer', {
        body: {
          contractIds,
          action: 'compare'
        }
      })

      if (error) {
        throw new Error(`Erreur de comparaison: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Compare contracts error:', error)
      throw error
    }
  }

  /**
   * Obtient des recommandations pour réduire les risques
   */
  static async getRiskMitigationPlan(contractId: string, targetRiskLevel: RiskLevel = 'low'): Promise<{
    currentRisk: RiskLevel
    targetRisk: RiskLevel
    steps: Array<{
      action: string
      impact: string
      priority: 'high' | 'medium' | 'low'
      estimatedReduction: number
    }>
    estimatedFinalScore: number
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-risk-analyzer', {
        body: {
          contractId,
          targetRiskLevel,
          action: 'mitigation_plan'
        }
      })

      if (error) {
        throw new Error(`Erreur plan de mitigation: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Mitigation plan error:', error)
      throw error
    }
  }

  /**
   * Surveillance en temps réel des risques
   */
  static async monitorRiskChanges(contractId: string, alertThreshold: number = 70): Promise<{
    currentScore: number
    previousScore: number
    changes: Array<{
      factor: string
      previousValue: number
      currentValue: number
      reason: string
    }>
    alert: boolean
    alertMessage?: string
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-risk-analyzer', {
        body: {
          contractId,
          alertThreshold,
          action: 'monitor'
        }
      })

      if (error) {
        throw new Error(`Erreur surveillance: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Monitor risk error:', error)
      throw error
    }
  }

  /**
   * Sauvegarde l'analyse de risque dans la base de données
   */
  private static async saveRiskAnalysis(contractId: string, analysis: RiskAnalysisResponse): Promise<void> {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          risk_analysis: {
            score: analysis.riskScore,
            level: analysis.riskLevel,
            factors: analysis.factors,
            lastAnalyzed: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)

      if (error) {
        console.error('Error saving risk analysis:', error)
        // Ne pas lancer d'erreur pour ne pas bloquer le processus
      }
    } catch (error) {
      console.error('Save risk analysis error:', error)
    }
  }
}