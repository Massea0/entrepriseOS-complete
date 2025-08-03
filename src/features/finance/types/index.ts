// Export all finance types
export * from './analytics.types'
export * from './base.types'
export * from './contract.types'
export * from './invoice.types'
export * from './quote.types'
export * from './payment.types'
export * from './pricing.types'

// Re-export common types
export type { Money } from './base.types'
export type { Contact } from './base.types'
export type { Invoice, InvoiceStatus } from './invoice.types'
export type { Quote, QuoteStatus } from './quote.types'
export type { Contract } from './contract.types'
export type { PricingRecommendation } from './pricing.types'

// Types communs finance
export interface FinancialPrediction {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe: 'week' | 'month' | 'quarter' | 'year'
  factors: Array<{
    name: string
    impact: number
    description: string
  }>
}

export interface FinancialInsight {
  id: string
  type: 'revenue' | 'expense' | 'cash_flow' | 'profitability' | 'risk'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  impact: {
    financial: number
    timeframe: string
  }
  recommendations: string[]
  dataPoints: Array<{
    label: string
    value: number
    date: Date
  }>
}

export interface FinanceDashboardData {
  // KPIs actuels
  revenue: {
    current: number
    previousPeriod: number
    change: number
    trend: Array<{ date: Date; value: number }>
  }
  expenses: {
    current: number
    previousPeriod: number
    change: number
    breakdown: Array<{ category: string; amount: number }>
  }
  profit: {
    current: number
    margin: number
    previousPeriod: number
    change: number
  }
  cashFlow: {
    current: number
    projected: number
    runway: number // en mois
    trend: Array<{ date: Date; value: number }>
  }
  
  // Métriques avancées
  receivables: {
    total: number
    overdue: number
    averageCollectionPeriod: number
  }
  payables: {
    total: number
    overdue: number
    averagePaymentPeriod: number
  }
  
  // Prédictions IA
  predictions: FinancialPrediction[]
  insights: FinancialInsight[]
  
  // Score de santé financière
  healthScore: {
    overall: number
    liquidity: number
    profitability: number
    efficiency: number
    growth: number
  }
}