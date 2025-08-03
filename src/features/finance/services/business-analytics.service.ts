import { supabase } from '@/lib/supabase'

export type AnalyticsMetric = 
  | 'revenue'
  | 'profit'
  | 'margin'
  | 'cash_flow'
  | 'customer_acquisition'
  | 'customer_lifetime_value'
  | 'churn_rate'
  | 'conversion_rate'

export type ExportFormat = 'json' | 'pdf' | 'excel' | 'csv'
export type DateRangePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

interface DateRange {
  start: string
  end: string
  period?: DateRangePeriod
}

interface FinancialMetric {
  name: string
  value: number
  previousValue?: number
  change?: number
  changePercentage?: number
  trend: 'up' | 'down' | 'stable'
}

interface AIInsight {
  type: 'opportunity' | 'warning' | 'trend' | 'anomaly'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionRequired: boolean
  suggestedActions?: string[]
}

interface BusinessAnalyticsResponse {
  dateRange: DateRange
  metrics: FinancialMetric[]
  insights: AIInsight[]
  kpis: {
    revenue: FinancialMetric
    profit: FinancialMetric
    margin: FinancialMetric
    cashFlow: FinancialMetric
  }
  charts: {
    revenue: Array<{ date: string; value: number }>
    expenses: Array<{ date: string; value: number }>
    profitMargin: Array<{ date: string; value: number }>
    cashFlow: Array<{ date: string; value: number }>
  }
  forecast?: {
    nextPeriod: {
      revenue: number
      profit: number
      confidence: number
    }
  }
  exportUrl?: string
  generatedAt: string
}

export class BusinessAnalyticsService {
  /**
   * Obtient les analytics financiers
   */
  static async getFinancialAnalytics(
    dateRange: DateRange,
    metrics: AnalyticsMetric[] = ['revenue', 'profit', 'margin', 'cash_flow'],
    format: ExportFormat = 'json'
  ): Promise<BusinessAnalyticsResponse> {
    try {
      const { data, error } = await supabase.functions.invoke<BusinessAnalyticsResponse>('business-analytics-engine', {
        body: {
          dateRange,
          metrics,
          format
        }
      })

      if (error) {
        console.error('Error getting financial analytics:', error)
        throw new Error(`Erreur analytics financiers: ${error.message}`)
      }

      if (!data) {
        throw new Error('Aucune donnée analytique retournée')
      }

      // Sauvegarder le rapport pour l'historique
      await this.saveAnalyticsReport(data)

      return data
    } catch (error) {
      console.error('BusinessAnalyticsService error:', error)
      throw error
    }
  }

  /**
   * Génère un rapport exécutif
   */
  static async generateExecutiveReport(
    period: DateRangePeriod = 'month',
    compareWithPrevious: boolean = true
  ): Promise<{
    summary: {
      performance: 'excellent' | 'good' | 'average' | 'poor'
      highlights: string[]
      concerns: string[]
    }
    metrics: {
      revenue: FinancialMetric
      profit: FinancialMetric
      growth: FinancialMetric
      efficiency: FinancialMetric
    }
    insights: AIInsight[]
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low'
      action: string
      expectedImpact: string
      timeframe: string
    }>
    exportUrl: string
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('business-analytics-engine', {
        body: {
          period,
          compareWithPrevious,
          action: 'executive_report'
        }
      })

      if (error) {
        throw new Error(`Erreur rapport exécutif: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Executive report error:', error)
      throw error
    }
  }

  /**
   * Analyse prédictive avec IA
   */
  static async getPredictiveAnalytics(
    metrics: AnalyticsMetric[],
    forecastPeriods: number = 3
  ): Promise<{
    predictions: Array<{
      metric: AnalyticsMetric
      currentValue: number
      predictions: Array<{
        period: string
        value: number
        confidence: number
        range: { min: number; max: number }
      }>
    }>
    modelAccuracy: number
    factors: Array<{
      factor: string
      impact: number
      correlation: number
    }>
    scenarios: {
      optimistic: Record<string, number>
      realistic: Record<string, number>
      pessimistic: Record<string, number>
    }
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('business-analytics-engine', {
        body: {
          metrics,
          forecastPeriods,
          action: 'predictive_analytics'
        }
      })

      if (error) {
        throw new Error(`Erreur analyse prédictive: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Predictive analytics error:', error)
      throw error
    }
  }

  /**
   * Détection d'anomalies
   */
  static async detectAnomalies(
    dateRange: DateRange,
    sensitivity: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<{
    anomalies: Array<{
      date: string
      metric: string
      expectedValue: number
      actualValue: number
      deviation: number
      severity: 'critical' | 'high' | 'medium' | 'low'
      possibleCauses: string[]
    }>
    totalAnomalies: number
    criticalCount: number
    recommendations: string[]
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('business-analytics-engine', {
        body: {
          dateRange,
          sensitivity,
          action: 'detect_anomalies'
        }
      })

      if (error) {
        throw new Error(`Erreur détection anomalies: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Detect anomalies error:', error)
      throw error
    }
  }

  /**
   * Tableau de bord temps réel
   */
  static async getRealTimeDashboard(): Promise<{
    liveMetrics: {
      revenue: { today: number; trend: string }
      orders: { count: number; value: number }
      customers: { new: number; active: number }
      conversion: { rate: number; change: number }
    }
    alerts: Array<{
      type: 'info' | 'warning' | 'critical'
      message: string
      metric?: string
      timestamp: string
    }>
    performance: {
      apiLatency: number
      dataFreshness: string
      lastUpdate: string
    }
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('business-analytics-engine', {
        body: {
          action: 'realtime_dashboard'
        }
      })

      if (error) {
        throw new Error(`Erreur dashboard temps réel: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Realtime dashboard error:', error)
      throw error
    }
  }

  /**
   * Export personnalisé
   */
  static async exportCustomReport(
    config: {
      title: string
      dateRange: DateRange
      metrics: AnalyticsMetric[]
      groupBy?: 'day' | 'week' | 'month'
      format: ExportFormat
      includeCharts?: boolean
      includeInsights?: boolean
    }
  ): Promise<{
    exportId: string
    downloadUrl: string
    expiresAt: string
    fileSize: number
    format: ExportFormat
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('business-analytics-engine', {
        body: {
          config,
          action: 'export_custom'
        }
      })

      if (error) {
        throw new Error(`Erreur export personnalisé: ${error.message}`)
      }

      return data!
    } catch (error) {
      console.error('Export custom error:', error)
      throw error
    }
  }

  /**
   * Sauvegarde le rapport analytique
   */
  private static async saveAnalyticsReport(report: BusinessAnalyticsResponse): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_reports')
        .insert({
          date_range: report.dateRange,
          metrics: report.metrics,
          insights: report.insights,
          generated_at: report.generatedAt,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving analytics report:', error)
      }
    } catch (error) {
      console.error('Save report error:', error)
    }
  }
}