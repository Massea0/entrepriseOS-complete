import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  Sparkles
} from 'lucide-react'
import { ContractGeneratorService } from '../../services/contract-generator.service'
import { ContractRiskService } from '../../services/contract-risk.service'
import { ContractTemplateSelector } from './ContractTemplateSelector'
import { ContractEditor } from './ContractEditor'
import { ContractRiskPanel } from './ContractRiskPanel'
import { ContractPreview } from './ContractPreview'
import type { Contract, ContractTemplate } from '../../types/contract.types'

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export function ContractWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [contractData, setContractData] = useState<any>({})
  const [generatedContract, setGeneratedContract] = useState<any>(null)
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const steps: WizardStep[] = [
    {
      id: 'template',
      title: 'Choisir un template',
      description: 'Sélectionnez un modèle de contrat',
      icon: <FileText className="h-5 w-5" />,
      completed: !!selectedTemplate
    },
    {
      id: 'customize',
      title: 'Personnaliser',
      description: 'Adaptez le contrat à vos besoins',
      icon: <Sparkles className="h-5 w-5" />,
      completed: Object.keys(contractData).length > 3
    },
    {
      id: 'risk',
      title: 'Analyse de risque',
      description: "Vérifiez les risques potentiels",
      icon: <AlertTriangle className="h-5 w-5" />,
      completed: !!riskAnalysis
    },
    {
      id: 'review',
      title: 'Révision finale',
      description: 'Vérifiez et finalisez',
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: false
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = async () => {
    if (currentStep === 1 && !generatedContract) {
      await generateContract()
    } else if (currentStep === 2 && generatedContract && !riskAnalysis) {
      await analyzeRisk()
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateContract = async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    try {
      const result = await ContractGeneratorService.generateContract({
        templateId: selectedTemplate.id,
        variables: {
          clientName: contractData.clientName || '',
          clientEmail: contractData.clientEmail || '',
          startDate: contractData.startDate || new Date().toISOString(),
          endDate: contractData.endDate,
          amount: contractData.amount || 0,
          currency: contractData.currency || 'EUR',
          paymentTerms: contractData.paymentTerms,
          deliverables: contractData.deliverables || [],
          specialClauses: contractData.specialClauses || []
        }
      })

      setGeneratedContract(result)
      toast({
        title: '✨ Contrat généré',
        description: 'Le contrat a été créé avec succès'
      })
    } catch (error) {
      console.error('Error generating contract:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le contrat',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const analyzeRisk = async () => {
    if (!generatedContract) return

    setIsAnalyzing(true)
    try {
      const analysis = await ContractRiskService.analyzeContractRisk({
        contractId: generatedContract.contractId,
        analysisType: 'all'
      })

      setRiskAnalysis(analysis)
      toast({
        title: '🔍 Analyse terminée',
        description: `Niveau de risque : ${analysis.riskLevel}`
      })
    } catch (error) {
      console.error('Error analyzing risk:', error)
      toast({
        title: 'Erreur',
        description: "Impossible d'analyser les risques",
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveContract = async () => {
    // TODO: Implémenter la sauvegarde
    toast({
      title: 'Contrat sauvegardé',
      description: 'Le contrat a été enregistré avec succès'
    })
  }

  const handleSendContract = async () => {
    // TODO: Implémenter l'envoi
    toast({
      title: 'Contrat envoyé',
      description: `Le contrat a été envoyé à ${contractData.clientEmail}`
    })
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Étape {currentStep + 1} sur {steps.length}
          </span>
          <span className="font-medium">
            {steps[currentStep].title}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps indicator */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <button
              onClick={() => index <= currentStep && setCurrentStep(index)}
              disabled={index > currentStep}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                index === currentStep
                  ? 'bg-primary text-primary-foreground border-primary'
                  : index < currentStep
                  ? 'bg-primary/20 text-primary border-primary'
                  : 'bg-muted text-muted-foreground border-muted'
              }`}
            >
              {step.icon}
            </button>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <ContractTemplateSelector
              onSelectTemplate={setSelectedTemplate}
              selectedTemplate={selectedTemplate}
            />
          )}
          
          {currentStep === 1 && selectedTemplate && (
            <ContractEditor
              template={selectedTemplate}
              data={contractData}
              onChange={setContractData}
              isGenerating={isGenerating}
            />
          )}
          
          {currentStep === 2 && generatedContract && (
            <ContractRiskPanel
              analysis={riskAnalysis}
              isAnalyzing={isAnalyzing}
              onReanalyze={analyzeRisk}
            />
          )}
          
          {currentStep === 3 && generatedContract && (
            <ContractPreview
              contract={generatedContract}
              riskAnalysis={riskAnalysis}
              onSave={handleSaveContract}
              onSend={handleSendContract}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        
        <div className="flex gap-2">
          {currentStep === steps.length - 1 ? (
            <>
              <Button variant="outline" onClick={handleSaveContract}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
              <Button onClick={handleSendContract}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 0 && !selectedTemplate) ||
                (currentStep === 1 && Object.keys(contractData).length < 3)
              }
            >
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}