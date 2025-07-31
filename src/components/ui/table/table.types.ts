import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { tableVariants } from './table.variants'

// Base table props
export interface TableProps
  extends HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  caption?: string
  sticky?: boolean
  hover?: boolean
  striped?: boolean
}

// Table header props
export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

// Table body props
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

// Table footer props
export interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {}

// Table row props
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean
  clickable?: boolean
  onRowClick?: () => void
}

// Table head cell props
export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
  resizable?: boolean
  sticky?: boolean
  align?: 'left' | 'center' | 'right'
}

// Table cell props
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right'
  truncate?: boolean
  sticky?: boolean
}

// Data types for DataTable
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  key: string
  direction: SortDirection
}

export interface ColumnDefinition<T = any> {
  key: string
  title: string
  sortable?: boolean
  resizable?: boolean
  width?: number | string
  minWidth?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
  sticky?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface FilterConfig {
  [key: string]: any
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  pageSizeOptions?: number[]
}

// DataTable props
export interface DataTableProps<T = any>
  extends Omit<TableProps, 'children'> {
  // Data
  data: T[]
  columns: ColumnDefinition<T>[]
  loading?: boolean
  empty?: React.ReactNode
  
  // Selection
  selectable?: boolean
  selectedRows?: Set<string | number>
  onSelectionChange?: (selectedRows: Set<string | number>) => void
  rowKey?: string | ((row: T) => string | number)
  
  // Sorting
  sortable?: boolean
  sortConfig?: SortConfig | null
  onSort?: (config: SortConfig | null) => void
  
  // Filtering
  filterable?: boolean
  filters?: FilterConfig
  onFilterChange?: (filters: FilterConfig) => void
  
  // Pagination
  pagination?: PaginationConfig | false
  onPaginationChange?: (page: number, pageSize: number) => void
  
  // Row actions
  onRowClick?: (row: T, index: number) => void
  onRowDoubleClick?: (row: T, index: number) => void
  
  // Virtualization (for large datasets)
  virtual?: boolean
  rowHeight?: number
  maxHeight?: number
  
  // Responsive
  responsive?: boolean
  breakpoint?: 'sm' | 'md' | 'lg'
  
  // Export
  exportable?: boolean
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void
}

// Table container props for responsive behavior
export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxHeight?: number | string
  responsive?: boolean
}

// Search and filter types
export interface SearchConfig {
  placeholder?: string
  searchKeys?: string[]
  debounceMs?: number
}

// Column resizing
export interface ColumnResizeConfig {
  enabled: boolean
  minWidth: number
  maxWidth?: number
  onResize?: (columnKey: string, width: number) => void
}