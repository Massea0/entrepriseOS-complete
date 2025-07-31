import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Grid3X3, 
  Edit, 
  Trash2, 
  Package,
  Thermometer,
  Shield,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  BarChart3
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

import { WarehouseZone } from '../../../types/inventory.types'
import { ZoneManagerProps, ZoneFormData } from '../WarehouseManager.types'
import { CapacityIndicator } from './CapacityIndicator'
import { ZoneForm } from './ZoneForm'
import { PositionTracker } from './PositionTracker'

const ZONE_TYPE_LABELS = {
  storage: 'Stockage',
  picking: 'Préparation',
  receiving: 'Réception',
  shipping: 'Expédition',
  quarantine: 'Quarantaine',
  returns: 'Retours'
}

const TEMPERATURE_LABELS = {
  ambient: 'Ambiant',
  refrigerated: 'Réfrigéré',
  frozen: 'Congelé'
}

export const ZoneManager: React.FC<ZoneManagerProps> = ({
  warehouse,
  zones,
  onZoneCreate,
  onZoneUpdate,
  onZoneDelete,
  onPositionUpdate,
  selectedZoneId,
  onZoneSelect,
  className
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [zoneToEdit, setZoneToEdit] = useState<WarehouseZone | null>(null)
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(selectedZoneId || null)

  const handleZoneClick = (zone: WarehouseZone) => {
    setExpandedZoneId(expandedZoneId === zone.id ? null : zone.id)
    onZoneSelect?.(zone)
  }

  const handleZoneEdit = (zone: WarehouseZone) => {
    setZoneToEdit(zone)
    setShowEditModal(true)
  }

  const handleZoneDelete = async (zone: WarehouseZone) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la zone "${zone.name}" ?`)) {
      try {
        await onZoneDelete?.(zone.id)
        toast.success('Zone supprimée avec succès')
      } catch (error) {
        toast.error('Erreur lors de la suppression de la zone')
      }
    }
  }

  const handleCreateSubmit = async (data: ZoneFormData) => {
    try {
      await onZoneCreate?.(data as Partial<WarehouseZone>)
      toast.success('Zone créée avec succès')
      setShowCreateModal(false)
    } catch (error) {
      toast.error('Erreur lors de la création de la zone')
    }
  }

  const handleEditSubmit = async (data: ZoneFormData) => {
    if (zoneToEdit) {
      try {
        await onZoneUpdate?.(zoneToEdit.id, data as Partial<WarehouseZone>)
        toast.success('Zone mise à jour avec succès')
        setShowEditModal(false)
        setZoneToEdit(null)
      } catch (error) {
        toast.error('Erreur lors de la mise à jour de la zone')
      }
    }
  }

  // Calculate warehouse-level stats
  const warehouseStats = {
    totalZones: zones.length,
    totalPositions: zones.reduce((sum, z) => sum + (z.analytics?.totalPositions || 0), 0),
    occupiedPositions: zones.reduce((sum, z) => sum + (z.analytics?.occupiedPositions || 0), 0),
    totalItems: zones.reduce((sum, z) => sum + (z.analytics?.totalItems || 0), 0),
    totalValue: zones.reduce((sum, z) => sum + (z.analytics?.totalValue || 0), 0)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Zones de l'entrepôt</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {warehouse.name} - {zones.length} zones configurées
            </p>
          </div>
          {onZoneCreate && (
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Zone
            </Button>
          )}
        </div>

        {/* Warehouse Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Zones</p>
            <p className="text-2xl font-bold">{warehouseStats.totalZones}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Positions</p>
            <p className="text-2xl font-bold">
              {warehouseStats.occupiedPositions}/{warehouseStats.totalPositions}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Articles</p>
            <p className="text-2xl font-bold">{warehouseStats.totalItems.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Valeur stock</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', { 
                style: 'currency', 
                currency: 'EUR' 
              }).format(warehouseStats.totalValue)}
            </p>
          </div>
        </div>

        {/* Overall Capacity */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Capacité globale</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((warehouseStats.occupiedPositions / warehouseStats.totalPositions) * 100)}%
            </span>
          </div>
          <CapacityIndicator
            used={warehouseStats.occupiedPositions}
            total={warehouseStats.totalPositions}
            showDetails
          />
        </div>
      </Card>

      {/* Zones List */}
      <div className="space-y-3">
        {zones.map((zone, index) => {
          const isExpanded = expandedZoneId === zone.id
          const occupancyRate = zone.analytics 
            ? (zone.analytics.occupiedPositions / zone.analytics.totalPositions) * 100 
            : 0

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                'overflow-hidden transition-all',
                isExpanded && 'ring-2 ring-primary'
              )}>
                {/* Zone Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleZoneClick(zone)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'p-2 rounded-lg',
                      zone.status === 'active' ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <Grid3X3 className={cn(
                        'h-5 w-5',
                        zone.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{zone.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {ZONE_TYPE_LABELS[zone.type]}
                        </Badge>
                        {zone.temperature && zone.temperature !== 'ambient' && (
                          <Badge variant="secondary" className="text-xs">
                            <Thermometer className="h-3 w-3 mr-1" />
                            {TEMPERATURE_LABELS[zone.temperature]}
                          </Badge>
                        )}
                        {zone.securityLevel && zone.securityLevel !== 'standard' && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {zone.securityLevel}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-mono">{zone.code}</span>
                        {zone.area && <span>{zone.area} m²</span>}
                        {zone.analytics && (
                          <>
                            <span>{zone.analytics.totalPositions} positions</span>
                            <span>{zone.analytics.totalItems} articles</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Capacity Indicator */}
                      <div className="w-32">
                        <CapacityIndicator
                          used={zone.analytics?.occupiedPositions || 0}
                          total={zone.analytics?.totalPositions || 0}
                          size="sm"
                        />
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleZoneEdit(zone)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleZoneDelete(zone)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <ChevronRight className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-90'
                      )} />
                    </div>
                  </div>

                  {/* Alerts */}
                  {zone.analytics && occupancyRate > 90 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Zone presque pleine ({Math.round(occupancyRate)}%)</span>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t">
                        <Tabs defaultValue="positions" className="w-full">
                          <TabsList className="w-full justify-start rounded-none border-b h-12">
                            <TabsTrigger value="positions">Positions</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="configuration">Configuration</TabsTrigger>
                          </TabsList>

                          <TabsContent value="positions" className="p-4">
                            {zone.positions && zone.positions.length > 0 ? (
                              <PositionTracker
                                zone={zone}
                                positions={zone.positions}
                                onPositionUpdate={onPositionUpdate ? 
                                  (positionId, data) => onPositionUpdate(zone.id, positionId, data) : 
                                  undefined
                                }
                                showOccupancy
                              />
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Aucune position configurée dans cette zone</p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="analytics" className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="p-4">
                                <p className="text-sm text-muted-foreground">Taux occupation</p>
                                <p className="text-2xl font-bold">{Math.round(occupancyRate)}%</p>
                              </Card>
                              <Card className="p-4">
                                <p className="text-sm text-muted-foreground">Rotation stock</p>
                                <p className="text-2xl font-bold">{zone.analytics?.stockTurnover || 0}x</p>
                              </Card>
                              <Card className="p-4">
                                <p className="text-sm text-muted-foreground">Valeur stock</p>
                                <p className="text-2xl font-bold">
                                  {new Intl.NumberFormat('fr-FR', { 
                                    style: 'currency', 
                                    currency: 'EUR',
                                    notation: 'compact'
                                  }).format(zone.analytics?.totalValue || 0)}
                                </p>
                              </Card>
                              <Card className="p-4">
                                <p className="text-sm text-muted-foreground">Mouvements/jour</p>
                                <p className="text-2xl font-bold">{zone.analytics?.avgMovementsPerDay || 0}</p>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="configuration" className="p-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium mb-1">Dimensions</p>
                                  <p className="text-sm text-muted-foreground">
                                    {zone.dimensions?.length || 0} × {zone.dimensions?.width || 0} × {zone.dimensions?.height || 0} m
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Capacité max</p>
                                  <p className="text-sm text-muted-foreground">
                                    {zone.maxWeight || 0} kg • {zone.maxVolume || 0} m³
                                  </p>
                                </div>
                              </div>
                              {zone.configuration && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Configuration</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(zone.configuration).map(([key, value]) => (
                                      <Badge key={key} variant="secondary" className="text-xs">
                                        {key}: {String(value)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}

        {zones.length === 0 && (
          <Card className="p-12 text-center">
            <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune zone configurée</h3>
            <p className="text-muted-foreground mb-4">
              Créez des zones pour organiser votre entrepôt
            </p>
            {onZoneCreate && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une zone
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Créer une nouvelle zone"
        description="Configurez une nouvelle zone pour votre entrepôt"
      >
        <ZoneForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Modifier la zone"
        description="Modifiez la configuration de la zone"
      >
        {zoneToEdit && (
          <ZoneForm
            initialData={zoneToEdit}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setShowEditModal(false)
              setZoneToEdit(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}