import { Product, Warehouse, StockMovement, PurchaseOrder } from '@/features/inventory/types/inventory.types';

export interface ScanResult {
  type: 'barcode' | 'qrcode';
  format: string;
  value: string;
  timestamp: Date;
}

export interface ScannedItem {
  id: string;
  scanResult: ScanResult;
  product?: Product;
  quantity: number;
  location?: string;
  notes?: string;
  scannedAt: Date;
  scannedBy: string;
}

export interface MobileSession {
  id: string;
  type: 'receiving' | 'picking' | 'counting';
  warehouseId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  items: ScannedItem[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface PickingTask {
  id: string;
  orderId: string;
  warehouseId: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  items: PickingItem[];
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  route?: PickingRoute;
}

export interface PickingItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  location: string;
  picked: number;
  status: 'pending' | 'partial' | 'completed' | 'skipped';
}

export interface PickingRoute {
  id: string;
  stops: RouteStop[];
  estimatedTime: number; // in minutes
  distance: number; // in meters
}

export interface RouteStop {
  location: string;
  items: PickingItem[];
  sequence: number;
}

export interface StockCountSession {
  id: string;
  type: 'cycle' | 'full' | 'spot';
  warehouseId: string;
  zones?: string[];
  assignedTo: string;
  items: CountItem[];
  status: 'scheduled' | 'in-progress' | 'review' | 'completed';
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  discrepancies: CountDiscrepancy[];
}

export interface CountItem {
  id: string;
  productId: string;
  product: Product;
  location: string;
  expectedQuantity: number;
  countedQuantity?: number;
  status: 'pending' | 'counted' | 'recounted' | 'verified';
  countedAt?: Date;
  countedBy?: string;
}

export interface CountDiscrepancy {
  productId: string;
  location: string;
  expectedQuantity: number;
  countedQuantity: number;
  variance: number;
  variancePercentage: number;
  resolved: boolean;
  resolution?: 'accept' | 'recount' | 'investigate';
  notes?: string;
}

// Component Props
export interface BarcodeScannerProps {
  onScan: (result: ScanResult) => void;
  onError?: (error: Error) => void;
  continuous?: boolean;
  formats?: string[];
  className?: string;
}

export interface MobileStockReceivingProps {
  purchaseOrder?: PurchaseOrder;
  warehouseId: string;
  onComplete?: (session: MobileSession) => void;
  className?: string;
}

export interface MobilePickingProps {
  task?: PickingTask;
  warehouseId: string;
  onComplete?: (task: PickingTask) => void;
  className?: string;
}

export interface MobileStockCountProps {
  session?: StockCountSession;
  warehouseId: string;
  onComplete?: (session: StockCountSession) => void;
  className?: string;
}