// contract.types.ts
// Types pour la gestion des contrats

import type { Company } from '@/features/companies/types'
import type { Profile } from '@/features/auth/types'

// Statut des contrats
export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  PENDING_SIGNATURE = 'pending_signature',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed'
}

// Type de contrat
export enum ContractType {
  EMPLOYMENT = 'employment',
  VENDOR = 'vendor',
  CLIENT = 'client',
  NDA = 'nda',
  PARTNERSHIP = 'partnership',
  SERVICE = 'service',
  LEASE = 'lease',
  OTHER = 'other'
}

// Planning de paiement
export enum PaymentSchedule {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  MILESTONE = 'milestone',
  CUSTOM = 'custom'
}

// Statut de signature
export enum SignatureStatus {
  PENDING = 'pending',
  SIGNED = 'signed',
  REJECTED = 'rejected'
}

// Section de contrat
export interface ContractSection {
  id: string
  title: string
  content: string
  order: number
  required: boolean
  editable: boolean
}

// Clause de contrat
export interface ContractClause {
  id: string
  title: string
  content: string
  type: 'standard' | 'special' | 'custom'
  category: string
  isMandatory: boolean
}

// Termes spéciaux
export interface SpecialTerms {
  penalties?: string
  warranties?: string
  liabilities?: string
  confidentiality?: string
  intellectualProperty?: string
  disputeResolution?: string
}

// Pièce jointe
export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: Date
  uploadedBy: string
}

// Signature
export interface Signature {
  id: string
  signerId: string
  signerName: string
  signerEmail: string
  signerRole: string
  signerCompany?: string
  signedAt?: Date
  ipAddress?: string
  signature?: string // Base64 encoded signature image
  status: SignatureStatus
  remindersSent: number
  lastReminderAt?: Date
}

// Tiers
export interface ThirdParty {
  id: string
  name: string
  role: string
  email: string
  company?: string
}

// Termes de renouvellement
export interface RenewalTerms {
  autoRenew: boolean
  renewalPeriod: number // en mois
  priceIncrease?: number // en pourcentage
  conditions?: string[]
}

// Termes de paiement
export interface PaymentTerms {
  schedule: PaymentSchedule
  customSchedule?: Array<{
    date: Date
    amount: number
    description: string
  }>
  dueDate?: number // jours après facturation
  earlyPaymentDiscount?: number
  lateFeePercentage?: number
}

// Facteurs de risque
export interface RiskFactor {
  id: string
  category: 'financial' | 'legal' | 'operational' | 'compliance' | 'reputational'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain'
  mitigation?: string
}

// Recommandation IA
export interface AIRecommendation {
  id: string
  type: 'clause' | 'term' | 'risk' | 'negotiation' | 'compliance'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  suggestedAction?: string
  impact?: string
}

// Vérification de conformité
export interface ComplianceCheck {
  gdpr: boolean
  industry: boolean
  regulatory: boolean
  internal: boolean
  issues: Array<{
    type: string
    description: string
    severity: 'low' | 'medium' | 'high'
    recommendation: string
  }>
}

// Extraction de termes clés
export interface KeyTermsExtraction {
  parties: string[]
  obligations: string[]
  deadlines: Array<{
    description: string
    date: Date
  }>
  financialTerms: Array<{
    type: string
    amount: number
    currency: string
  }>
  keyDates: Array<{
    type: string
    date: Date
    description: string
  }>
}

// Workflow d'approbation
export interface ApprovalWorkflow {
  steps: Array<{
    id: string
    order: number
    approverRole: string
    approverId?: string
    status: 'pending' | 'approved' | 'rejected'
    approvedAt?: Date
    comments?: string
  }>
  currentStep: number
  startedAt: Date
  completedAt?: Date
}

// Historique d'approbation
export interface ApprovalHistoryItem {
  id: string
  action: 'approved' | 'rejected' | 'requested_changes'
  userId: string
  userName: string
  timestamp: Date
  comments?: string
  changes?: string[]
}

// Contrat principal
export interface Contract {
  id: string
  companyId: string
  company?: Company
  contractNumber: string
  
  // Informations de base
  title: string
  description?: string
  type: ContractType
  category?: string
  tags?: string[]
  
  // Statut
  status: ContractStatus
  
  // Parties
  clientId?: string
  client?: Company
  vendorId?: string
  vendor?: Company
  thirdParties?: ThirdParty[]
  
  // Dates et durée
  effectiveDate: Date
  expirationDate?: Date
  durationMonths?: number
  autoRenewal: boolean
  renewalNoticeDays: number
  renewalTerms?: RenewalTerms
  terminationNoticeDays: number
  
  // Termes financiers
  contractValue?: number
  paymentSchedule?: PaymentSchedule
  paymentTerms?: PaymentTerms
  currency: string
  lateFeePercentage?: number
  
  // Contenu du contrat
  sections: ContractSection[]
  clauses?: ContractClause[]
  specialTerms?: SpecialTerms
  exclusions?: string[]
  
  // Pièces jointes et documents
  attachments?: Attachment[]
  relatedDocuments?: string[]
  
  // Signatures
  signatures?: Signature[]
  signatureDeadline?: Date
  fullySignedDate?: Date
  
  // Analyse IA
  riskScore?: number
  riskFactors?: RiskFactor[]
  aiRecommendations?: AIRecommendation[]
  complianceCheck?: ComplianceCheck
  keyTermsExtraction?: KeyTermsExtraction
  
  // Versioning
  version: number
  parentContractId?: string
  isAmendment: boolean
  changeSummary?: string
  
  // Workflow
  approvalWorkflow?: ApprovalWorkflow
  currentApprover?: string
  currentApproverUser?: Profile
  approvalHistory?: ApprovalHistoryItem[]
  
  // Métadonnées
  createdBy: string
  createdByUser?: Profile
  lastModifiedBy?: string
  lastModifiedByUser?: Profile
  approvedBy?: string
  approvedByUser?: Profile
  terminatedBy?: string
  terminatedByUser?: Profile
  terminationReason?: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  terminatedAt?: Date
}

// Input pour créer un contrat
export interface CreateContractInput {
  title: string
  description?: string
  type: ContractType
  category?: string
  tags?: string[]
  clientId?: string
  vendorId?: string
  effectiveDate: Date
  expirationDate?: Date
  contractValue?: number
  currency?: string
  sections?: Omit<ContractSection, 'id'>[]
  useTemplate?: string
  useAI?: boolean
}

// Input pour mettre à jour un contrat
export interface UpdateContractInput extends Partial<CreateContractInput> {
  status?: ContractStatus
  sections?: ContractSection[]
  clauses?: ContractClause[]
  specialTerms?: SpecialTerms
  attachments?: Attachment[]
  signatures?: Signature[]
}

// Analytics des contrats
export interface ContractAnalytics {
  totalContracts: number
  activeContracts: number
  totalValue: number
  expiringContracts: number
  averageContractValue: number
  averageRiskScore: number
  contractsByType: Array<{
    type: ContractType
    count: number
    value: number
  }>
  contractsByStatus: Array<{
    status: ContractStatus
    count: number
  }>
  upcomingRenewals: Array<{
    contract: Contract
    daysUntilRenewal: number
  }>
  highRiskContracts: Contract[]
}

// Filtres pour les contrats
export interface ContractFilters {
  status?: ContractStatus[]
  type?: ContractType[]
  clientId?: string
  vendorId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  expiringWithinDays?: number
  minValue?: number
  maxValue?: number
  search?: string
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
}

// Paramètres d'analyse IA
export interface AIContractAnalysisParams {
  contractId?: string
  contractText?: string
  analyzeRisk: boolean
  checkCompliance: boolean
  extractKeyTerms: boolean
  suggestImprovements: boolean
  compareWithTemplates: boolean
}

// Réponse d'analyse IA
export interface AIContractAnalysisResponse {
  riskScore: number
  riskFactors: RiskFactor[]
  recommendations: AIRecommendation[]
  complianceCheck: ComplianceCheck
  keyTerms: KeyTermsExtraction
  suggestedClauses?: ContractClause[]
  similarContracts?: Array<{
    contractId: string
    similarity: number
  }>
}

// Template de contrat
export interface ContractTemplate {
  id: string
  companyId?: string // null pour les templates publics
  name: string
  type: ContractType
  category?: string
  description?: string
  sections: ContractSection[]
  variables: Array<{
    name: string
    type: 'text' | 'number' | 'date' | 'select'
    required: boolean
    defaultValue?: any
    options?: string[]
  }>
  clausesLibrary?: ContractClause[]
  isActive: boolean
  requiresLegalReview: boolean
  approvalRequired: boolean
  usageCount: number
  lastUsedAt?: Date
  averageCompletionTime?: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}