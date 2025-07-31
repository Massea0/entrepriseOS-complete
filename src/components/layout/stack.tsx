import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Stack variants configuration
 * Defines different stack layouts and spacings
 */
const stackVariants = cva(
  'flex',
  {
    variants: {
      // Direction
      direction: {
        row: 'flex-row',
        col: 'flex-col',
        'row-reverse': 'flex-row-reverse',
        'col-reverse': 'flex-col-reverse',
      },
      
      // Spacing between items
      spacing: {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
        10: 'gap-10',
        12: 'gap-12',
        16: 'gap-16',
      },
      
      // Alignment on main axis
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      
      // Alignment on cross axis
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
        baseline: 'items-baseline',
      },
      
      // Wrap behavior
      wrap: {
        true: 'flex-wrap',
        false: 'flex-nowrap',
        reverse: 'flex-wrap-reverse',
      },
    },
    defaultVariants: {
      direction: 'col',
      spacing: 4,
      justify: 'start',
      align: 'stretch',
      wrap: false,
    },
  }
)

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  /**
   * The element to render as
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'nav' | 'aside' | 'header' | 'footer'
  
  /**
   * Whether the stack should take full width
   * @default false
   */
  fullWidth?: boolean
  
  /**
   * Whether the stack should take full height
   * @default false
   */
  fullHeight?: boolean
}

/**
 * Stack Component
 * 
 * A flexible stack layout component that arranges children vertically or horizontally
 * with consistent spacing. Uses flexbox under the hood.
 * 
 * @example
 * ```tsx
 * // Vertical stack with default spacing
 * <Stack>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Stack>
 * 
 * // Horizontal stack with custom spacing
 * <Stack direction="row" spacing={8} align="center">
 *   <Avatar />
 *   <Typography>User Name</Typography>
 * </Stack>
 * 
 * // Centered stack
 * <Stack justify="center" align="center" fullHeight>
 *   <LoadingSpinner />
 * </Stack>
 * ```
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className,
    direction,
    spacing,
    justify,
    align,
    wrap,
    as: Component = 'div',
    fullWidth = false,
    fullHeight = false,
    ...props 
  }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          stackVariants({ direction, spacing, justify, align, wrap }),
          fullWidth && 'w-full',
          fullHeight && 'h-full',
          className
        )}
        {...props}
      />
    )
  }
)

Stack.displayName = 'Stack'

/**
 * Spacer Component
 * 
 * A flexible spacer that grows to fill available space in a flex container
 */
export const Spacer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex-grow', className)}
      aria-hidden="true"
      {...props}
    />
  )
})

Spacer.displayName = 'Spacer'

/**
 * Divider Component
 * 
 * A visual divider for separating content
 */
export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /**
   * Orientation of the divider
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
  
  /**
   * Visual variant
   * @default 'solid'
   */
  variant?: 'solid' | 'dashed' | 'dotted'
  
  /**
   * Thickness of the divider
   * @default 'md'
   */
  thickness?: 'sm' | 'md' | 'lg'
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ 
    className,
    orientation = 'horizontal',
    variant = 'solid',
    thickness = 'md',
    ...props 
  }, ref) => {
    const isHorizontal = orientation === 'horizontal'
    
    const thicknessMap = {
      sm: isHorizontal ? 'h-px' : 'w-px',
      md: isHorizontal ? 'h-0.5' : 'w-0.5',
      lg: isHorizontal ? 'h-1' : 'w-1',
    }
    
    const variantMap = {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    }
    
    return (
      <hr
        ref={ref}
        className={cn(
          'border-0 bg-border',
          isHorizontal ? 'w-full' : 'h-full',
          thicknessMap[thickness],
          variant !== 'solid' && [
            'bg-transparent',
            isHorizontal ? 'border-t' : 'border-l',
            variantMap[variant],
          ],
          className
        )}
        {...props}
      />
    )
  }
)

Divider.displayName = 'Divider'