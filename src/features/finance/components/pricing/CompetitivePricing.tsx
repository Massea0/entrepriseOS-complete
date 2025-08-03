import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowUp, ArrowDown, Minus, Target, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Competitor {
  competitor: string
  priceIndex: number // 100 = même prix, >100 = plus cher, <100 = moins cher
  marketShare: number
}

interface Recommendation {
  productId: string
  productName: string
  currentPrice: number
  recommendedPrice: number
}

interface CompetitivePricingProps {
  competitors: Competitor[]
  recommendations: Recommendation[]
}

export function CompetitivePricing({ competitors, recommendations }: CompetitivePricingProps) {
  const averagePriceIndex = competitors.reduce((sum, c) => sum + c.priceIndex, 0) / competitors.length
  const ourPosition = averagePriceIndex > 100 ? 'premium' : averagePriceIndex < 100 ? 'value' : 'aligned'
  
  // Données pour le radar chart
  const radarData = [
    { metric: 'Prix', value: 100, competitor: averagePriceIndex },
    { metric: 'Part de marché', value: 100 - competitors.reduce((sum, c) => sum + c.marketShare, 0), competitor: 30 },
    { metric: 'Compétitivité', value: 110 - averagePriceIndex, competitor: 100 },
    { metric: 'Marge', value: averagePriceIndex * 0.4, competitor: 40 },
    { metric: 'Volume', value: 200 - averagePriceIndex, competitor: 100 }
  ]

  const getPositionBadge = () => {
    switch (ourPosition) {
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Position Premium</Badge>
      case 'value':
        return <Badge className="bg-blue-100 text-blue-800">Position Value</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800">Prix Alignés</Badge>
    }
  }

  const getPriceComparisonIcon = (index: number) => {
    if (index > 105) return <ArrowUp className="h-4 w-4 text-red-500" />
    if (index < 95) return <ArrowDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getRecommendationForPosition = () => {
    if (ourPosition === 'premium') {
      return {
        title: 'Justifier la position premium',
        actions: [
          'Renforcer la communication sur la valeur ajoutée',
          'Développer des services exclusifs',
          'Créer des packages premium'
        ]
      }
    } else if (ourPosition === 'value') {
      return {
        title: 'Capitaliser sur la position value',
        actions: [
          'Augmenter le volume de ventes',
          'Optimiser les coûts pour maintenir les marges',
          'Communiquer sur le rapport qualité/prix'
        ]
      }
    }
    return {
      title: 'Différenciation nécessaire',
      actions: [
        'Développer des avantages compétitifs uniques',
        'Segmenter l\'offre par gamme',
        'Innover sur les services'
      ]
    }
  }

  const strategy = getRecommendationForPosition()

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Position Prix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{averagePriceIndex.toFixed(0)}</span>
                {getPositionBadge()}
              </div>
              <p className="text-sm text-muted-foreground">
                vs moyenne concurrents (base 100)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Part de Marché Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {100 - competitors.reduce((sum, c) => sum + c.marketShare, 0)}%
              </div>
              <Progress 
                value={100 - competitors.reduce((sum, c) => sum + c.marketShare, 0)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Nombre de Concurrents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitors.length}</div>
            <p className="text-sm text-muted-foreground">
              dans votre segment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Competitive positioning radar */}
      <Card>
        <CardHeader>
          <CardTitle>Positionnement Concurrentiel</CardTitle>
          <CardDescription>
            Comparaison multi-critères avec la moyenne du marché
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="metric" className="text-xs" />
                <PolarRadiusAxis angle={90} domain={[0, 150]} />
                <Radar
                  name="Notre position"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Moyenne marché"
                  dataKey="competitor"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Competitor details */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse Détaillée des Concurrents</CardTitle>
          <CardDescription>
            Position prix et part de marché
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concurrent</TableHead>
                <TableHead className="text-center">Index Prix</TableHead>
                <TableHead className="text-center">Position</TableHead>
                <TableHead className="text-center">Part de Marché</TableHead>
                <TableHead>Stratégie Recommandée</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((competitor) => (
                <TableRow key={competitor.competitor}>
                  <TableCell className="font-medium">{competitor.competitor}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getPriceComparisonIcon(competitor.priceIndex)}
                      <span className={cn(
                        'font-medium',
                        competitor.priceIndex > 105 && 'text-red-600',
                        competitor.priceIndex < 95 && 'text-green-600'
                      )}>
                        {competitor.priceIndex}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {competitor.priceIndex > 110 ? 'Premium' :
                       competitor.priceIndex < 90 ? 'Low-cost' : 'Milieu de gamme'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      <span className="font-medium">{competitor.marketShare}%</span>
                      <Progress value={competitor.marketShare} className="h-1.5 w-20 mx-auto" />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {competitor.priceIndex > 105 
                      ? "Attaquer sur le rapport qualité/prix"
                      : competitor.priceIndex < 95
                      ? "Se différencier par la qualité"
                      : "Innover sur les services"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Strategic recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommandations Stratégiques
          </CardTitle>
          <CardDescription>
            {strategy.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategy.actions.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
            
            {/* Price adjustment opportunities */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Opportunités d'ajustement identifiées
              </h4>
              <div className="space-y-2">
                {recommendations.slice(0, 3).map(rec => {
                  const priceChange = ((rec.recommendedPrice - rec.currentPrice) / rec.currentPrice) * 100
                  return (
                    <div key={rec.productId} className="flex items-center justify-between text-sm">
                      <span>{rec.productName}</span>
                      <span className={cn(
                        'font-medium',
                        priceChange > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}% recommandé
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}