import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FileText, 
  Search, 
  Star, 
  Shield, 
  Package,
  Briefcase,
  Clock,
  Sparkles
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ContractTemplate } from '../../types/contract.types'

interface ContractTemplateSelectorProps {
  onSelectTemplate: (template: ContractTemplate) => void
  selectedTemplate: ContractTemplate | null
}

const mockTemplates: ContractTemplate[] = [
  {
    id: '1',
    name: 'Contrat de Service Standard',
    description: 'Template polyvalent pour prestations de services',
    type: 'service',
    content: '',
    sections: [],
    variables: {},
    requiredVariables: ['clientName', 'startDate', 'amount'],
    legalCompliance: 'standard',
    aiGenerated: false,
    popularity: 85,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Contrat de Développement Logiciel',
    description: 'Spécialisé pour projets de développement IT',
    type: 'service',
    content: '',
    sections: [],
    variables: {},
    requiredVariables: ['clientName', 'projectName', 'deliverables', 'deadline'],
    legalCompliance: 'premium',
    aiGenerated: true,
    popularity: 92,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Contrat de Vente de Produits',
    description: 'Pour la vente de biens et marchandises',
    type: 'product',
    content: '',
    sections: [],
    variables: {},
    requiredVariables: ['clientName', 'products', 'deliveryDate', 'amount'],
    legalCompliance: 'standard',
    aiGenerated: false,
    popularity: 78,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Contrat d\'Abonnement SaaS',
    description: 'Pour services en ligne avec facturation récurrente',
    type: 'subscription',
    content: '',
    sections: [],
    variables: {},
    requiredVariables: ['clientName', 'subscriptionPlan', 'monthlyFee', 'startDate'],
    legalCompliance: 'premium',
    aiGenerated: true,
    popularity: 88,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export function ContractTemplateSelector({ onSelectTemplate, selectedTemplate }: ContractTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ContractTemplate[]>(mockTemplates)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || template.type === filterType
    return matchesSearch && matchesType
  })

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Briefcase className="h-5 w-5" />
      case 'product':
        return <Package className="h-5 w-5" />
      case 'subscription':
        return <Clock className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getComplianceBadge = (level: string) => {
    switch (level) {
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      case 'standard':
        return <Badge variant="secondary">Standard</Badge>
      default:
        return <Badge variant="outline">Basique</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(null)}
          >
            Tous
          </Button>
          <Button
            variant={filterType === 'service' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('service')}
          >
            Services
          </Button>
          <Button
            variant={filterType === 'product' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('product')}
          >
            Produits
          </Button>
          <Button
            variant={filterType === 'subscription' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('subscription')}
          >
            Abonnements
          </Button>
        </div>
      </div>

      {/* Templates list */}
      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pr-4">
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id ? 'border-primary ring-1 ring-primary' : ''
                }`}
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTemplateIcon(template.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {template.name}
                          {template.aiGenerated && (
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              IA
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    {getComplianceBadge(template.legalCompliance)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{template.popularity}%</span>
                        <span className="text-muted-foreground">popularité</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">Vérifié juridiquement</span>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {template.requiredVariables.length} champs requis
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* AI Generation option */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Sparkles className="h-8 w-8 mx-auto text-purple-500" />
            <h3 className="font-semibold">Créer un template personnalisé avec l'IA</h3>
            <p className="text-sm text-muted-foreground">
              Décrivez vos besoins et l'IA générera un template sur mesure
            </p>
            <Button variant="outline" className="mt-4">
              Générer avec l'IA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}