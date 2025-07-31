import React, { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Package, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { OrderReceivingProps, ReceiveItemData } from '../PurchaseOrderManagement.types'

interface ReceivingForm {
  items: ReceiveItemData[]
  receivingNotes?: string
}

const CONDITION_OPTIONS = [
  { value: 'good', label: 'Bon état', color: 'text-green-600 bg-green-100' },
  { value: 'damaged', label: 'Endommagé', color: 'text-orange-600 bg-orange-100' },
  { value: 'rejected', label: 'Rejeté', color: 'text-red-600 bg-red-100' }
]

export const OrderReceiving: React.FC<OrderReceivingProps> = ({
  order,
  onReceive,
  onCancel,
  warehouses,
  isLoading = false
}) => {
  const [showSerialNumbers, setShowSerialNumbers] = useState<Record<string, boolean>>({})

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ReceivingForm>({
    defaultValues: {
      items: order.items?.map(item => ({
        itemId: item.id,
        receivedQuantity: item.quantity - (item.receivedQuantity || 0),
        condition: 'good',
        lotNumber: '',
        serialNumbers: [],
        notes: ''
      })) || []
    }
  })

  const { fields } = useFieldArray({
    control,
    name: 'items'
  })

  const watchedItems = watch('items')

  // Calculate totals
  const totals = React.useMemo(() => {
    const totalOrdered = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const totalAlreadyReceived = order.items?.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0) || 0
    const totalReceiving = watchedItems.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0)
    const totalAfterReceiving = totalAlreadyReceived + totalReceiving

    return {
      totalOrdered,
      totalAlreadyReceived,
      totalReceiving,
      totalAfterReceiving,
      percentageComplete: totalOrdered > 0 ? (totalAfterReceiving / totalOrdered) * 100 : 0
    }
  }, [order.items, watchedItems])

  const handleFormSubmit = (data: ReceivingForm) => {
    // Filter out items with 0 received quantity
    const itemsToReceive = data.items.filter(item => item.receivedQuantity > 0)
    onReceive(itemsToReceive)
  }

  const handleSerialNumbersChange = (itemId: string, value: string) => {
    const index = fields.findIndex(f => f.itemId === itemId)
    if (index !== -1) {
      const serialNumbers = value.split(',').map(s => s.trim()).filter(s => s)
      setValue(`items.${index}.serialNumbers`, serialNumbers)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Order Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Commande</p>
            <p className="font-mono">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fournisseur</p>
            <p>{order.supplier?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Entrepôt</p>
            <p>{order.warehouse?.name}</p>
          </div>
        </div>
      </Card>

      {/* Reception Progress */}
      <Card className="p-4">
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Progression de la réception
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Déjà reçu</span>
              <span>{totals.totalAlreadyReceived} / {totals.totalOrdered} unités</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>En cours de réception</span>
              <span className="text-primary">{totals.totalReceiving} unités</span>
            </div>
            <Progress value={totals.percentageComplete} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {totals.percentageComplete.toFixed(0)}% complété après cette réception
            </p>
          </div>
        </div>
      </Card>

      {/* Items to Receive */}
      <div className="space-y-4">
        <h4 className="font-medium">Articles à réceptionner</h4>
        {fields.map((field, index) => {
          const orderItem = order.items?.find(item => item.id === field.itemId)
          if (!orderItem) return null

          const remainingQuantity = orderItem.quantity - (orderItem.receivedQuantity || 0)
          const hasSerialTracking = orderItem.product?.trackingType === 'serial'
          const hasLotTracking = orderItem.product?.trackingType === 'lot'

          return (
            <Card key={field.id} className="p-4">
              <div className="space-y-4">
                {/* Product Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium">{orderItem.product?.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {orderItem.product?.sku}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Commandé: {orderItem.quantity} {orderItem.product?.unitOfMeasure}
                      </span>
                      {orderItem.receivedQuantity > 0 && (
                        <span className="text-sm text-muted-foreground">
                          • Déjà reçu: {orderItem.receivedQuantity}
                        </span>
                      )}
                      <span className="text-sm font-medium text-primary">
                        • Reste: {remainingQuantity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Receiving Fields */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.receivedQuantity`}>
                      Quantité reçue
                    </Label>
                    <Input
                      type="number"
                      {...register(`items.${index}.receivedQuantity`, { 
                        valueAsNumber: true,
                        min: 0,
                        max: remainingQuantity
                      })}
                      min="0"
                      max={remainingQuantity}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.condition`}>
                      État
                    </Label>
                    <Select
                      value={watch(`items.${index}.condition`)}
                      onValueChange={(value) => setValue(`items.${index}.condition`, value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className={cn('text-xs', option.color)}>
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {hasLotTracking && (
                    <div>
                      <Label htmlFor={`items.${index}.lotNumber`}>
                        N° de lot
                      </Label>
                      <Input
                        {...register(`items.${index}.lotNumber`)}
                        placeholder="LOT-001"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor={`items.${index}.expirationDate`}>
                      Date d'expiration
                    </Label>
                    <DatePicker
                      date={watch(`items.${index}.expirationDate`)}
                      onDateChange={(date) => setValue(`items.${index}.expirationDate`, date)}
                      placeholder="Optionnel"
                    />
                  </div>
                </div>

                {/* Serial Numbers */}
                {hasSerialTracking && watch(`items.${index}.receivedQuantity`) > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Numéros de série</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSerialNumbers({
                          ...showSerialNumbers,
                          [field.itemId]: !showSerialNumbers[field.itemId]
                        })}
                      >
                        {showSerialNumbers[field.itemId] ? 'Masquer' : 'Afficher'}
                      </Button>
                    </div>
                    {showSerialNumbers[field.itemId] && (
                      <Textarea
                        placeholder="Entrez les numéros de série séparés par des virgules"
                        onChange={(e) => handleSerialNumbersChange(field.itemId, e.target.value)}
                        rows={2}
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {watch(`items.${index}.serialNumbers`)?.length || 0} / {watch(`items.${index}.receivedQuantity`)} numéros saisis
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <Label htmlFor={`items.${index}.notes`}>
                    Notes (optionnel)
                  </Label>
                  <Input
                    {...register(`items.${index}.notes`)}
                    placeholder="Observations sur la réception..."
                  />
                </div>

                {/* Condition Warning */}
                {watch(`items.${index}.condition`) !== 'good' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Les articles {watch(`items.${index}.condition`) === 'damaged' ? 'endommagés' : 'rejetés'} 
                      seront signalés et pourront nécessiter un retour fournisseur.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* General Notes */}
      <div className="space-y-2">
        <Label htmlFor="receivingNotes">Notes générales de réception</Label>
        <Textarea
          id="receivingNotes"
          {...register('receivingNotes')}
          placeholder="Observations générales sur la livraison..."
          rows={3}
        />
      </div>

      {/* Summary */}
      {totals.totalReceiving > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Vous allez réceptionner {totals.totalReceiving} unités sur {totals.totalOrdered - totals.totalAlreadyReceived} restantes.
            {totals.percentageComplete === 100 && ' Cette réception complètera la commande.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || totals.totalReceiving === 0}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Réception en cours...
            </>
          ) : (
            <>
              <Package className="h-4 w-4 mr-2" />
              Confirmer la réception
            </>
          )}
        </Button>
      </div>
    </form>
  )
}