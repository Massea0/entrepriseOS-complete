import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Building2, 
  Map, 
  Grid3X3, 
  List, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  BarChart3,
  Package,
  AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

import { InventoryService } from '../../services/inventory.service'
import { Warehouse } from '../../types/inventory.types'
import { WarehouseManagerProps, ViewMode, WarehouseFormData } from './WarehouseManager.types'
import { WarehouseGrid } from './components/WarehouseGrid'
import { WarehouseMap } from './components/WarehouseMap'
import { WarehouseList } from './components/WarehouseList'
import { ZoneManager } from './components/ZoneManager'
import { WarehouseForm } from './components/WarehouseForm'
import { WarehouseStats } from './components/WarehouseStats'

export const WarehouseManager: React.FC<WarehouseManagerProps> = ({
  warehouses: warehousesProp,
  selectedWarehouse: selectedWarehouseProp,
  onWarehouseSelect,
  onWarehouseCreate,
  onWarehouseUpdate,
  onWarehouseDelete,
  onZoneCreate,
  onZoneUpdate,
  onZoneDelete,
  onPositionUpdate,
  viewMode: viewModeProp = 'grid',
  onViewModeChange,
  isLoading: isLoadingProp = false,
  className
}) => {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>(viewModeProp)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(selectedWarehouseProp || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [warehouseToEdit, setWarehouseToEdit] = useState<Warehouse | null>(null)

  // Fetch warehouses if not provided
  const { data: warehousesData, isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => InventoryService.getWarehouses(),
    enabled: !warehousesProp
  })

  const warehouses = warehousesProp || warehousesData?.data || []
  const isLoading = isLoadingProp || isLoadingWarehouses

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Warehouse>) => 
      onWarehouseCreate ? onWarehouseCreate(data) : InventoryService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Entrepôt créé avec succès')
      setShowCreateModal(false)
    },
    onError: () => {
      toast.error('Erreur lors de la création de l\'entrepôt')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Warehouse> }) =>
      onWarehouseUpdate ? onWarehouseUpdate(id, data) : InventoryService.updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Entrepôt mis à jour avec succès')
      setShowEditModal(false)
      setWarehouseToEdit(null)
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour de l\'entrepôt')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      onWarehouseDelete ? onWarehouseDelete(id) : InventoryService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Entrepôt supprimé avec succès')
      if (selectedWarehouse?.id === deleteMutation.variables) {
        setSelectedWarehouse(null)
      }
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de l\'entrepôt')
    }
  })

  // Handlers
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    onViewModeChange?.(mode)
  }, [onViewModeChange])

  const handleWarehouseSelect = useCallback((warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    onWarehouseSelect?.(warehouse)
  }, [onWarehouseSelect])

  const handleWarehouseEdit = useCallback((warehouse: Warehouse) => {
    setWarehouseToEdit(warehouse)
    setShowEditModal(true)
  }, [])

  const handleWarehouseDelete = useCallback((warehouse: Warehouse) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'entrepôt "${warehouse.name}" ?`)) {
      deleteMutation.mutate(warehouse.id)
    }
  }, [deleteMutation])

  const handleCreateSubmit = useCallback((data: WarehouseFormData) => {
    createMutation.mutate(data as Partial<Warehouse>)
  }, [createMutation])

  const handleEditSubmit = useCallback((data: WarehouseFormData) => {
    if (warehouseToEdit) {
      updateMutation.mutate({ id: warehouseToEdit.id, data: data as Partial<Warehouse> })
    }
  }, [updateMutation, warehouseToEdit])

  // Filtered warehouses
  const filteredWarehouses = useMemo(() => {
    if (!searchQuery) return warehouses

    const query = searchQuery.toLowerCase()
    return warehouses.filter(warehouse => 
      warehouse.name.toLowerCase().includes(query) ||
      warehouse.code.toLowerCase().includes(query) ||
      warehouse.address?.city?.toLowerCase().includes(query) ||
      warehouse.address?.country?.toLowerCase().includes(query)
    )
  }, [warehouses, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const totalCapacity = warehouses.reduce((sum, w) => sum + (w.totalCapacity || 0), 0)
    const usedCapacity = warehouses.reduce((sum, w) => sum + (w.usedCapacity || 0), 0)
    const totalZones = warehouses.reduce((sum, w) => sum + (w.zones?.length || 0), 0)
    const activeWarehouses = warehouses.filter(w => w.status === 'active').length

    return {
      totalWarehouses: warehouses.length,
      activeWarehouses,
      totalCapacity,
      usedCapacity,
      utilizationRate: totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0,
      totalZones
    }
  }, [warehouses])

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
            <Building2 className="h-6 w-6" />
            Gestion des Entrepôts
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérez vos entrepôts, zones et emplacements de stockage
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
            onClick={() => setShowCreateModal(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Entrepôt
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <WarehouseStats stats={stats} />

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un entrepôt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('map')}
                className="rounded-none border-x"
              >
                <Map className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warehouse List/Grid */}
        <div className={cn(
          'space-y-4',
          selectedWarehouse ? 'lg:col-span-1' : 'lg:col-span-3'
        )}>
          <AnimatePresence mode="wait">
            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <WarehouseGrid
                  warehouses={filteredWarehouses}
                  selectedWarehouseId={selectedWarehouse?.id}
                  onWarehouseSelect={handleWarehouseSelect}
                  onWarehouseEdit={handleWarehouseEdit}
                  onWarehouseDelete={handleWarehouseDelete}
                />
              </motion.div>
            )}
            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <WarehouseList
                  warehouses={filteredWarehouses}
                  selectedWarehouseId={selectedWarehouse?.id}
                  onWarehouseSelect={handleWarehouseSelect}
                  onWarehouseEdit={handleWarehouseEdit}
                  onWarehouseDelete={handleWarehouseDelete}
                />
              </motion.div>
            )}
            {viewMode === 'map' && selectedWarehouse && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="lg:col-span-3"
              >
                <WarehouseMap
                  warehouse={selectedWarehouse}
                  showCapacity
                  showHeatmap
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Zone Manager - shown when a warehouse is selected and not in map view */}
        {selectedWarehouse && viewMode !== 'map' && (
          <div className="lg:col-span-2">
            <ZoneManager
              warehouse={selectedWarehouse}
              zones={selectedWarehouse.zones || []}
              onZoneCreate={onZoneCreate ? (data) => onZoneCreate(selectedWarehouse.id, data) : undefined}
              onZoneUpdate={onZoneUpdate ? (zoneId, data) => onZoneUpdate(selectedWarehouse.id, zoneId, data) : undefined}
              onZoneDelete={onZoneDelete ? (zoneId) => onZoneDelete(selectedWarehouse.id, zoneId) : undefined}
              onPositionUpdate={onPositionUpdate ? (zoneId, positionId, data) => onPositionUpdate(selectedWarehouse.id, zoneId, positionId, data) : undefined}
            />
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Créer un nouvel entrepôt"
        description="Remplissez les informations pour créer un nouvel entrepôt"
      >
        <WarehouseForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createMutation.isLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Modifier l'entrepôt"
        description="Modifiez les informations de l'entrepôt"
      >
        {warehouseToEdit && (
          <WarehouseForm
            initialData={warehouseToEdit}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setShowEditModal(false)
              setWarehouseToEdit(null)
            }}
            isLoading={updateMutation.isLoading}
          />
        )}
      </Modal>
    </div>
  )
}