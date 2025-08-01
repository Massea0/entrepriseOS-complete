// QuoteForm.tsx
// Formulaire de création et édition de devis

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  CalendarIcon,
  Plus,
  Sparkles,
  Save,
  Send,
  X,
  Euro,
  Building,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { CreateQuoteInput, UpdateQuoteInput, Quote, DiscountType, Currency } from '../../types'
import { QuoteFormItem } from './QuoteFormItem'
import { toast } from '@/hooks/use-toast'

const itemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, 'La description est requise'),
  quantity: z.number().min(1, 'La quantité doit être au moins 1'),
  unitPrice: z.number().min(0, 'Le prix doit être positif'),
  discount: z.number().min(0).max(100),
  discountType: z.enum(['percentage', 'fixed']),
  taxRate: z.number().min(0).max(100),
  total: z.number()
})

const formSchema = z.object({
  clientId: z.string().optional(),
  clientName: z.string().min(1, 'Le nom du client est requis'),
  clientEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  clientAddress: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional(),
  validUntil: z.date(),
  currency: z.string().default('EUR'),
  items: z.array(itemSchema).min(1, 'Au moins un article est requis'),
  taxRate: z.number().min(0).max(100).default(20),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  termsConditions: z.string().optional(),
  notes: z.string().optional(),
  useAI: z.boolean().default(false)
})

type FormData = z.infer<typeof formSchema>

interface QuoteFormProps {
  quote?: Quote
  onSubmit: (data: CreateQuoteInput | UpdateQuoteInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  clients?: Array<{ id: string; name: string; email?: string; phone?: string }>
}

const defaultItem = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  discountType: DiscountType.PERCENTAGE,
  taxRate: 20,
  total: 0
}

export function QuoteForm({
  quote,
  onSubmit,
  onCancel,
  isLoading,
  clients = []
}: QuoteFormProps) {
  const [items, setItems] = React.useState<Array<Omit<typeof defaultItem, 'id'>>>(
    quote?.items.map(({ id, ...item }) => item) || [defaultItem]
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: quote?.clientId,
      clientName: quote?.clientName || '',
      clientEmail: quote?.clientEmail || '',
      clientPhone: quote?.clientPhone || '',
      clientAddress: quote?.clientAddress,
      validUntil: quote?.validUntil || addDays(new Date(), 30),
      currency: quote?.currency || 'EUR',
      items: items,
      taxRate: quote?.taxRate || 20,
      discountType: quote?.discountType,
      discountValue: quote?.discountValue || 0,
      termsConditions: quote?.termsConditions || '',
      notes: quote?.notes || '',
      useAI: false
    }
  })

  const clientId = watch('clientId')
  const currency = watch('currency') as Currency

  // Mettre à jour les infos client quand on sélectionne un client
  React.useEffect(() => {
    if (clientId && clients.length > 0) {
      const client = clients.find(c => c.id === clientId)
      if (client) {
        setValue('clientName', client.name)
        setValue('clientEmail', client.email || '')
        setValue('clientPhone', client.phone || '')
      }
    }
  }, [clientId, clients, setValue])

  const addItem = () => {
    setItems([...items, { ...defaultItem }])
  }

  const updateItem = (index: number, item: Omit<typeof defaultItem, 'id'>) => {
    const updatedItems = [...items]
    updatedItems[index] = item
    setItems(updatedItems)
    setValue('items', updatedItems)
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index)
      setItems(updatedItems)
      setValue('items', updatedItems)
    }
  }

  const onFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit({
        ...data,
        items: items
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde',
        variant: 'destructive'
      })
    }
  })

  // Calculs des totaux
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const discountAmount = watch('discountType') === 'percentage'
    ? subtotal * ((watch('discountValue') || 0) / 100)
    : (watch('discountValue') || 0)
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * ((watch('taxRate') || 20) / 100)
  const total = afterDiscount + taxAmount

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informations client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clients.length > 0 && (
            <div>
              <Label>Client existant</Label>
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nouveau client</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">
                <User className="inline h-4 w-4 mr-1" />
                Nom du client *
              </Label>
              <Input
                id="clientName"
                {...register('clientName')}
                className={cn('mt-1', errors.clientName && 'border-red-500')}
              />
              {errors.clientName && (
                <p className="text-sm text-red-500 mt-1">{errors.clientName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clientEmail">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </Label>
              <Input
                id="clientEmail"
                type="email"
                {...register('clientEmail')}
                className={cn('mt-1', errors.clientEmail && 'border-red-500')}
              />
              {errors.clientEmail && (
                <p className="text-sm text-red-500 mt-1">{errors.clientEmail.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clientPhone">
                <Phone className="inline h-4 w-4 mr-1" />
                Téléphone
              </Label>
              <Input
                id="clientPhone"
                {...register('clientPhone')}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Date de validité *</Label>
              <Controller
                control={control}
                name="validUntil"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal mt-1',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'dd MMMM yyyy', { locale: fr }) : 'Sélectionner'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <QuoteFormItem
              key={index}
              item={item}
              index={index}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un article
          </Button>
        </CardContent>
      </Card>

      {/* Totaux */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Remise</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>TVA ({watch('taxRate')}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total TTC</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes et conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Notes et conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="termsConditions">Conditions générales</Label>
            <Textarea
              id="termsConditions"
              {...register('termsConditions')}
              placeholder="Conditions de paiement, délais de livraison..."
              className="mt-1"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes pour usage interne..."
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
        )}

        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {quote ? 'Mettre à jour' : 'Créer'} le devis
        </Button>
      </div>
    </form>
  )
}