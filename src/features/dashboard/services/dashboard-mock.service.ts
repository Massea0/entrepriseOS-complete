import type {
  DashboardConfig,
  DashboardLayout,
  WidgetConfig,
  DashboardAnalytics,
  DashboardListResponse,
  WidgetDataResponse
} from '../types/dashboard.types'
import type { UserRole } from '@/features/auth/types/auth.types'

// Données mock pour les widgets
const mockWidgets: WidgetConfig[] = [
  {
    id: 'widget-1',
    type: 'metric',
    title: 'Total des employés',
    category: 'hr',
    size: 'md',
    position: { x: 0, y: 0, w: 3, h: 2 },
    refreshInterval: '5m',
    data: {
      value: 42,
      format: 'number',
      trend: 'up',
      trendPercentage: 12,
      label: 'employés actifs'
    }
  },
  {
    id: 'widget-2',
    type: 'metric',
    title: 'Projets actifs',
    category: 'projects',
    size: 'md',
    position: { x: 3, y: 0, w: 3, h: 2 },
    refreshInterval: '5m',
    data: {
      value: 8,
      format: 'number',
      trend: 'up',
      trendPercentage: 25,
      label: 'projets en cours'
    }
  },
  {
    id: 'widget-3',
    type: 'metric',
    title: 'Chiffre d\'affaires',
    category: 'finance',
    size: 'md',
    position: { x: 6, y: 0, w: 3, h: 2 },
    refreshInterval: '5m',
    data: {
      value: 125000,
      format: 'currency',
      trend: 'up',
      trendPercentage: 18,
      label: 'ce mois-ci'
    }
  },
  {
    id: 'widget-4',
    type: 'metric',
    title: 'Stock total',
    category: 'inventory',
    size: 'md',
    position: { x: 9, y: 0, w: 3, h: 2 },
    refreshInterval: '5m',
    data: {
      value: 1250,
      format: 'number',
      trend: 'down',
      trendPercentage: 5,
      label: 'articles en stock'
    }
  },
  {
    id: 'widget-5',
    type: 'metric',
    title: 'Nouveaux clients',
    category: 'crm',
    size: 'md',
    position: { x: 0, y: 2, w: 4, h: 2 },
    refreshInterval: '15m',
    data: {
      value: 23,
      format: 'number',
      trend: 'up',
      trendPercentage: 35,
      label: 'ce mois-ci'
    }
  },
  {
    id: 'widget-6',
    type: 'metric',
    title: 'Tickets support',
    category: 'support',
    size: 'md',
    position: { x: 4, y: 2, w: 4, h: 2 },
    refreshInterval: '10m',
    data: {
      value: 7,
      format: 'number',
      trend: 'down',
      trendPercentage: 22,
      label: 'tickets ouverts'
    }
  },
  {
    id: 'widget-7',
    type: 'metric',
    title: 'Taux de satisfaction',
    category: 'analytics',
    size: 'md',
    position: { x: 8, y: 2, w: 4, h: 2 },
    refreshInterval: '30m',
    data: {
      value: 94.5,
      format: 'percentage',
      trend: 'up',
      trendPercentage: 2,
      label: 'satisfaction client'
    }
  }
]

// Dashboard layout mock
const mockLayout: DashboardLayout = {
  id: 'default-layout',
  name: 'Vue principale',
  type: 'grid',
  columns: 12,
  rows: 8,
  gap: 16,
  widgets: mockWidgets
}

// Dashboard config mock
const mockDashboard: DashboardConfig = {
  id: 'default-dashboard',
  name: 'Tableau de bord principal',
  description: 'Vue d\'ensemble de l\'entreprise',
  layouts: [mockLayout],
  defaultLayoutId: 'default-layout',
  permissions: {
    read: ['employee', 'manager', 'admin'],
    write: ['manager', 'admin'],
    delete: ['admin']
  },
  shared: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Service Mock pour le Dashboard
export class DashboardMockService {
  static async getDashboards(): Promise<DashboardListResponse> {
    return {
      data: [mockDashboard],
      total: 1,
      page: 1,
      pageSize: 10
    }
  }

  static async getDashboard(id: string): Promise<DashboardConfig> {
    return mockDashboard
  }

  static async getDashboardByRole(role: UserRole): Promise<DashboardConfig> {
    // Retourner le même dashboard pour tous les rôles en mode mock
    return mockDashboard
  }

  static async createDashboard(config: Partial<DashboardConfig>): Promise<DashboardConfig> {
    return {
      ...mockDashboard,
      ...config,
      id: `dashboard-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  static async updateDashboard(id: string, updates: Partial<DashboardConfig>): Promise<DashboardConfig> {
    return {
      ...mockDashboard,
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }

  static async deleteDashboard(id: string): Promise<void> {
    // Simulation de suppression
    return Promise.resolve()
  }

  static async duplicateDashboard(id: string, name?: string): Promise<DashboardConfig> {
    return {
      ...mockDashboard,
      id: `dashboard-${Date.now()}`,
      name: name || `${mockDashboard.name} (copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  static async refreshWidgetData(widgetId: string): Promise<WidgetDataResponse> {
    const widget = mockWidgets.find(w => w.id === widgetId)
    
    if (!widget) {
      throw new Error('Widget not found')
    }

    // Générer des données aléatoires pour simuler les mises à jour
    const randomChange = Math.random() * 10 - 5 // -5% à +5%
    const currentValue = widget.data.value as number
    const newValue = Math.round(currentValue * (1 + randomChange / 100))
    
    return {
      widgetId,
      data: {
        ...widget.data,
        value: newValue,
        trend: randomChange > 0 ? 'up' : 'down',
        trendPercentage: Math.abs(Math.round(randomChange))
      },
      lastUpdated: new Date().toISOString()
    }
  }

  static async getAnalyticsByRole(role: UserRole): Promise<DashboardAnalytics> {
    return {
      role,
      totalViews: 1234,
      uniqueUsers: 42,
      averageTimeSpent: 300,
      popularWidgets: [
        { widgetId: 'widget-1', views: 456 },
        { widgetId: 'widget-3', views: 389 }
      ],
      lastAccessed: new Date().toISOString()
    }
  }

  static async subscribeToUpdates(dashboardId: string): Promise<void> {
    console.log(`Mock: Subscribed to updates for dashboard ${dashboardId}`)
    return Promise.resolve()
  }

  static async unsubscribeFromUpdates(dashboardId: string): Promise<void> {
    console.log(`Mock: Unsubscribed from updates for dashboard ${dashboardId}`)
    return Promise.resolve()
  }
}

// Widget Data Cache pour le mode mock
export class WidgetDataCacheMock {
  private static cache = new Map<string, any>()

  static getData(widgetId: string) {
    return this.cache.get(widgetId)
  }

  static setData(widgetId: string, data: any) {
    this.cache.set(widgetId, {
      data,
      lastUpdated: new Date()
    })
  }

  static removeData(widgetId: string) {
    this.cache.delete(widgetId)
  }

  static clearAll() {
    this.cache.clear()
  }
}