// index.ts
// Export de tous les types du module Finance

// Types des devis
export * from './quote.types'

// Types des contrats
export * from './contract.types'

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