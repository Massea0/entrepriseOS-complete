import React from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import { MovementFiltersPanelProps } from '../StockMovements.types'

const MOVEMENT_TYPES = [
  { value: 'all', label: 'Tous les types' },
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

const MOVEMENT_STATUSES = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'partial', label: 'Partiel' },
  { value: 'completed', label: 'Complété' }
]

export const MovementFiltersPanel: React.FC<MovementFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  warehouses = [],
  products = [],
  showAdvanced = true,
  onReset,
  className
}) => {
  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => key !== 'search' && value && value !== 'all')
    .length

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type">Type de mouvement</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value as any })}
          >
            <SelectTrigger id="type">
              <SelectValue />
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

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOVEMENT_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Warehouse Filter */}
        <div className="space-y-2">
          <Label htmlFor="warehouse">Entrepôt</Label>
          <Select
            value={filters.warehouseId || ''}
            onValueChange={(value) => onFiltersChange({ ...filters, warehouseId: value || undefined })}
          >
            <SelectTrigger id="warehouse">
              <SelectValue placeholder="Tous les entrepôts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les entrepôts</SelectItem>
              {warehouses.map((warehouse: any) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product Filter */}
        {showAdvanced && (
          <>
            <div className="space-y-2">
              <Label htmlFor="product">Produit</Label>
              <Select
                value={filters.productId || ''}
                onValueChange={(value) => onFiltersChange({ ...filters, productId: value || undefined })}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Tous les produits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les produits</SelectItem>
                  {products.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{product.sku}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date de début</Label>
              <DatePicker
                date={filters.dateFrom}
                onDateChange={(date) => onFiltersChange({ ...filters, dateFrom: date })}
                placeholder="Sélectionnez une date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Date de fin</Label>
              <DatePicker
                date={filters.dateTo}
                onDateChange={(date) => onFiltersChange({ ...filters, dateTo: date })}
                placeholder="Sélectionnez une date"
              />
            </div>

            {/* Quantity Range */}
            <div className="space-y-2">
              <Label htmlFor="minQuantity">Quantité min</Label>
              <Input
                id="minQuantity"
                type="number"
                value={filters.minQuantity || ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  minQuantity: e.target.value ? Number(e.target.value) : undefined 
                })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxQuantity">Quantité max</Label>
              <Input
                id="maxQuantity"
                type="number"
                value={filters.maxQuantity || ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  maxQuantity: e.target.value ? Number(e.target.value) : undefined 
                })}
                placeholder="∞"
              />
            </div>
          </>
        )}
      </div>

      {/* Active Filters & Reset */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtres actifs:</span>
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      )}
    </div>
  )
}