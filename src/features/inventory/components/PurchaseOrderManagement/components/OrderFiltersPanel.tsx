import React from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import { Supplier } from '../../../types/inventory.types'
import { PurchaseOrderFilters } from '../PurchaseOrderManagement.types'

interface OrderFiltersPanelProps {
  filters: PurchaseOrderFilters
  onFiltersChange: (filters: PurchaseOrderFilters) => void
  suppliers?: Supplier[]
  warehouses?: any[]
  onReset?: () => void
  className?: string
}

const ORDER_STATUSES = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'partially_approved', label: 'Partiellement approuvé' },
  { value: 'rejected', label: 'Rejeté' },
  { value: 'sent', label: 'Envoyé' },
  { value: 'partially_received', label: 'Partiellement reçu' },
  { value: 'received', label: 'Reçu' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'closed', label: 'Clôturé' }
]

const APPROVAL_STATUSES = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente d\'approbation' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Rejeté' }
]

export const OrderFiltersPanel: React.FC<OrderFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  suppliers = [],
  warehouses = [],
  onReset,
  className
}) => {
  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => key !== 'search' && value && value !== 'all')
    .length

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Statut de commande</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Approval Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="approvalStatus">Statut d'approbation</Label>
          <Select
            value={filters.approvalStatus || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, approvalStatus: value as any })}
          >
            <SelectTrigger id="approvalStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPROVAL_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Supplier Filter */}
        <div className="space-y-2">
          <Label htmlFor="supplier">Fournisseur</Label>
          <Select
            value={filters.supplierId || ''}
            onValueChange={(value) => onFiltersChange({ ...filters, supplierId: value || undefined })}
          >
            <SelectTrigger id="supplier">
              <SelectValue placeholder="Tous les fournisseurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les fournisseurs</SelectItem>
              {suppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
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
              {warehouses.map(warehouse => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
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

        {/* Amount Range */}
        <div className="space-y-2">
          <Label htmlFor="minAmount">Montant min (€)</Label>
          <Input
            id="minAmount"
            type="number"
            value={filters.minAmount || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              minAmount: e.target.value ? Number(e.target.value) : undefined 
            })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxAmount">Montant max (€)</Label>
          <Input
            id="maxAmount"
            type="number"
            value={filters.maxAmount || ''}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              maxAmount: e.target.value ? Number(e.target.value) : undefined 
            })}
            placeholder="∞"
          />
        </div>
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