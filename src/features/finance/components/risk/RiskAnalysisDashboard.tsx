import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3,
  Activity,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react'
import { ContractRiskService } from '../../services/contract-risk.service'
import { RiskOverviewCard } from './RiskOverviewCard'
import { RiskHeatmap } from './RiskHeatmap'
import { RiskTrendChart } from './RiskTrendChart'
import { RiskDistribution } from './RiskDistribution'
import { MitigationPlan } from './MitigationPlan'
import { ContractRiskList } from './ContractRiskList'

interface RiskAnalyticsData {
  overview: {
    totalContracts: number
    averageRiskScore: number
    highRiskContracts: number
    criticalRisks: number
    mitigatedRisks: number
    pendingActions: number
  }
  distribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  trends: Array<{
    date: string
    averageScore: number
    highRiskCount: number
  }>
  topRisks: Array<{
    category: string
    count: number
    averageImpact: number
  }>
  contracts: Array<{
    id: string
    name: string
    clientName: string
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    factors: number
    lastAnalyzed: string
  }>
}

export function RiskAnalysisDashboard() {
  const [timeRange, setTimeRange] = useState('month')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<RiskAnalyticsData | null>(null)
  const [selectedContract, setSelectedContract] = useState<string | null>(null)

  const loadAnalytics = async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      // Simuler le chargement des données
      // TODO: Remplacer par l'appel réel à l'API
      const mockData: RiskAnalyticsData = {
        overview: {
          totalContracts: 156,
          averageRiskScore: 42,
          highRiskContracts: 23,
          criticalRisks: 5,
          mitigatedRisks: 89,
          pendingActions: 34
        },
        distribution: {
          low: 67,
          medium: 45,
          high: 38,
          critical: 6
        },
        trends: generateMockTrends(),
        topRisks: [
          { category: 'Financier', count: 45, averageImpact: 78 },
          { category: 'Juridique', count: 38, averageImpact: 65 },
          { category: 'Opérationnel', count: 29, averageImpact: 52 },
          { category: 'Conformité', count: 24, averageImpact: 71 },
          { category: 'Réputation', count: 18, averageImpact: 83 }
        ],
        contracts: generateMockContracts()
      }

      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error loading risk analytics:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, filterCategory])

  const handleExportReport = async () => {
    // TODO: Implémenter l'export du rapport
    console.log('Export risk report')
  }

  const handleContractAnalysis = async (contractId: string) => {
    setSelectedContract(contractId)
    // TODO: Charger l'analyse détaillée du contrat
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analyse des Risques</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble des risques contractuels et recommandations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RiskOverviewCard
          title="Score de Risque Moyen"
          value={analyticsData.overview.averageRiskScore}
          format="score"
          icon={Shield}
          trend={-5}
          color="blue"
        />
        <RiskOverviewCard
          title="Contrats à Risque Élevé"
          value={analyticsData.overview.highRiskContracts}
          format="number"
          icon={AlertTriangle}
          trend={12}
          color="orange"
        />
        <RiskOverviewCard
          title="Risques Critiques"
          value={analyticsData.overview.criticalRisks}
          format="number"
          icon={Activity}
          trend={-25}
          color="red"
        />
        <RiskOverviewCard
          title="Actions en Attente"
          value={analyticsData.overview.pendingActions}
          format="number"
          icon={TrendingUp}
          trend={8}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="contracts">Contrats</TabsTrigger>
          <TabsTrigger value="mitigation">Plan de Mitigation</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Heatmap des risques */}
            <RiskHeatmap 
              data={analyticsData.topRisks}
              title="Carte de Chaleur des Risques"
            />
            
            {/* Distribution des risques */}
            <RiskDistribution 
              distribution={analyticsData.distribution}
              title="Répartition par Niveau"
            />
          </div>

          {/* Alerte pour risques critiques */}
          {analyticsData.overview.criticalRisks > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{analyticsData.overview.criticalRisks} risques critiques</strong> nécessitent 
                une attention immédiate. Consultez le plan de mitigation pour les actions recommandées.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <ContractRiskList
            contracts={analyticsData.contracts}
            onSelectContract={handleContractAnalysis}
            selectedContract={selectedContract}
          />
        </TabsContent>

        <TabsContent value="mitigation" className="space-y-4">
          <MitigationPlan
            contracts={analyticsData.contracts.filter(c => 
              c.riskLevel === 'high' || c.riskLevel === 'critical'
            )}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <RiskTrendChart
            data={analyticsData.trends}
            title="Évolution des Risques"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions
function generateMockTrends() {
  const trends = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    trends.push({
      date: date.toISOString().split('T')[0],
      averageScore: Math.floor(Math.random() * 20) + 35,
      highRiskCount: Math.floor(Math.random() * 10) + 15
    })
  }
  return trends
}

function generateMockContracts() {
  const contracts = []
  const clients = ['Acme Corp', 'TechStart', 'Global Industries', 'Innovation Labs', 'Digital Solutions']
  const levels: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical']
  
  for (let i = 1; i <= 20; i++) {
    const riskLevel = levels[Math.floor(Math.random() * levels.length)]
    contracts.push({
      id: `CONTRACT-${i}`,
      name: `Contrat de Service #${i}`,
      clientName: clients[Math.floor(Math.random() * clients.length)],
      riskScore: Math.floor(Math.random() * 60) + 20,
      riskLevel,
      factors: Math.floor(Math.random() * 8) + 2,
      lastAnalyzed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  return contracts.sort((a, b) => b.riskScore - a.riskScore)
}