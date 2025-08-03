import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Badge } from '@/components/ui/badge'

interface RiskDistributionProps {
  distribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  title?: string
  className?: string
}

export function RiskDistribution({ 
  distribution, 
  title = "Répartition par Niveau de Risque",
  className 
}: RiskDistributionProps) {
  const data = [
    { name: 'Faible', value: distribution.low, color: '#22c55e' },
    { name: 'Modéré', value: distribution.medium, color: '#eab308' },
    { name: 'Élevé', value: distribution.high, color: '#f97316' },
    { name: 'Critique', value: distribution.critical, color: '#ef4444' }
  ]

  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} contrats ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const getRiskBadge = (level: string, count: number) => {
    const percentage = ((count / total) * 100).toFixed(1)
    const variant = 
      level === 'Faible' ? 'outline' :
      level === 'Modéré' ? 'secondary' :
      level === 'Élevé' ? 'default' :
      'destructive'
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: data.find(d => d.name === level)?.color 
            }}
          />
          <span className="text-sm font-medium">{level}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={variant}>{count}</Badge>
          <span className="text-sm text-muted-foreground">({percentage}%)</span>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Distribution des contrats par niveau de risque
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Donut Chart */}
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          {/* Legend with counts */}
          <div className="space-y-2 pt-4 border-t">
            {getRiskBadge('Faible', distribution.low)}
            {getRiskBadge('Modéré', distribution.medium)}
            {getRiskBadge('Élevé', distribution.high)}
            {getRiskBadge('Critique', distribution.critical)}
          </div>

          {/* Risk summary */}
          {distribution.critical > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-destructive font-medium">
                ⚠️ {distribution.critical} contrat{distribution.critical > 1 ? 's' : ''} 
                {' '}nécessite{distribution.critical > 1 ? 'nt' : ''} une attention immédiate
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}