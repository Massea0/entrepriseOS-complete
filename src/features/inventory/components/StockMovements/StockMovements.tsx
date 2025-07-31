import React, { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowUpDown,
  Download,
  Filter,
  Plus,
  Search,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MoreVertical,
  Eye,
  X,
  FileDown,
  Upload,
  History
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Modal } from '@/components/ui/modal'
import { DataTable } from '@/components/ui/table'
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
import { StockMovement } from '../../types/inventory.types'
import { 
  StockMovementsProps, 
  StockMovementFilters,
  MovementFormData,
  ExportFormat
} from './StockMovements.types'
import { MovementForm } from './components/MovementForm'
import { MovementDetails } from './components/MovementDetails'
import { MovementTimeline } from './components/MovementTimeline'
import { MovementStats } from './components/MovementStats'
import { MovementFiltersPanel } from './components/MovementFiltersPanel'
import { BulkMovement } from './components/BulkMovement'

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

const MOVEMENT_TYPE_COLORS = {
  in: 'text-green-600 bg-green-100',
  out: 'text-red-600 bg-red-100',
  transfer: 'text-blue-600 bg-blue-100',
  adjustment: 'text-orange-600 bg-orange-100',
  return: 'text-purple-600 bg-purple-100',
  damage: 'text-red-600 bg-red-100',
  theft: 'text-red-600 bg-red-100',
  count: 'text-gray-600 bg-gray-100',
  correction: 'text-yellow-600 bg-yellow-100',
  assembly: 'text-indigo-600 bg-indigo-100',
  disassembly: 'text-indigo-600 bg-indigo-100'
}

export const StockMovements: React.FC<StockMovementsProps> = ({
  movements: movementsProp,
  filters: filtersProp,
  onMovementCreate,
  onMovementCancel,
  onMovementUpdate,
  onFiltersChange,
  showAdvancedFilters = true,
  exportOptions = ['PDF', 'Excel', 'CSV'],
  isLoading: isLoadingProp = false,
  className
}) => {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table')
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  
  const [filters, setFilters] = useState<StockMovementFilters>(filtersProp || {
    search: '',
    type: 'all',
    status: 'all'
  })

  // Fetch movements if not provided
  const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['stock-movements', filters],
    queryFn: () => InventoryService.getStockMovements(filters),
    enabled: !movementsProp
  })

  const movements = movementsProp || movementsData?.data || []
  const isLoading = isLoadingProp || isLoadingMovements

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<StockMovement>) =>
      onMovementCreate ? onMovementCreate(data) : InventoryService.createStockMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      toast.success('Mouvement créé avec succès')
      setShowCreateModal(false)
    },
    onError: () => {
      toast.error('Erreur lors de la création du mouvement')
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (movementId: string) =>
      onMovementCancel ? onMovementCancel(movementId) : InventoryService.cancelStockMovement(movementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      toast.success('Mouvement annulé avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de l\'annulation du mouvement')
    }
  })

  // Handlers
  const handleFiltersChange = useCallback((newFilters: StockMovementFilters) => {
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [onFiltersChange])

  const handleMovementClick = useCallback((movement: StockMovement) => {
    setSelectedMovement(movement)
    setShowDetailsModal(true)
  }, [])

  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      const data = await InventoryService.exportStockMovements(filters, format)
      // Handle download
      const blob = new Blob([data], { 
        type: format === 'PDF' ? 'application/pdf' : 
              format === 'Excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'text/csv'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mouvements-stock-${format(new Date(), 'yyyy-MM-dd')}.${format.toLowerCase()}`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Export ${format} réussi`)
    } catch (error) {
      toast.error(`Erreur lors de l'export ${format}`)
    }
  }, [filters])

  const handleCreateSubmit = useCallback((data: MovementFormData) => {
    createMutation.mutate(data as Partial<StockMovement>)
  }, [createMutation])

  const handleBulkSubmit = useCallback(async (movements: MovementFormData[]) => {
    try {
      await InventoryService.createBulkStockMovements(movements)
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      toast.success(`${movements.length} mouvements créés avec succès`)
      setShowBulkModal(false)
    } catch (error) {
      toast.error('Erreur lors de la création des mouvements')
    }
  }, [queryClient])

  // Filtered movements
  const filteredMovements = useMemo(() => {
    let filtered = [...movements]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(movement =>
        movement.reference?.toLowerCase().includes(search) ||
        movement.product?.name?.toLowerCase().includes(search) ||
        movement.product?.sku?.toLowerCase().includes(search) ||
        movement.notes?.toLowerCase().includes(search)
      )
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(movement => movement.type === filters.type)
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(movement => movement.status === filters.status)
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(movement => 
        new Date(movement.createdAt) >= filters.dateFrom!
      )
    }
    if (filters.dateTo) {
      filtered = filtered.filter(movement => 
        new Date(movement.createdAt) <= filters.dateTo!
      )
    }

    // Sort by date desc
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return filtered
  }, [movements, filters])

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date()
    const todayMovements = movements.filter(m => 
      format(new Date(m.createdAt), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    )

    const totalIn = movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0)
    const totalOut = movements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0)
    const totalTransfers = movements.filter(m => m.type === 'transfer').length

    return {
      todayCount: todayMovements.length,
      totalMovements: movements.length,
      totalIn,
      totalOut,
      totalTransfers,
      pendingCount: movements.filter(m => m.status === 'pending').length
    }
  }, [movements])

  // Table columns
  const columns = [
    {
      key: 'reference',
      label: 'Référence',
      render: (movement: StockMovement) => (
        <div className="font-mono text-sm">{movement.reference}</div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (movement: StockMovement) => (
        <Badge className={cn('text-xs', MOVEMENT_TYPE_COLORS[movement.type])}>
          {MOVEMENT_TYPE_LABELS[movement.type]}
        </Badge>
      )
    },
    {
      key: 'product',
      label: 'Produit',
      render: (movement: StockMovement) => (
        <div className="space-y-1">
          <div className="font-medium">{movement.product?.name}</div>
          <div className="text-xs text-muted-foreground">{movement.product?.sku}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantité',
      render: (movement: StockMovement) => (
        <div className="flex items-center gap-1">
          {movement.type === 'in' ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : movement.type === 'out' ? (
            <TrendingDown className="h-4 w-4 text-red-600" />
          ) : (
            <ArrowRight className="h-4 w-4 text-blue-600" />
          )}
          <span className="font-medium">{movement.quantity}</span>
          <span className="text-sm text-muted-foreground">
            {movement.product?.unitOfMeasure}
          </span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Localisation',
      render: (movement: StockMovement) => (
        <div className="text-sm">
          {movement.type === 'transfer' ? (
            <div className="flex items-center gap-1">
              <span>{movement.fromWarehouse?.name}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{movement.toWarehouse?.name}</span>
            </div>
          ) : (
            <span>{movement.warehouse?.name || movement.toWarehouse?.name}</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (movement: StockMovement) => (
        <Badge variant={movement.status === 'completed' ? 'default' : 'secondary'}>
          {MOVEMENT_STATUS_LABELS[movement.status]}
        </Badge>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (movement: StockMovement) => (
        <div className="text-sm">
          {format(new Date(movement.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (movement: StockMovement) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleMovementClick(movement)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            {movement.status === 'pending' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => cancelMutation.mutate(movement.id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

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
            <History className="h-6 w-6" />
            Mouvements de Stock
          </h2>
          <p className="text-muted-foreground mt-1">
            Historique et traçabilité des mouvements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {exportOptions.map(format => (
                <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export {format}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import en masse
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau mouvement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <MovementStats movements={movements} />

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence, produit..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showFiltersPanel ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof StockMovementFilters]).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof StockMovementFilters]).length}
                </Badge>
              )}
            </Button>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFiltersPanel && showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t">
                <MovementFiltersPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={() => handleFiltersChange({ search: '', type: 'all', status: 'all' })}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Content */}
      {viewMode === 'table' ? (
        <Card className="p-0">
          <DataTable
            columns={columns}
            data={filteredMovements}
            onRowClick={handleMovementClick}
            emptyMessage="Aucun mouvement trouvé"
          />
        </Card>
      ) : (
        <MovementTimeline
          movements={filteredMovements}
          onMovementClick={handleMovementClick}
        />
      )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Créer un mouvement de stock"
        description="Enregistrez un nouveau mouvement dans votre inventaire"
        size="lg"
      >
        <MovementForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createMutation.isLoading}
        />
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        title="Import en masse"
        description="Importez plusieurs mouvements en une seule opération"
        size="xl"
      >
        <BulkMovement
          onSubmit={handleBulkSubmit}
          onCancel={() => setShowBulkModal(false)}
        />
      </Modal>

      {/* Details Modal */}
      {selectedMovement && (
        <Modal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          title="Détails du mouvement"
          size="lg"
        >
          <MovementDetails
            movement={selectedMovement}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedMovement(null)
            }}
            onCancel={
              selectedMovement.status === 'pending'
                ? () => cancelMutation.mutateAsync(selectedMovement.id)
                : undefined
            }
            canCancel={selectedMovement.status === 'pending'}
          />
        </Modal>
      )}
    </div>
  )
}