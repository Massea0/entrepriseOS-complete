import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  TrendingUp, 
  TrendingDown,
  Calculator,
  Eye,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PricingService } from '../../services/pricing.service'

interface Recommendation {
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
}

interface PriceSimulatorProps {
  recommendations: Recommendation[]
  onSelectProduct: (productId: string) => void
  selectedProduct: string | null
}

export function PriceSimulator({ 
  recommendations, 
  onSelectProduct, 
  selectedProduct 
}: PriceSimulatorProps) {
  const [simulatedPrices, setSimulatedPrices] = useState<Record<string, number>>({})
  const [showDetails, setShowDetails] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [detailProduct, setDetailProduct] = useState<Recommendation | null>(null)

  const handlePriceChange = (productId: string, newPrice: number) => {
    setSimulatedPrices(prev => ({
      ...prev,
      [productId]: newPrice
    }))
  }

  const handleApplyRecommendations = async () => {
    setIsSimulating(true)
    try {
      // Appliquer toutes les recommandations
      const newPrices: Record<string, number> = {}
      recommendations.forEach(rec => {
        newPrices[rec.productId] = rec.recommendedPrice
      })
      setSimulatedPrices(newPrices)
      
      // Simuler l'application via le service
      await PricingService.simulatePricing({
        priceChanges: Object.entries(newPrices).map(([productId, price]) => ({
          productId,
          newPrice: price
        })),
        duration: 30
      })
    } catch (error) {
      console.error('Error applying recommendations:', error)
    } finally {
      setIsSimulating(false)
    }
  }

  const handleShowDetails = (product: Recommendation) => {
    setDetailProduct(product)
    setShowDetails(true)
  }

  const getImpactColor = (impact: number) => {
    if (impact > 10) return 'text-green-600 font-semibold'
    if (impact > 0) return 'text-green-600'
    if (impact > -5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge className="bg-green-100 text-green-800">Très élevée</Badge>
    if (confidence >= 75) return <Badge className="bg-blue-100 text-blue-800">Élevée</Badge>
    if (confidence >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Modérée</Badge>
    return <Badge className="bg-red-100 text-red-800">Faible</Badge>
  }

  const totalRevenuImpact = recommendations.reduce((sum, rec) => {
    const price = simulatedPrices[rec.productId] || rec.currentPrice
    const priceChange = ((price - rec.currentPrice) / rec.currentPrice) * 100
    return sum + (priceChange * rec.impact.revenue / 100)
  }, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Simulateur de Prix IA</CardTitle>
              <CardDescription>
                Ajustez les prix recommandés et visualisez l'impact
              </CardDescription>
            </div>
            <Button 
              onClick={handleApplyRecommendations}
              disabled={isSimulating}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isSimulating ? 'Application...' : 'Appliquer toutes les recommandations'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Impact estimé sur le revenu</p>
              <div className="flex items-center gap-2 mt-1">
                {totalRevenuImpact > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span className={cn(
                  'text-2xl font-bold',
                  totalRevenuImpact > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {totalRevenuImpact > 0 ? '+' : ''}{totalRevenuImpact.toFixed(1)}%
                </span>
              </div>
            </div>
            {totalRevenuImpact > 10 && (
              <Badge variant="default" className="bg-green-600">
                Forte opportunité
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Prix actuel</TableHead>
                <TableHead className="text-right">Prix recommandé</TableHead>
                <TableHead className="text-center">Impact</TableHead>
                <TableHead className="text-center">Confiance</TableHead>
                <TableHead className="w-[200px]">Ajustement</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((rec) => {
                const simulatedPrice = simulatedPrices[rec.productId] || rec.currentPrice
                const priceChange = ((simulatedPrice - rec.currentPrice) / rec.currentPrice) * 100
                
                return (
                  <TableRow 
                    key={rec.productId}
                    className={selectedProduct === rec.productId ? 'bg-muted' : ''}
                  >
                    <TableCell className="font-medium">{rec.productName}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(rec.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(rec.recommendedPrice)}
                        <div className="text-xs text-muted-foreground">
                          ({((rec.recommendedPrice - rec.currentPrice) / rec.currentPrice * 100).toFixed(1)}%)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className={getImpactColor(rec.impact.revenue)}>
                          Rev: {rec.impact.revenue > 0 ? '+' : ''}{rec.impact.revenue.toFixed(1)}%
                        </div>
                        <div className={getImpactColor(rec.impact.margin)}>
                          Marge: {rec.impact.margin > 0 ? '+' : ''}{rec.impact.margin.toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getConfidenceBadge(rec.confidence)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Slider
                          value={[simulatedPrice]}
                          onValueChange={(value) => handlePriceChange(rec.productId, value[0])}
                          max={rec.currentPrice * 1.5}
                          min={rec.currentPrice * 0.5}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            }).format(simulatedPrice)}
                          </span>
                          <span className={cn(
                            'font-medium',
                            priceChange > 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShowDetails(rec)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Analyse détaillée - {detailProduct?.productName}</DialogTitle>
            <DialogDescription>
              Recommandation basée sur l'analyse IA du marché
            </DialogDescription>
          </DialogHeader>
          {detailProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Prix actuel</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(detailProduct.currentPrice)}
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Prix recommandé</p>
                  <p className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(detailProduct.recommendedPrice)}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Raisonnement IA
                </h4>
                <p className="text-sm text-muted-foreground">
                  {detailProduct.reasoning}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Impact projeté</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenu</span>
                    <span className={cn('font-medium', getImpactColor(detailProduct.impact.revenue))}>
                      {detailProduct.impact.revenue > 0 ? '+' : ''}{detailProduct.impact.revenue.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Volume</span>
                    <span className={cn('font-medium', getImpactColor(detailProduct.impact.volume))}>
                      {detailProduct.impact.volume > 0 ? '+' : ''}{detailProduct.impact.volume.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marge</span>
                    <span className={cn('font-medium', getImpactColor(detailProduct.impact.margin))}>
                      {detailProduct.impact.margin > 0 ? '+' : ''}{detailProduct.impact.margin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Progress value={detailProduct.confidence} className="flex-1" />
                <span className="text-sm font-medium">{detailProduct.confidence}% confiance</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}