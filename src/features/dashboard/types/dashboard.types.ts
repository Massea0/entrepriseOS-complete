import { ReactNode } from 'react'
import { UserRole } from '@/features/auth/types/auth.types'

// Widget size definitions
export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Widget category types
export type WidgetCategory = 
  | 'analytics'
  | 'sales'
  | 'hr'
  | 'finance'
  | 'projects'
  | 'communication'
  | 'tasks'
  | 'reports'

// Chart types for data visualization widgets
export type ChartType = 
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'radar'
  | 'funnel'

// Widget data refresh intervals
export type RefreshInterval = 
  | 'none'
  | '30s'
  | '1m' 
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '24h'

// Base widget configuration
export interface BaseWidgetConfig {
  id: string
  title: string
  description?: string
  category: WidgetCategory
  size: WidgetSize
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  refreshInterval: RefreshInterval
  lastUpdated?: Date
  isLoading?: boolean
  error?: string
  permissions?: string[]
}

// Specific widget type configurations
export interface MetricWidgetConfig extends BaseWidgetConfig {
  type: 'metric'
  data: {
    value: number | string
    previousValue?: number
    unit?: string
    trend?: 'up' | 'down' | 'stable'
    trendPercentage?: number
    target?: number
    format?: 'number' | 'currency' | 'percentage'
    precision?: number
  }
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'muted'
}

export interface ChartWidgetConfig extends BaseWidgetConfig {
  type: 'chart'
  chartType: ChartType
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      color?: string
      borderColor?: string
      backgroundColor?: string
    }>
  }
  options?: {
    showLegend?: boolean
    showTooltips?: boolean
    showAxes?: boolean
    height?: number
  }
}

export interface ListWidgetConfig extends BaseWidgetConfig {
  type: 'list'
  data: {
    items: Array<{
      id: string
      title: string
      subtitle?: string
      description?: string
      status?: 'active' | 'pending' | 'completed' | 'cancelled'
      priority?: 'low' | 'medium' | 'high' | 'urgent'
      date?: Date
      assignee?: {
        name: string
        avatar?: string
      }
      metadata?: Record<string, any>
    }>
    showStatus?: boolean
    showPriority?: boolean
    showDate?: boolean
    showAssignee?: boolean
    maxItems?: number
  }
  actions?: Array<{
    label: string
    action: string
    icon?: ReactNode
  }>
}

export interface ActivityWidgetConfig extends BaseWidgetConfig {
  type: 'activity'
  data: {
    activities: Array<{
      id: string
      type: 'user' | 'system' | 'notification'
      title: string
      description: string
      timestamp: Date
      user?: {
        name: string
        avatar?: string
      }
      metadata?: Record<string, any>
    }>
    maxItems?: number
    showTimestamps?: boolean
    showUsers?: boolean
  }
}

export interface CalendarWidgetConfig extends BaseWidgetConfig {
  type: 'calendar'
  data: {
    events: Array<{
      id: string
      title: string
      start: Date
      end?: Date
      type: 'meeting' | 'deadline' | 'task' | 'event'
      status?: 'scheduled' | 'completed' | 'cancelled'
      attendees?: string[]
    }>
    view?: 'month' | 'week' | 'day' | 'agenda'
    showWeekends?: boolean
  }
}

export interface TableWidgetConfig extends BaseWidgetConfig {
  type: 'table'
  data: {
    columns: Array<{
      key: string
      label: string
      type?: 'text' | 'number' | 'date' | 'currency' | 'status' | 'user'
      sortable?: boolean
      width?: number
    }>
    rows: Array<Record<string, any>>
    pagination?: {
      page: number
      pageSize: number
      total: number
    }
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  actions?: Array<{
    label: string
    action: string
    icon?: ReactNode
  }>
}

export interface CustomWidgetConfig extends BaseWidgetConfig {
  type: 'custom'
  component: string
  props?: Record<string, any>
}

// Union type for all widget configurations
export type WidgetConfig = 
  | MetricWidgetConfig
  | ChartWidgetConfig
  | ListWidgetConfig
  | ActivityWidgetConfig
  | CalendarWidgetConfig
  | TableWidgetConfig
  | CustomWidgetConfig

// Dashboard layout configuration
export interface DashboardLayout {
  id: string
  name: string
  description?: string
  isDefault?: boolean
  columns: number
  breakpoints: {
    lg: number
    md: number
    sm: number
    xs: number
  }
  widgets: WidgetConfig[]
  createdAt: Date
  updatedAt: Date
}

// Dashboard configuration by role
export interface DashboardConfig {
  id: string
  name: string
  role: UserRole
  layouts: DashboardLayout[]
  defaultLayoutId: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Widget template for widget library
export interface WidgetTemplate {
  id: string
  name: string
  description: string
  category: WidgetCategory
  type: WidgetConfig['type']
  preview?: string
  defaultConfig: Partial<WidgetConfig>
  requiredPermissions?: string[]
  supportedRoles?: UserRole[]
  tags?: string[]
}

// Dashboard state
export interface DashboardState {
  currentDashboard?: DashboardConfig
  currentLayout?: DashboardLayout
  widgets: WidgetConfig[]
  isEditing: boolean
  isLoading: boolean
  error?: string
  
  // Widget library
  availableWidgets: WidgetTemplate[]
  
  // Real-time data
  widgetData: Record<string, any>
  lastUpdate: Date
}

// Dashboard actions
export interface DashboardActions {
  // Dashboard management
  loadDashboard: (dashboardId: string) => Promise<void>
  saveDashboard: () => Promise<void>
  createDashboard: (config: Partial<DashboardConfig>) => Promise<DashboardConfig>
  deleteDashboard: (dashboardId: string) => Promise<void>
  duplicateDashboard: (dashboardId: string) => Promise<DashboardConfig>
  
  // Layout management
  switchLayout: (layoutId: string) => Promise<void>
  createLayout: (layout: Partial<DashboardLayout>) => Promise<DashboardLayout>
  deleteLayout: (layoutId: string) => Promise<void>
  
  // Widget management
  addWidget: (widget: Partial<WidgetConfig>) => void
  removeWidget: (widgetId: string) => void
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void
  moveWidget: (widgetId: string, position: WidgetConfig['position']) => void
  resizeWidget: (widgetId: string, size: WidgetSize) => void
  
  // Widget data
  refreshWidget: (widgetId: string) => Promise<void>
  refreshAllWidgets: () => Promise<void>
  setWidgetData: (widgetId: string, data: any) => void
  
  // Editing mode
  setEditMode: (editing: boolean) => void
  resetChanges: () => void
  
  // Real-time updates
  subscribeToUpdates: () => void
  unsubscribeFromUpdates: () => void
}

// Widget component props
export interface WidgetProps<T extends WidgetConfig = WidgetConfig> {
  config: T
  isEditing?: boolean
  onUpdate?: (updates: Partial<T>) => void
  onRemove?: () => void
  onRefresh?: () => void
  className?: string
}

// Dashboard grid item
export interface DashboardGridItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  static?: boolean
  isDraggable?: boolean
  isResizable?: boolean
}

// Dashboard analytics data
export interface DashboardAnalytics {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  conversionRate: number
  customerSatisfaction: number
  openTickets: number
  pendingTasks: number
  upcomingEvents: number
  recentActivities: ActivityWidgetConfig['data']['activities']
  topPerformers: Array<{
    name: string
    value: number
    change: number
  }>
  chartData: {
    revenue: ChartWidgetConfig['data']
    users: ChartWidgetConfig['data']
    sales: ChartWidgetConfig['data']
  }
}

// Dashboard API responses
export interface DashboardListResponse {
  dashboards: DashboardConfig[]
  total: number
  page: number
  pageSize: number
}

export interface WidgetDataResponse {
  widgetId: string
  data: any
  lastUpdated: Date
  nextUpdate?: Date
}

// Hook return types
export interface UseDashboardReturn {
  // State
  dashboard: DashboardConfig | undefined
  layout: DashboardLayout | undefined
  widgets: WidgetConfig[]
  isEditing: boolean
  isLoading: boolean
  error: string | undefined
  
  // Actions
  loadDashboard: (id: string) => Promise<void>
  saveDashboard: () => Promise<void>
  addWidget: (widget: Partial<WidgetConfig>) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void
  
  // Edit mode
  setEditMode: (editing: boolean) => void
  resetChanges: () => void
}

export interface UseWidgetDataReturn<T = any> {
  data: T | undefined
  isLoading: boolean
  error: string | undefined
  lastUpdated: Date | undefined
  refresh: () => Promise<void>
}