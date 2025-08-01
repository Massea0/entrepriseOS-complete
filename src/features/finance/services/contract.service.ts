// contract.service.ts
// Service pour la gestion des contrats avec analyse de risque IA

import { supabase } from '@/lib/supabase'
import type {
  Contract,
  CreateContractInput,
  UpdateContractInput,
  ContractFilters,
  ContractAnalytics,
  AIContractAnalysisParams,
  AIContractAnalysisResponse,
  ContractStatus,
  ContractTemplate,
  Signature,
  SignatureStatus,
  RiskFactor
} from '../types'
import { getCurrentUser, getCompanyId } from '@/lib/supabase'

export class ContractService {
  // ===============================
  // CRUD Operations
  // ===============================

  /**
   * Récupérer tous les contrats avec filtres
   */
  static async getContracts(filters?: ContractFilters): Promise<Contract[]> {
    try {
      const companyId = await getCompanyId()
      if (!companyId) throw new Error('Company ID not found')

      let query = supabase
        .from('contracts')
        .select(`
          *,
          client:client_id(id, name, email, phone),
          vendor:vendor_id(id, name, email, phone),
          created_by_user:created_by(id, first_name, last_name, email),
          approved_by_user:approved_by(id, first_name, last_name, email),
          current_approver_user:current_approver(id, first_name, last_name, email)
        `)
        .or(`company_id.eq.${companyId},client_id.eq.${companyId},vendor_id.eq.${companyId}`)
        .order('created_at', { ascending: false })

      // Appliquer les filtres
      if (filters) {
        if (filters.status?.length) {
          query = query.in('status', filters.status)
        }
        if (filters.type?.length) {
          query = query.in('type', filters.type)
        }
        if (filters.clientId) {
          query = query.eq('client_id', filters.clientId)
        }
        if (filters.vendorId) {
          query = query.eq('vendor_id', filters.vendorId)
        }
        if (filters.dateRange) {
          query = query
            .gte('effective_date', filters.dateRange.start.toISOString())
            .lte('effective_date', filters.dateRange.end.toISOString())
        }
        if (filters.expiringWithinDays) {
          const expiryDate = new Date()
          expiryDate.setDate(expiryDate.getDate() + filters.expiringWithinDays)
          query = query
            .gte('expiration_date', new Date().toISOString())
            .lte('expiration_date', expiryDate.toISOString())
        }
        if (filters.minValue !== undefined) {
          query = query.gte('contract_value', filters.minValue)
        }
        if (filters.maxValue !== undefined) {
          query = query.lte('contract_value', filters.maxValue)
        }
        if (filters.search) {
          query = query.or(`contract_number.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
        }
        if (filters.riskLevel) {
          const riskThresholds = {
            low: [0, 25],
            medium: [26, 50],
            high: [51, 75],
            critical: [76, 100]
          }
          const [min, max] = riskThresholds[filters.riskLevel]
          query = query.gte('risk_score', min).lte('risk_score', max)
        }
      }

      const { data, error } = await query

      if (error) throw error

      // Transformer les données
      return data.map(this.transformContractFromDB)
    } catch (error) {
      console.error('Error fetching contracts:', error)
      throw error
    }
  }

  /**
   * Récupérer un contrat par ID
   */
  static async getContract(id: string): Promise<Contract> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          client:client_id(id, name, email, phone),
          vendor:vendor_id(id, name, email, phone),
          created_by_user:created_by(id, first_name, last_name, email),
          approved_by_user:approved_by(id, first_name, last_name, email),
          current_approver_user:current_approver(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Contract not found')

      return this.transformContractFromDB(data)
    } catch (error) {
      console.error('Error fetching contract:', error)
      throw error
    }
  }

  /**
   * Créer un nouveau contrat
   */
  static async createContract(input: CreateContractInput): Promise<Contract> {
    try {
      const user = await getCurrentUser()
      const companyId = await getCompanyId()
      
      if (!user || !companyId) {
        throw new Error('User or company not found')
      }

      let sections = input.sections || []
      
      // Si utilisation d'un template
      if (input.useTemplate) {
        const template = await this.getTemplate(input.useTemplate)
        sections = template.sections
      }

      const { data, error } = await supabase
        .from('contracts')
        .insert({
          company_id: companyId,
          title: input.title,
          description: input.description,
          type: input.type,
          category: input.category,
          tags: input.tags,
          client_id: input.clientId,
          vendor_id: input.vendorId,
          effective_date: input.effectiveDate.toISOString(),
          expiration_date: input.expirationDate?.toISOString(),
          contract_value: input.contractValue,
          currency: input.currency || 'EUR',
          sections,
          created_by: user.id,
          status: 'draft'
        })
        .select(`
          *,
          client:client_id(id, name, email, phone),
          vendor:vendor_id(id, name, email, phone),
          created_by_user:created_by(id, first_name, last_name, email)
        `)
        .single()

      if (error) throw error

      // Si demandé, analyser avec IA
      if (input.useAI) {
        await this.analyzeContractWithAI(data.id)
      }

      return this.transformContractFromDB(data)
    } catch (error) {
      console.error('Error creating contract:', error)
      throw error
    }
  }

  /**
   * Mettre à jour un contrat
   */
  static async updateContract(id: string, input: UpdateContractInput): Promise<Contract> {
    try {
      const user = await getCurrentUser()
      const updateData: any = {
        last_modified_by: user?.id
      }

      // Mapper les champs d'input
      if (input.title !== undefined) updateData.title = input.title
      if (input.description !== undefined) updateData.description = input.description
      if (input.type !== undefined) updateData.type = input.type
      if (input.category !== undefined) updateData.category = input.category
      if (input.tags !== undefined) updateData.tags = input.tags
      if (input.clientId !== undefined) updateData.client_id = input.clientId
      if (input.vendorId !== undefined) updateData.vendor_id = input.vendorId
      if (input.effectiveDate !== undefined) updateData.effective_date = input.effectiveDate.toISOString()
      if (input.expirationDate !== undefined) updateData.expiration_date = input.expirationDate.toISOString()
      if (input.contractValue !== undefined) updateData.contract_value = input.contractValue
      if (input.currency !== undefined) updateData.currency = input.currency
      if (input.sections !== undefined) updateData.sections = input.sections
      if (input.clauses !== undefined) updateData.clauses = input.clauses
      if (input.specialTerms !== undefined) updateData.special_terms = input.specialTerms
      if (input.attachments !== undefined) updateData.attachments = input.attachments
      if (input.signatures !== undefined) updateData.signatures = input.signatures
      if (input.status !== undefined) updateData.status = input.status

      const { data, error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          client:client_id(id, name, email, phone),
          vendor:vendor_id(id, name, email, phone),
          created_by_user:created_by(id, first_name, last_name, email),
          approved_by_user:approved_by(id, first_name, last_name, email),
          current_approver_user:current_approver(id, first_name, last_name, email)
        `)
        .single()

      if (error) throw error

      return this.transformContractFromDB(data)
    } catch (error) {
      console.error('Error updating contract:', error)
      throw error
    }
  }

  /**
   * Supprimer un contrat
   */
  static async deleteContract(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id)
        .eq('status', 'draft') // Seulement les brouillons

      if (error) throw error
    } catch (error) {
      console.error('Error deleting contract:', error)
      throw error
    }
  }

  // ===============================
  // AI Integration
  // ===============================

  /**
   * Analyser un contrat avec l'IA
   */
  static async analyzeContractWithAI(contractId: string): Promise<AIContractAnalysisResponse> {
    try {
      const contract = await this.getContract(contractId)

      // Appeler l'Edge Function
      const { data: analysis, error } = await supabase.functions.invoke('contract-analyzer', {
        body: {
          contract,
          analyzeRisk: true,
          checkCompliance: true,
          extractKeyTerms: true,
          suggestImprovements: true,
          compareWithTemplates: true
        } as AIContractAnalysisParams
      })

      if (error) throw error

      const response = analysis as AIContractAnalysisResponse

      // Sauvegarder l'analyse
      await supabase
        .from('contracts')
        .update({
          risk_score: response.riskScore,
          risk_factors: response.riskFactors,
          ai_recommendations: response.recommendations,
          compliance_check: response.complianceCheck,
          key_terms_extraction: response.keyTerms
        })
        .eq('id', contractId)

      return response
    } catch (error) {
      console.error('Error analyzing contract with AI:', error)
      throw error
    }
  }

  /**
   * Générer un contrat à partir d'un template avec IA
   */
  static async generateContractFromTemplate(
    templateId: string,
    clientId: string,
    customFields: Record<string, any>
  ): Promise<Contract> {
    try {
      // Appeler l'Edge Function
      const { data: generatedContent, error } = await supabase.functions.invoke('contract-generator', {
        body: {
          templateId,
          clientId,
          customFields,
          legalCompliance: true,
          optimize: true
        }
      })

      if (error) throw error

      // Créer le contrat
      return await this.createContract({
        ...generatedContent,
        useTemplate: templateId,
        useAI: false // Déjà généré avec IA
      })
    } catch (error) {
      console.error('Error generating contract from template:', error)
      throw error
    }
  }

  // ===============================
  // Signature Workflow
  // ===============================

  /**
   * Initier le workflow de signature électronique
   */
  static async initiateESignature(
    contractId: string,
    signers: Array<{
      email: string
      name: string
      role: string
      company?: string
    }>
  ): Promise<void> {
    try {
      // Créer les enregistrements de signature
      const signatures: Signature[] = signers.map(signer => ({
        id: crypto.randomUUID(),
        signerId: crypto.randomUUID(), // Sera mis à jour si le signataire a un compte
        signerName: signer.name,
        signerEmail: signer.email,
        signerRole: signer.role,
        signerCompany: signer.company,
        status: SignatureStatus.PENDING,
        remindersSent: 0
      }))

      // Mettre à jour le contrat
      await supabase
        .from('contracts')
        .update({
          signatures,
          signature_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending_signature'
        })
        .eq('id', contractId)

      // Appeler l'Edge Function pour le workflow
      const { error } = await supabase.functions.invoke('esignature-workflow', {
        body: {
          contractId,
          signers,
          reminders: true,
          expiryDays: 30
        }
      })

      if (error) throw error

      // Envoyer les emails aux signataires
      for (const signer of signers) {
        await this.sendSignatureRequest(contractId, signer.email)
      }
    } catch (error) {
      console.error('Error initiating e-signature:', error)
      throw error
    }
  }

  /**
   * Enregistrer une signature
   */
  static async recordSignature(
    contractId: string,
    signerEmail: string,
    signature: string
  ): Promise<void> {
    try {
      const contract = await this.getContract(contractId)
      
      // Mettre à jour la signature
      const signatures = contract.signatures?.map(sig => {
        if (sig.signerEmail === signerEmail) {
          return {
            ...sig,
            signedAt: new Date(),
            signature,
            status: SignatureStatus.SIGNED,
            ipAddress: '0.0.0.0' // TODO: Récupérer l'IP réelle
          }
        }
        return sig
      })

      // Vérifier si toutes les signatures sont complètes
      const allSigned = signatures?.every(sig => sig.status === SignatureStatus.SIGNED)

      await supabase
        .from('contracts')
        .update({
          signatures,
          status: allSigned ? 'active' : 'pending_signature',
          fully_signed_date: allSigned ? new Date().toISOString() : null
        })
        .eq('id', contractId)
    } catch (error) {
      console.error('Error recording signature:', error)
      throw error
    }
  }

  // ===============================
  // Risk Management
  // ===============================

  /**
   * Calculer le score de risque d'un contrat
   */
  static async calculateRiskScore(contractId: string): Promise<number> {
    try {
      const contract = await this.getContract(contractId)
      
      const riskFactors: RiskFactor[] = []
      let totalScore = 0
      let weightSum = 0

      // Facteurs de risque financier
      if (!contract.contractValue || contract.contractValue > 1000000) {
        riskFactors.push({
          id: crypto.randomUUID(),
          category: 'financial',
          description: 'Valeur contractuelle élevée',
          severity: 'high',
          likelihood: 'likely'
        })
        totalScore += 75
        weightSum += 1
      }

      // Facteurs de risque temporel
      if (contract.expirationDate) {
        const daysUntilExpiry = Math.floor(
          (contract.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        if (daysUntilExpiry < 30) {
          riskFactors.push({
            id: crypto.randomUUID(),
            category: 'operational',
            description: 'Expiration imminente',
            severity: 'medium',
            likelihood: 'certain'
          })
          totalScore += 50
          weightSum += 1
        }
      }

      // Facteurs de risque de conformité
      if (!contract.complianceCheck?.gdpr) {
        riskFactors.push({
          id: crypto.randomUUID(),
          category: 'compliance',
          description: 'Non-conformité RGPD potentielle',
          severity: 'high',
          likelihood: 'possible'
        })
        totalScore += 60
        weightSum += 1
      }

      const riskScore = weightSum > 0 ? Math.round(totalScore / weightSum) : 0

      // Sauvegarder
      await supabase
        .from('contracts')
        .update({ 
          risk_score: riskScore,
          risk_factors: riskFactors 
        })
        .eq('id', contractId)

      return riskScore
    } catch (error) {
      console.error('Error calculating risk score:', error)
      throw error
    }
  }

  // ===============================
  // Contract Templates
  // ===============================

  /**
   * Récupérer les templates de contrat
   */
  static async getTemplates(type?: string): Promise<ContractTemplate[]> {
    try {
      const companyId = await getCompanyId()
      
      let query = supabase
        .from('contract_templates')
        .select('*')
        .eq('is_active', true)
        .or(`company_id.eq.${companyId},company_id.is.null`)
        .order('usage_count', { ascending: false })

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching templates:', error)
      throw error
    }
  }

  /**
   * Récupérer un template par ID
   */
  static async getTemplate(id: string): Promise<ContractTemplate> {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Template not found')

      return data
    } catch (error) {
      console.error('Error fetching template:', error)
      throw error
    }
  }

  // ===============================
  // Analytics
  // ===============================

  /**
   * Obtenir les analytics des contrats
   */
  static async getContractAnalytics(): Promise<ContractAnalytics> {
    try {
      const companyId = await getCompanyId()
      if (!companyId) throw new Error('Company ID not found')

      // Récupérer tous les contrats
      const contracts = await this.getContracts()
      
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const activeContracts = contracts.filter(c => c.status === ContractStatus.ACTIVE)
      const expiringContracts = contracts.filter(c => 
        c.status === ContractStatus.ACTIVE &&
        c.expirationDate &&
        c.expirationDate <= thirtyDaysFromNow &&
        c.expirationDate >= now
      )

      const totalValue = activeContracts.reduce((sum, c) => sum + (c.contractValue || 0), 0)
      const averageValue = activeContracts.length > 0 ? totalValue / activeContracts.length : 0

      const riskScores = contracts
        .filter(c => c.riskScore !== undefined)
        .map(c => c.riskScore!)
      const averageRiskScore = riskScores.length > 0
        ? riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
        : 0

      // Grouper par type
      const contractsByType = Object.values(
        contracts.reduce((acc, contract) => {
          if (!acc[contract.type]) {
            acc[contract.type] = {
              type: contract.type,
              count: 0,
              value: 0
            }
          }
          acc[contract.type].count++
          acc[contract.type].value += contract.contractValue || 0
          return acc
        }, {} as Record<string, any>)
      )

      // Grouper par statut
      const contractsByStatus = Object.values(
        contracts.reduce((acc, contract) => {
          if (!acc[contract.status]) {
            acc[contract.status] = {
              status: contract.status,
              count: 0
            }
          }
          acc[contract.status].count++
          return acc
        }, {} as Record<string, any>)
      )

      // Renouvellements à venir
      const upcomingRenewals = contracts
        .filter(c => 
          c.status === ContractStatus.ACTIVE &&
          c.expirationDate &&
          c.autoRenewal
        )
        .map(contract => ({
          contract,
          daysUntilRenewal: Math.floor(
            (contract.expirationDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
        }))
        .filter(item => item.daysUntilRenewal <= 90)
        .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)

      // Contrats à haut risque
      const highRiskContracts = contracts
        .filter(c => c.riskScore && c.riskScore > 50)
        .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))

      return {
        totalContracts: contracts.length,
        activeContracts: activeContracts.length,
        totalValue,
        expiringContracts: expiringContracts.length,
        averageContractValue: averageValue,
        averageRiskScore,
        contractsByType,
        contractsByStatus,
        upcomingRenewals,
        highRiskContracts
      }
    } catch (error) {
      console.error('Error fetching contract analytics:', error)
      throw error
    }
  }

  // ===============================
  // Helper Methods
  // ===============================

  /**
   * Transformer les données de la DB vers le type Contract
   */
  private static transformContractFromDB(data: any): Contract {
    return {
      id: data.id,
      companyId: data.company_id,
      contractNumber: data.contract_number,
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      tags: data.tags,
      status: data.status,
      clientId: data.client_id,
      client: data.client,
      vendorId: data.vendor_id,
      vendor: data.vendor,
      thirdParties: data.third_parties,
      effectiveDate: new Date(data.effective_date),
      expirationDate: data.expiration_date ? new Date(data.expiration_date) : undefined,
      durationMonths: data.duration_months,
      autoRenewal: data.auto_renewal,
      renewalNoticeDays: data.renewal_notice_days,
      renewalTerms: data.renewal_terms,
      terminationNoticeDays: data.termination_notice_days,
      contractValue: data.contract_value,
      paymentSchedule: data.payment_schedule,
      paymentTerms: data.payment_terms,
      currency: data.currency,
      lateFeePercentage: data.late_fee_percentage,
      sections: data.sections,
      clauses: data.clauses,
      specialTerms: data.special_terms,
      exclusions: data.exclusions,
      attachments: data.attachments,
      relatedDocuments: data.related_documents,
      signatures: data.signatures,
      signatureDeadline: data.signature_deadline ? new Date(data.signature_deadline) : undefined,
      fullySignedDate: data.fully_signed_date ? new Date(data.fully_signed_date) : undefined,
      riskScore: data.risk_score,
      riskFactors: data.risk_factors,
      aiRecommendations: data.ai_recommendations,
      complianceCheck: data.compliance_check,
      keyTermsExtraction: data.key_terms_extraction,
      version: data.version,
      parentContractId: data.parent_contract_id,
      isAmendment: data.is_amendment,
      changeSummary: data.change_summary,
      approvalWorkflow: data.approval_workflow,
      currentApprover: data.current_approver,
      currentApproverUser: data.current_approver_user,
      approvalHistory: data.approval_history,
      createdBy: data.created_by,
      createdByUser: data.created_by_user,
      lastModifiedBy: data.last_modified_by,
      approvedBy: data.approved_by,
      approvedByUser: data.approved_by_user,
      terminatedBy: data.terminated_by,
      terminationReason: data.termination_reason,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      terminatedAt: data.terminated_at ? new Date(data.terminated_at) : undefined
    }
  }

  /**
   * Envoyer une demande de signature
   */
  private static async sendSignatureRequest(contractId: string, signerEmail: string): Promise<void> {
    try {
      const contract = await this.getContract(contractId)
      
      // Générer l'email avec l'IA
      const { data: emailContent, error } = await supabase.functions.invoke('email-generator', {
        body: {
          template: 'signature_request',
          context: {
            contract,
            signerEmail,
            signatureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/contracts/${contractId}/sign`
          },
          tone: 'formal',
          language: 'fr'
        }
      })

      if (error) throw error

      // Envoyer l'email
      await supabase.functions.invoke('send-email', {
        body: {
          to: signerEmail,
          subject: emailContent.subject,
          html: emailContent.html
        }
      })
    } catch (error) {
      console.error('Error sending signature request:', error)
      throw error
    }
  }
}