import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Package,
  MapPin,
  Calendar,
  User,
  FileText,
  Hash,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  X,
  CheckCircle
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { StockMovement } from '../../../types/inventory.types'
import { MovementDetailsProps } from '../StockMovements.types'

const MOVEMENT_TYPE_LABELS = {
  in: 'Entrée',
  out: 'Sortie',
  transfer: 'Transfert',
  adjustment: 'Ajustement',
  return: 'Retour',
  damage: 'Dommage',
  theft: 'Vol',
  count: 'Comptage',
  correction: 'Correction',
  assembly: 'Assemblage',
  disassembly: 'Désassemblage'
}

const MOVEMENT_STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  partial: 'Partiel',
  completed: 'Complété'
}

export const MovementDetails: React.FC<MovementDetailsProps> = ({
  movement,
  onClose,
  onCancel,
  onApprove,
  canEdit = false,
  canCancel = false,
  canApprove = false
}) => {
  const Icon = movement.type === 'in' ? TrendingUp :
               movement.type === 'out' ? TrendingDown :
               ArrowRight

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon className={cn(
              'h-5 w-5',
              movement.type === 'in' && 'text-green-600',
              movement.type === 'out' && 'text-red-600',
              movement.type === 'transfer' && 'text-blue-600'
            )} />
            <h3 className="text-lg font-semibold">
              {MOVEMENT_TYPE_LABELS[movement.type]}
            </h3>
            <Badge variant={movement.status === 'completed' ? 'default' : 'secondary'}>
              {MOVEMENT_STATUS_LABELS[movement.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Référence: {movement.reference}
          </p>
        </div>
      </div>

      <Separator />

      {/* Product Information */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Produit
        </h4>
        <Card className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium">{movement.product?.name}</p>
              <p className="text-sm text-muted-foreground">SKU: {movement.product?.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{movement.quantity}</p>
              <p className="text-sm text-muted-foreground">{movement.product?.unitOfMeasure}</p>
            </div>
          </div>
          {movement.serialNumber && (
            <div className="pt-2 border-t">
              <p className="text-sm">
                <span className="text-muted-foreground">N° de série:</span> {movement.serialNumber}
              </p>
            </div>
          )}
          {movement.lotNumber && (
            <div>
              <p className="text-sm">
                <span className="text-muted-foreground">N° de lot:</span> {movement.lotNumber}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Localisation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(movement.type === 'out' || movement.type === 'transfer') && (
            <Card className="p-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Source</p>
              <div className="space-y-1">
                <p className="font-medium">{movement.fromWarehouse?.name}</p>
                {movement.fromZone && (
                  <p className="text-sm text-muted-foreground">
                    Zone: {movement.fromZone.name}
                  </p>
                )}
                {movement.fromPosition && (
                  <p className="text-sm text-muted-foreground">
                    Position: {movement.fromPosition.code}
                  </p>
                )}
              </div>
            </Card>
          )}

          {(movement.type === 'in' || movement.type === 'transfer') && (
            <Card className="p-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Destination</p>
              <div className="space-y-1">
                <p className="font-medium">{movement.toWarehouse?.name}</p>
                {movement.toZone && (
                  <p className="text-sm text-muted-foreground">
                    Zone: {movement.toZone.name}
                  </p>
                )}
                {movement.toPosition && (
                  <p className="text-sm text-muted-foreground">
                    Position: {movement.toPosition.code}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h4 className="font-medium">Informations supplémentaires</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date de création</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(movement.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            </div>

            {movement.executedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date d'exécution</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(movement.executedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            )}

            {movement.createdBy && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Créé par</p>
                  <p className="text-sm text-muted-foreground">
                    {movement.createdBy.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {movement.reason && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Raison</p>
                  <p className="text-sm text-muted-foreground">
                    {movement.reason}
                  </p>
                </div>
              </div>
            )}

            {movement.notes && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {movement.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cost Information */}
      {movement.totalCost && (
        <div className="space-y-4">
          <h4 className="font-medium">Informations financières</h4>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coût unitaire</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: movement.totalCost.currency
                  }).format(movement.unitCost?.amount || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Coût total</p>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: movement.totalCost.currency
                  }).format(movement.totalCost.amount)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {canCancel && movement.status === 'pending' && (
          <Button
            variant="destructive"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler le mouvement
          </Button>
        )}
        {canApprove && movement.status === 'pending' && (
          <Button
            variant="default"
            onClick={onApprove}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approuver
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onClose}
        >
          Fermer
        </Button>
      </div>
    </div>
  )
}