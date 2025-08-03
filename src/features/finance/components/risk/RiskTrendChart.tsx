import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TrendData {
  date: string
  averageScore: number
  highRiskCount: number
}

interface RiskTrendChartProps {
  data: TrendData[]
  title?: string
  className?: string
}

export function RiskTrendChart({ 
  data, 
  title = "Évolution des Risques", 
  className 
}: RiskTrendChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return format(date, 'dd MMM', { locale: fr })
    } catch {
      return dateStr
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{formatDate(label)}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.stroke }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-medium">
                  {entry.dataKey === 'averageScore' 
                    ? `${entry.value}/100`
                    : entry.value
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  // Calculer les tendances
  const firstScore = data[0]?.averageScore || 0
  const lastScore = data[data.length - 1]?.averageScore || 0
  const scoreTrend = lastScore - firstScore
  const scoreTrendPercent = firstScore > 0 ? ((scoreTrend / firstScore) * 100).toFixed(1) : '0'

  const firstHighRisk = data[0]?.highRiskCount || 0
  const lastHighRisk = data[data.length - 1]?.highRiskCount || 0
  const highRiskTrend = lastHighRisk - firstHighRisk

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Évolution du score de risque moyen et du nombre de contrats à risque élevé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trend summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Tendance Score Risque</p>
              <div className="flex items-center gap-2">
                {scoreTrend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-semibold ${scoreTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {scoreTrendPercent}%
                </span>
                <span className="text-sm text-muted-foreground">
                  ({scoreTrend > 0 ? '+' : ''}{scoreTrend.toFixed(1)} points)
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tendance Contrats à Risque</p>
              <div className="flex items-center gap-2">
                {highRiskTrend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-semibold ${highRiskTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {highRiskTrend > 0 ? '+' : ''}{highRiskTrend}
                </span>
                <span className="text-sm text-muted-foreground">
                  contrats
                </span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-xs"
                />
                <YAxis 
                  yAxisId="left"
                  className="text-xs"
                  label={{ 
                    value: 'Score de risque', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#666' }
                  }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  className="text-xs"
                  label={{ 
                    value: 'Contrats à risque', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { textAnchor: 'middle', fill: '#666' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                  name="Score moyen"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="highRiskCount"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 3 }}
                  name="Contrats à risque"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Analysis insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="text-sm font-medium mb-2">Points d'attention</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {scoreTrend > 5 && (
                  <li>• Augmentation significative du risque global</li>
                )}
                {highRiskTrend > 3 && (
                  <li>• Nombre croissant de contrats à risque élevé</li>
                )}
                {data.some(d => d.averageScore > 60) && (
                  <li>• Pics de risque détectés dans la période</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Recommandations</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Analyser les contrats récents en détail</li>
                <li>• Renforcer les procédures de validation</li>
                <li>• Planifier des revues régulières</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}