import { supabase } from '@/lib/supabase'
import type { Contract, ContractTemplate } from '../types/contract.types'

interface ContractVariables {
  clientName: string
  clientAddress?: string
  clientEmail: string
  startDate: string
  endDate?: string
  amount: number
  currency?: string
  paymentTerms?: string
  deliverables?: string[]
  specialClauses?: string[]
  [key: string]: any // Pour des variables dynamiques
}

interface GenerateContractResponse {
  contractId: string
  content: string
  status: 'draft' | 'ready' | 'needs_review'
  formattedContent?: string // HTML ou Markdown formaté
  metadata: {
    templateUsed: string
    generatedAt: string
    estimatedReadTime: number
    wordCount: number
  }
  warnings?: string[]
  missingVariables?: string[]
}

interface ContractGenerationParams {
  templateId: string
  variables: ContractVariables
  language?: 'fr' | 'en'
  format?: 'text' | 'html' | 'markdown'
  includeAISuggestions?: boolean
}

export class ContractGeneratorService {
  /**
   * Génère un contrat à partir d'un template
   */
  static async generateContract(params: ContractGenerationParams): Promise<GenerateContractResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<GenerateContractResponse>('contract-generator', {
        body: {
          templateId: params.templateId,
          variables: params.variables,
          language: params.language || 'fr',
          format: params.format || 'html',
          includeAISuggestions: params.includeAISuggestions ?? true
        }
      })

      if (error) {
        console.error('Error generating contract:', error)
        throw new Error(`Erreur de génération de contrat: ${error.message}`)
      }

      if (!data) {
        throw new Error('Aucun contrat généré')
      }

      // Sauvegarder le contrat généré
      await this.saveGeneratedContract(data, params)

      return data
    } catch (error) {
      console.error('ContractGeneratorService error:', error)
      throw error
    }
  }

  /**
   * Génère un contrat avec l'IA sans template
   */
  static async generateContractWithAI(
    requirements: string,
    contractType: 'service' | 'product' | 'subscription' | 'custom',
    clientData: Partial<ContractVariables>
  ): Promise<GenerateContractResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<GenerateContractResponse>('contract-generator', {
        body: {
          requirements,
          contractType,
          clientData,
          action: 'generate_from_ai'
        }
      })

      if (error) {
        throw new Error(`Erreur génération IA: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('AI contract generation error:', error)
      throw error
    }
  }

  /**
   * Prévisualise un contrat avant génération finale
   */
  static async previewContract(
    templateId: string,
    variables: Partial<ContractVariables>
  ): Promise<{
    preview: string
    completeness: number
    missingRequired: string[]
    suggestions: Array<{
      field: string
      suggestion: string
      reason: string
    }>
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-generator', {
        body: {
          templateId,
          variables,
          action: 'preview'
        }
      })

      if (error) {
        throw new Error(`Erreur preview: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Preview contract error:', error)
      throw error
    }
  }

  /**
   * Valide un contrat généré
   */
  static async validateContract(contractId: string): Promise<{
    valid: boolean
    issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      section?: string
      suggestion?: string
    }>
    legalCompliance: boolean
    readabilityScore: number
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-generator', {
        body: {
          contractId,
          action: 'validate'
        }
      })

      if (error) {
        throw new Error(`Erreur validation: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Validate contract error:', error)
      throw error
    }
  }

  /**
   * Convertit un contrat en PDF
   */
  static async exportContractToPDF(contractId: string, options?: {
    includeSignatureFields?: boolean
    watermark?: string
    password?: string
  }): Promise<{
    pdfUrl: string
    expiresAt: string
    fileSize: number
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-generator', {
        body: {
          contractId,
          options,
          action: 'export_pdf'
        }
      })

      if (error) {
        throw new Error(`Erreur export PDF: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Export PDF error:', error)
      throw error
    }
  }

  /**
   * Clone un contrat existant
   */
  static async cloneContract(
    contractId: string,
    newVariables: Partial<ContractVariables>
  ): Promise<GenerateContractResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<GenerateContractResponse>('contract-generator', {
        body: {
          contractId,
          newVariables,
          action: 'clone'
        }
      })

      if (error) {
        throw new Error(`Erreur clonage: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Clone contract error:', error)
      throw error
    }
  }

  /**
   * Sauvegarde le contrat généré dans la base de données
   */
  private static async saveGeneratedContract(
    generatedContract: GenerateContractResponse,
    params: ContractGenerationParams
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('contracts')
        .insert({
          id: generatedContract.contractId,
          template_id: params.templateId,
          content: generatedContract.content,
          status: generatedContract.status,
          client_name: params.variables.clientName,
          client_email: params.variables.clientEmail,
          amount: params.variables.amount,
          start_date: params.variables.startDate,
          end_date: params.variables.endDate,
          metadata: generatedContract.metadata,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving contract:', error)
      }
    } catch (error) {
      console.error('Save contract error:', error)
    }
  }
}