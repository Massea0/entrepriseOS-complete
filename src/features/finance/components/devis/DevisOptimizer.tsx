import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign,
  Percent,
  Target,
  Zap,
  Info
} from 'lucide-react'
import { PricingService } from '../../services/pricing.service'
import { AIDevisService } from '../../services/ai-devis.service'

interface OptimizationGoals {
  maximizeMargin: boolean
  improveCompetitiveness: boolean
  increaseVolume: boolean
  balanceRisk: boolean
}

interface OptimizationResult {
  originalPrice: number
  optimizedPrice: number
  marginChange: number
  volumeImpact: number
  confidence: number
  recommendations: string[]
}

interface DevisOptimizerProps {
  devisId?: string
  currentAmount: number
  onOptimizationComplete: (result: OptimizationResult) => void
}

export function DevisOptimizer({ devisId, currentAmount, onOptimizationComplete }: DevisOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)
  const [goals, setGoals] = useState<OptimizationGoals>({
    maximizeMargin: true,
    improveCompetitiveness: true,
    increaseVolume: false,
    balanceRisk: true
  })
  const [marginTarget, setMarginTarget] = useState([25]) // %
  const [result, setResult] = useState<OptimizationResult | null>(null)

  const runOptimization = async () => {
    setIsOptimizing(true)
    setOptimizationProgress(0)
    
    try {
      // Simulation de progression
      const progressInterval = setInterval(() => {
        setOptimizationProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // Appel au service d'optimisation
      const optimizationGoals: string[] = []
      if (goals.maximizeMargin) optimizationGoals.push('margin')
      if (goals.improveCompetitiveness) optimizationGoals.push('competitiveness')
      if (goals.increaseVolume) optimizationGoals.push('volume')
      if (goals.balanceRisk) optimizationGoals.push('risk')

      let optimizationResult: OptimizationResult

      if (devisId) {
        const response = await AIDevisService.optimizeExistingDevis(devisId, optimizationGoals)
        optimizationResult = {
          originalPrice: currentAmount,
          optimizedPrice: response.devis.totalAmount,
          marginChange: response.devis.margin - 20, // Supposons une marge initiale de 20%
          volumeImpact: 15, // Estimation
          confidence: 85,
          recommendations: response.suggestions.pricing
        }
      } else {
        // Optimisation générique sans devis spécifique
        optimizationResult = {
          originalPrice: currentAmount,
          optimizedPrice: currentAmount * 1.1, // Exemple simplifié
          marginChange: 5,
          volumeImpact: 10,
          confidence: 75,
          recommendations: [
            "Augmenter le prix de 10% pour améliorer la marge",
            "Ajouter des services complémentaires à forte valeur",
            "Proposer des remises volume pour les grandes commandes"
          ]
        }
      }

      clearInterval(progressInterval)
      setOptimizationProgress(100)
      setResult(optimizationResult)
      onOptimizationComplete(optimizationResult)

    } catch (error) {
      console.error('Erreur optimisation:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Optimiseur de Prix IA
        </CardTitle>
        <CardDescription>
          Optimisez vos prix pour maximiser vos résultats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="goals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals">Objectifs</TabsTrigger>
            <TabsTrigger value="results" disabled={!result}>Résultats</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            {/* Objectifs d'optimisation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <Label htmlFor="maximize-margin">Maximiser la marge</Label>
                </div>
                <Switch
                  id="maximize-margin"
                  checked={goals.maximizeMargin}
                  onCheckedChange={(checked) => setGoals({ ...goals, maximizeMargin: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="improve-competitiveness">Améliorer la compétitivité</Label>
                </div>
                <Switch
                  id="improve-competitiveness"
                  checked={goals.improveCompetitiveness}
                  onCheckedChange={(checked) => setGoals({ ...goals, improveCompetitiveness: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <Label htmlFor="increase-volume">Augmenter le volume</Label>
                </div>
                <Switch
                  id="increase-volume"
                  checked={goals.increaseVolume}
                  onCheckedChange={(checked) => setGoals({ ...goals, increaseVolume: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <Label htmlFor="balance-risk">Équilibrer les risques</Label>
                </div>
                <Switch
                  id="balance-risk"
                  checked={goals.balanceRisk}
                  onCheckedChange={(checked) => setGoals({ ...goals, balanceRisk: checked })}
                />
              </div>
            </div>

            {/* Cible de marge */}
            {goals.maximizeMargin && (
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label>Marge cible</Label>
                  <span className="text-sm font-medium">{marginTarget[0]}%</span>
                </div>
                <Slider
                  value={marginTarget}
                  onValueChange={setMarginTarget}
                  min={10}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
            )}

            {/* Bouton d'optimisation */}
            <Button
              onClick={runOptimization}
              disabled={isOptimizing || (!goals.maximizeMargin && !goals.improveCompetitiveness && !goals.increaseVolume && !goals.balanceRisk)}
              className="w-full"
            >
              {isOptimizing ? (
                <>
                  <Progress value={optimizationProgress} className="w-20 mr-2" />
                  Optimisation en cours...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Lancer l'optimisation
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {result && (
              <>
                {/* Résumé des résultats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Prix original</div>
                      <div className="text-2xl font-bold">{result.originalPrice.toFixed(2)} €</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Prix optimisé</div>
                      <div className="text-2xl font-bold text-green-600">
                        {result.optimizedPrice.toFixed(2)} €
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Impacts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Impact sur la marge</span>
                    <span className={`text-sm font-medium ${result.marginChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.marginChange > 0 ? '+' : ''}{result.marginChange}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Impact sur le volume</span>
                    <span className="text-sm font-medium">
                      {result.volumeImpact > 0 ? '+' : ''}{result.volumeImpact}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Niveau de confiance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={result.confidence} className="w-20" />
                      <span className="text-sm font-medium">{result.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* Recommandations */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">Recommandations :</p>
                    <ul className="text-sm space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}