import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface RiskData {
  category: string
  count: number
  averageImpact: number
}

interface RiskHeatmapProps {
  data: RiskData[]
  title?: string
  className?: string
}

export function RiskHeatmap({ data, title = "Carte de Chaleur des Risques", className }: RiskHeatmapProps) {
  const getHeatColor = (impact: number) => {
    if (impact >= 80) return 'bg-red-600 hover:bg-red-700'
    if (impact >= 70) return 'bg-red-500 hover:bg-red-600'
    if (impact >= 60) return 'bg-orange-500 hover:bg-orange-600'
    if (impact >= 50) return 'bg-orange-400 hover:bg-orange-500'
    if (impact >= 40) return 'bg-yellow-500 hover:bg-yellow-600'
    if (impact >= 30) return 'bg-yellow-400 hover:bg-yellow-500'
    if (impact >= 20) return 'bg-green-400 hover:bg-green-500'
    return 'bg-green-300 hover:bg-green-400'
  }

  const getTextColor = (impact: number) => {
    return impact >= 50 ? 'text-white' : 'text-gray-800'
  }

  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Impact moyen par catégorie de risque
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Légende */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Faible impact</span>
            <div className="flex gap-1">
              {[20, 30, 40, 50, 60, 70, 80].map(level => (
                <div
                  key={level}
                  className={cn(
                    'w-6 h-6 rounded',
                    getHeatColor(level)
                  )}
                />
              ))}
            </div>
            <span className="text-muted-foreground">Impact élevé</span>
          </div>

          {/* Heatmap grid */}
          <div className="space-y-3">
            {data.map((item) => {
              const barWidth = (item.count / maxCount) * 100
              
              return (
                <TooltipProvider key={item.category}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-muted-foreground">
                            {item.count} risques
                          </span>
                        </div>
                        <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                          <div
                            className={cn(
                              'absolute inset-y-0 left-0 transition-all duration-300 rounded-lg flex items-center justify-center',
                              getHeatColor(item.averageImpact),
                              getTextColor(item.averageImpact)
                            )}
                            style={{ width: `${barWidth}%` }}
                          >
                            <span className="text-sm font-medium">
                              {item.averageImpact}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm">Nombre de risques: {item.count}</p>
                        <p className="text-sm">Impact moyen: {item.averageImpact}%</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>

          {/* Summary stats */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total des risques</p>
                <p className="font-semibold text-lg">
                  {data.reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Impact moyen global</p>
                <p className="font-semibold text-lg">
                  {Math.round(
                    data.reduce((sum, item) => sum + item.averageImpact, 0) / data.length
                  )}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}