import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import { Brain, TrendingUp } from 'lucide-react'

interface Prediction {
  metric: string
  currentValue: number
  predictions: Array<{
    period: string
    value: number
    confidence: number
    range: { min: number; max: number }
  }>
}

interface PredictionsChartProps {
  predictions: Prediction[]
  modelAccuracy: number
}

export function PredictionsChart({ predictions, modelAccuracy }: PredictionsChartProps) {
  // Préparer les données pour le graphique
  const chartData = predictions[0]?.predictions.map((pred, index) => {
    const dataPoint: any = {
      period: pred.period,
      index: index
    }
    
    predictions.forEach(p => {
      const metricName = p.metric === 'revenue' ? 'Chiffre d\'affaires' : 'Bénéfice'
      dataPoint[metricName] = p.predictions[index].value
      dataPoint[`${metricName}_min`] = p.predictions[index].range.min
      dataPoint[`${metricName}_max`] = p.predictions[index].range.max
    })
    
    return dataPoint
  }) || []

  const formatValue = (value: number) => {
    return `${(value / 1000).toFixed(0)}k€`
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return 'text-green-600'
    if (accuracy >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec précision du modèle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <CardTitle>Prédictions IA</CardTitle>
            </div>
            <Badge variant="outline" className={getAccuracyColor(modelAccuracy)}>
              Précision: {modelAccuracy}%
            </Badge>
          </div>
          <CardDescription>
            Projections basées sur l'analyse historique et les tendances du marché
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Fiabilité du modèle</span>
              <span className={getAccuracyColor(modelAccuracy)}>{modelAccuracy}%</span>
            </div>
            <Progress value={modelAccuracy} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Graphique des prédictions */}
      <Card>
        <CardHeader>
          <CardTitle>Projections sur 3 mois</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip 
                formatter={(value: any) => formatValue(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              
              {/* Ligne de référence pour aujourd'hui */}
              <ReferenceLine x={0} stroke="gray" strokeDasharray="3 3" />
              
              {/* Lignes de prédiction */}
              <Line
                type="monotone"
                dataKey="Chiffre d'affaires"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="Bénéfice"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Détails des prédictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((prediction, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">
                {prediction.metric === 'revenue' ? 'Chiffre d\'affaires' : 'Bénéfice'} prévu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prediction.predictions.map((pred, predIndex) => (
                  <div key={predIndex} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{pred.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatValue(pred.value)}</span>
                        <Badge variant="outline" className="text-xs">
                          ±{((pred.range.max - pred.range.min) / pred.value * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Fourchette: {formatValue(pred.range.min)} - {formatValue(pred.range.max)}
                    </div>
                    <Progress value={pred.confidence} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}