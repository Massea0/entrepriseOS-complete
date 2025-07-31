import { ky } from '@/services/api'
import type {
  DashboardConfig,
  DashboardLayout,
  WidgetConfig,
  WidgetTemplate,
  DashboardAnalytics,
  DashboardListResponse,
  WidgetDataResponse
} from '../types/dashboard.types'
import type { UserRole } from '@/features/auth/types/auth.types'

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */
export class DashboardService {
  private static readonly ENDPOINTS = {
    // Dashboard management
    DASHBOARDS: '/dashboards',
    DASHBOARD_BY_ID: (id: string) => `/dashboards/${id}`,
    DASHBOARD_BY_ROLE: (role: UserRole) => `/dashboards/role/${role}`,
    
    // Layout management
    LAYOUTS: (dashboardId: string) => `/dashboards/${dashboardId}/layouts`,
    LAYOUT_BY_ID: (dashboardId: string, layoutId: string) => `/dashboards/${dashboardId}/layouts/${layoutId}`,
    
    // Widget management
    WIDGETS: (dashboardId: string) => `/dashboards/${dashboardId}/widgets`,
    WIDGET_BY_ID: (dashboardId: string, widgetId: string) => `/dashboards/${dashboardId}/widgets/${widgetId}`,
    WIDGET_DATA: (widgetId: string) => `/widgets/${widgetId}/data`,
    WIDGET_TEMPLATES: '/widgets/templates',
    
    // Analytics
    ANALYTICS: '/dashboard/analytics',
    ANALYTICS_BY_ROLE: (role: UserRole) => `/dashboard/analytics/${role}`,
    
    // Real-time updates
    SUBSCRIBE: '/dashboard/subscribe',
    UNSUBSCRIBE: '/dashboard/unsubscribe'
  } as const

  // Dashboard Management

  /**
   * Get all dashboards for current user
   */
  static async getDashboards(): Promise<DashboardListResponse> {
    const response = await ky.get(this.ENDPOINTS.DASHBOARDS).json<DashboardListResponse>()
    return response
  }

  /**
   * Get dashboard by ID
   */
  static async getDashboard(id: string): Promise<DashboardConfig> {
    const response = await ky.get(this.ENDPOINTS.DASHBOARD_BY_ID(id)).json<DashboardConfig>()
    return response
  }

  /**
   * Get default dashboard for user role
   */
  static async getDashboardByRole(role: UserRole): Promise<DashboardConfig> {
    const response = await ky.get(this.ENDPOINTS.DASHBOARD_BY_ROLE(role)).json<DashboardConfig>()
    return response
  }

  /**
   * Create new dashboard
   */
  static async createDashboard(config: Partial<DashboardConfig>): Promise<DashboardConfig> {
    const response = await ky.post(this.ENDPOINTS.DASHBOARDS, {
      json: config
    }).json<DashboardConfig>()
    return response
  }

  /**
   * Update dashboard
   */
  static async updateDashboard(id: string, updates: Partial<DashboardConfig>): Promise<DashboardConfig> {
    const response = await ky.patch(this.ENDPOINTS.DASHBOARD_BY_ID(id), {
      json: updates
    }).json<DashboardConfig>()
    return response
  }

  /**
   * Delete dashboard
   */
  static async deleteDashboard(id: string): Promise<void> {
    await ky.delete(this.ENDPOINTS.DASHBOARD_BY_ID(id))
  }

  /**
   * Duplicate dashboard
   */
  static async duplicateDashboard(id: string, name?: string): Promise<DashboardConfig> {
    const response = await ky.post(`${this.ENDPOINTS.DASHBOARD_BY_ID(id)}/duplicate`, {
      json: { name }
    }).json<DashboardConfig>()
    return response
  }

  // Layout Management

  /**
   * Get all layouts for dashboard
   */
  static async getLayouts(dashboardId: string): Promise<DashboardLayout[]> {
    const response = await ky.get(this.ENDPOINTS.LAYOUTS(dashboardId)).json<DashboardLayout[]>()
    return response
  }

  /**
   * Get layout by ID
   */
  static async getLayout(dashboardId: string, layoutId: string): Promise<DashboardLayout> {
    const response = await ky.get(this.ENDPOINTS.LAYOUT_BY_ID(dashboardId, layoutId)).json<DashboardLayout>()
    return response
  }

  /**
   * Create new layout
   */
  static async createLayout(dashboardId: string, layout: Partial<DashboardLayout>): Promise<DashboardLayout> {
    const response = await ky.post(this.ENDPOINTS.LAYOUTS(dashboardId), {
      json: layout
    }).json<DashboardLayout>()
    return response
  }

  /**
   * Update layout
   */
  static async updateLayout(
    dashboardId: string, 
    layoutId: string, 
    updates: Partial<DashboardLayout>
  ): Promise<DashboardLayout> {
    const response = await ky.patch(this.ENDPOINTS.LAYOUT_BY_ID(dashboardId, layoutId), {
      json: updates
    }).json<DashboardLayout>()
    return response
  }

  /**
   * Delete layout
   */
  static async deleteLayout(dashboardId: string, layoutId: string): Promise<void> {
    await ky.delete(this.ENDPOINTS.LAYOUT_BY_ID(dashboardId, layoutId))
  }

  // Widget Management

  /**
   * Get all widgets for dashboard
   */
  static async getWidgets(dashboardId: string): Promise<WidgetConfig[]> {
    const response = await ky.get(this.ENDPOINTS.WIDGETS(dashboardId)).json<WidgetConfig[]>()
    return response
  }

  /**
   * Get widget by ID
   */
  static async getWidget(dashboardId: string, widgetId: string): Promise<WidgetConfig> {
    const response = await ky.get(this.ENDPOINTS.WIDGET_BY_ID(dashboardId, widgetId)).json<WidgetConfig>()
    return response
  }

  /**
   * Create new widget
   */
  static async createWidget(dashboardId: string, widget: Partial<WidgetConfig>): Promise<WidgetConfig> {
    const response = await ky.post(this.ENDPOINTS.WIDGETS(dashboardId), {
      json: widget
    }).json<WidgetConfig>()
    return response
  }

  /**
   * Update widget
   */
  static async updateWidget(
    dashboardId: string, 
    widgetId: string, 
    updates: Partial<WidgetConfig>
  ): Promise<WidgetConfig> {
    const response = await ky.patch(this.ENDPOINTS.WIDGET_BY_ID(dashboardId, widgetId), {
      json: updates
    }).json<WidgetConfig>()
    return response
  }

  /**
   * Delete widget
   */
  static async deleteWidget(dashboardId: string, widgetId: string): Promise<void> {
    await ky.delete(this.ENDPOINTS.WIDGET_BY_ID(dashboardId, widgetId))
  }

  /**
   * Get widget data
   */
  static async getWidgetData(widgetId: string): Promise<WidgetDataResponse> {
    const response = await ky.get(this.ENDPOINTS.WIDGET_DATA(widgetId)).json<WidgetDataResponse>()
    return response
  }

  /**
   * Refresh widget data
   */
  static async refreshWidgetData(widgetId: string): Promise<WidgetDataResponse> {
    const response = await ky.post(`${this.ENDPOINTS.WIDGET_DATA(widgetId)}/refresh`).json<WidgetDataResponse>()
    return response
  }

  /**
   * Get available widget templates
   */
  static async getWidgetTemplates(): Promise<WidgetTemplate[]> {
    const response = await ky.get(this.ENDPOINTS.WIDGET_TEMPLATES).json<WidgetTemplate[]>()
    return response
  }

  // Analytics

  /**
   * Get dashboard analytics data
   */
  static async getAnalytics(): Promise<DashboardAnalytics> {
    const response = await ky.get(this.ENDPOINTS.ANALYTICS).json<DashboardAnalytics>()
    return response
  }

  /**
   * Get role-specific analytics
   */
  static async getAnalyticsByRole(role: UserRole): Promise<DashboardAnalytics> {
    const response = await ky.get(this.ENDPOINTS.ANALYTICS_BY_ROLE(role)).json<DashboardAnalytics>()
    return response
  }

  // Real-time Updates

  /**
   * Subscribe to dashboard updates
   */
  static async subscribeToUpdates(dashboardId: string): Promise<void> {
    await ky.post(this.ENDPOINTS.SUBSCRIBE, {
      json: { dashboardId }
    })
  }

  /**
   * Unsubscribe from dashboard updates
   */
  static async unsubscribeFromUpdates(dashboardId: string): Promise<void> {
    await ky.post(this.ENDPOINTS.UNSUBSCRIBE, {
      json: { dashboardId }
    })
  }
}

/**
 * Widget Data Cache Manager
 * Handles caching and refresh intervals for widget data
 */
export class WidgetDataCache {
  private static cache = new Map<string, {
    data: any
    lastUpdated: Date
    refreshInterval: number
    timeoutId?: NodeJS.Timeout
  }>()

  /**
   * Set widget data in cache with auto-refresh
   */
  static setData(
    widgetId: string, 
    data: any, 
    refreshInterval: number = 0
  ): void {
    // Clear existing timeout
    const existing = this.cache.get(widgetId)
    if (existing?.timeoutId) {
      clearTimeout(existing.timeoutId)
    }

    // Set new data
    const cacheEntry = {
      data,
      lastUpdated: new Date(),
      refreshInterval,
      timeoutId: undefined as NodeJS.Timeout | undefined
    }

    // Set auto-refresh if interval > 0
    if (refreshInterval > 0) {
      cacheEntry.timeoutId = setTimeout(async () => {
        try {
          const response = await DashboardService.refreshWidgetData(widgetId)
          this.setData(widgetId, response.data, refreshInterval)
        } catch (error) {
          console.error(`Failed to refresh widget ${widgetId}:`, error)
          // Retry with exponential backoff
          setTimeout(() => {
            this.setData(widgetId, data, refreshInterval * 1.5)
          }, 5000)
        }
      }, refreshInterval)
    }

    this.cache.set(widgetId, cacheEntry)
  }

  /**
   * Get widget data from cache
   */
  static getData(widgetId: string): {
    data: any
    lastUpdated: Date
  } | null {
    const entry = this.cache.get(widgetId)
    if (!entry) return null

    return {
      data: entry.data,
      lastUpdated: entry.lastUpdated
    }
  }

  /**
   * Remove widget from cache
   */
  static removeData(widgetId: string): void {
    const entry = this.cache.get(widgetId)
    if (entry?.timeoutId) {
      clearTimeout(entry.timeoutId)
    }
    this.cache.delete(widgetId)
  }

  /**
   * Clear all cached data
   */
  static clearAll(): void {
    this.cache.forEach((entry) => {
      if (entry.timeoutId) {
        clearTimeout(entry.timeoutId)
      }
    })
    this.cache.clear()
  }

  /**
   * Check if data is stale (older than refresh interval)
   */
  static isStale(widgetId: string): boolean {
    const entry = this.cache.get(widgetId)
    if (!entry) return true

    const age = Date.now() - entry.lastUpdated.getTime()
    return age > entry.refreshInterval
  }
}

/**
 * Dashboard Template Presets
 * Pre-configured dashboard layouts for different roles
 */
export class DashboardTemplates {
  /**
   * Admin dashboard template
   */
  static getAdminTemplate(): Partial<DashboardConfig> {
    return {
      name: 'Dashboard Administrateur',
      role: 'admin',
      layouts: [{
        id: 'admin-default',
        name: 'Vue d\'ensemble',
        isDefault: true,
        columns: 12,
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
        widgets: [
          {
            id: 'total-users',
            type: 'metric',
            title: 'Utilisateurs Total',
            category: 'analytics',
            size: 'md',
            position: { x: 0, y: 0, w: 3, h: 2 },
            refreshInterval: '5m',
            data: { value: 0, format: 'number' },
            color: 'primary'
          },
          {
            id: 'revenue-chart',
            type: 'chart',
            title: 'Revenus Mensuels',
            category: 'finance',
            size: 'lg',
            position: { x: 3, y: 0, w: 6, h: 4 },
            refreshInterval: '15m',
            chartType: 'line',
            data: { labels: [], datasets: [] }
          },
          {
            id: 'recent-activities',
            type: 'activity',
            title: 'Activités Récentes',
            category: 'analytics',
            size: 'md',
            position: { x: 9, y: 0, w: 3, h: 4 },
            refreshInterval: '1m',
            data: { activities: [], maxItems: 10 }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      defaultLayoutId: 'admin-default',
      permissions: ['admin.view', 'analytics.view', 'users.view'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Manager dashboard template
   */
  static getManagerTemplate(): Partial<DashboardConfig> {
    return {
      name: 'Dashboard Manager',
      role: 'manager',
      layouts: [{
        id: 'manager-default',
        name: 'Gestion d\'équipe',
        isDefault: true,
        columns: 12,
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
        widgets: [
          {
            id: 'team-performance',
            type: 'chart',
            title: 'Performance Équipe',
            category: 'hr',
            size: 'lg',
            position: { x: 0, y: 0, w: 8, h: 3 },
            refreshInterval: '30m',
            chartType: 'bar',
            data: { labels: [], datasets: [] }
          },
          {
            id: 'pending-tasks',
            type: 'list',
            title: 'Tâches En Attente',
            category: 'tasks',
            size: 'md',
            position: { x: 8, y: 0, w: 4, h: 3 },
            refreshInterval: '5m',
            data: { items: [], maxItems: 8 }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      defaultLayoutId: 'manager-default',
      permissions: ['manager.view', 'team.view', 'projects.view'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Employee dashboard template
   */
  static getEmployeeTemplate(): Partial<DashboardConfig> {
    return {
      name: 'Dashboard Employé',
      role: 'employee',
      layouts: [{
        id: 'employee-default',
        name: 'Mon espace de travail',
        isDefault: true,
        columns: 12,
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
        widgets: [
          {
            id: 'my-tasks',
            type: 'list',
            title: 'Mes Tâches',
            category: 'tasks',
            size: 'lg',
            position: { x: 0, y: 0, w: 6, h: 4 },
            refreshInterval: '2m',
            data: { items: [], maxItems: 10 }
          },
          {
            id: 'calendar',
            type: 'calendar',
            title: 'Mon Planning',
            category: 'tasks',
            size: 'lg',
            position: { x: 6, y: 0, w: 6, h: 4 },
            refreshInterval: '15m',
            data: { events: [], view: 'week' }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      defaultLayoutId: 'employee-default',
      permissions: ['tasks.view', 'calendar.view'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}