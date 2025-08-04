import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { ChevronUp as ChevronUpIcon } from 'lucide-react'
import type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableContainerProps
} from './table.types'
import {
  tableVariants,
  tableHeaderVariants,
  tableBodyVariants,
  tableFooterVariants,
  tableRowVariants,
  tableHeadVariants,
  tableCellVariants,
  tableContainerVariants,
  sortIconVariants
} from './table.variants'

/**
 * Table Container
 * Wrapper for responsive table behavior
 */
export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ className, responsive, maxHeight, style, ...props }, ref) => {
    const containerStyle = maxHeight 
      ? { ...style, maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }
      : style

    return (
      <div
        ref={ref}
        className={cn(
          tableContainerVariants({ responsive }),
          className
        )}
        style={containerStyle}
        {...props}
      />
    )
  }
)
TableContainer.displayName = 'TableContainer'

/**
 * Base Table Component
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, size, caption, sticky, hover, striped, ...props }, ref) => {
    return (
      <table
        ref={ref}
        className={cn(
          tableVariants({ variant, size }),
          hover && '[&_tbody_tr]:hover:bg-muted/50',
          sticky && 'relative',
          className
        )}
        {...props}
      >
        {caption && <caption className="mt-4 text-sm text-muted-foreground">{caption}</caption>}
      </table>
    )
  }
)
Table.displayName = 'Table'

/**
 * Table Header
 */
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(tableHeaderVariants(), className)}
        {...props}
      />
    )
  }
)
TableHeader.displayName = 'TableHeader'

/**
 * Table Body
 */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn(tableBodyVariants(), className)}
        {...props}
      />
    )
  }
)
TableBody.displayName = 'TableBody'

/**
 * Table Footer
 */
export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <tfoot
        ref={ref}
        className={cn(tableFooterVariants(), className)}
        {...props}
      />
    )
  }
)
TableFooter.displayName = 'TableFooter'

/**
 * Table Row
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, clickable, onRowClick, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
      onClick?.(event)
      onRowClick?.()
    }

    return (
      <tr
        ref={ref}
        className={cn(
          tableRowVariants({ clickable, selected }),
          className
        )}
        onClick={clickable || onRowClick ? handleClick : onClick}
        data-state={selected ? 'selected' : undefined}
        {...props}
      />
    )
  }
)
TableRow.displayName = 'TableRow'

/**
 * Table Head Cell (for headers)
 */
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ 
    className, 
    children,
    sortable, 
    sortDirection, 
    onSort, 
    resizable, 
    sticky, 
    align,
    onClick,
    ...props 
  }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLTableCellElement>) => {
      onClick?.(event)
      if (sortable && onSort) {
        onSort()
      }
    }

    return (
      <th
        ref={ref}
        className={cn(
          tableHeadVariants({ align, sortable, sticky }),
          className
        )}
        onClick={sortable || onSort ? handleClick : onClick}
        {...props}
      >
        <div className="flex items-center">
          {children}
          {sortable && (
            <ChevronUpIcon 
              className={cn(
                sortIconVariants({ direction: sortDirection })
              )}
            />
          )}
        </div>
      </th>
    )
  }
)
TableHead.displayName = 'TableHead'

/**
 * Table Cell (for data)
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align, truncate, sticky, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          tableCellVariants({ align, truncate, sticky }),
          className
        )}
        {...props}
      />
    )
  }
)
TableCell.displayName = 'TableCell'

/**
 * Table Caption
 */
export const TableCaption = forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => {
    return (
      <caption
        ref={ref}
        className={cn('mt-4 text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  }
)
TableCaption.displayName = 'TableCaption'