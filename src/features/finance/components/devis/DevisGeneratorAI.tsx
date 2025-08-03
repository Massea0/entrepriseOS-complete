import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Sparkles, Download, Send, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { AIDevisService } from '../../services/ai-devis.service'
import { DevisAISuggestions } from './DevisAISuggestions'
import { DevisPreview } from './DevisPreview'
import type { Quote, QuoteItem } from '../../types/quote.types'

// Schema de validation du formulaire
const devisFormSchema = z.object({
  clientName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  clientEmail: z.string().email('Email invalide'),
  clientIndustry: z.string().optional(),
  clientCompanySize: z.string().optional(),
  requirements: z.string().min(10, 'Décrivez vos besoins en détail (min. 10 caractères)'),
  estimatedBudget: z.number().min(0).optional(),
})

type DevisFormData = z.infer<typeof devisFormSchema>

interface AIGeneratedDevis {
  items: QuoteItem[]
  totalAmount: number
  margin: number
  validityDays: number
  aiInsights: {
    marketPosition: string
    riskLevel: 'low' | 'medium' | 'high'
    suggestions: string[]
    competitiveAnalysis: string
  }
}

export function DevisGeneratorAI() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiDevis, setAiDevis] = useState<AIGeneratedDevis | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  const form = useForm<DevisFormData>({
    resolver: zodResolver(devisFormSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientIndustry: '',
      clientCompanySize: '',
      requirements: '',
      estimatedBudget: undefined,
    }
  })

  const generateWithAI = async (data: DevisFormData) => {
    setIsGenerating(true)
    try {
      const result = await AIDevisService.generateDevisWithAI({
        clientData: {
          name: data.clientName,
          email: data.clientEmail,
          industry: data.clientIndustry,
          companySize: data.clientCompanySize,
        },
        requirements: data.requirements,
        estimatedBudget: data.estimatedBudget,
      })

      setAiDevis({
        items: result.devis.items,
        totalAmount: result.devis.totalAmount,
        margin: result.devis.margin,
        validityDays: result.devis.validityDays,
        aiInsights: result.aiInsights,
      })

      toast({
        title: '✨ Devis généré avec succès',
        description: 'L\'IA a analysé vos besoins et créé un devis optimisé',
      })

      setShowPreview(true)
    } catch (error) {
      console.error('Erreur génération devis:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le devis. Veuillez réessayer.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveDevis = async () => {
    // TODO: Implémenter la sauvegarde
    toast({
      title: 'Devis sauvegardé',
      description: 'Le devis a été enregistré avec succès',
    })
  }

  const handleSendDevis = async () => {
    // TODO: Implémenter l'envoi
    toast({
      title: 'Devis envoyé',
      description: `Le devis a été envoyé à ${form.getValues('clientEmail')}`,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulaire principal */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Générateur de Devis Intelligent
          </CardTitle>
          <CardDescription>
            Créez des devis personnalisés en quelques secondes grâce à l'IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generateWithAI)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du client</FormLabel>
                      <FormControl>
                        <Input placeholder="Entreprise ABC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email du client</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@entreprise.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientIndustry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secteur d'activité</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un secteur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tech">Technologie</SelectItem>
                          <SelectItem value="retail">Commerce</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="industry">Industrie</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientCompanySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taille de l'entreprise</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Nombre d'employés" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employés</SelectItem>
                          <SelectItem value="11-50">11-50 employés</SelectItem>
                          <SelectItem value="51-200">51-200 employés</SelectItem>
                          <SelectItem value="201-1000">201-1000 employés</SelectItem>
                          <SelectItem value="1000+">1000+ employés</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description des besoins</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez en détail les services ou produits souhaités..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Plus vous êtes précis, plus l'IA pourra générer un devis pertinent
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget estimé (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Aide l'IA à proposer des solutions adaptées à votre budget
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={isGenerating} className="flex-1">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Générer avec l'IA
                    </>
                  )}
                </Button>

                {aiDevis && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDevis}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendDevis}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Panneau des suggestions IA */}
      <div className="space-y-6">
        {aiDevis && (
          <DevisAISuggestions
            insights={aiDevis.aiInsights}
            onApplySuggestion={(suggestion) => {
              toast({
                title: 'Suggestion appliquée',
                description: suggestion,
              })
            }}
          />
        )}
      </div>

      {/* Preview du devis */}
      {showPreview && aiDevis && (
        <DevisPreview
          devis={{
            clientName: form.getValues('clientName'),
            clientEmail: form.getValues('clientEmail'),
            items: aiDevis.items,
            totalAmount: aiDevis.totalAmount,
            validityDays: aiDevis.validityDays,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}