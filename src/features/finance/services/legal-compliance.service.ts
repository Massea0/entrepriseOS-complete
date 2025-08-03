import { supabase } from '@/lib/supabase'

export type ComplianceCheckType = 'rgpd' | 'mentions' | 'terms' | 'privacy' | 'all'
export type ComplianceLevel = 'compliant' | 'partial' | 'non_compliant'

interface ComplianceIssue {
  type: 'error' | 'warning' | 'suggestion'
  category: string
  description: string
  location?: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  recommendation: string
  legalReference?: string
}

interface ComplianceCheckResponse {
  compliant: boolean
  complianceLevel: ComplianceLevel
  score: number // 0-100
  issues: ComplianceIssue[]
  suggestions: string[]
  checkedAreas: {
    rgpd: { compliant: boolean; score: number }
    mentions: { compliant: boolean; score: number }
    accessibility: { compliant: boolean; score: number }
    cookies: { compliant: boolean; score: number }
  }
  report: {
    summary: string
    details: Record<string, any>
    generatedAt: string
  }
}

export class LegalComplianceService {
  /**
   * Vérifie la conformité légale d'un document
   */
  static async checkCompliance(
    documentContent: string,
    checkType: ComplianceCheckType = 'all',
    documentType?: 'contract' | 'privacy_policy' | 'terms' | 'website'
  ): Promise<ComplianceCheckResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<ComplianceCheckResponse>('legal-compliance-checker', {
        body: {
          documentContent,
          checkType,
          documentType
        }
      })

      if (error) {
        console.error('Error checking compliance:', error)
        throw new Error(`Erreur vérification conformité: ${error.message}`)
      }

      if (!data) {
        throw new Error('Aucun résultat de conformité retourné')
      }

      // Sauvegarder le rapport de conformité
      await this.saveComplianceReport(data)

      return data
    } catch (error) {
      console.error('LegalComplianceService error:', error)
      throw error
    }
  }

  /**
   * Vérifie la conformité RGPD spécifiquement
   */
  static async checkRGPDCompliance(
    documentContent: string,
    dataProcessingActivities?: string[]
  ): Promise<{
    compliant: boolean
    score: number
    requirements: Array<{
      requirement: string
      status: 'met' | 'not_met' | 'partial'
      details: string
    }>
    dataProtectionOfficer: {
      required: boolean
      appointed: boolean
    }
    privacyByDesign: boolean
    recommendations: string[]
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('legal-compliance-checker', {
        body: {
          documentContent,
          dataProcessingActivities,
          action: 'check_rgpd'
        }
      })

      if (error) {
        throw new Error(`Erreur RGPD: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('RGPD compliance error:', error)
      throw error
    }
  }

  /**
   * Génère les mentions légales automatiquement
   */
  static async generateLegalMentions(
    companyInfo: {
      name: string
      legalForm: string
      address: string
      siret: string
      capital?: number
      directorName: string
      hostingProvider?: string
    }
  ): Promise<{
    mentionsLegales: string
    mentionsRGPD: string
    cookiePolicy: string
    termsOfUse?: string
    formatted: {
      html: string
      markdown: string
      text: string
    }
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('legal-compliance-checker', {
        body: {
          companyInfo,
          action: 'generate_mentions'
        }
      })

      if (error) {
        throw new Error(`Erreur génération mentions: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Generate mentions error:', error)
      throw error
    }
  }

  /**
   * Vérifie et met à jour automatiquement la conformité
   */
  static async autoFixCompliance(
    documentContent: string,
    issues: ComplianceIssue[]
  ): Promise<{
    fixedContent: string
    fixedIssues: string[]
    remainingIssues: ComplianceIssue[]
    confidence: number
    requiresReview: boolean
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('legal-compliance-checker', {
        body: {
          documentContent,
          issues,
          action: 'auto_fix'
        }
      })

      if (error) {
        throw new Error(`Erreur correction automatique: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Auto fix error:', error)
      throw error
    }
  }

  /**
   * Surveillance continue de la conformité
   */
  static async monitorCompliance(
    documentIds: string[],
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Promise<{
    monitoringId: string
    schedule: {
      frequency: string
      nextCheck: string
      notificationEmail?: string
    }
    currentStatus: Array<{
      documentId: string
      lastCheck: string
      complianceLevel: ComplianceLevel
      criticalIssues: number
    }>
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('legal-compliance-checker', {
        body: {
          documentIds,
          frequency,
          action: 'setup_monitoring'
        }
      })

      if (error) {
        throw new Error(`Erreur surveillance: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Monitor compliance error:', error)
      throw error
    }
  }

  /**
   * Sauvegarde le rapport de conformité
   */
  private static async saveComplianceReport(report: ComplianceCheckResponse): Promise<void> {
    try {
      const { error } = await supabase
        .from('compliance_reports')
        .insert({
          compliance_level: report.complianceLevel,
          score: report.score,
          issues: report.issues,
          report: report.report,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving compliance report:', error)
      }
    } catch (error) {
      console.error('Save report error:', error)
    }
  }
}