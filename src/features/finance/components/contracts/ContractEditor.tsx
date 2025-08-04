import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Plus, X, Loader2 } from 'lucide-react'
import type { ContractTemplate } from '../../types/contract.types'

interface ContractEditorProps {
  template: ContractTemplate
  data: any
  onChange: (data: any) => void
  isGenerating?: boolean
}

const contractSchema = z.object({
  clientName: z.string().min(2, 'Le nom du client est requis'),
  clientEmail: z.string().email('Email invalide'),
  clientAddress: z.string().optional(),
  clientPhone: z.string().optional(),
  startDate: z.date({
    required_error: "La date de début est requise"
  }),
  endDate: z.date().optional(),
  amount: z.number().min(0, 'Le montant doit être positif'),
  currency: z.string().default('EUR'),
  paymentTerms: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  specialClauses: z.array(z.string()).optional(),
})

type ContractFormData = z.infer<typeof contractSchema>

export function ContractEditor({ template, data, onChange, isGenerating }: ContractEditorProps) {
  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      clientName: data.clientName || '',
      clientEmail: data.clientEmail || '',
      clientAddress: data.clientAddress || '',
      clientPhone: data.clientPhone || '',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      amount: data.amount || 0,
      currency: data.currency || 'EUR',
      paymentTerms: data.paymentTerms || '30 jours après réception de facture',
      deliverables: data.deliverables || [],
      specialClauses: data.specialClauses || [],
    }
  })

  const deliverables = form.watch('deliverables') || []
  const specialClauses = form.watch('specialClauses') || []

  const handleAddDeliverable = () => {
    const current = form.getValues('deliverables') || []
    form.setValue('deliverables', [...current, ''])
  }

  const handleRemoveDeliverable = (index: number) => {
    const current = form.getValues('deliverables') || []
    form.setValue('deliverables', current.filter((_, i) => i !== index))
  }

  const handleAddClause = () => {
    const current = form.getValues('specialClauses') || []
    form.setValue('specialClauses', [...current, ''])
  }

  const handleRemoveClause = (index: number) => {
    const current = form.getValues('specialClauses') || []
    form.setValue('specialClauses', current.filter((_, i) => i !== index))
  }

  // Update parent data on form change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onChange(value)
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Informations client */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Client</CardTitle>
            <CardDescription>
              Détails du client pour le contrat
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@entreprise.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="123 rue Example" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+33 1 23 45 67 89" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Détails du contrat */}
        <Card>
          <CardHeader>
            <CardTitle>Détails du Contrat</CardTitle>
            <CardDescription>
              Conditions et modalités du contrat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de fin (optionnelle)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < form.getValues('startDate')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant total</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Devise</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditions de paiement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="30 jours après réception de facture..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Livrables */}
        <Card>
          <CardHeader>
            <CardTitle>Livrables</CardTitle>
            <CardDescription>
              Listez les livrables ou services à fournir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {deliverables.map((_, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`deliverables.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Description du livrable" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveDeliverable(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDeliverable}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un livrable
            </Button>
          </CardContent>
        </Card>

        {/* Clauses spéciales */}
        <Card>
          <CardHeader>
            <CardTitle>Clauses Spéciales</CardTitle>
            <CardDescription>
              Ajoutez des clauses personnalisées si nécessaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {specialClauses.map((_, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`specialClauses.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="Détail de la clause..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveClause(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddClause}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une clause
            </Button>
          </CardContent>
        </Card>

        {isGenerating && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Génération du contrat en cours...</span>
          </div>
        )}
      </form>
    </Form>
  )
}