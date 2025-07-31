import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Badge variants configuration
 */
const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border hover:bg-accent hover:text-accent-foreground',
        success: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:hover:bg-yellow-800',
        error: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800',
      },
      size: {
        sm: 'h-5 px-2 text-xs',
        md: 'h-6 px-2.5 text-xs',
        lg: 'h-7 px-3 text-sm',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before the content
   */
  icon?: React.ReactNode
  
  /**
   * Whether the badge is removable
   * @default false
   */
  removable?: boolean
  
  /**
   * Callback when the badge is removed
   */
  onRemove?: () => void
  
  /**
   * Maximum width for the badge content
   */
  maxWidth?: string
  
  /**
   * Whether to truncate long text
   * @default false
   */
  truncate?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    { 
      className, 
      variant, 
      size, 
      rounded,
      icon,
      removable = false,
      onRemove,
      maxWidth,
      truncate = false,
      children,
      ...props 
    }, 
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, rounded }),
          removable && 'pr-1',
          className
        )}
        style={{ maxWidth }}
        {...props}
      >
        {icon && (
          <span className="mr-1 flex shrink-0 items-center">
            {icon}
          </span>
        )}
        <span className={cn(truncate && 'truncate')}>
          {children}
        </span>
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className={cn(
              'ml-1 flex shrink-0 items-center rounded-sm opacity-70 transition-opacity hover:opacity-100',
              'focus:outline-none focus:opacity-100',
              size === 'sm' && '-mr-0.5',
              size === 'lg' && '-mr-1'
            )}
            aria-label="Remove badge"
          >
            <X className={cn(
              'h-3 w-3',
              size === 'lg' && 'h-3.5 w-3.5'
            )} />
          </button>
        )}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

/**
 * BadgeGroup Component
 * 
 * Container for grouping multiple badges
 */
interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Gap between badges
   * @default 'sm'
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  
  /**
   * Whether to wrap badges to next line
   * @default true
   */
  wrap?: boolean
}

const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, gap = 'sm', wrap = true, ...props }, ref) => {
    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-1.5',
      md: 'gap-2',
      lg: 'gap-3',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          gapClasses[gap],
          wrap ? 'flex-wrap' : 'overflow-hidden',
          className
        )}
        {...props}
      />
    )
  }
)

BadgeGroup.displayName = 'BadgeGroup'

/**
 * Tag Component
 * 
 * A variant of Badge specifically for tags
 */
export interface TagProps extends Omit<BadgeProps, 'variant' | 'rounded'> {
  /**
   * Tag color variant
   */
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink'
}

const tagColorVariants = {
  gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  red: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800',
  yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:hover:bg-yellow-800',
  green: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800',
  blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800',
  indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-100 dark:hover:bg-indigo-800',
  purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:hover:bg-purple-800',
  pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-100 dark:hover:bg-pink-800',
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, color = 'gray', size = 'sm', ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        className={cn(tagColorVariants[color], 'border-transparent', className)}
        size={size}
        rounded="full"
        {...props}
      />
    )
  }
)

Tag.displayName = 'Tag'

/**
 * StatusBadge Component
 * 
 * A badge with a status indicator dot
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'icon'> {
  /**
   * Status indicator color
   */
  status?: 'online' | 'offline' | 'away' | 'busy' | 'error' | 'warning' | 'success'
  
  /**
   * Whether to pulse the status indicator
   * @default false
   */
  pulse?: boolean
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  success: 'bg-green-500',
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status = 'offline', pulse = false, ...props }, ref) => {
    const statusIndicator = (
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              statusColors[status]
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            statusColors[status]
          )}
        />
      </span>
    )

    return <Badge ref={ref} icon={statusIndicator} {...props} />
  }
)

StatusBadge.displayName = 'StatusBadge'

export { Badge, BadgeGroup, Tag, StatusBadge, badgeVariants }