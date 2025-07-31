'use client'

import React from 'react'
import { create } from 'zustand'
import { DashboardService, WidgetDataCache } from '../services/dashboard.service'
import { useAuth } from '@/features/auth'
import type {
  DashboardConfig,
  DashboardLayout,
  WidgetConfig,
  DashboardState,
  DashboardActions,
  UseDashboardReturn,
  UseWidgetDataReturn
} from '../types/dashboard.types'

interface DashboardStore extends DashboardState, DashboardActions {
  // Internal actions
  setDashboard: (dashboard: DashboardConfig) => void
  setLayout: (layout: DashboardLayout) => void
  setWidgets: (widgets: WidgetConfig[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  currentDashboard: undefined,
  currentLayout: undefined,
  widgets: [],
  isEditing: false,
  isLoading: false,
  error: undefined,
  availableWidgets: [],
  widgetData: {},
  lastUpdate: new Date(),

  // Dashboard management
  loadDashboard: async (dashboardId: string) => {
    try {
      set({ isLoading: true, error: undefined })
      
      const dashboard = await DashboardService.getDashboard(dashboardId)
      const defaultLayout = dashboard.layouts.find(l => l.id === dashboard.defaultLayoutId) 
        || dashboard.layouts[0]
      
      if (!defaultLayout) {
        throw new Error('No layouts found for dashboard')
      }

      set({
        currentDashboard: dashboard,
        currentLayout: defaultLayout,
        widgets: defaultLayout.widgets,
        isLoading: false
      })

      // Load widget data
      await get().refreshAllWidgets()
      
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to load dashboard' 
      })
      throw error
    }
  },

  saveDashboard: async () => {
    try {
      const { currentDashboard, currentLayout, widgets } = get()
      if (!currentDashboard || !currentLayout) return

      set({ isLoading: true, error: undefined })

      // Update layout with current widgets
      const updatedLayout = { ...currentLayout, widgets }
      
      // Update dashboard
      const updatedDashboard = {
        ...currentDashboard,
        layouts: currentDashboard.layouts.map(layout =>
          layout.id === currentLayout.id ? updatedLayout : layout
        )
      }

      const savedDashboard = await DashboardService.updateDashboard(
        currentDashboard.id, 
        updatedDashboard
      )

      set({
        currentDashboard: savedDashboard,
        currentLayout: updatedLayout,
        isLoading: false
      })

    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to save dashboard' 
      })
      throw error
    }
  },

  createDashboard: async (config: Partial<DashboardConfig>) => {
    try {
      set({ isLoading: true, error: undefined })
      
      const dashboard = await DashboardService.createDashboard(config)
      
      set({ isLoading: false })
      return dashboard
      
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to create dashboard' 
      })
      throw error
    }
  },

  deleteDashboard: async (dashboardId: string) => {
    try {
      set({ isLoading: true, error: undefined })
      
      await DashboardService.deleteDashboard(dashboardId)
      
      const { currentDashboard } = get()
      if (currentDashboard?.id === dashboardId) {
        set({
          currentDashboard: undefined,
          currentLayout: undefined,
          widgets: []
        })
      }
      
      set({ isLoading: false })
      
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to delete dashboard' 
      })
      throw error
    }
  },

  duplicateDashboard: async (dashboardId: string) => {
    try {
      set({ isLoading: true, error: undefined })
      
      const dashboard = await DashboardService.duplicateDashboard(dashboardId)
      
      set({ isLoading: false })
      return dashboard
      
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to duplicate dashboard' 
      })
      throw error
    }
  },

  // Layout management
  switchLayout: async (layoutId: string) => {
    try {
      const { currentDashboard } = get()
      if (!currentDashboard) return

      const layout = currentDashboard.layouts.find(l => l.id === layoutId)
      if (!layout) {
        throw new Error('Layout not found')
      }

      set({
        currentLayout: layout,
        widgets: layout.widgets
      })

      await get().refreshAllWidgets()
      
    } catch (error: any) {
      set({ error: error.message || 'Failed to switch layout' })
      throw error
    }
  },

  createLayout: async (layout: Partial<DashboardLayout>) => {
    try {
      const { currentDashboard } = get()
      if (!currentDashboard) throw new Error('No dashboard loaded')

      set({ isLoading: true, error: undefined })
      
      const newLayout = await DashboardService.createLayout(currentDashboard.id, layout)
      
      set({ isLoading: false })
      return newLayout
      
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to create layout' 
      })
      throw error
    }
  },

  deleteLayout: async (layoutId: string) => {
    try {
      const { currentDashboard } = get()
      if (!currentDashboard) return

      set({ isLoading: true, error: undefined })
      
      await DashboardService.deleteLayout(currentDashboard.id, layoutId)
      
      set({ isLoading: false })
      
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to delete layout' 
      })
      throw error
    }
  },

  // Widget management
  addWidget: (widget: Partial<WidgetConfig>) => {
    const { widgets } = get()
    
    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      title: 'Nouveau Widget',
      category: 'analytics',
      size: 'md',
      position: { x: 0, y: 0, w: 4, h: 3 },
      refreshInterval: '5m',
      type: 'metric',
      data: { value: 0 },
      ...widget
    } as WidgetConfig

    set({ widgets: [...widgets, newWidget] })
  },

  removeWidget: (widgetId: string) => {
    const { widgets } = get()
    
    // Remove from cache
    WidgetDataCache.removeData(widgetId)
    
    set({ 
      widgets: widgets.filter(w => w.id !== widgetId) 
    })
  },

  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => {
    const { widgets } = get()
    
    set({
      widgets: widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    })
  },

  moveWidget: (widgetId: string, position: WidgetConfig['position']) => {
    get().updateWidget(widgetId, { position })
  },

  resizeWidget: (widgetId: string, size: WidgetConfig['size']) => {
    get().updateWidget(widgetId, { size })
  },

  // Widget data
  refreshWidget: async (widgetId: string) => {
    try {
      const response = await DashboardService.refreshWidgetData(widgetId)
      
      set(state => ({
        widgetData: {
          ...state.widgetData,
          [widgetId]: response.data
        },
        lastUpdate: new Date()
      }))

      // Update cache
      WidgetDataCache.setData(widgetId, response.data)
      
    } catch (error: any) {
      console.error(`Failed to refresh widget ${widgetId}:`, error)
      get().updateWidget(widgetId, { 
        error: error.message || 'Failed to refresh data' 
      })
    }
  },

  refreshAllWidgets: async () => {
    const { widgets } = get()
    
    const refreshPromises = widgets.map(widget => 
      get().refreshWidget(widget.id)
    )
    
    await Promise.allSettled(refreshPromises)
  },

  setWidgetData: (widgetId: string, data: any) => {
    set(state => ({
      widgetData: {
        ...state.widgetData,
        [widgetId]: data
      },
      lastUpdate: new Date()
    }))
  },

  // Editing mode
  setEditMode: (editing: boolean) => {
    set({ isEditing: editing })
  },

  resetChanges: () => {
    const { currentLayout } = get()
    if (currentLayout) {
      set({ 
        widgets: currentLayout.widgets,
        isEditing: false 
      })
    }
  },

  // Real-time updates
  subscribeToUpdates: async () => {
    const { currentDashboard } = get()
    if (!currentDashboard) return

    try {
      await DashboardService.subscribeToUpdates(currentDashboard.id)
    } catch (error: any) {
      console.error('Failed to subscribe to updates:', error)
    }
  },

  unsubscribeFromUpdates: async () => {
    const { currentDashboard } = get()
    if (!currentDashboard) return

    try {
      await DashboardService.unsubscribeFromUpdates(currentDashboard.id)
    } catch (error: any) {
      console.error('Failed to unsubscribe from updates:', error)
    }
  },

  // Setters
  setDashboard: (dashboard: DashboardConfig) => set({ currentDashboard: dashboard }),
  setLayout: (layout: DashboardLayout) => set({ currentLayout: layout }),
  setWidgets: (widgets: WidgetConfig[]) => set({ widgets }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error })
}))

/**
 * Main dashboard hook
 */
export const useDashboard = (): UseDashboardReturn => {
  const store = useDashboardStore()
  const { user } = useAuth()

  // Auto-load dashboard for user role
  React.useEffect(() => {
    if (user && !store.currentDashboard) {
      DashboardService.getDashboardByRole(user.role)
        .then(dashboard => {
          store.loadDashboard(dashboard.id)
        })
        .catch(error => {
          console.error('Failed to load default dashboard:', error)
        })
    }
  }, [user, store.currentDashboard])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      store.unsubscribeFromUpdates()
      WidgetDataCache.clearAll()
    }
  }, [])

  return {
    // State
    dashboard: store.currentDashboard,
    layout: store.currentLayout,
    widgets: store.widgets,
    isEditing: store.isEditing,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    loadDashboard: store.loadDashboard,
    saveDashboard: store.saveDashboard,
    addWidget: store.addWidget,
    removeWidget: store.removeWidget,
    updateWidget: store.updateWidget,

    // Edit mode
    setEditMode: store.setEditMode,
    resetChanges: store.resetChanges
  }
}

/**
 * Hook for widget data management
 */
export const useWidgetData = <T = any>(widgetId: string): UseWidgetDataReturn<T> => {
  const store = useDashboardStore()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string>()

  const data = store.widgetData[widgetId] as T | undefined
  const lastUpdated = React.useMemo(() => {
    const cached = WidgetDataCache.getData(widgetId)
    return cached?.lastUpdated
  }, [widgetId, store.lastUpdate])

  const refresh = React.useCallback(async () => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      await store.refreshWidget(widgetId)
    } catch (err: any) {
      setError(err.message || 'Failed to refresh widget data')
    } finally {
      setIsLoading(false)
    }
  }, [widgetId, store.refreshWidget])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh
  }
}

/**
 * Hook for dashboard analytics
 */
export const useDashboardAnalytics = () => {
  const [analytics, setAnalytics] = React.useState<any>()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const { user } = useAuth()

  const fetchAnalytics = React.useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(undefined)

    try {
      const data = await DashboardService.getAnalyticsByRole(user.role)
      setAnalytics(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    isLoading,
    error,
    refresh: fetchAnalytics
  }
}