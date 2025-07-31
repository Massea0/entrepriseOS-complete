import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Search, 
  Filter,
  Grid3X3,
  List,
  AlertCircle,
  MapPin,
  QrCode,
  Info
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { WarehouseZone, WarehousePosition } from '../../../types/inventory.types'
import { PositionTrackerProps } from '../WarehouseManager.types'

type ViewMode = 'grid' | 'list'

export const PositionTracker: React.FC<PositionTrackerProps> = ({
  zone,
  positions,
  onPositionUpdate,
  onPositionSelect,
  selectedPositionId,
  showOccupancy = true,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterOccupied, setFilterOccupied] = useState<boolean | null>(null)

  // Group positions by aisle and shelf
  const positionsByLocation = useMemo(() => {
    const grouped: Record<string, Record<string, WarehousePosition[]>> = {}
    
    positions.forEach(position => {
      const aisle = position.aisle || 'A'
      const shelf = position.shelf || '1'
      
      if (!grouped[aisle]) grouped[aisle] = {}
      if (!grouped[aisle][shelf]) grouped[aisle][shelf] = []
      
      grouped[aisle][shelf].push(position)
    })
    
    return grouped
  }, [positions])

  // Filter positions
  const filteredPositions = useMemo(() => {
    let filtered = positions

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(position =>
        position.code.toLowerCase().includes(query) ||
        position.barcode?.toLowerCase().includes(query) ||
        position.currentProduct?.sku?.toLowerCase().includes(query) ||
        position.currentProduct?.name?.toLowerCase().includes(query)
      )
    }

    // Occupancy filter
    if (filterOccupied !== null) {
      filtered = filtered.filter(position => position.isOccupied === filterOccupied)
    }

    return filtered
  }, [positions, searchQuery, filterOccupied])

  // Calculate stats
  const stats = useMemo(() => {
    const occupied = positions.filter(p => p.isOccupied).length
    const available = positions.length - occupied
    const occupancyRate = positions.length > 0 ? (occupied / positions.length) * 100 : 0

    return { occupied, available, occupancyRate, total: positions.length }
  }, [positions])

  const renderGridView = () => {
    const aisles = Object.keys(positionsByLocation).sort()

    return (
      <div className="space-y-6">
        {aisles.map(aisle => (
          <div key={aisle} className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Allée {aisle}</h4>
            <div className="space-y-3">
              {Object.entries(positionsByLocation[aisle])
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([shelf, shelfPositions]) => (
                  <div key={shelf} className="space-y-2">
                    <p className="text-xs text-muted-foreground">Étagère {shelf}</p>
                    <div className="grid grid-cols-10 gap-1">
                      {shelfPositions
                        .sort((a, b) => (a.position || 0) - (b.position || 0))
                        .map(position => {
                          const isSelected = selectedPositionId === position.id
                          const isFiltered = !filteredPositions.includes(position)

                          return (
                            <Tooltip key={position.id}>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={cn(
                                    'aspect-square rounded cursor-pointer border-2 transition-all',
                                    position.isOccupied
                                      ? 'bg-primary border-primary'
                                      : 'bg-muted border-muted hover:border-primary/50',
                                    isSelected && 'ring-2 ring-primary ring-offset-2',
                                    isFiltered && 'opacity-30',
                                    position.isBlocked && 'bg-destructive border-destructive'
                                  )}
                                  onClick={() => !isFiltered && onPositionSelect?.(position)}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-semibold">{position.code}</p>
                                  {position.isOccupied && position.currentProduct && (
                                    <>
                                      <p className="text-xs">{position.currentProduct.sku}</p>
                                      <p className="text-xs">{position.currentProduct.name}</p>
                                      <p className="text-xs">Qté: {position.currentQuantity}</p>
                                    </>
                                  )}
                                  {position.isBlocked && (
                                    <p className="text-xs text-destructive">Position bloquée</p>
                                  )}
                                  {!position.isOccupied && !position.isBlocked && (
                                    <p className="text-xs text-muted-foreground">Disponible</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderListView = () => {
    return (
      <div className="space-y-2">
        {filteredPositions.map((position, index) => {
          const isSelected = selectedPositionId === position.id

          return (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card
                className={cn(
                  'p-3 cursor-pointer transition-all hover:shadow-md',
                  isSelected && 'ring-2 ring-primary',
                  position.isBlocked && 'opacity-60'
                )}
                onClick={() => onPositionSelect?.(position)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded',
                    position.isOccupied ? 'bg-primary/10' : 'bg-muted',
                    position.isBlocked && 'bg-destructive/10'
                  )}>
                    <Package className={cn(
                      'h-4 w-4',
                      position.isOccupied ? 'text-primary' : 'text-muted-foreground',
                      position.isBlocked && 'text-destructive'
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{position.code}</p>
                      <Badge variant="outline" className="text-xs">
                        {position.aisle}-{position.shelf}-{position.position}
                      </Badge>
                      {position.isBlocked && (
                        <Badge variant="destructive" className="text-xs">
                          Bloqué
                        </Badge>
                      )}
                    </div>
                    {position.isOccupied && position.currentProduct && (
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="font-mono">{position.currentProduct.sku}</span>
                        <span className="truncate">{position.currentProduct.name}</span>
                        <span>Qté: {position.currentQuantity}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {position.barcode && (
                      <Tooltip>
                        <TooltipTrigger>
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">{position.barcode}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Badge
                      variant={position.isOccupied ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {position.isOccupied ? 'Occupé' : 'Libre'}
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats */}
      {showOccupancy && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Occupées</p>
            <p className="text-lg font-bold text-primary">{stats.occupied}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Libres</p>
            <p className="text-lg font-bold text-green-600">{stats.available}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Taux</p>
            <p className="text-lg font-bold">{Math.round(stats.occupancyRate)}%</p>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une position, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={filterOccupied === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterOccupied(filterOccupied === true ? null : true)}
          >
            Occupées
          </Button>
          <Button
            variant={filterOccupied === false ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterOccupied(filterOccupied === false ? null : false)}
          >
            Libres
          </Button>
          
          <div className="flex items-center border rounded-md ml-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend for grid view */}
      {viewMode === 'grid' && (
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-primary rounded" />
            <span>Occupé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-muted rounded" />
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-destructive rounded" />
            <span>Bloqué</span>
          </div>
        </div>
      )}

      {/* Positions Display */}
      {filteredPositions.length > 0 ? (
        viewMode === 'grid' ? renderGridView() : renderListView()
      ) : (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Aucune position trouvée
          </p>
        </Card>
      )}
    </div>
  )
}