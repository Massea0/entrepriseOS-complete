// Types pour la gestion des contrats

export interface ContractTemplate {
  id: string
  name: string
  description: string
  type: 'service' | 'product' | 'subscription' | 'custom'
  content: string
  sections: ContractSection[]
  variables: Record<string, string>
  requiredVariables: string[]
  legalCompliance: 'basic' | 'standard' | 'premium'
  aiGenerated: boolean
  popularity: number
  createdAt: string
  updatedAt: string
}

export interface ContractSection {
  id: string
  title: string
  content: string
  order: number
  required: boolean
  editable: boolean
}

export interface Contract {
  id: string
  templateId?: string
  clientId: string
  clientName: string
  clientEmail: string
  clientAddress?: string
  clientPhone?: string
  title: string
  content: string
  status: 'draft' | 'sent' | 'signed' | 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate?: string
  amount: number
  currency: string
  paymentTerms?: string
  deliverables?: string[]
  specialClauses?: string[]
  signedDate?: string
  signedBy?: string
  riskScore?: number
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ContractRisk {
  contractId: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: RiskFactor[]
  recommendations: string[]
  financialExposure?: number
  legalCompliance: {
    compliant: boolean
    issues: string[]
  }
  lastAnalyzedAt: string
}

export interface RiskFactor {
  category: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  mitigation: string
}

export interface ContractVariable {
  key: string
  value: string
  type: 'text' | 'number' | 'date' | 'currency' | 'list'
  required: boolean
  defaultValue?: string
}

export interface ContractGenerationRequest {
  templateId?: string
  clientId: string
  variables: Record<string, any>
  aiInstructions?: string
}

export interface ContractAnalysisRequest {
  contractId: string
  analysisType: 'risk' | 'compliance' | 'financial' | 'all'
  includeRecommendations?: boolean
}

export interface ContractSignature {
  contractId: string
  signedBy: string
  signedAt: string
  ipAddress?: string
  signatureData: string
}