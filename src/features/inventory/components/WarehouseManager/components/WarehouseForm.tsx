import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

import { Warehouse } from '../../../types/inventory.types'
import { WarehouseFormData } from '../WarehouseManager.types'

const warehouseSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères').max(10, 'Le code ne peut pas dépasser 10 caractères'),
  type: z.enum(['main', 'satellite', 'distribution', 'transit']),
  address: z.object({
    street: z.string().min(1, 'L\'adresse est requise'),
    city: z.string().min(1, 'La ville est requise'),
    state: z.string().optional(),
    postalCode: z.string().min(1, 'Le code postal est requis'),
    country: z.string().min(1, 'Le pays est requis')
  }),
  contact: z.object({
    name: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    phone: z.string().optional()
  }),
  operatingHours: z.record(z.object({
    open: z.string(),
    close: z.string()
  })).optional(),
  configuration: z.object({
    enableBarcodeScanning: z.boolean().optional(),
    enableRFID: z.boolean().optional(),
    enableAutomatedPicking: z.boolean().optional(),
    defaultPickingStrategy: z.enum(['fifo', 'lifo', 'fefo', 'nearest']).optional()
  }).optional()
})

interface WarehouseFormProps {
  initialData?: Partial<Warehouse>
  onSubmit: (data: WarehouseFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const WAREHOUSE_TYPES = [
  { value: 'main', label: 'Principal' },
  { value: 'satellite', label: 'Satellite' },
  { value: 'distribution', label: 'Distribution' },
  { value: 'transit', label: 'Transit' }
]

const PICKING_STRATEGIES = [
  { value: 'fifo', label: 'FIFO (Premier entré, premier sorti)' },
  { value: 'lifo', label: 'LIFO (Dernier entré, premier sorti)' },
  { value: 'fefo', label: 'FEFO (Premier expiré, premier sorti)' },
  { value: 'nearest', label: 'Plus proche' }
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
}

export const WarehouseForm: React.FC<WarehouseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      type: initialData?.type || 'main',
      address: {
        street: initialData?.address?.street || '',
        city: initialData?.address?.city || '',
        state: initialData?.address?.state || '',
        postalCode: initialData?.address?.postalCode || '',
        country: initialData?.address?.country || 'France'
      },
      contact: {
        name: initialData?.contact?.name || '',
        email: initialData?.contact?.email || '',
        phone: initialData?.contact?.phone || ''
      },
      operatingHours: initialData?.operatingHours || {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '13:00' },
        sunday: { open: '', close: '' }
      },
      configuration: {
        enableBarcodeScanning: initialData?.configuration?.enableBarcodeScanning ?? true,
        enableRFID: initialData?.configuration?.enableRFID ?? false,
        enableAutomatedPicking: initialData?.configuration?.enableAutomatedPicking ?? false,
        defaultPickingStrategy: initialData?.configuration?.defaultPickingStrategy || 'fifo'
      }
    }
  })

  const configuration = watch('configuration')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="address">Adresse</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'entrepôt</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Entrepôt principal"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="WH001"
                className="uppercase"
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type d'entrepôt</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                {WAREHOUSE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Contact</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact.name">Nom du responsable</Label>
                <Input
                  id="contact.name"
                  {...register('contact.name')}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact.phone">Téléphone</Label>
                <Input
                  id="contact.phone"
                  {...register('contact.phone')}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact.email">Email</Label>
              <Input
                id="contact.email"
                type="email"
                {...register('contact.email')}
                placeholder="contact@entrepot.fr"
              />
              {errors.contact?.email && (
                <p className="text-sm text-destructive">{errors.contact.email.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address.street">Adresse</Label>
            <Textarea
              id="address.street"
              {...register('address.street')}
              placeholder="123 Rue de l'Industrie"
              rows={2}
            />
            {errors.address?.street && (
              <p className="text-sm text-destructive">{errors.address.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address.city">Ville</Label>
              <Input
                id="address.city"
                {...register('address.city')}
                placeholder="Paris"
              />
              {errors.address?.city && (
                <p className="text-sm text-destructive">{errors.address.city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.postalCode">Code postal</Label>
              <Input
                id="address.postalCode"
                {...register('address.postalCode')}
                placeholder="75001"
              />
              {errors.address?.postalCode && (
                <p className="text-sm text-destructive">{errors.address.postalCode.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address.state">Région/État</Label>
              <Input
                id="address.state"
                {...register('address.state')}
                placeholder="Île-de-France"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.country">Pays</Label>
              <Input
                id="address.country"
                {...register('address.country')}
                placeholder="France"
              />
              {errors.address?.country && (
                <p className="text-sm text-destructive">{errors.address.country.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Définissez les horaires d'ouverture de l'entrepôt
          </p>
          <div className="space-y-3">
            {DAYS.map(day => (
              <Card key={day} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <p className="font-medium">{DAY_LABELS[day]}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      {...register(`operatingHours.${day}.open` as any)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">à</span>
                    <Input
                      type="time"
                      {...register(`operatingHours.${day}.close` as any)}
                      className="w-32"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="barcode">Scanner de codes-barres</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le support des scanners de codes-barres
                  </p>
                </div>
                <Switch
                  id="barcode"
                  checked={configuration?.enableBarcodeScanning}
                  onCheckedChange={(checked) => setValue('configuration.enableBarcodeScanning', checked)}
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rfid">RFID</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le support des tags RFID
                  </p>
                </div>
                <Switch
                  id="rfid"
                  checked={configuration?.enableRFID}
                  onCheckedChange={(checked) => setValue('configuration.enableRFID', checked)}
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="automated">Picking automatisé</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le système de picking automatisé
                  </p>
                </div>
                <Switch
                  id="automated"
                  checked={configuration?.enableAutomatedPicking}
                  onCheckedChange={(checked) => setValue('configuration.enableAutomatedPicking', checked)}
                />
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="strategy">Stratégie de picking par défaut</Label>
              <Select
                value={configuration?.defaultPickingStrategy}
                onValueChange={(value) => setValue('configuration.defaultPickingStrategy', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une stratégie" />
                </SelectTrigger>
                <SelectContent>
                  {PICKING_STRATEGIES.map(strategy => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Enregistrement...
            </>
          ) : (
            initialData ? 'Mettre à jour' : 'Créer'
          )}
        </Button>
      </div>
    </form>
  )
}