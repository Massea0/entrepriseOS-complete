import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LightbulbIcon, 
  AlertTriangle, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface AIInsight {
  type: 'opportunity' | 'warning' | 'trend' | 'anomaly'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionRequired: boolean
  suggestedActions?: string[]
}

interface AIInsightsPanelProps {
  insights: AIInsight[]
  onActionClick?: (action: string) => void
}

export function AIInsightsPanel({ insights, onActionClick }: AIInsightsPanelProps) {
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <LightbulbIcon className="h-5 w-5 text-yellow-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-blue-500" />
      case 'anomaly':
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
    }
  }

  const getAlertVariant = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning':
      case 'anomaly':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const prioritizedInsights = [...insights].sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 }
    const typeOrder = { anomaly: 0, warning: 1, opportunity: 2, trend: 3 }
    
    if (a.actionRequired !== b.actionRequired) {
      return a.actionRequired ? -1 : 1
    }
    
    if (impactOrder[a.impact] !== impactOrder[b.impact]) {
      return impactOrder[a.impact] - impactOrder[b.impact]
    }
    
    return typeOrder[a.type] - typeOrder[b.type]
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          Insights IA
        </CardTitle>
        <CardDescription>
          Recommandations et alertes basées sur l'analyse IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {prioritizedInsights.map((insight, index) => (
              <Alert key={index} variant={getAlertVariant(insight.type)}>
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 space-y-2">
                    <AlertTitle className="flex items-center gap-2">
                      {insight.title}
                      <Badge variant={getImpactColor(insight.impact)}>
                        Impact {insight.impact}
                      </Badge>
                      {insight.actionRequired && (
                        <Badge variant="destructive">
                          Action requise
                        </Badge>
                      )}
                    </AlertTitle>
                    <AlertDescription>
                      {insight.description}
                    </AlertDescription>
                    
                    {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <p className="text-sm font-medium">Actions suggérées :</p>
                        <div className="space-y-1">
                          {insight.suggestedActions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant="outline"
                              size="sm"
                              className="w-full justify-between"
                              onClick={() => onActionClick?.(action)}
                            >
                              <span className="text-left">{action}</span>
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
            
            {insights.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Tout va bien !</AlertTitle>
                <AlertDescription>
                  Aucune alerte ou recommandation particulière pour le moment.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}