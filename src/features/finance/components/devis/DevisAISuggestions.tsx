import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  LightbulbIcon,
  Target,
  Shield,
  BarChart3
} from 'lucide-react'

interface AIInsights {
  marketPosition: string
  riskLevel: 'low' | 'medium' | 'high'
  suggestions: string[]
  competitiveAnalysis: string
}

interface DevisAISuggestionsProps {
  insights: AIInsights
  onApplySuggestion: (suggestion: string) => void
}

export function DevisAISuggestions({ insights, onApplySuggestion }: DevisAISuggestionsProps) {
  const getRiskIcon = () => {
    switch (insights.riskLevel) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'high':
        return <Shield className="h-4 w-4 text-red-500" />
    }
  }

  const getRiskColor = () => {
    switch (insights.riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          Insights IA
        </CardTitle>
        <CardDescription>
          Analyse intelligente et recommandations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position sur le marché */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Position Marché</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {insights.marketPosition}
          </p>
        </div>

        <Separator />

        {/* Niveau de risque */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getRiskIcon()}
            <span className="text-sm font-medium">Niveau de Risque</span>
          </div>
          <Badge 
            variant="outline" 
            className={getRiskColor()}
          >
            {insights.riskLevel === 'low' && 'Risque Faible'}
            {insights.riskLevel === 'medium' && 'Risque Modéré'}
            {insights.riskLevel === 'high' && 'Risque Élevé'}
          </Badge>
        </div>

        <Separator />

        {/* Analyse concurrentielle */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Analyse Concurrentielle</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {insights.competitiveAnalysis}
          </p>
        </div>

        <Separator />

        {/* Suggestions */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Suggestions d'Optimisation</span>
          <ScrollArea className="h-[200px] rounded-md border p-3">
            <div className="space-y-2">
              {insights.suggestions.map((suggestion, index) => (
                <Alert key={index} className="cursor-pointer hover:bg-accent">
                  <AlertDescription className="flex items-start justify-between gap-2">
                    <span className="text-sm flex-1">{suggestion}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onApplySuggestion(suggestion)}
                      className="shrink-0"
                    >
                      Appliquer
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Actions rapides */}
        <div className="pt-2 space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onApplySuggestion('optimize_pricing')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Optimiser les prix
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onApplySuggestion('add_services')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Ajouter des services suggérés
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}