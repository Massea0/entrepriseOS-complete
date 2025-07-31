import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Loader2, RefreshCw, Loader } from 'lucide-react'

/**
 * Spinner variants configuration
 */
const spinnerVariants = cva(
  'animate-spin',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-10 w-10',
      },
      color: {
        current: 'text-current',
        primary: 'text-primary',
        secondary: 'text-secondary',
        success: 'text-green-600 dark:text-green-500',
        warning: 'text-yellow-600 dark:text-yellow-500',
        error: 'text-red-600 dark:text-red-500',
        info: 'text-blue-600 dark:text-blue-500',
        muted: 'text-muted-foreground',
      },
      speed: {
        slow: 'animate-spin-slow',
        normal: 'animate-spin',
        fast: 'animate-spin-fast',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'current',
      speed: 'normal',
    },
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * The type of spinner icon
   * @default 'loader2'
   */
  type?: 'loader' | 'loader2' | 'refresh' | 'circular' | 'dots'
  
  /**
   * Label for screen readers
   * @default 'Loading...'
   */
  label?: string
  
  /**
   * Whether to show the label visually
   * @default false
   */
  showLabel?: boolean
  
  /**
   * Position of the label
   * @default 'right'
   */
  labelPosition?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * Spinner Component
 * 
 * A loading spinner with multiple styles and variants.
 * 
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" color="primary" />
 * <Spinner type="dots" showLabel label="Loading data..." />
 * ```
 */
const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size,
      color,
      speed,
      type = 'loader2',
      label = 'Loading...',
      showLabel = false,
      labelPosition = 'right',
      ...props
    },
    ref
  ) => {
    const renderSpinner = () => {
      switch (type) {
        case 'loader':
          return <Loader className={cn(spinnerVariants({ size, color, speed }))} />
        
        case 'refresh':
          return <RefreshCw className={cn(spinnerVariants({ size, color, speed }))} />
        
        case 'circular':
          const sizeMap = {
            xs: 12,
            sm: 16,
            md: 24,
            lg: 32,
            xl: 40,
          }
          const strokeWidth = size === 'xs' ? 3 : size === 'sm' ? 3 : 4
          const svgSize = sizeMap[size || 'md']
          const radius = (svgSize - strokeWidth) / 2
          const circumference = radius * 2 * Math.PI
          
          return (
            <svg
              className={cn(spinnerVariants({ color, speed }), 'transform -rotate-90')}
              width={svgSize}
              height={svgSize}
            >
              <circle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.25}
              />
              <circle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeLinecap="round"
              />
            </svg>
          )
        
        case 'dots':
          return (
            <div className={cn('inline-flex items-center space-x-1', spinnerVariants({ color }))}>
              <span className={cn('animate-bounce', spinnerVariants({ size }))} style={{ animationDelay: '0ms' }}>
                <span className="sr-only">.</span>
                <div className="rounded-full bg-current" />
              </span>
              <span className={cn('animate-bounce', spinnerVariants({ size }))} style={{ animationDelay: '150ms' }}>
                <span className="sr-only">.</span>
                <div className="rounded-full bg-current" />
              </span>
              <span className={cn('animate-bounce', spinnerVariants({ size }))} style={{ animationDelay: '300ms' }}>
                <span className="sr-only">.</span>
                <div className="rounded-full bg-current" />
              </span>
            </div>
          )
        
        case 'loader2':
        default:
          return <Loader2 className={cn(spinnerVariants({ size, color, speed }))} />
      }
    }

    const labelClasses = {
      top: 'flex-col-reverse',
      right: 'flex-row',
      bottom: 'flex-col',
      left: 'flex-row-reverse',
    }

    const labelSpacingClasses = {
      top: 'mb-2',
      right: 'ml-2',
      bottom: 'mt-2',
      left: 'mr-2',
    }

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center',
          showLabel && labelClasses[labelPosition],
          className
        )}
        {...props}
      >
        {renderSpinner()}
        {showLabel ? (
          <span className={cn('text-sm', labelSpacingClasses[labelPosition])}>
            {label}
          </span>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

/**
 * SpinnerOverlay Component
 * 
 * A full-screen overlay with a centered spinner.
 */
export interface SpinnerOverlayProps extends SpinnerProps {
  /**
   * Whether the overlay is visible
   * @default true
   */
  visible?: boolean
  
  /**
   * Background blur amount
   * @default 'sm'
   */
  blur?: 'none' | 'sm' | 'md' | 'lg'
  
  /**
   * Whether to block pointer events
   * @default true
   */
  blocking?: boolean
}

const SpinnerOverlay = React.forwardRef<HTMLDivElement, SpinnerOverlayProps>(
  (
    {
      visible = true,
      blur = 'sm',
      blocking = true,
      className,
      ...spinnerProps
    },
    ref
  ) => {
    const blurClasses = {
      none: '',
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
    }

    if (!visible) return null

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-background/50',
          blurClasses[blur],
          blocking && 'pointer-events-auto',
          !blocking && 'pointer-events-none',
          className
        )}
      >
        <Spinner {...spinnerProps} />
      </div>
    )
  }
)

SpinnerOverlay.displayName = 'SpinnerOverlay'

/**
 * LoadingButton Component
 * 
 * A button with an integrated loading state.
 */
export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether the button is in loading state
   * @default false
   */
  loading?: boolean
  
  /**
   * Spinner props
   */
  spinnerProps?: Omit<SpinnerProps, 'showLabel'>
  
  /**
   * Loading text
   */
  loadingText?: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loading = false,
      spinnerProps,
      loadingText,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center',
          'transition-opacity',
          loading && 'cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" {...spinnerProps} />
          </div>
        )}
        <span className={cn(loading && 'opacity-0')}>
          {loadingText && loading ? loadingText : children}
        </span>
      </button>
    )
  }
)

LoadingButton.displayName = 'LoadingButton'

/**
 * LoadingDots Component
 * 
 * Simple animated loading dots.
 */
export const LoadingDots: React.FC<{
  className?: string
  dotClassName?: string
}> = ({ className, dotClassName }) => (
  <span className={cn('loading-dots', className)}>
    <span className={dotClassName} />
    <span className={dotClassName} />
    <span className={dotClassName} />
  </span>
)

LoadingDots.displayName = 'LoadingDots'

export { Spinner, SpinnerOverlay, LoadingButton }