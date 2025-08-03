import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Info, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ElasticityData {
  products: Array<{
    name: string
    elasticity: number
    category: 'elastic' | 'inelastic' | 'unit'
  }>
}

interface ElasticityAnalysisProps {
  data: ElasticityData
  timeframe: string
}

export function ElasticityAnalysis({ data, timeframe }: ElasticityAnalysisProps) {
  const getElasticityColor = (elasticity: number) => {
    if (elasticity > 1.5) return '#ef4444' // rouge - très élastique
    if (elasticity > 1.0) return '#f97316' // orange - élastique
    if (elasticity === 1.0) return '#eab308' // jaune - unitaire
    if (elasticity > 0.5) return '#3b82f6' // bleu - peu élastique
    return '#22c55e' // vert - inélastique
  }

  const getElasticityLabel = (category: string) => {
    switch (category) {
      case 'elastic':
        return { text: 'Élastique', variant: 'destructive' as const }
      case 'inelastic':
        return { text: 'Inélastique', variant: 'secondary' as const }
      case 'unit':
        return { text: 'Unitaire', variant: 'outline' as const }
      default:
        return { text: 'Inconnu', variant: 'default' as const }
    }
  }

  const getRecommendation = (elasticity: number) => {
    if (elasticity > 1.5) {
      return {
        action: 'Réduire les prix',
        reason: 'Très sensible aux variations de prix',
        icon: <TrendingDown className="h-4 w-4" />
      }
    }
    if (elasticity > 1.0) {
      return {
        action: 'Ajuster avec prudence',
        reason: 'Demande élastique',
        icon: <TrendingDown className="h-4 w-4" />
      }
    }
    if (elasticity < 0.5) {
      return {
        action: 'Augmenter les prix',
        reason: 'Faible sensibilité au prix',
        icon: <TrendingUp className="h-4 w-4" />
      }
    }
    return {
      action: 'Maintenir les prix',
      reason: 'Élasticité modérée',
      icon: <Info className="h-4 w-4" />
    }
  }

  const averageElasticity = data.products.reduce((sum, p) => sum + p.elasticity, 0) / data.products.length
  const elasticProducts = data.products.filter(p => p.category === 'elastic').length
  const inelasticProducts = data.products.filter(p => p.category === 'inelastic').length

  const chartData = data.products.map(p => ({
    ...p,
    color: getElasticityColor(p.elasticity)
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const recommendation = getRecommendation(data.elasticity)
      
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Élasticité: {data.elasticity.toFixed(2)}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            {recommendation.icon}
            <span className="font-medium">{recommendation.action}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Élasticité Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageElasticity.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {averageElasticity > 1 ? 'Marché sensible aux prix' : 'Marché peu sensible'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Produits Élastiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elasticProducts}</div>
            <Progress 
              value={(elasticProducts / data.products.length) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Produits Inélastiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inelasticProducts}</div>
            <Progress 
              value={(inelasticProducts / data.products.length) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse d'Élasticité par Produit</CardTitle>
          <CardDescription>
            Sensibilité de la demande aux variations de prix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-xs"
                />
                <YAxis 
                  label={{ 
                    value: 'Coefficient d\'élasticité', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#666' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="elasticity" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Inélastique (&lt;0.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Peu élastique (0.5-1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span>Élastique (&gt;1)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product details */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations par Produit</CardTitle>
          <CardDescription>
            Actions suggérées basées sur l'élasticité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.products.map((product) => {
              const label = getElasticityLabel(product.category)
              const recommendation = getRecommendation(product.elasticity)
              
              return (
                <div 
                  key={product.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Coefficient: {product.elasticity.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={label.variant}>
                      {label.text}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {recommendation.icon}
                    <div className="text-right">
                      <p className="font-medium text-sm">{recommendation.action}</p>
                      <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      {elasticProducts > data.products.length * 0.5 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Marché sensible aux prix</AlertTitle>
          <AlertDescription>
            Plus de 50% de vos produits ont une demande élastique. 
            Considérez des stratégies de différenciation ou de valeur ajoutée 
            plutôt que des augmentations de prix directes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}