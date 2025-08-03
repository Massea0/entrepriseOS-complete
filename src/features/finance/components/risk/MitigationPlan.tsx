import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Target,
  FileText,
  Send,
  Download
} from 'lucide-react'
import { ContractRiskService } from '../../services/contract-risk.service'

interface Contract {
  id: string
  name: string
  clientName: string
  riskScore: number
  riskLevel: 'high' | 'critical'
  factors: number
}

interface MitigationPlanProps {
  contracts: Contract[]
}

interface MitigationAction {
  id: string
  contractId: string
  title: string
  description: string
  priority: 'high' | 'critical'
  estimatedTime: string
  status: 'pending' | 'in_progress' | 'completed'
  assignee?: string
  dueDate?: string
}

export function MitigationPlan({ contracts }: MitigationPlanProps) {
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)

  // Générer des actions de mitigation mock
  const generateMitigationActions = (): MitigationAction[] => {
    const actions: MitigationAction[] = []
    
    contracts.forEach(contract => {
      if (contract.riskLevel === 'critical') {
        actions.push({
          id: `${contract.id}-1`,
          contractId: contract.id,
          title: 'Révision urgente des clauses',
          description: `Réviser immédiatement les clauses à risque du ${contract.name}`,
          priority: 'critical',
          estimatedTime: '2 heures',
          status: 'pending',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        actions.push({
          id: `${contract.id}-2`,
          contractId: contract.id,
          title: 'Consultation juridique',
          description: 'Obtenir l\'avis d\'un expert juridique sur les risques identifiés',
          priority: 'critical',
          estimatedTime: '1 heure',
          status: 'pending',
          dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        })
      } else {
        actions.push({
          id: `${contract.id}-1`,
          contractId: contract.id,
          title: 'Analyse approfondie',
          description: `Effectuer une analyse détaillée des risques pour ${contract.name}`,
          priority: 'high',
          estimatedTime: '3 heures',
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    })
    
    return actions
  }

  const [actions] = useState<MitigationAction[]>(generateMitigationActions())

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true)
    try {
      // Appeler le service pour générer un plan de mitigation
      const plan = await ContractRiskService.generateMitigationPlan(
        contracts.map(c => c.id)
      )
      console.log('Mitigation plan generated:', plan)
    } catch (error) {
      console.error('Error generating mitigation plan:', error)
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const handleSelectAction = (actionId: string) => {
    setSelectedActions(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    )
  }

  const criticalActions = actions.filter(a => a.priority === 'critical')
  const highActions = actions.filter(a => a.priority === 'high')
  const completedActions = actions.filter(a => a.status === 'completed').length
  const completionRate = (completedActions / actions.length) * 100

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actions Critiques</p>
                <p className="text-2xl font-bold">{criticalActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actions Prioritaires</p>
                <p className="text-2xl font-bold">{highActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progression</p>
                <div className="flex items-center gap-2">
                  <Progress value={completionRate} className="w-20" />
                  <span className="text-lg font-bold">{Math.round(completionRate)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for critical risks */}
      {criticalActions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalActions.length} actions critiques</strong> doivent être 
            traitées dans les 48 heures pour éviter des risques majeurs.
          </AlertDescription>
        </Alert>
      )}

      {/* Mitigation actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan d'Actions de Mitigation</CardTitle>
              <CardDescription>
                Actions recommandées pour réduire les risques identifiés
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
              >
                <Shield className="mr-2 h-4 w-4" />
                {isGeneratingPlan ? 'Génération...' : 'Générer avec IA'}
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="critical">
            <TabsList>
              <TabsTrigger value="critical">
                Critique ({criticalActions.length})
              </TabsTrigger>
              <TabsTrigger value="high">
                Prioritaire ({highActions.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                Toutes ({actions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="critical" className="space-y-4 mt-4">
              {criticalActions.map(action => (
                <ActionCard 
                  key={action.id}
                  action={action}
                  isSelected={selectedActions.includes(action.id)}
                  onSelect={() => handleSelectAction(action.id)}
                  contract={contracts.find(c => c.id === action.contractId)}
                />
              ))}
            </TabsContent>

            <TabsContent value="high" className="space-y-4 mt-4">
              {highActions.map(action => (
                <ActionCard 
                  key={action.id}
                  action={action}
                  isSelected={selectedActions.includes(action.id)}
                  onSelect={() => handleSelectAction(action.id)}
                  contract={contracts.find(c => c.id === action.contractId)}
                />
              ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-4">
              {actions.map(action => (
                <ActionCard 
                  key={action.id}
                  action={action}
                  isSelected={selectedActions.includes(action.id)}
                  onSelect={() => handleSelectAction(action.id)}
                  contract={contracts.find(c => c.id === action.contractId)}
                />
              ))}
            </TabsContent>
          </Tabs>

          {/* Bulk actions */}
          {selectedActions.length > 0 && (
            <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedActions.length} action{selectedActions.length > 1 ? 's' : ''} sélectionnée{selectedActions.length > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Send className="mr-2 h-3 w-3" />
                  Assigner
                </Button>
                <Button size="sm">
                  Démarrer les actions
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Action card component
function ActionCard({ 
  action, 
  isSelected, 
  onSelect,
  contract 
}: { 
  action: MitigationAction
  isSelected: boolean
  onSelect: () => void
  contract?: Contract
}) {
  return (
    <Card className={`${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <Badge 
                variant={action.priority === 'critical' ? 'destructive' : 'default'}
              >
                {action.priority === 'critical' ? 'Critique' : 'Prioritaire'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{contract?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{action.estimatedTime}</span>
              </div>
              {action.dueDate && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>
                    Échéance: {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}