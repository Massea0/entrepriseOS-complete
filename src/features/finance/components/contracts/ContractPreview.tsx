import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  Download, 
  Mail, 
  Save,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  User,
  Shield
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ContractPreviewProps {
  contract: {
    contractId: string
    content: string
    status: string
    formattedContent?: string
    metadata: {
      templateUsed: string
      generatedAt: string
      estimatedReadTime: number
      wordCount: number
    }
    warnings?: string[]
  }
  riskAnalysis?: {
    riskLevel: string
    riskScore: number
  }
  onSave: () => void
  onSend: () => void
}

export function ContractPreview({ contract, riskAnalysis, onSave, onSend }: ContractPreviewProps) {
  const getRiskBadge = () => {
    if (!riskAnalysis) return null
    
    const color = 
      riskAnalysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
      riskAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
      riskAnalysis.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
      'bg-red-100 text-red-800'
    
    return (
      <Badge className={color}>
        <Shield className="h-3 w-3 mr-1" />
        Risque {riskAnalysis.riskLevel} ({riskAnalysis.riskScore}/100)
      </Badge>
    )
  }

  const handleDownloadPDF = () => {
    // TODO: Implémenter le téléchargement PDF
    console.log('Download PDF')
  }

  const handleDownloadWord = () => {
    // TODO: Implémenter le téléchargement Word
    console.log('Download Word')
  }

  return (
    <div className="space-y-6">
      {/* Métadonnées */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Contrat Généré</CardTitle>
              <CardDescription>
                ID: {contract.contractId}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">
                {contract.metadata.wordCount} mots
              </Badge>
              <Badge variant="outline">
                ~{contract.metadata.estimatedReadTime} min de lecture
              </Badge>
              {getRiskBadge()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Template utilisé</p>
              <p className="font-medium">{contract.metadata.templateUsed}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Généré le</p>
              <p className="font-medium">
                {format(new Date(contract.metadata.generatedAt), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Statut</p>
              <Badge variant="secondary">{contract.status}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Format</p>
              <p className="font-medium">HTML</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avertissements */}
      {contract.warnings && contract.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Points d'attention :</p>
            <ul className="space-y-1">
              {contract.warnings.map((warning, index) => (
                <li key={index} className="text-sm">• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Aperçu du contrat */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Aperçu du Contrat</CardTitle>
          <CardDescription>
            Vérifiez le contenu avant de finaliser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border p-6">
            {contract.formattedContent ? (
              <div 
                dangerouslySetInnerHTML={{ __html: contract.formattedContent }}
                className="prose prose-sm max-w-none"
              />
            ) : (
              <div className="whitespace-pre-wrap font-mono text-sm">
                {contract.content}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Disponibles</CardTitle>
          <CardDescription>
            Choisissez comment procéder avec ce contrat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Téléchargement */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Télécharger</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadWord}>
                  <Download className="mr-2 h-4 w-4" />
                  Word
                </Button>
              </div>
            </div>

            {/* Actions principales */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Actions</h4>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
                <Button onClick={onSend}>
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer au client
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prochaines étapes */}
      <Alert>
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertDescription>
          <p className="font-medium mb-2">Prochaines étapes recommandées :</p>
          <ol className="space-y-1 text-sm">
            <li>1. Téléchargez une copie du contrat pour vos archives</li>
            <li>2. Envoyez le contrat au client pour signature</li>
            <li>3. Configurez des rappels de suivi dans le CRM</li>
            <li>4. Préparez les documents annexes si nécessaire</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  )
}