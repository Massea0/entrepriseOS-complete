import { Product, Warehouse, StockMovement } from '@/features/inventory/types/inventory.types';

export interface InventoryAnalyticsProps {
  className?: string;
}

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom';
export type AnalyticsView = 'overview' | 'abc' | 'turnover' | 'forecast' | 'trends';

export interface AnalyticsFilters {
  dateRange: DateRange;
  customDateRange?: {
    from: Date;
    to: Date;
  };
  warehouseId?: string;
  categoryId?: string;
  supplierId?: string;
}

export interface ABCAnalysisItem {
  product: Product;
  revenue: number;
  quantity: number;
  percentage: number;
  cumulativePercentage: number;
  category: 'A' | 'B' | 'C';
}

export interface TurnoverMetrics {
  productId: string;
  productName: string;
  turnoverRate: number;
  averageStockValue: number;
  costOfGoodsSold: number;
  daysInInventory: number;
  stockRotations: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ForecastData {
  productId: string;
  productName: string;
  currentStock: number;
  forecastedDemand: number[];
  reorderDate: Date;
  stockoutRisk: 'low' | 'medium' | 'high';
  confidence: number;
  seasonalFactors?: number[];
}

export interface InventoryTrend {
  date: string;
  totalValue: number;
  totalItems: number;
  categories: {
    [key: string]: {
      value: number;
      items: number;
    };
  };
}

export interface KPIMetric {
  label: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease';
  unit?: string;
  icon?: React.ReactNode;
}

// Component Props
export interface AnalyticsOverviewProps {
  filters: AnalyticsFilters;
}

export interface ABCAnalysisProps {
  filters: AnalyticsFilters;
  onProductClick?: (product: Product) => void;
}

export interface TurnoverAnalysisProps {
  filters: AnalyticsFilters;
  onProductClick?: (productId: string) => void;
}

export interface DemandForecastingProps {
  filters: AnalyticsFilters;
  onProductClick?: (productId: string) => void;
}

export interface InventoryTrendsProps {
  filters: AnalyticsFilters;
}

export interface KPICardProps {
  metric: KPIMetric;
  className?: string;
}

export interface AnalyticsFiltersBarProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  view: AnalyticsView;
  onViewChange: (view: AnalyticsView) => void;
}

export interface ABCChartProps {
  data: ABCAnalysisItem[];
  height?: number;
}

export interface TurnoverChartProps {
  data: TurnoverMetrics[];
  height?: number;
}

export interface ForecastChartProps {
  data: ForecastData;
  height?: number;
}

export interface TrendChartProps {
  data: InventoryTrend[];
  height?: number;
  showCategories?: boolean;
}