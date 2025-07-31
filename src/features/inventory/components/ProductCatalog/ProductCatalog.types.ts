import { Product, ProductCategory, Supplier } from '../../types/inventory.types'

export interface ProductCatalogProps {
  products?: Product[]
  categories?: ProductCategory[]
  suppliers?: Supplier[]
  onProductCreate?: (data: Partial<Product>) => Promise<void>
  onProductUpdate?: (productId: string, data: Partial<Product>) => Promise<void>
  onProductDelete?: (productId: string) => Promise<void>
  onProductsImport?: (products: Partial<Product>[]) => Promise<void>
  onProductsExport?: (productIds: string[]) => Promise<void>
  onBulkUpdate?: (productIds: string[], data: Partial<Product>) => Promise<void>
  onBulkDelete?: (productIds: string[]) => Promise<void>
  showAdvancedFilters?: boolean
  showBulkActions?: boolean
  viewMode?: 'grid' | 'list'
  isLoading?: boolean
  className?: string
}

export interface ProductFilters {
  search?: string
  categoryId?: string
  supplierId?: string
  status?: Product['status'] | 'all'
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all'
  minPrice?: number
  maxPrice?: number
  trackingType?: Product['trackingType'] | 'all'
  tags?: string[]
}

export interface ProductFormData {
  name: string
  sku: string
  barcode?: string
  description?: string
  categoryId: string
  unitOfMeasure: string
  trackingType: Product['trackingType']
  status: Product['status']
  dimensions?: {
    length: number
    width: number
    height: number
    weight: number
  }
  images?: string[]
  tags?: string[]
  customFields?: Record<string, any>
  supplierProducts?: {
    supplierId: string
    supplierSku: string
    price: number
    leadTime: number
    minOrderQuantity: number
  }[]
}

export interface ProductCardProps {
  product: Product
  onSelect?: (product: Product) => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onQuickView?: (product: Product) => void
  isSelected?: boolean
  viewMode?: 'grid' | 'list'
  showStock?: boolean
  className?: string
}

export interface ProductDetailsProps {
  product: Product
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export interface ProductFormProps {
  initialData?: Product | null
  categories: ProductCategory[]
  suppliers?: Supplier[]
  onSubmit: (data: ProductFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface ProductImportProps {
  onImport: (products: Partial<Product>[]) => Promise<void>
  onCancel: () => void
  categories: ProductCategory[]
  isLoading?: boolean
}

export interface BulkActionsProps {
  selectedProducts: Product[]
  onBulkUpdate: (data: Partial<Product>) => void
  onBulkDelete: () => void
  onClearSelection: () => void
  categories?: ProductCategory[]
}

export interface ProductFiltersPanelProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  categories?: ProductCategory[]
  suppliers?: Supplier[]
  showAdvanced?: boolean
  onReset?: () => void
  className?: string
}

export interface ProductStockInfoProps {
  product: Product
  showDetails?: boolean
  className?: string
}