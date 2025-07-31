import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ShoppingCart,
  Building,
  Calendar,
  Package,
  CreditCard,
  Truck,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Printer,
  ChevronRight
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { OrderDetailsProps } from '../PurchaseOrderManagement.types'

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

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onClose,
  onApprove,
  onReject,
  onReceive,
  onPrint,
  canApprove = false,
  canReject = false,
  canReceive = false,
  canEdit = false,
  approvalLevels = [],
  currentUser
}) => {
  const totalReceived = order.items?.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0) || 0
  const totalOrdered = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const receivedPercentage = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h3 className="text-lg font-semibold">
              Commande {order.orderNumber}
            </h3>
            <Badge className={cn('text-xs', ORDER_STATUS_COLORS[order.status])}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Créée le {format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onPrint && (
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          )}
          {order.status === 'approved' && (
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="items">Articles ({order.items?.length || 0})</TabsTrigger>
          <TabsTrigger value="approval">Approbation</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Supplier Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Fournisseur
            </h4>
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{order.supplier?.name}</p>
                  <p className="text-sm text-muted-foreground">Code: {order.supplier?.code}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {order.supplier?.contactName}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.supplier?.email}</p>
                  <p className="text-sm text-muted-foreground">{order.supplier?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse de facturation</p>
                  <p className="text-sm">{order.supplier?.address?.street}</p>
                  <p className="text-sm">
                    {order.supplier?.address?.city}, {order.supplier?.address?.postalCode}
                  </p>
                  <p className="text-sm">{order.supplier?.address?.country}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Delivery Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Livraison
            </h4>
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Entrepôt de destination</p>
                  <p className="font-medium">{order.warehouse?.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">Date attendue</p>
                  <p className="font-medium">
                    {order.expectedDate && format(new Date(order.expectedDate), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Méthode de livraison</p>
                  <p className="font-medium capitalize">{order.shippingMethod || 'Standard'}</p>
                  {order.trackingNumber && (
                    <>
                      <p className="text-sm text-muted-foreground mt-2">N° de suivi</p>
                      <p className="font-mono text-sm">{order.trackingNumber}</p>
                    </>
                  )}
                </div>
              </div>
              {order.shippingAddress && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Adresse de livraison</p>
                  <p className="text-sm mt-1">{order.shippingAddress.street}</p>
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm">{order.shippingAddress.country}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Informations financières
            </h4>
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total HT</span>
                  <span>{new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: order.subtotalAmount?.currency || 'EUR'
                  }).format(order.subtotalAmount?.amount || 0)}</span>
                </div>
                {order.discountAmount && order.discountAmount.amount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Remises</span>
                    <span>-{new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: order.discountAmount.currency
                    }).format(order.discountAmount.amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>TVA</span>
                  <span>{new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: order.taxAmount?.currency || 'EUR'
                  }).format(order.taxAmount?.amount || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total TTC</span>
                  <span className="text-lg">{new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: order.totalAmount?.currency || 'EUR'
                  }).format(order.totalAmount?.amount || 0)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Conditions de paiement</p>
                <p className="font-medium">{order.paymentTerms || 'Net 30 jours'}</p>
              </div>
            </Card>
          </div>

          {/* Reception Progress */}
          {(order.status === 'sent' || order.status === 'partially_received' || order.status === 'received') && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Progression de la réception
              </h4>
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Articles reçus</span>
                    <span className="font-medium">
                      {totalReceived} / {totalOrdered} unités
                    </span>
                  </div>
                  <Progress value={receivedPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {receivedPercentage.toFixed(0)}% complété
                  </p>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-6 mt-6">
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{item.product?.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {item.product?.sku}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantité commandée</p>
                        <p className="font-medium">{item.quantity} {item.product?.unitOfMeasure}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prix unitaire</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: item.unitPrice.currency
                          }).format(item.unitPrice.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">TVA</p>
                        <p className="font-medium">{item.taxRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total ligne</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: item.totalPrice.currency
                          }).format(item.totalPrice.amount)}
                        </p>
                      </div>
                    </div>
                    {item.receivedQuantity !== undefined && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Quantité reçue</span>
                          <Badge variant={item.receivedQuantity === item.quantity ? 'default' : 'secondary'}>
                            {item.receivedQuantity} / {item.quantity}
                          </Badge>
                        </div>
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-sm text-muted-foreground italic mt-2">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approval" className="space-y-6 mt-6">
          <div className="space-y-4">
            <h4 className="font-medium">Workflow d'approbation</h4>
            
            {/* Approval Levels */}
            <div className="space-y-3">
              {approvalLevels.map((level, index) => {
                const isApproved = order.currentApprovalLevel && order.currentApprovalLevel >= level.level
                const isPending = order.currentApprovalLevel === level.level - 1 && order.status === 'pending'
                const isRejected = order.status === 'rejected' && order.currentApprovalLevel === level.level - 1
                
                return (
                  <Card key={level.level} className={cn(
                    'p-4',
                    isApproved && 'border-green-200 bg-green-50',
                    isPending && 'border-yellow-200 bg-yellow-50',
                    isRejected && 'border-red-200 bg-red-50'
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          isApproved && 'bg-green-100',
                          isPending && 'bg-yellow-100',
                          isRejected && 'bg-red-100',
                          !isApproved && !isPending && !isRejected && 'bg-gray-100'
                        )}>
                          {isApproved ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : isPending ? (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          ) : isRejected ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">{level.level}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{level.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {level.approvers.map(a => a.name).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isApproved && (
                          <Badge variant="default">Approuvé</Badge>
                        )}
                        {isPending && (
                          <Badge variant="secondary">En attente</Badge>
                        )}
                        {isRejected && (
                          <Badge variant="destructive">Rejeté</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Approval History */}
            {order.approvalHistory && order.approvalHistory.length > 0 && (
              <>
                <h4 className="font-medium mt-6">Historique des approbations</h4>
                <div className="space-y-3">
                  {order.approvalHistory.map((approval, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {approval.action === 'approved' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <p className="font-medium">
                              Niveau {approval.level} - {approval.action === 'approved' ? 'Approuvé' : 'Rejeté'}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Par {approval.approver?.name} le{' '}
                            {format(new Date(approval.date), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </p>
                          {approval.comment && (
                            <p className="text-sm mt-2">
                              Commentaire: {approval.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <div className="space-y-4">
            <h4 className="font-medium">Historique de la commande</h4>
            <div className="space-y-3">
              {/* Mock history - replace with actual history */}
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Commande créée</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {canReceive && (
          <Button onClick={onReceive}>
            <Package className="h-4 w-4 mr-2" />
            Réceptionner
          </Button>
        )}
        {canReject && (
          <Button
            variant="destructive"
            onClick={() => onReject?.('Rejet manuel')}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeter
          </Button>
        )}
        {canApprove && (
          <Button
            onClick={() => onApprove?.((order.currentApprovalLevel || 0) + 1)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approuver
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  )
}