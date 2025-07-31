import * as React from 'react'
import { cn } from '@/utils/cn'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns in the grid
   * Can be a number or responsive object
   * @default 1
   */
  cols?: number | {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  
  /**
   * Gap between grid items
   * @default 4
   */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16
  
  /**
   * Separate gaps for rows and columns
   */
  rowGap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16
  colGap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16
  
  /**
   * Align items within grid cells
   * @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  
  /**
   * Justify items within grid cells
   * @default 'stretch'
   */
  justify?: 'start' | 'center' | 'end' | 'stretch'
  
  /**
   * Flow direction for auto-placed items
   * @default 'row'
   */
  flow?: 'row' | 'col' | 'dense' | 'row-dense' | 'col-dense'
}

// Helper function to generate grid column classes
const getColsClasses = (
  cols: GridProps['cols']
): string => {
  if (typeof cols === 'number') {
    return `grid-cols-${cols}`
  }
  
  if (typeof cols === 'object') {
    const classes: string[] = []
    
    if (cols.base) classes.push(`grid-cols-${cols.base}`)
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`)
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`)
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`)
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`)
    if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`)
    
    return classes.join(' ')
  }
  
  return 'grid-cols-1'
}

/**
 * Grid Component
 * 
 * A flexible grid layout component that uses CSS Grid under the hood.
 * Supports responsive column counts and various alignment options.
 * 
 * @example
 * ```tsx
 * // Simple 3 column grid
 * <Grid cols={3} gap={4}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 * 
 * // Responsive grid
 * <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={6}>
 *   {items.map(item => (
 *     <Card key={item.id}>{item.name}</Card>
 *   ))}
 * </Grid>
 * 
 * // Grid with different row/column gaps
 * <Grid cols={4} rowGap={8} colGap={4}>
 *   {children}
 * </Grid>
 * ```
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className,
    cols = 1,
    gap,
    rowGap,
    colGap,
    align = 'stretch',
    justify = 'stretch',
    flow = 'row',
    children,
    ...props 
  }, ref) => {
    // Build gap classes
    const gapClasses = []
    if (gap !== undefined) {
      gapClasses.push(`gap-${gap}`)
    } else {
      if (rowGap !== undefined) gapClasses.push(`gap-y-${rowGap}`)
      if (colGap !== undefined) gapClasses.push(`gap-x-${colGap}`)
    }
    
    // Alignment classes
    const alignMap = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    }
    
    const justifyMap = {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      stretch: 'justify-items-stretch',
    }
    
    const flowMap = {
      row: 'grid-flow-row',
      col: 'grid-flow-col',
      dense: 'grid-flow-dense',
      'row-dense': 'grid-flow-row-dense',
      'col-dense': 'grid-flow-col-dense',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          getColsClasses(cols),
          gapClasses,
          alignMap[align],
          justifyMap[justify],
          flowMap[flow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'

/**
 * GridItem Component
 * 
 * Optional component for grid items that need specific placement or spanning
 */
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Column span
   */
  colSpan?: number | 'auto' | 'full'
  
  /**
   * Row span
   */
  rowSpan?: number | 'auto' | 'full'
  
  /**
   * Column start position
   */
  colStart?: number | 'auto'
  
  /**
   * Row start position
   */
  rowStart?: number | 'auto'
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ 
    className,
    colSpan,
    rowSpan,
    colStart,
    rowStart,
    ...props 
  }, ref) => {
    const spanClasses = []
    
    if (colSpan) {
      spanClasses.push(
        colSpan === 'full' ? 'col-span-full' : 
        colSpan === 'auto' ? 'col-auto' : 
        `col-span-${colSpan}`
      )
    }
    
    if (rowSpan) {
      spanClasses.push(
        rowSpan === 'full' ? 'row-span-full' : 
        rowSpan === 'auto' ? 'row-auto' : 
        `row-span-${rowSpan}`
      )
    }
    
    if (colStart) {
      spanClasses.push(
        colStart === 'auto' ? 'col-start-auto' : 
        `col-start-${colStart}`
      )
    }
    
    if (rowStart) {
      spanClasses.push(
        rowStart === 'auto' ? 'row-start-auto' : 
        `row-start-${rowStart}`
      )
    }
    
    return (
      <div
        ref={ref}
        className={cn(spanClasses, className)}
        {...props}
      />
    )
  }
)

GridItem.displayName = 'GridItem'