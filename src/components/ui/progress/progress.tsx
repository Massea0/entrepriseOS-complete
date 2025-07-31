import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Progress bar variants
 */
const progressVariants = cva(
  'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      variant: {
        default: '',
        success: '',
        warning: '',
        error: '',
        info: '',
      },
      size: {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-green-600 dark:bg-green-500',
        warning: 'bg-yellow-600 dark:bg-yellow-500',
        error: 'bg-red-600 dark:bg-red-500',
        info: 'bg-blue-600 dark:bg-blue-500',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
      striped: {
        true: 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-progress-stripes',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
      striped: false,
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  /**
   * Current progress value (0-100)
   */
  value?: number
  
  /**
   * Maximum value
   * @default 100
   */
  max?: number
  
  /**
   * Whether to show the progress label
   * @default false
   */
  showLabel?: boolean
  
  /**
   * Custom label format function
   */
  labelFormat?: (value: number, max: number) => string
  
  /**
   * Whether to animate the progress bar
   * @default false
   */
  animated?: boolean
  
  /**
   * Whether to show striped animation
   * @default false
   */
  striped?: boolean
  
  /**
   * Progress indicator color variant
   */
  indicatorVariant?: VariantProps<typeof progressIndicatorVariants>['variant']
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { 
      className,
      value = 0,
      max = 100,
      variant,
      size,
      showLabel = false,
      labelFormat,
      animated = false,
      striped = false,
      indicatorVariant,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const defaultLabelFormat = (val: number, mx: number) => `${Math.round((val / mx) * 100)}%`
    const label = labelFormat ? labelFormat(value, max) : defaultLabelFormat(value, max)

    return (
      <div className="w-full">
        {showLabel && (
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{label}</span>
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label="Progress"
          className={cn(progressVariants({ variant, size }), className)}
          {...props}
        >
          <div
            className={cn(
              progressIndicatorVariants({ 
                variant: indicatorVariant || variant, 
                animated, 
                striped 
              })
            )}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

/**
 * CircularProgress Component
 * 
 * A circular progress indicator
 */
export interface CircularProgressProps
  extends Omit<React.SVGAttributes<SVGElement>, 'size'>,
    Pick<ProgressProps, 'value' | 'max' | 'showLabel' | 'labelFormat' | 'variant'> {
  /**
   * Size of the circular progress
   * @default 64
   */
  size?: number
  
  /**
   * Stroke width
   * @default 4
   */
  strokeWidth?: number
}

const circularVariantColors = {
  default: 'stroke-primary',
  success: 'stroke-green-600 dark:stroke-green-500',
  warning: 'stroke-yellow-600 dark:stroke-yellow-500',
  error: 'stroke-red-600 dark:stroke-red-500',
  info: 'stroke-blue-600 dark:stroke-blue-500',
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = 64,
      strokeWidth = 4,
      showLabel = false,
      labelFormat,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const defaultLabelFormat = (val: number, mx: number) => `${Math.round((val / mx) * 100)}%`
    const label = labelFormat ? labelFormat(value, max) : defaultLabelFormat(value, max)
    
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative inline-flex">
        <svg
          ref={ref}
          width={size}
          height={size}
          className={cn('transform -rotate-90', className)}
          {...props}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="fill-none stroke-secondary"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              'fill-none transition-all duration-300 ease-in-out',
              circularVariantColors[variant]
            )}
            strokeLinecap="round"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium">{label}</span>
          </div>
        )}
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'

/**
 * MultiProgress Component
 * 
 * A progress bar with multiple segments
 */
export interface MultiProgressSegment {
  value: number
  variant?: ProgressProps['variant']
  label?: string
}

export interface MultiProgressProps
  extends Omit<ProgressProps, 'value' | 'variant' | 'animated' | 'striped'> {
  /**
   * Array of progress segments
   */
  segments: MultiProgressSegment[]
}

const MultiProgress = React.forwardRef<HTMLDivElement, MultiProgressProps>(
  ({ className, segments, max = 100, size, showLabel = false, ...props }, ref) => {
    const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0)
    const totalPercentage = Math.min((totalValue / max) * 100, 100)

    return (
      <div className="w-full">
        {showLabel && (
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(totalPercentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={totalValue}
          className={cn(progressVariants({ size }), className)}
          {...props}
        >
          <div className="flex h-full">
            {segments.map((segment, index) => {
              const segmentPercentage = (segment.value / max) * 100
              return (
                <div
                  key={index}
                  className={cn(
                    'h-full transition-all duration-300',
                    progressIndicatorVariants({ variant: segment.variant })
                  )}
                  style={{ width: `${segmentPercentage}%` }}
                  title={segment.label}
                />
              )
            })}
          </div>
        </div>
        {showLabel && segments.some(s => s.label) && (
          <div className="mt-2 flex flex-wrap gap-4 text-xs">
            {segments.map((segment, index) => segment.label && (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className={cn(
                    'h-2 w-2 rounded-full',
                    progressIndicatorVariants({ variant: segment.variant })
                  )} 
                />
                <span className="text-muted-foreground">{segment.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

MultiProgress.displayName = 'MultiProgress'

export { Progress, CircularProgress, MultiProgress }