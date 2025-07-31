import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid3X3,
  Layers,
  Info,
  Package,
  Thermometer,
  Shield
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

import { Warehouse, WarehouseZone, WarehousePosition } from '../../../types/inventory.types'
import { WarehouseMapProps } from '../WarehouseManager.types'
import { CapacityIndicator } from './CapacityIndicator'

const ZONE_COLORS = {
  storage: '#3B82F6',      // blue
  picking: '#10B981',      // green
  receiving: '#F59E0B',    // amber
  shipping: '#8B5CF6',     // purple
  quarantine: '#EF4444',   // red
  returns: '#F97316'       // orange
}

const TEMPERATURE_COLORS = {
  ambient: '#6B7280',      // gray
  refrigerated: '#06B6D4', // cyan
  frozen: '#3B82F6'        // blue
}

export const WarehouseMap: React.FC<WarehouseMapProps> = ({
  warehouse,
  onZoneClick,
  onPositionClick,
  selectedZoneId,
  selectedPositionId,
  showCapacity = true,
  showHeatmap = false,
  className
}) => {
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5))
  const handleResetZoom = () => setZoom(1)

  // Calculate zone dimensions based on warehouse layout
  const calculateZoneLayout = (zones: WarehouseZone[]) => {
    const totalArea = warehouse.totalArea || 10000 // m²
    const zoneLayouts: Record<string, { x: number; y: number; width: number; height: number }> = {}
    
    // Simple grid layout - can be enhanced with actual warehouse layout data
    const cols = Math.ceil(Math.sqrt(zones.length))
    const rows = Math.ceil(zones.length / cols)
    
    zones.forEach((zone, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const zoneArea = zone.area || totalArea / zones.length
      const areaRatio = zoneArea / totalArea
      
      zoneLayouts[zone.id] = {
        x: (col / cols) * 100,
        y: (row / rows) * 100,
        width: (1 / cols) * 100 * 0.9, // 90% to add gaps
        height: (1 / rows) * 100 * 0.9
      }
    })
    
    return zoneLayouts
  }

  const zoneLayouts = calculateZoneLayout(warehouse.zones || [])

  const getZoneColor = (zone: WarehouseZone) => {
    if (showHeatmap && zone.analytics) {
      // Color based on utilization
      const utilization = (zone.analytics.occupiedPositions / zone.analytics.totalPositions) * 100
      if (utilization > 90) return '#EF4444' // red
      if (utilization > 75) return '#F59E0B' // amber
      if (utilization > 50) return '#10B981' // green
      return '#3B82F6' // blue
    }
    return ZONE_COLORS[zone.type] || '#6B7280'
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Plan de l'entrepôt - {warehouse.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {warehouse.zones?.length || 0} zones • {warehouse.totalArea || 0} m²
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Toggle
            pressed={showGrid}
            onPressedChange={setShowGrid}
            size="sm"
          >
            <Grid3X3 className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={showLabels}
            onPressedChange={setShowLabels}
            size="sm"
          >
            <Info className="h-4 w-4" />
          </Toggle>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="h-8 px-2 text-xs"
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="text-muted-foreground">Légende:</span>
        {Object.entries(ZONE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="relative bg-muted rounded-lg overflow-hidden"
        style={{ height: '600px' }}
      >
        <div 
          className="absolute inset-0 transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Grid */}
          {showGrid && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* Zones */}
          {warehouse.zones?.map(zone => {
            const layout = zoneLayouts[zone.id]
            const isSelected = selectedZoneId === zone.id
            const isHovered = hoveredZone === zone.id

            return (
              <motion.div
                key={zone.id}
                className={cn(
                  'absolute cursor-pointer transition-all',
                  isSelected && 'ring-2 ring-primary ring-offset-2',
                  isHovered && 'shadow-lg z-10'
                )}
                style={{
                  left: `${layout.x}%`,
                  top: `${layout.y}%`,
                  width: `${layout.width}%`,
                  height: `${layout.height}%`,
                  backgroundColor: getZoneColor(zone),
                  opacity: isSelected || isHovered ? 1 : 0.8
                }}
                onClick={() => onZoneClick?.(zone)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative w-full h-full p-3 text-white">
                  {/* Zone Info */}
                  {showLabels && (
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">{zone.name}</div>
                      <div className="text-xs opacity-90">{zone.code}</div>
                      
                      {/* Zone Stats */}
                      {zone.analytics && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs">
                            {zone.analytics.occupiedPositions}/{zone.analytics.totalPositions} positions
                          </div>
                          {showCapacity && (
                            <CapacityIndicator
                              used={zone.analytics.occupiedPositions}
                              total={zone.analytics.totalPositions}
                              size="sm"
                              className="mt-1"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Zone Icons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {zone.temperature && zone.temperature !== 'ambient' && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div 
                            className="p-1 rounded bg-white/20"
                            style={{ color: TEMPERATURE_COLORS[zone.temperature] }}
                          >
                            <Thermometer className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {zone.temperature === 'refrigerated' ? 'Réfrigéré' : 'Congelé'}
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {zone.securityLevel && zone.securityLevel !== 'standard' && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="p-1 rounded bg-white/20">
                            <Shield className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Sécurité {zone.securityLevel}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Positions Grid (simplified) */}
                  {zone.positions && zone.positions.length > 0 && zoom > 1.2 && (
                    <div className="absolute bottom-2 left-2 right-2 grid grid-cols-5 gap-1">
                      {zone.positions.slice(0, 10).map(position => (
                        <div
                          key={position.id}
                          className={cn(
                            'h-2 rounded-sm cursor-pointer',
                            position.isOccupied ? 'bg-white/60' : 'bg-white/20',
                            selectedPositionId === position.id && 'ring-1 ring-white'
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onPositionClick?.(zone, position)
                          }}
                        />
                      ))}
                      {zone.positions.length > 10 && (
                        <div className="text-xs text-white/60">+{zone.positions.length - 10}</div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Hovered Zone Tooltip */}
        {hoveredZone && warehouse.zones && (
          <div className="absolute top-4 right-4 bg-background border rounded-lg shadow-lg p-3 max-w-xs pointer-events-none z-20">
            {(() => {
              const zone = warehouse.zones.find(z => z.id === hoveredZone)
              if (!zone) return null
              
              return (
                <>
                  <h4 className="font-semibold mb-2">{zone.name}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {zone.type}
                      </Badge>
                    </div>
                    {zone.area && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Surface:</span>
                        <span>{zone.area} m²</span>
                      </div>
                    )}
                    {zone.analytics && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Capacité:</span>
                          <span>
                            {Math.round((zone.analytics.occupiedPositions / zone.analytics.totalPositions) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Articles:</span>
                          <span>{zone.analytics.totalItems}</span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </Card>
  )
}