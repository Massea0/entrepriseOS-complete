// quote.types.ts
// Types pour la gestion des devis

import type { Company } from '@/features/companies/types'
import type { Profile } from '@/features/auth/types'

// Statut des devis
export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Type de remise
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

// Devise
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF'

// Article du devis
export interface QuoteItem {
  id: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  discountType: DiscountType
  taxRate: number
  total: number
}

// Adresse client
export interface ClientAddress {
  street: string
  city: string
  postalCode: string
  country: string
  additionalInfo?: string
}

// Suggestion IA
export interface AISuggestion {
  id: string
  type: 'pricing' | 'terms' | 'product' | 'discount' | 'timing'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  suggestedValue?: any
  reasoning?: string
}

// Insights IA
export interface AIInsights {
  conversionProbability: number
  optimalPrice?: number
  competitiveAnalysis?: {
    position: 'above' | 'below' | 'average'
    percentageDiff: number
  }
  clientProfile?: {
    buyingPower: 'high' | 'medium' | 'low'
    loyaltyScore: number
    preferredTerms: string[]
  }
  recommendations: string[]
}

// Devis principal
export interface Quote {
  id: string
  companyId: string
  company?: Company
  quoteNumber: string
  
  // Informations client
  clientId?: string
  client?: Company
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: ClientAddress
  
  // Statut et validité
  status: QuoteStatus
  validUntil: Date
  sentAt?: Date
  viewedAt?: Date
  respondedAt?: Date
  
  // Détails financiers
  currency: Currency
  subtotal: number
  taxRate: number
  taxAmount: number
  discountType?: DiscountType
  discountValue: number
  discountAmount: number
  totalAmount: number
  
  // Contenu
  items: QuoteItem[]
  termsConditions?: string
  notes?: string
  
  // Intégration IA
  aiGenerated: boolean
  aiSuggestions?: AISuggestion[]
  aiScore?: number
  aiInsights?: AIInsights
  
  // Suivi
  createdBy: string
  createdByUser?: Profile
  approvedBy?: string
  approvedByUser?: Profile
  convertedToInvoiceId?: string
  rejectionReason?: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// Input pour créer un devis
export interface CreateQuoteInput {
  clientId?: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: ClientAddress
  validUntil?: Date
  currency?: Currency
  items: Omit<QuoteItem, 'id'>[]
  taxRate?: number
  discountType?: DiscountType
  discountValue?: number
  termsConditions?: string
  notes?: string
  useAI?: boolean
}

// Input pour mettre à jour un devis
export interface UpdateQuoteInput extends Partial<CreateQuoteInput> {
  status?: QuoteStatus
  rejectionReason?: string
}

// Analytics des devis
export interface QuoteAnalytics {
  totalQuotes: number
  totalValue: number
  conversionRate: number
  averageValue: number
  averageClosingTime: number // en jours
  topProducts: Array<{
    productId: string
    name: string
    count: number
    value: number
  }>
  rejectionReasons: Array<{
    reason: string
    count: number
    percentage: number
  }>
  monthlyTrend: Array<{
    month: string
    count: number
    value: number
    conversionRate: number
  }>
}

// Filtres pour les devis
export interface QuoteFilters {
  status?: QuoteStatus[]
  clientId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  minAmount?: number
  maxAmount?: number
  search?: string
  aiGenerated?: boolean
}

// Paramètres de génération IA
export interface AIQuoteGenerationParams {
  clientId: string
  products?: Array<{
    productId: string
    quantity: number
  }>
  context?: string
  targetBudget?: number
  urgency?: 'low' | 'medium' | 'high'
  includeAlternatives?: boolean
  optimizeFor?: 'conversion' | 'profit' | 'relationship'
}

// Réponse de génération IA
export interface AIQuoteGenerationResponse {
  quote: Partial<CreateQuoteInput>
  confidence: number
  suggestions: AISuggestion[]
  alternatives?: Array<{
    quote: Partial<CreateQuoteInput>
    reasoning: string
  }>
}