import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Skeleton variants configuration
 */
const skeletonVariants = cva(
  'animate-pulse bg-muted',
  {
    variants: {
      variant: {
        default: '',
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
        rounded: 'rounded-lg',
      },
      animation: {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animation: 'pulse',
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /**
   * Width of the skeleton
   */
  width?: string | number
  
  /**
   * Height of the skeleton
   */
  height?: string | number
  
  /**
   * Whether the skeleton should be displayed as inline
   * @default false
   */
  inline?: boolean
}

/**
 * Skeleton Component
 * 
 * Used to display a placeholder while content is loading.
 * 
 * @example
 * ```tsx
 * <Skeleton variant="text" width="100%" />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" width={210} height={118} />
 * ```
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animation, width, height, inline = false, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          skeletonVariants({ variant, animation }),
          inline && 'inline-block',
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

/**
 * SkeletonText Component
 * 
 * Preset skeleton for text content with multiple lines.
 */
export interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  /**
   * Number of lines to display
   * @default 3
   */
  lines?: number
  
  /**
   * Gap between lines
   * @default 'md'
   */
  gap?: 'sm' | 'md' | 'lg'
  
  /**
   * Whether the last line should be shorter
   * @default true
   */
  lastLineShort?: boolean
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, gap = 'md', lastLineShort = true, className, ...props }, ref) => {
    const gapClasses = {
      sm: 'space-y-2',
      md: 'space-y-3',
      lg: 'space-y-4',
    }

    return (
      <div ref={ref} className={cn(gapClasses[gap], className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={lastLineShort && index === lines - 1 ? '80%' : '100%'}
            {...props}
          />
        ))}
      </div>
    )
  }
)

SkeletonText.displayName = 'SkeletonText'

/**
 * SkeletonAvatar Component
 * 
 * Preset skeleton for avatar.
 */
export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'variant'> {
  /**
   * Size of the avatar
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
}

const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizes = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
    }

    const avatarSize = typeof size === 'number' ? size : sizes[size]

    return (
      <Skeleton
        ref={ref}
        variant="circular"
        width={avatarSize}
        height={avatarSize}
        className={className}
        {...props}
      />
    )
  }
)

SkeletonAvatar.displayName = 'SkeletonAvatar'

/**
 * SkeletonButton Component
 * 
 * Preset skeleton for button.
 */
export interface SkeletonButtonProps extends Omit<SkeletonProps, 'variant'> {
  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  
  /**
   * Whether the button is full width
   * @default false
   */
  fullWidth?: boolean
}

const SkeletonButton = React.forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ size = 'md', fullWidth = false, className, ...props }, ref) => {
    const sizes = {
      xs: { width: 60, height: 28 },
      sm: { width: 80, height: 32 },
      md: { width: 100, height: 36 },
      lg: { width: 120, height: 40 },
      xl: { width: 140, height: 44 },
    }

    return (
      <Skeleton
        ref={ref}
        variant="rounded"
        width={fullWidth ? '100%' : sizes[size].width}
        height={sizes[size].height}
        className={className}
        {...props}
      />
    )
  }
)

SkeletonButton.displayName = 'SkeletonButton'

/**
 * SkeletonCard Component
 * 
 * Preset skeleton for card content.
 */
export interface SkeletonCardProps extends Omit<SkeletonProps, 'variant'> {
  /**
   * Whether to show avatar
   * @default true
   */
  showAvatar?: boolean
  
  /**
   * Whether to show media
   * @default true
   */
  showMedia?: boolean
  
  /**
   * Number of text lines
   * @default 3
   */
  lines?: number
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ showAvatar = true, showMedia = true, lines = 3, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {showMedia && (
          <Skeleton variant="rectangular" width="100%" height={200} />
        )}
        
        <div className="p-4 space-y-4">
          {showAvatar && (
            <div className="flex items-center space-x-3">
              <SkeletonAvatar size="md" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" />
              </div>
            </div>
          )}
          
          <SkeletonText lines={lines} />
          
          <div className="flex gap-2">
            <SkeletonButton size="sm" />
            <SkeletonButton size="sm" />
          </div>
        </div>
      </div>
    )
  }
)

SkeletonCard.displayName = 'SkeletonCard'

/**
 * SkeletonTable Component
 * 
 * Preset skeleton for table.
 */
export interface SkeletonTableProps extends Omit<SkeletonProps, 'variant'> {
  /**
   * Number of rows
   * @default 5
   */
  rows?: number
  
  /**
   * Number of columns
   * @default 4
   */
  columns?: number
  
  /**
   * Whether to show header
   * @default true
   */
  showHeader?: boolean
}

const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ rows = 5, columns = 4, showHeader = true, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showHeader && (
          <div className="flex gap-4 p-4 border-b">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton
                key={`header-${index}`}
                variant="text"
                width={index === 0 ? '20%' : `${80 / (columns - 1)}%`}
                height={20}
              />
            ))}
          </div>
        )}
        
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-4 p-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  variant="text"
                  width={colIndex === 0 ? '20%' : `${80 / (columns - 1)}%`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }
)

SkeletonTable.displayName = 'SkeletonTable'

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard,
  SkeletonTable,
}