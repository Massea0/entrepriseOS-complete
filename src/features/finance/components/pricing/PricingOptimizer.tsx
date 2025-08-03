import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  Calculator,
  Target,
  Activity,
  Sparkles,
  Download,
  RefreshCw,
  DollarSign
} from 'lucide-react'
import { PricingService } from '../../services/pricing.service'
import { PriceSimulator } from './PriceSimulator'
import { ElasticityAnalysis } from './ElasticityAnalysis'
import { CompetitivePricing } from './CompetitivePricing'
import { BundleOptimizer } from './BundleOptimizer'
import { PricingOverviewCard } from './PricingOverviewCard'

interface PricingData {
  overview: {
    currentRevenue: number
    projectedRevenue: number
    revenueIncrease: number
    avgMargin: number
    marginIncrease: number
    optimizedProducts: number
    totalProducts: number
  }
  recommendations: Array<{
    productId: string
    productName: string
    currentPrice: number
    recommendedPrice: number
    impact: {
      revenue: number
      volume: number
      margin: number
    }
    confidence: number
    reasoning: string
  }>
  elasticity: {
    products: Array<{
      name: string
      elasticity: number
      category: 'elastic' | 'inelastic' | 'unit'
    }>
  }
  competitors: Array<{
    competitor: string
    priceIndex: number
    marketShare: number
  }>
}

export function PricingOptimizer() {
  const [timeframe, setTimeframe] = useState('month')
  const [category, setCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  const loadPricingData = async () => {
    setIsLoading(true)
    try {
      // Simuler le chargement des données
      const mockData: PricingData = {
        overview: {
          currentRevenue: 850000,
          projectedRevenue: 978000,
          revenueIncrease: 15,
          avgMargin: 42,
          marginIncrease: 3.5,
          optimizedProducts: 23,
          totalProducts: 45
        },
        recommendations: generateMockRecommendations(),
        elasticity: {
          products: [
            { name: 'Service Premium', elasticity: 0.3, category: 'inelastic' },
            { name: 'Consultation', elasticity: 1.2, category: 'elastic' },
            { name: 'Formation', elasticity: 1.0, category: 'unit' },
            { name: 'Support', elasticity: 0.5, category: 'inelastic' },
            { name: 'Audit', elasticity: 1.8, category: 'elastic' }
          ]
        },
        competitors: [
          { competitor: 'Concurrent A', priceIndex: 110, marketShare: 25 },
          { competitor: 'Concurrent B', priceIndex: 95, marketShare: 30 },
          { competitor: 'Concurrent C', priceIndex: 105, marketShare: 20 }
        ]
      }
      
      setPricingData(mockData)
    } catch (error) {
      console.error('Error loading pricing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPricingData()
  }, [timeframe, category])

  const handleOptimizePricing = async () => {
    setIsOptimizing(true)
    try {
      const result = await PricingService.optimizePricing({
        category: category === 'all' ? undefined : category,
        targetMargin: 45,
        constraints: {
          maxPriceIncrease: 20,
          minMargin: 30
        }
      })
      console.log('Pricing optimized:', result)
      // Recharger les données après optimisation
      await loadPricingData()
    } catch (error) {
      console.error('Error optimizing pricing:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleExportAnalysis = () => {
    console.log('Export pricing analysis')
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

  if (!pricingData) return null

  const hasHighImpactRecommendations = pricingData.recommendations.some(
    r => r.impact.revenue > 10
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Optimisation des Prix</h2>
          <p className="text-muted-foreground">
            Analyse IA et recommandations pour maximiser vos revenus
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous produits</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="products">Produits</SelectItem>
              <SelectItem value="subscriptions">Abonnements</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="default"
            onClick={handleOptimizePricing}
            disabled={isOptimizing}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isOptimizing ? 'Optimisation...' : 'Optimiser avec IA'}
          </Button>
          <Button variant="outline" onClick={handleExportAnalysis}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PricingOverviewCard
          title="Revenu Projeté"
          value={pricingData.overview.projectedRevenue}
          format="currency"
          icon={DollarSign}
          trend={pricingData.overview.revenueIncrease}
          color="green"
        />
        <PricingOverviewCard
          title="Augmentation Revenus"
          value={pricingData.overview.revenueIncrease}
          format="percentage"
          icon={TrendingUp}
          trend={0}
          color="blue"
        />
        <PricingOverviewCard
          title="Marge Moyenne"
          value={pricingData.overview.avgMargin}
          format="percentage"
          icon={Target}
          trend={pricingData.overview.marginIncrease}
          color="purple"
        />
        <PricingOverviewCard
          title="Produits Optimisés"
          value={pricingData.overview.optimizedProducts}
          format="fraction"
          total={pricingData.overview.totalProducts}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Alert for high impact recommendations */}
      {hasHighImpactRecommendations && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Opportunité détectée !</strong> Des ajustements de prix pourraient 
            augmenter vos revenus de {pricingData.overview.revenueIncrease}% 
            ({new Intl.NumberFormat('fr-FR', { 
              style: 'currency', 
              currency: 'EUR' 
            }).format(pricingData.overview.projectedRevenue - pricingData.overview.currentRevenue)})
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="simulator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simulator">Simulateur</TabsTrigger>
          <TabsTrigger value="elasticity">Élasticité</TabsTrigger>
          <TabsTrigger value="competitive">Concurrence</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-4">
          <PriceSimulator
            recommendations={pricingData.recommendations}
            onSelectProduct={setSelectedProduct}
            selectedProduct={selectedProduct}
          />
        </TabsContent>

        <TabsContent value="elasticity" className="space-y-4">
          <ElasticityAnalysis
            data={pricingData.elasticity}
            timeframe={timeframe}
          />
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <CompetitivePricing
            competitors={pricingData.competitors}
            recommendations={pricingData.recommendations}
          />
        </TabsContent>

        <TabsContent value="bundles" className="space-y-4">
          <BundleOptimizer
            products={pricingData.recommendations.map(r => ({
              id: r.productId,
              name: r.productName,
              price: r.currentPrice,
              margin: pricingData.overview.avgMargin
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function
function generateMockRecommendations() {
  const products = [
    'Service Consultation Premium',
    'Formation Avancée',
    'Support 24/7',
    'Audit Complet',
    'Package Entreprise'
  ]
  
  return products.map((product, index) => {
    const currentPrice = 500 + Math.random() * 2000
    const priceChange = -10 + Math.random() * 25
    const recommendedPrice = currentPrice * (1 + priceChange / 100)
    
    return {
      productId: `PROD-${index + 1}`,
      productName: product,
      currentPrice,
      recommendedPrice,
      impact: {
        revenue: Math.random() * 20 - 5,
        volume: Math.random() * -15,
        margin: Math.random() * 5
      },
      confidence: 70 + Math.random() * 25,
      reasoning: priceChange > 0 
        ? "Forte demande et faible élasticité permettent une augmentation"
        : "Ajustement recommandé pour stimuler la demande"
    }
  })
}