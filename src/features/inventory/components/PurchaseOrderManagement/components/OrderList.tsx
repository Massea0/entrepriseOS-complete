import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Send,
  Package,
  FileText,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { DataTable } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { PurchaseOrder } from '../../../types/inventory.types'
import { OrderListProps } from '../PurchaseOrderManagement.types'

const ORDER_STATUS_LABELS = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuvé',
  partially_approved: 'Partiellement approuvé',
  rejected: 'Rejeté',
  sent: 'Envoyé',
  partially_received: 'Partiellement reçu',
  received: 'Reçu',
  cancelled: 'Annulé',
  closed: 'Clôturé'
}

const ORDER_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-100 text-yellow-600',
  approved: 'bg-green-100 text-green-600',
  partially_approved: 'bg-orange-100 text-orange-600',
  rejected: 'bg-red-100 text-red-600',
  sent: 'bg-blue-100 text-blue-600',
  partially_received: 'bg-purple-100 text-purple-600',
  received: 'bg-green-100 text-green-600',
  cancelled: 'bg-gray-100 text-gray-600',
  closed: 'bg-gray-100 text-gray-600'
}

const ORDER_STATUS_ICONS = {
  draft: FileText,
  pending: Clock,
  approved: CheckCircle,
  partially_approved: Clock,
  rejected: XCircle,
  sent: Send,
  partially_received: Package,
  received: Package,
  cancelled: XCircle,
  closed: CheckCircle
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onOrderSelect,
  onOrderEdit,
  onOrderDelete,
  selectedOrderId,
  isLoading = false
}) => {
  const columns = [
    {
      key: 'orderNumber',
      label: 'N° Commande',
      render: (order: PurchaseOrder) => (
        <div className="font-mono text-sm">{order.orderNumber}</div>
      )
    },
    {
      key: 'supplier',
      label: 'Fournisseur',
      render: (order: PurchaseOrder) => (
        <div className="space-y-1">
          <div className="font-medium">{order.supplier?.name}</div>
          <div className="text-xs text-muted-foreground">{order.supplier?.code}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (order: PurchaseOrder) => {
        const Icon = ORDER_STATUS_ICONS[order.status]
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <Badge className={cn('text-xs', ORDER_STATUS_COLORS[order.status])}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'items',
      label: 'Articles',
      render: (order: PurchaseOrder) => (
        <div className="space-y-1">
          <div className="font-medium">{order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}</div>
          <div className="text-xs text-muted-foreground">
            {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} unités
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Montant',
      render: (order: PurchaseOrder) => (
        <div className="text-right">
          <div className="font-medium">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: order.totalAmount?.currency || 'EUR'
            }).format(order.totalAmount?.amount || 0)}
          </div>
          {order.taxAmount && (
            <div className="text-xs text-muted-foreground">
              TVA: {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: order.taxAmount.currency
              }).format(order.taxAmount.amount)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (order: PurchaseOrder) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-muted-foreground">Créée:</span>{' '}
            {format(new Date(order.createdAt), 'dd MMM', { locale: fr })}
          </div>
          {order.expectedDate && (
            <div className="text-sm">
              <span className="text-muted-foreground">Attendue:</span>{' '}
              {format(new Date(order.expectedDate), 'dd MMM', { locale: fr })}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'approval',
      label: 'Approbation',
      render: (order: PurchaseOrder) => {
        if (!order.approvalHistory || order.approvalHistory.length === 0) {
          return <span className="text-sm text-muted-foreground">-</span>
        }

        const lastApproval = order.approvalHistory[order.approvalHistory.length - 1]
        return (
          <div className="space-y-1">
            <Badge variant={lastApproval.action === 'approved' ? 'default' : 'destructive'}>
              Niveau {lastApproval.level}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {lastApproval.approver?.name}
            </div>
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: '',
      render: (order: PurchaseOrder) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOrderSelect(order)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            {order.status === 'draft' && onOrderEdit && (
              <DropdownMenuItem onClick={() => onOrderEdit(order)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
            )}
            {order.status === 'approved' && (
              <DropdownMenuItem onClick={() => {/* TODO: Send order */}}>
                <Send className="h-4 w-4 mr-2" />
                Envoyer au fournisseur
              </DropdownMenuItem>
            )}
            {(order.status === 'sent' || order.status === 'partially_received') && (
              <DropdownMenuItem onClick={() => {/* TODO: Receive order */}}>
                <Package className="h-4 w-4 mr-2" />
                Réceptionner
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {order.status === 'draft' && onOrderDelete && (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onOrderDelete(order)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
        <p className="text-muted-foreground">
          Il n'y a pas encore de commandes fournisseurs
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-0">
      <DataTable
        columns={columns}
        data={orders}
        onRowClick={onOrderSelect}
        isLoading={isLoading}
        emptyMessage="Aucune commande trouvée"
        getRowClassName={(order) => 
          selectedOrderId === order.id ? 'bg-primary/5' : ''
        }
      />
    </Card>
  )
}