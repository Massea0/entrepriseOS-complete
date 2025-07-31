import { Product, Warehouse } from '@/features/inventory/types/inventory.types';

export interface LowStockAlertsProps {
  className?: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'snoozed';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export interface StockAlert {
  id: string;
  productId: string;
  product: Product;
  warehouseId: string;
  warehouse: Warehouse;
  severity: AlertSeverity;
  status: AlertStatus;
  currentStock: number;
  minStockLevel: number;
  reorderPoint: number;
  daysUntilStockout: number;
  suggestedOrderQuantity: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  snoozedUntil?: Date;
}

export interface AlertThreshold {
  id: string;
  name: string;
  description: string;
  productCategory?: string;
  warehouseId?: string;
  minStockPercentage: number;
  reorderPointPercentage: number;
  criticalDaysThreshold: number;
  warningDaysThreshold: number;
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  channels: NotificationChannel[];
  emailRecipients: string[];
  phoneNumbers: string[];
  criticalAlertsOnly: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
  alertFrequency: 'immediate' | 'hourly' | 'daily';
}

export interface AlertFilters {
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  warehouseId?: string;
  productCategory?: string;
  daysUntilStockout?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  active: number;
  acknowledged: number;
  resolved: number;
  averageResolutionTime: number; // in hours
  productsAtRisk: number;
  estimatedStockoutValue: number;
}

// Component Props
export interface AlertDashboardProps {
  filters: AlertFilters;
  onAlertClick?: (alert: StockAlert) => void;
}

export interface AlertListProps {
  alerts: StockAlert[];
  onAlertClick?: (alert: StockAlert) => void;
  onStatusChange?: (alertId: string, status: AlertStatus) => void;
  onBulkAction?: (alertIds: string[], action: 'acknowledge' | 'snooze' | 'resolve') => void;
}

export interface AlertDetailsProps {
  alert: StockAlert;
  onStatusChange?: (status: AlertStatus) => void;
  onCreateOrder?: () => void;
}

export interface ThresholdManagerProps {
  thresholds: AlertThreshold[];
  onThresholdUpdate?: (threshold: AlertThreshold) => void;
  onThresholdCreate?: (threshold: Omit<AlertThreshold, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onThresholdDelete?: (thresholdId: string) => void;
}

export interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSettingsUpdate?: (settings: NotificationSettings) => void;
}

export interface AlertTimelineProps {
  alerts: StockAlert[];
  dateRange: {
    from: Date;
    to: Date;
  };
}

export interface AlertNotificationProps {
  alert: StockAlert;
  onDismiss?: () => void;
  onAction?: (action: 'view' | 'acknowledge' | 'create-order') => void;
}

export interface AlertSummaryCardProps {
  title: string;
  value: number | string;
  change?: number;
  severity?: AlertSeverity;
  icon?: React.ReactNode;
  onClick?: () => void;
}