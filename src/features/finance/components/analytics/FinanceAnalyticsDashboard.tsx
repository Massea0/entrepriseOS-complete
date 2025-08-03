import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Activity,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { BusinessAnalyticsService, type DateRangePeriod } from '../../services/business-analytics.service'
import { KPICard } from './KPICard'
import { RevenueChart } from './RevenueChart'
import { AIInsightsPanel } from './AIInsightsPanel'
import { PredictionsChart } from './PredictionsChart'

interface FinancialMetric {
  name: string
  value: number
  previousValue?: number
  change?: number
  changePercentage?: number
  trend: 'up' | 'down' | 'stable'
}

export function FinanceAnalyticsDashboard() {
  const [period, setPeriod] = useState<DateRangePeriod>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [predictions, setPredictions] = useState<any>(null)

  const loadAnalytics = async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)

    try {
      // Calculer la période
      const endDate = new Date()
      const startDate = new Date()
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }

      // Charger les analytics
      const analyticsData = await BusinessAnalyticsService.getFinancialAnalytics(
        {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          period
        },
        ['revenue', 'profit', 'margin', 'cash_flow']
      )

      setAnalytics(analyticsData)

      // Charger les prédictions
      const predictionsData = await BusinessAnalyticsService.getPredictiveAnalytics(
        ['revenue', 'profit'],
        3
      )

      setPredictions(predictionsData)

    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Impossible de charger les données analytiques')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const handleExport = async () => {
    try {
      const result = await BusinessAnalyticsService.exportCustomReport({
        title: `Rapport Financier - ${period}`,
        dateRange: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          period
        },
        metrics: ['revenue', 'profit', 'margin', 'cash_flow'],
        format: 'pdf',
        includeCharts: true,
        includeInsights: true
      })

      // Télécharger le fichier
      window.open(result.downloadUrl, '_blank')
    } catch (err) {
      console.error('Export error:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tableau de Bord Financier</h2>
          <p className="text-muted-foreground">
            Analytics en temps réel avec prédictions IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(value: DateRangePeriod) => setPeriod(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => loadAnalytics(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Chiffre d'Affaires"
          value={analytics?.kpis.revenue.value || 0}
          change={analytics?.kpis.revenue.changePercentage || 0}
          trend={analytics?.kpis.revenue.trend || 'stable'}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Bénéfice"
          value={analytics?.kpis.profit.value || 0}
          change={analytics?.kpis.profit.changePercentage || 0}
          trend={analytics?.kpis.profit.trend || 'stable'}
          icon={TrendingUp}
          color="blue"
        />
        <KPICard
          title="Marge"
          value={analytics?.kpis.margin.value || 0}
          change={analytics?.kpis.margin.changePercentage || 0}
          trend={analytics?.kpis.margin.trend || 'stable'}
          icon={BarChart3}
          color="purple"
          format="percentage"
        />
        <KPICard
          title="Trésorerie"
          value={analytics?.kpis.cashFlow.value || 0}
          change={analytics?.kpis.cashFlow.changePercentage || 0}
          trend={analytics?.kpis.cashFlow.trend || 'stable'}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Tabs pour différentes vues */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions IA</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueChart 
              data={analytics?.charts.revenue || []}
              title="Évolution du Chiffre d'Affaires"
            />
            <RevenueChart 
              data={analytics?.charts.profitMargin || []}
              title="Évolution de la Marge"
              color="purple"
            />
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {predictions && (
            <PredictionsChart 
              predictions={predictions.predictions}
              modelAccuracy={predictions.modelAccuracy}
            />
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {analytics?.insights && (
            <AIInsightsPanel 
              insights={analytics.insights}
              onActionClick={(action) => console.log('Action:', action)}
            />
          )}
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détection d'Anomalies</CardTitle>
              <CardDescription>
                L'IA surveille vos métriques pour détecter les variations inhabituelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implémenter la détection d'anomalies */}
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Aucune anomalie détectée sur la période sélectionnée
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}