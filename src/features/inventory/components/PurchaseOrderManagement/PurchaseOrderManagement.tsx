import React, { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Send,
  Printer
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Modal } from '@/components/ui/modal'
import { Spinner } from '@/components/ui/spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

import { InventoryService } from '../../services/inventory.service'
import { PurchaseOrder } from '../../types/inventory.types'
import {
  PurchaseOrderManagementProps,
  PurchaseOrderFilters,
  OrderFormData,
  ReceiveItemData,
  ApprovalLevel
} from './PurchaseOrderManagement.types'
import { OrderForm } from './components/OrderForm'
import { OrderDetails } from './components/OrderDetails'
import { OrderList } from './components/OrderList'
import { OrderApproval } from './components/OrderApproval'
import { OrderReceiving } from './components/OrderReceiving'
import { OrderStats } from './components/OrderStats'
import { OrderFiltersPanel } from './components/OrderFiltersPanel'

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

export const PurchaseOrderManagement: React.FC<PurchaseOrderManagementProps> = ({
  orders: ordersProp,
  suppliers: suppliersProp,
  onOrderCreate,
  onOrderUpdate,
  onOrderDelete,
  onOrderApprove,
  onOrderReject,
  onOrderReceive,
  workflowEnabled = true,
  approvalLevels = [],
  currentUser,
  isLoading: isLoadingProp = false,
  className
}) => {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showReceivingModal, setShowReceivingModal] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<PurchaseOrder | null>(null)

  const [filters, setFilters] = useState<PurchaseOrderFilters>({
    search: '',
    status: 'all',
    approvalStatus: 'all'
  })

  // Fetch data
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: () => InventoryService.getPurchaseOrders(filters),
    enabled: !ordersProp
  })

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => InventoryService.getSuppliers(),
    enabled: !suppliersProp
  })

  const orders = ordersProp || ordersData?.data || []
  const suppliers = suppliersProp || suppliersData?.data || []
  const isLoading = isLoadingProp || isLoadingOrders || isLoadingSuppliers

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<PurchaseOrder>) =>
      onOrderCreate ? onOrderCreate(data) : InventoryService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Commande créée avec succès')
      setShowCreateModal(false)
    },
    onError: () => {
      toast.error('Erreur lors de la création de la commande')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PurchaseOrder> }) =>
      onOrderUpdate ? onOrderUpdate(id, data) : InventoryService.updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Commande mise à jour avec succès')
      setShowCreateModal(false)
      setOrderToEdit(null)
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour de la commande')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      onOrderDelete ? onOrderDelete(id) : InventoryService.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Commande supprimée avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la commande')
    }
  })

  const approveMutation = useMutation({
    mutationFn: ({ orderId, level }: { orderId: string; level: number }) =>
      onOrderApprove ? onOrderApprove(orderId, level) : InventoryService.approvePurchaseOrder(orderId, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Commande approuvée avec succès')
      setShowApprovalModal(false)
    },
    onError: () => {
      toast.error('Erreur lors de l\'approbation de la commande')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      onOrderReject ? onOrderReject(orderId, reason) : InventoryService.rejectPurchaseOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Commande rejetée')
      setShowApprovalModal(false)
    },
    onError: () => {
      toast.error('Erreur lors du rejet de la commande')
    }
  })

  const receiveMutation = useMutation({
    mutationFn: ({ orderId, items }: { orderId: string; items: ReceiveItemData[] }) =>
      onOrderReceive ? onOrderReceive(orderId, items) : InventoryService.receivePurchaseOrder(orderId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      toast.success('Réception enregistrée avec succès')
      setShowReceivingModal(false)
    },
    onError: () => {
      toast.error('Erreur lors de la réception')
    }
  })

  // Handlers
  const handleOrderSelect = useCallback((order: PurchaseOrder) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }, [])

  const handleOrderEdit = useCallback((order: PurchaseOrder) => {
    setOrderToEdit(order)
    setShowCreateModal(true)
  }, [])

  const handleOrderDelete = useCallback((order: PurchaseOrder) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande ${order.orderNumber} ?`)) {
      deleteMutation.mutate(order.id)
    }
  }, [deleteMutation])

  const handleCreateSubmit = useCallback((data: OrderFormData) => {
    if (orderToEdit) {
      updateMutation.mutate({ id: orderToEdit.id, data: data as Partial<PurchaseOrder> })
    } else {
      createMutation.mutate(data as Partial<PurchaseOrder>)
    }
  }, [createMutation, updateMutation, orderToEdit])

  const handleApprove = useCallback((orderId: string, level: number) => {
    approveMutation.mutate({ orderId, level })
  }, [approveMutation])

  const handleReject = useCallback((orderId: string, reason: string) => {
    rejectMutation.mutate({ orderId, reason })
  }, [rejectMutation])

  const handleReceive = useCallback((orderId: string, items: ReceiveItemData[]) => {
    receiveMutation.mutate({ orderId, items })
  }, [receiveMutation])

  const handleSendOrder = useCallback(async (order: PurchaseOrder) => {
    try {
      await InventoryService.sendPurchaseOrder(order.id)
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.success('Commande envoyée au fournisseur')
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la commande')
    }
  }, [queryClient])

  const handlePrintOrder = useCallback(async (order: PurchaseOrder) => {
    try {
      const pdf = await InventoryService.generatePurchaseOrderPDF(order.id)
      // Handle PDF download/print
      window.open(pdf.url, '_blank')
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF')
    }
  }, [])

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(search) ||
        order.supplier?.name?.toLowerCase().includes(search) ||
        order.items?.some(item => 
          item.product?.name?.toLowerCase().includes(search) ||
          item.product?.sku?.toLowerCase().includes(search)
        )
      )
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status)
    }

    // Approval status filter
    if (filters.approvalStatus && filters.approvalStatus !== 'all') {
      if (filters.approvalStatus === 'pending') {
        filtered = filtered.filter(order => 
          order.status === 'pending' || order.status === 'partially_approved'
        )
      } else if (filters.approvalStatus === 'approved') {
        filtered = filtered.filter(order => order.status === 'approved')
      } else if (filters.approvalStatus === 'rejected') {
        filtered = filtered.filter(order => order.status === 'rejected')
      }
    }

    // Sort by date desc
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return filtered
  }, [orders, filters])

  // Calculate stats
  const stats = useMemo(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'partially_approved')
    const approvedOrders = orders.filter(o => o.status === 'approved')
    const sentOrders = orders.filter(o => o.status === 'sent')
    const receivedOrders = orders.filter(o => o.status === 'received' || o.status === 'partially_received')

    const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount?.amount || 0), 0)
    const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.totalAmount?.amount || 0), 0)

    return {
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      approvedOrders: approvedOrders.length,
      sentOrders: sentOrders.length,
      receivedOrders: receivedOrders.length,
      totalAmount,
      pendingAmount
    }
  }, [orders])

  // Check user permissions
  const canApprove = useCallback((order: PurchaseOrder) => {
    if (!workflowEnabled || !currentUser) return false
    
    const nextLevel = (order.currentApprovalLevel || 0) + 1
    const approvalLevel = approvalLevels.find(l => l.level === nextLevel)
    
    return approvalLevel?.approvers.some(a => a.id === currentUser.id) || false
  }, [workflowEnabled, currentUser, approvalLevels])

  const canReceive = useCallback((order: PurchaseOrder) => {
    return order.status === 'sent' || order.status === 'partially_received'
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Commandes Fournisseurs
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérez vos commandes d'approvisionnement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* TODO: Export functionality */}}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button
            onClick={() => {
              setOrderToEdit(null)
              setShowCreateModal(true)
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </div>

      {/* Stats */}
      <OrderStats stats={stats} />

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Toutes ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            En attente ({stats.pendingOrders})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvées ({stats.approvedOrders})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Envoyées ({stats.sentOrders})
          </TabsTrigger>
          <TabsTrigger value="received">
            Reçues ({stats.receivedOrders})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro, fournisseur, produit..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFiltersPanel ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFiltersPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t">
                    <OrderFiltersPanel
                      filters={filters}
                      onFiltersChange={setFilters}
                      suppliers={suppliers}
                      onReset={() => setFilters({ search: '', status: 'all', approvalStatus: 'all' })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Orders List */}
          <OrderList
            orders={filteredOrders}
            onOrderSelect={handleOrderSelect}
            onOrderEdit={handleOrderEdit}
            onOrderDelete={handleOrderDelete}
            selectedOrderId={selectedOrder?.id}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <OrderList
            orders={filteredOrders.filter(o => o.status === 'pending' || o.status === 'partially_approved')}
            onOrderSelect={handleOrderSelect}
            onOrderEdit={handleOrderEdit}
            onOrderDelete={handleOrderDelete}
            selectedOrderId={selectedOrder?.id}
          />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <OrderList
            orders={filteredOrders.filter(o => o.status === 'approved')}
            onOrderSelect={handleOrderSelect}
            onOrderEdit={handleOrderEdit}
            onOrderDelete={handleOrderDelete}
            selectedOrderId={selectedOrder?.id}
          />
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <OrderList
            orders={filteredOrders.filter(o => o.status === 'sent')}
            onOrderSelect={handleOrderSelect}
            onOrderEdit={handleOrderEdit}
            onOrderDelete={handleOrderDelete}
            selectedOrderId={selectedOrder?.id}
          />
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <OrderList
            orders={filteredOrders.filter(o => o.status === 'received' || o.status === 'partially_received')}
            onOrderSelect={handleOrderSelect}
            onOrderEdit={handleOrderEdit}
            onOrderDelete={handleOrderDelete}
            selectedOrderId={selectedOrder?.id}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title={orderToEdit ? 'Modifier la commande' : 'Créer une commande'}
        description={orderToEdit ? 'Modifiez les informations de la commande' : 'Créez une nouvelle commande fournisseur'}
        size="xl"
      >
        <OrderForm
          initialData={orderToEdit}
          suppliers={suppliers}
          onSubmit={handleCreateSubmit}
          onCancel={() => {
            setShowCreateModal(false)
            setOrderToEdit(null)
          }}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      </Modal>

      {/* Details Modal */}
      {selectedOrder && (
        <Modal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          title={`Commande ${selectedOrder.orderNumber}`}
          size="xl"
        >
          <OrderDetails
            order={selectedOrder}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedOrder(null)
            }}
            onApprove={
              canApprove(selectedOrder)
                ? (level) => {
                    setShowApprovalModal(true)
                    setShowDetailsModal(false)
                  }
                : undefined
            }
            onReject={
              canApprove(selectedOrder)
                ? (reason) => handleReject(selectedOrder.id, reason)
                : undefined
            }
            onReceive={
              canReceive(selectedOrder)
                ? () => {
                    setShowReceivingModal(true)
                    setShowDetailsModal(false)
                  }
                : undefined
            }
            onPrint={() => handlePrintOrder(selectedOrder)}
            canApprove={canApprove(selectedOrder)}
            canReject={canApprove(selectedOrder)}
            canReceive={canReceive(selectedOrder)}
            canEdit={selectedOrder.status === 'draft'}
            approvalLevels={approvalLevels}
            currentUser={currentUser}
          />
        </Modal>
      )}

      {/* Approval Modal */}
      {selectedOrder && showApprovalModal && (
        <Modal
          open={showApprovalModal}
          onOpenChange={setShowApprovalModal}
          title="Approuver la commande"
          size="lg"
        >
          <OrderApproval
            order={selectedOrder}
            approvalLevels={approvalLevels}
            currentUser={currentUser!}
            onApprove={(level) => handleApprove(selectedOrder.id, level)}
            onReject={(reason) => handleReject(selectedOrder.id, reason)}
            isLoading={approveMutation.isLoading || rejectMutation.isLoading}
          />
        </Modal>
      )}

      {/* Receiving Modal */}
      {selectedOrder && showReceivingModal && (
        <Modal
          open={showReceivingModal}
          onOpenChange={setShowReceivingModal}
          title="Réception de commande"
          size="xl"
        >
          <OrderReceiving
            order={selectedOrder}
            onReceive={(items) => handleReceive(selectedOrder.id, items)}
            onCancel={() => {
              setShowReceivingModal(false)
            }}
            isLoading={receiveMutation.isLoading}
          />
        </Modal>
      )}
    </div>
  )
}