'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { MetricWidget } from './widgets/MetricWidget'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  PlusIcon, 
  EditIcon, 
  SaveIcon, 
  XIcon,
  GridIcon,
  LayoutIcon
} from 'lucide-react'
import type { 
  WidgetConfig, 
  DashboardLayout,
  WidgetProps 
} from '../types/dashboard.types'
import { useDashboard } from '../hooks/useDashboard'

interface DashboardGridProps {
  className?: string
  showEditControls?: boolean
}

// Widget size mappings for grid
const WIDGET_SIZES = {
  sm: { w: 3, h: 2 },
  md: { w: 4, h: 3 },
  lg: { w: 6, h: 4 },
  xl: { w: 8, h: 5 },
  full: { w: 12, h: 6 }
} as const

// Widget renderer factory
const renderWidget = (config: WidgetConfig, isEditing: boolean, onUpdate?: (updates: Partial<WidgetConfig>) => void, onRemove?: () => void) => {
  const baseProps: WidgetProps = {
    config,
    isEditing,
    onUpdate,
    onRemove,
    onRefresh: () => {
      // Will be handled by useWidgetData hook
    }
  }

  switch (config.type) {
    case 'metric':
      return <MetricWidget {...baseProps} config={config} />
    
    case 'chart':
      // TODO: Implement ChartWidget
      return (
        <Card className="h-full">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <GridIcon className="h-8 w-8 mx-auto mb-2" />
              <p>Chart Widget</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </CardContent>
        </Card>
      )
    
    case 'list':
      // TODO: Implement ListWidget
      return (
        <Card className="h-full">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <LayoutIcon className="h-8 w-8 mx-auto mb-2" />
              <p>List Widget</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </CardContent>
        </Card>
      )
    
    case 'activity':
      // TODO: Implement ActivityWidget
      return (
        <Card className="h-full">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="h-8 w-8 mx-auto mb-2 rounded-full bg-muted" />
              <p>Activity Widget</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </CardContent>
        </Card>
      )
    
    case 'calendar':
      // TODO: Implement CalendarWidget
      return (
        <Card className="h-full">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="h-8 w-8 mx-auto mb-2 rounded bg-muted" />
              <p>Calendar Widget</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </CardContent>
        </Card>
      )
    
    case 'table':
      // TODO: Implement TableWidget
      return (
        <Card className="h-full">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="h-8 w-8 mx-auto mb-2 rounded bg-muted" />
              <p>Table Widget</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </CardContent>
        </Card>
      )
    
    default:
      return (
        <Card className="h-full border-dashed">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <PlusIcon className="h-8 w-8 mx-auto mb-2" />
              <p>Unknown Widget</p>
              <p className="text-xs">Type: {config.type}</p>
            </div>
          </CardContent>
        </Card>
      )
  }
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  className,
  showEditControls = true
}) => {
  const {
    dashboard,
    layout,
    widgets,
    isEditing,
    isLoading,
    error,
    setEditMode,
    addWidget,
    removeWidget,
    updateWidget,
    saveDashboard,
    resetChanges
  } = useDashboard()

  // Create grid layout from widgets
  const gridLayout = useMemo(() => {
    if (!widgets || !layout) return []

    return widgets.map(widget => ({
      id: widget.id,
      widget,
      gridArea: `${widget.position.y + 1} / ${widget.position.x + 1} / span ${widget.position.h} / span ${widget.position.w}`
    }))
  }, [widgets, layout])

  const handleEditToggle = () => {
    if (isEditing) {
      setEditMode(false)
    } else {
      setEditMode(true)
    }
  }

  const handleSave = async () => {
    try {
      await saveDashboard()
      setEditMode(false)
    } catch (error) {
      console.error('Failed to save dashboard:', error)
    }
  }

  const handleCancel = () => {
    resetChanges()
    setEditMode(false)
  }

  const handleAddWidget = () => {
    // Find next available position
    const occupiedPositions = widgets.map(w => ({
      x: w.position.x,
      y: w.position.y,
      w: w.position.w,
      h: w.position.h
    }))

    // Simple positioning logic - place at first available spot
    let x = 0
    let y = 0
    const cols = layout?.columns || 12

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < cols - 3; col++) {
        const isOccupied = occupiedPositions.some(pos => 
          col >= pos.x && col < pos.x + pos.w &&
          row >= pos.y && row < pos.y + pos.h
        )

        if (!isOccupied) {
          x = col
          y = row
          break
        }
      }
      if (x !== 0 || y !== 0) break
    }

    addWidget({
      type: 'metric',
      title: 'Nouvelle métrique',
      category: 'analytics',
      size: 'md',
      position: { x, y, w: 4, h: 3 },
      refreshInterval: '5m',
      data: { 
        value: Math.floor(Math.random() * 1000),
        format: 'number',
        trend: 'up',
        trendPercentage: Math.floor(Math.random() * 20)
      }
    })
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-destructive font-medium mb-2">
              Erreur de chargement
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {error}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Actualiser
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {dashboard?.name || 'Dashboard'}
          </h1>
          {layout && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{layout.name}</Badge>
              <span className="text-sm text-muted-foreground">
                {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {showEditControls && (
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <XIcon className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleEditToggle}>
                <EditIcon className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add widget button in edit mode */}
      {isEditing && (
        <div className="mb-4">
          <Button variant="dashed" onClick={handleAddWidget} className="w-full">
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter un widget
          </Button>
        </div>
      )}

      {/* Widget grid */}
      {widgets.length > 0 ? (
        <div 
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${layout?.columns || 12}, minmax(0, 1fr))`,
            gridAutoRows: 'minmax(100px, auto)'
          }}
        >
          {gridLayout.map(({ id, widget, gridArea }) => (
            <div
              key={id}
              style={{ gridArea }}
              className={cn(
                'min-h-0', // Important for proper grid sizing
                isEditing && 'ring-2 ring-transparent hover:ring-primary/50 transition-all'
              )}
            >
              {renderWidget(
                widget,
                isEditing,
                (updates) => updateWidget(id, updates),
                () => removeWidget(id)
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="h-64">
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center">
              <GridIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Aucun widget</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par ajouter votre premier widget
              </p>
              {isEditing && (
                <Button onClick={handleAddWidget}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter un widget
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

DashboardGrid.displayName = 'DashboardGrid'