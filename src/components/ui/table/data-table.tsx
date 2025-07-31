import React, { useMemo, useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { Spinner } from '../spinner'
import { Badge } from '../badge'
import { 
  Table, 
  TableContainer, 
  TableHeader, 
  TableBody, 
  TableFooter,
  TableRow, 
  TableHead, 
  TableCell 
} from './table'
import type { DataTableProps, ColumnDefinition, SortConfig } from './table.types'
import { 
  loadingOverlayVariants, 
  emptyStateVariants,
  selectionVariants 
} from './table.variants'
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  MoreHorizontalIcon,
  SearchIcon,
  DownloadIcon
} from 'lucide-react'

/**
 * DataTable Component
 * Advanced table with sorting, filtering, pagination, and selection
 */
export function DataTable<T = any>({
  // Data props
  data = [],
  columns = [],
  loading = false,
  empty,
  
  // Table props
  className,
  variant,
  size,
  hover = true,
  striped,
  
  // Selection props
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  rowKey = 'id',
  
  // Sorting props
  sortable = true,
  sortConfig,
  onSort,
  
  // Filtering props
  filterable = false,
  filters = {},
  onFilterChange,
  
  // Pagination props
  pagination,
  onPaginationChange,
  
  // Row actions
  onRowClick,
  onRowDoubleClick,
  
  // Virtualization
  virtual = false,
  rowHeight = 48,
  maxHeight,
  
  // Responsive
  responsive = true,
  breakpoint = 'md',
  
  // Export
  exportable = false,
  onExport,
  
  ...props
}: DataTableProps<T>) {
  const [internalSortConfig, setInternalSortConfig] = useState<SortConfig | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Use internal sort state if no external sort control
  const currentSortConfig = sortConfig !== undefined ? sortConfig : internalSortConfig

  // Get row key value
  const getRowKey = useCallback((row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row)
    }
    return (row as any)[rowKey] || index
  }, [rowKey])

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    if (!sortable) return

    const newSortConfig: SortConfig = {
      key: columnKey,
      direction: 
        currentSortConfig?.key === columnKey && currentSortConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }

    if (onSort) {
      onSort(newSortConfig)
    } else {
      setInternalSortConfig(newSortConfig)
    }
  }, [sortable, currentSortConfig, onSort])

  // Handle selection
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      const allKeys = new Set(data.map((row, index) => getRowKey(row, index)))
      onSelectionChange(allKeys)
    } else {
      onSelectionChange(new Set())
    }
  }, [data, getRowKey, onSelectionChange])

  const handleSelectRow = useCallback((rowKey: string | number, checked: boolean) => {
    if (!onSelectionChange) return

    const newSelection = new Set(selectedRows)
    if (checked) {
      newSelection.add(rowKey)
    } else {
      newSelection.delete(rowKey)
    }
    onSelectionChange(newSelection)
  }, [selectedRows, onSelectionChange])

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(row => {
        return columns.some(column => {
          const value = (row as any)[column.key]
          return String(value).toLowerCase().includes(searchQuery.toLowerCase())
        })
      })
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        result = result.filter(row => (row as any)[key] === value)
      }
    })

    // Apply sorting
    if (currentSortConfig) {
      result.sort((a, b) => {
        const aValue = (a as any)[currentSortConfig.key]
        const bValue = (b as any)[currentSortConfig.key]
        
        if (aValue < bValue) return currentSortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return currentSortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchQuery, filters, currentSortConfig, columns])

  // Selection state
  const isAllSelected = selectedRows.size > 0 && selectedRows.size === processedData.length
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < processedData.length

  // Render cell content
  const renderCell = useCallback((column: ColumnDefinition<T>, row: T, index: number) => {
    const value = (row as any)[column.key]
    
    if (column.render) {
      return column.render(value, row, index)
    }
    
    return value
  }, [])

  // Empty state
  const EmptyState = () => (
    <div className={emptyStateVariants()}>
      {empty || (
        <div className="space-y-2">
          <SearchIcon className="h-8 w-8 mx-auto opacity-50" />
          <div className="text-sm">Aucune donnée disponible</div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(filterable || exportable || selectedRows.size > 0) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Search */}
            {filterable && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
            
            {/* Selection info */}
            {selectedRows.size > 0 && (
              <Badge variant="secondary">
                {selectedRows.size} sélectionné{selectedRows.size > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Export */}
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.('csv')}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <TableContainer 
        responsive={responsive} 
        maxHeight={maxHeight}
        className={cn("relative", className)}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className={loadingOverlayVariants()}>
            <Spinner size="lg" />
          </div>
        )}

        <Table 
          variant={variant} 
          size={size} 
          hover={hover} 
          striped={striped}
          {...props}
        >
          {/* Header */}
          <TableHeader>
            <TableRow>
              {/* Selection header */}
              {selectable && (
                <TableHead className={selectionVariants({ type: 'header' })}>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onCheckedChange={handleSelectAll}
                    aria-label="Sélectionner tout"
                  />
                </TableHead>
              )}

              {/* Column headers */}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  sortable={sortable && column.sortable !== false}
                  sortDirection={
                    currentSortConfig?.key === column.key 
                      ? currentSortConfig.direction 
                      : null
                  }
                  onSort={() => handleSort(column.key)}
                  align={column.align}
                  sticky={column.sticky}
                  className={cn(column.headerClassName)}
                  style={{ 
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody>
            {processedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-32"
                >
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              processedData.map((row, index) => {
                const key = getRowKey(row, index)
                const isSelected = selectedRows.has(key)

                return (
                  <TableRow
                    key={key}
                    selected={isSelected}
                    clickable={!!onRowClick}
                    onRowClick={() => onRowClick?.(row, index)}
                    onDoubleClick={() => onRowDoubleClick?.(row, index)}
                  >
                    {/* Selection cell */}
                    {selectable && (
                      <TableCell className={selectionVariants({ type: 'cell' })}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(key, checked)}
                          aria-label={`Sélectionner la ligne ${index + 1}`}
                        />
                      </TableCell>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        align={column.align}
                        truncate={column.key !== 'actions'} // Don't truncate actions
                        sticky={column.sticky}
                        className={cn(column.className)}
                      >
                        {renderCell(column, row, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>

          {/* Footer for pagination info */}
          {pagination && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {processedData.length} résultat{processedData.length > 1 ? 's' : ''}
                      {pagination.total && ` sur ${pagination.total}`}
                    </div>
                    {/* Pagination component would go here */}
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </div>
  )
}