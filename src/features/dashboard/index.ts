// Hooks
export { useDashboard, useWidgetData, useDashboardAnalytics, useDashboardStore } from './hooks/useDashboard'

// Services
export { DashboardService, WidgetDataCache, DashboardTemplates } from './services/dashboard.service'

// Components
export { DashboardGrid } from './components/DashboardGrid'
export { MetricWidget } from './components/widgets/MetricWidget'

// Pages
export { DashboardPage } from './pages/DashboardPage'

// Types
export type {
  // Widget types
  WidgetConfig,
  WidgetSize,
  WidgetCategory,
  ChartType,
  RefreshInterval,
  MetricWidgetConfig,
  ChartWidgetConfig,
  ListWidgetConfig,
  ActivityWidgetConfig,
  CalendarWidgetConfig,
  TableWidgetConfig,
  CustomWidgetConfig,
  WidgetProps,
  WidgetTemplate,
  
  // Dashboard types
  DashboardConfig,
  DashboardLayout,
  DashboardState,
  DashboardActions,
  DashboardGridItem,
  DashboardAnalytics,
  
  // API types
  DashboardListResponse,
  WidgetDataResponse,
  
  // Hook types
  UseDashboardReturn,
  UseWidgetDataReturn
} from './types/dashboard.types'