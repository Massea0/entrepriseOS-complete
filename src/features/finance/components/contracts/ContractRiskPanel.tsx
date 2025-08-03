import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import type { RiskLevel } from '../../services/contract-risk.service'

interface RiskFactor {
  category: string
  description: string
  impact: RiskLevel
  probability: number
  mitigation: string
}

interface RiskAnalysis {
  riskScore: number
  riskLevel: RiskLevel
  factors: RiskFactor[]
  recommendations: string[]
  summary: string
  financialExposure?: number
  legalCompliance?: {
    compliant: boolean
    issues: string[]
  }
}

interface ContractRiskPanelProps {
  analysis: RiskAnalysis | null
  isAnalyzing?: boolean
  onReanalyze?: () => void
}

export function ContractRiskPanel({ analysis, isAnalyzing, onReanalyze }: ContractRiskPanelProps) {
  if (!analysis && !isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyse de risque non effectuée</h3>
          <p className="text-muted-foreground mb-4">
            L'analyse de risque sera lancée automatiquement à l'étape suivante
          </p>
          {onReanalyze && (
            <Button onClick={onReanalyze}>
              <Shield className="mr-2 h-4 w-4" />
              Analyser maintenant
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <RefreshCw className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyse en cours...</h3>
          <p className="text-muted-foreground">
            L'IA analyse les risques potentiels du contrat
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  const getRiskIcon = () => {
    switch (analysis.riskLevel) {
      case 'low':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />
      case 'medium':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case 'high':
        return <XCircle className="h-6 w-6 text-orange-500" />
      case 'critical':
        return <XCircle className="h-6 w-6 text-red-500" />
    }
  }

  const getRiskColor = () => {
    switch (analysis.riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
    }
  }

  const getRiskLabel = () => {
    switch (analysis.riskLevel) {
      case 'low':
        return 'Risque Faible'
      case 'medium':
        return 'Risque Modéré'
      case 'high':
        return 'Risque Élevé'
      case 'critical':
        return 'Risque Critique'
    }
  }

  return (
    <div className="space-y-6">
      {/* Score global */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getRiskIcon()}
              Analyse de Risque
            </CardTitle>
            {onReanalyze && (
              <Button variant="outline" size="sm" onClick={onReanalyze}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réanalyser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Score de risque global</p>
              <p className="text-3xl font-bold">{analysis.riskScore}/100</p>
            </div>
            <Badge className={`text-lg px-4 py-2 ${getRiskColor()}`}>
              {getRiskLabel()}
            </Badge>
          </div>
          <Progress value={analysis.riskScore} className="h-3" />
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Conformité légale */}
      {analysis.legalCompliance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Conformité Légale
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.legalCompliance.compliant ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Contrat conforme</AlertTitle>
                <AlertDescription>
                  Le contrat respecte toutes les exigences légales
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Problèmes de conformité détectés</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1">
                    {analysis.legalCompliance.issues.map((issue, index) => (
                      <li key={index} className="text-sm">• {issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Facteurs de risque */}
      <Card>
        <CardHeader>
          <CardTitle>Facteurs de Risque Identifiés</CardTitle>
          <CardDescription>
            Analyse détaillée des risques par catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {analysis.factors.map((factor, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{factor.category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {factor.description}
                        </p>
                      </div>
                      <Badge variant={
                        factor.impact === 'critical' ? 'destructive' :
                        factor.impact === 'high' ? 'destructive' :
                        factor.impact === 'medium' ? 'default' : 'secondary'
                      }>
                        Impact {factor.impact}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Probabilité</span>
                        <span className="font-medium">{factor.probability}%</span>
                      </div>
                      <Progress value={factor.probability} className="h-1" />
                    </div>
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        <strong>Mitigation :</strong> {factor.mitigation}
                      </AlertDescription>
                    </Alert>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
          <CardDescription>
            Actions suggérées pour réduire les risques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exposition financière */}
      {analysis.financialExposure && (
        <Alert>
          <TrendingDown className="h-4 w-4" />
          <AlertTitle>Exposition Financière</AlertTitle>
          <AlertDescription>
            Perte potentielle maximale estimée : {' '}
            <span className="font-semibold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(analysis.financialExposure)}
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}