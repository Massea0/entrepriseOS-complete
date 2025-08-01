// QuoteFormItem.tsx
// Composant pour un article de devis dans le formulaire

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { X, GripVertical } from 'lucide-react'
import { QuoteItem, DiscountType } from '../../types'
import { cn } from '@/lib/utils'

interface QuoteFormItemProps {
  item: Omit<QuoteItem, 'id'>
  index: number
  onUpdate: (index: number, item: Omit<QuoteItem, 'id'>) => void
  onRemove: (index: number) => void
  className?: string
  isDragging?: boolean
}

export function QuoteFormItem({
  item,
  index,
  onUpdate,
  onRemove,
  className,
  isDragging
}: QuoteFormItemProps) {
  const updateField = <K extends keyof Omit<QuoteItem, 'id'>>(
    field: K,
    value: Omit<QuoteItem, 'id'>[K]
  ) => {
    const updatedItem = { ...item, [field]: value }
    
    // Recalculer le total
    const subtotal = updatedItem.quantity * updatedItem.unitPrice
    const discountAmount = updatedItem.discountType === DiscountType.PERCENTAGE
      ? subtotal * (updatedItem.discount / 100)
      : updatedItem.discount
    const afterDiscount = subtotal - discountAmount
    const taxAmount = afterDiscount * (updatedItem.taxRate / 100)
    updatedItem.total = afterDiscount + taxAmount
    
    onUpdate(index, updatedItem)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all',
        isDragging && 'opacity-50',
        className
      )}
    >
      {/* Poignée de déplacement */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Bouton supprimer */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="space-y-4 pl-8">
        {/* Description */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={item.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Description de l'article"
            className="mt-1 min-h-[60px]"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Quantité */}
          <div>
            <label className="text-sm font-medium">Quantité</label>
            <Input
              type="number"
              min="1"
              step="1"
              value={item.quantity}
              onChange={(e) => updateField('quantity', Number(e.target.value))}
              className="mt-1"
            />
          </div>

          {/* Prix unitaire */}
          <div>
            <label className="text-sm font-medium">Prix unitaire</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unitPrice}
              onChange={(e) => updateField('unitPrice', Number(e.target.value))}
              className="mt-1"
            />
          </div>

          {/* Type de remise */}
          <div>
            <label className="text-sm font-medium">Type remise</label>
            <Select
              value={item.discountType}
              onValueChange={(value) => updateField('discountType', value as DiscountType)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DiscountType.PERCENTAGE}>%</SelectItem>
                <SelectItem value={DiscountType.FIXED}>€</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valeur de remise */}
          <div>
            <label className="text-sm font-medium">Remise</label>
            <Input
              type="number"
              min="0"
              step={item.discountType === DiscountType.PERCENTAGE ? "1" : "0.01"}
              value={item.discount}
              onChange={(e) => updateField('discount', Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Taux de TVA */}
          <div>
            <label className="text-sm font-medium">TVA (%)</label>
            <Select
              value={item.taxRate.toString()}
              onValueChange={(value) => updateField('taxRate', Number(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5.5">5.5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sous-total */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Sous-total</label>
            <div className="mt-1 flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
              {formatCurrency(item.quantity * item.unitPrice)}
            </div>
          </div>

          {/* Total */}
          <div>
            <label className="text-sm font-medium">Total</label>
            <div className="mt-1 flex h-10 items-center rounded-md border bg-background px-3 text-sm font-medium">
              {formatCurrency(item.total)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}