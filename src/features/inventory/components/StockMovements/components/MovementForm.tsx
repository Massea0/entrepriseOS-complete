import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Spinner } from '@/components/ui/spinner'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { InventoryService } from '../../../services/inventory.service'
import { MovementFormData } from '../StockMovements.types'

const movementSchema = z.object({
  type: z.enum(['in', 'out', 'transfer', 'adjustment', 'return', 'damage', 'theft', 'count', 'correction', 'assembly', 'disassembly']),
  productId: z.string().min(1, 'Le produit est requis'),
  quantity: z.number().positive('La quantité doit être positive'),
  fromWarehouseId: z.string().optional(),
  fromZoneId: z.string().optional(),
  fromPositionId: z.string().optional(),
  toWarehouseId: z.string().optional(),
  toZoneId: z.string().optional(),
  toPositionId: z.string().optional(),
  reason: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  scheduledDate: z.date().optional()
}).refine((data) => {
  // Validation rules based on movement type
  if (data.type === 'transfer') {
    return data.fromWarehouseId && data.toWarehouseId
  }
  if (data.type === 'in') {
    return data.toWarehouseId
  }
  if (data.type === 'out') {
    return data.fromWarehouseId
  }
  return true
}, {
  message: 'Les entrepôts source et destination sont requis pour ce type de mouvement'
})

interface MovementFormProps {
  initialData?: Partial<MovementFormData>
  onSubmit: (data: MovementFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const MOVEMENT_TYPES = [
  { value: 'in', label: 'Entrée' },
  { value: 'out', label: 'Sortie' },
  { value: 'transfer', label: 'Transfert' },
  { value: 'adjustment', label: 'Ajustement' },
  { value: 'return', label: 'Retour' },
  { value: 'damage', label: 'Dommage' },
  { value: 'theft', label: 'Vol' },
  { value: 'count', label: 'Comptage' },
  { value: 'correction', label: 'Correction' }
]

const MOVEMENT_REASONS = {
  adjustment: [
    'Inventaire physique',
    'Correction d\'erreur',
    'Écart constaté'
  ],
  damage: [
    'Produit endommagé',
    'Défaut de fabrication',
    'Accident de manutention'
  ],
  return: [
    'Retour client',
    'Retour fournisseur',
    'Non-conformité'
  ]
}

export const MovementForm: React.FC<MovementFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [selectedFromWarehouse, setSelectedFromWarehouse] = useState<string>('')
  const [selectedToWarehouse, setSelectedToWarehouse] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: initialData?.type || 'in',
      productId: initialData?.productId || '',
      quantity: initialData?.quantity || 1,
      fromWarehouseId: initialData?.fromWarehouseId || '',
      fromZoneId: initialData?.fromZoneId || '',
      fromPositionId: initialData?.fromPositionId || '',
      toWarehouseId: initialData?.toWarehouseId || '',
      toZoneId: initialData?.toZoneId || '',
      toPositionId: initialData?.toPositionId || '',
      reason: initialData?.reason || '',
      reference: initialData?.reference || '',
      notes: initialData?.notes || '',
      scheduledDate: initialData?.scheduledDate
    }
  })

  const movementType = watch('type')
  const productId = watch('productId')

  // Fetch data
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => InventoryService.getProducts()
  })

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => InventoryService.getWarehouses()
  })

  const { data: fromZones } = useQuery({
    queryKey: ['zones', selectedFromWarehouse],
    queryFn: () => InventoryService.getWarehouseZones(selectedFromWarehouse),
    enabled: !!selectedFromWarehouse
  })

  const { data: toZones } = useQuery({
    queryKey: ['zones', selectedToWarehouse],
    queryFn: () => InventoryService.getWarehouseZones(selectedToWarehouse),
    enabled: !!selectedToWarehouse
  })

  // Update warehouse selections
  useEffect(() => {
    const fromWarehouseId = watch('fromWarehouseId')
    if (fromWarehouseId) setSelectedFromWarehouse(fromWarehouseId)
  }, [watch('fromWarehouseId')])

  useEffect(() => {
    const toWarehouseId = watch('toWarehouseId')
    if (toWarehouseId) setSelectedToWarehouse(toWarehouseId)
  }, [watch('toWarehouseId')])

  // Get current stock for selected product
  const { data: stockLevels } = useQuery({
    queryKey: ['stock-levels', productId],
    queryFn: () => InventoryService.getStockLevels({ productId }),
    enabled: !!productId
  })

  const showFromLocation = ['out', 'transfer', 'adjustment', 'damage', 'theft'].includes(movementType)
  const showToLocation = ['in', 'transfer', 'return'].includes(movementType)
  const showReason = ['adjustment', 'damage', 'theft', 'return'].includes(movementType)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type de mouvement</Label>
          <Select
            value={watch('type')}
            onValueChange={(value) => setValue('type', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {MOVEMENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Référence</Label>
          <Input
            id="reference"
            {...register('reference')}
            placeholder="REF-001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="productId">Produit</Label>
        <Select
          value={watch('productId')}
          onValueChange={(value) => setValue('productId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un produit" />
          </SelectTrigger>
          <SelectContent>
            {products?.data?.map((product: any) => (
              <SelectItem key={product.id} value={product.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{product.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{product.sku}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.productId && (
          <p className="text-sm text-destructive">{errors.productId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantité</Label>
        <Input
          id="quantity"
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          placeholder="1"
        />
        {errors.quantity && (
          <p className="text-sm text-destructive">{errors.quantity.message}</p>
        )}
        {stockLevels?.data && productId && (
          <p className="text-sm text-muted-foreground">
            Stock actuel : {stockLevels.data.reduce((sum: number, level: any) => sum + level.quantity, 0)} unités
          </p>
        )}
      </div>

      {/* From Location */}
      {showFromLocation && (
        <Card className="p-4 space-y-4">
          <h4 className="font-medium">Emplacement source</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromWarehouseId">Entrepôt</Label>
              <Select
                value={watch('fromWarehouseId')}
                onValueChange={(value) => {
                  setValue('fromWarehouseId', value)
                  setValue('fromZoneId', '')
                  setValue('fromPositionId', '')
                  setSelectedFromWarehouse(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.data?.map((warehouse: any) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromZoneId">Zone</Label>
              <Select
                value={watch('fromZoneId')}
                onValueChange={(value) => setValue('fromZoneId', value)}
                disabled={!selectedFromWarehouse}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {fromZones?.data?.map((zone: any) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromPositionId">Position</Label>
              <Input
                id="fromPositionId"
                {...register('fromPositionId')}
                placeholder="A-1-1"
                disabled={!watch('fromZoneId')}
              />
            </div>
          </div>
        </Card>
      )}

      {/* To Location */}
      {showToLocation && (
        <Card className="p-4 space-y-4">
          <h4 className="font-medium">Emplacement destination</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="toWarehouseId">Entrepôt</Label>
              <Select
                value={watch('toWarehouseId')}
                onValueChange={(value) => {
                  setValue('toWarehouseId', value)
                  setValue('toZoneId', '')
                  setValue('toPositionId', '')
                  setSelectedToWarehouse(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.data?.map((warehouse: any) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toZoneId">Zone</Label>
              <Select
                value={watch('toZoneId')}
                onValueChange={(value) => setValue('toZoneId', value)}
                disabled={!selectedToWarehouse}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {toZones?.data?.map((zone: any) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toPositionId">Position</Label>
              <Input
                id="toPositionId"
                {...register('toPositionId')}
                placeholder="B-2-3"
                disabled={!watch('toZoneId')}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Reason */}
      {showReason && (
        <div className="space-y-2">
          <Label htmlFor="reason">Raison</Label>
          <Select
            value={watch('reason')}
            onValueChange={(value) => setValue('reason', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une raison" />
            </SelectTrigger>
            <SelectContent>
              {MOVEMENT_REASONS[movementType as keyof typeof MOVEMENT_REASONS]?.map((reason: string) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
              <SelectItem value="other">Autre (préciser dans les notes)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="scheduledDate">Date planifiée</Label>
        <DatePicker
          date={watch('scheduledDate')}
          onDateChange={(date) => setValue('scheduledDate', date)}
          placeholder="Sélectionnez une date"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Notes additionnelles..."
          rows={3}
        />
      </div>

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
              Création...
            </>
          ) : (
            'Créer le mouvement'
          )}
        </Button>
      </div>
    </form>
  )
}