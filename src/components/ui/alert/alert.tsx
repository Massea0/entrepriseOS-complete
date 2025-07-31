import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Alert variants configuration
 */
const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: [
          'border-blue-200 bg-blue-50 text-blue-900',
          'dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
          '[&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
        ],
        success: [
          'border-green-200 bg-green-50 text-green-900',
          'dark:border-green-800 dark:bg-green-950 dark:text-green-100',
          '[&>svg]:text-green-600 dark:[&>svg]:text-green-400',
        ],
        warning: [
          'border-yellow-200 bg-yellow-50 text-yellow-900',
          'dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
          '[&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400',
        ],
        error: [
          'border-red-200 bg-red-50 text-red-900',
          'dark:border-red-800 dark:bg-red-950 dark:text-red-100',
          '[&>svg]:text-red-600 dark:[&>svg]:text-red-400',
        ],
        destructive: [
          'border-destructive/50 text-destructive',
          'dark:border-destructive [&>svg]:text-destructive',
        ],
      },
      size: {
        sm: 'p-3 text-sm [&>svg]:h-4 [&>svg]:w-4 [&>svg]:top-3 [&>svg]:left-3 [&>svg~*]:pl-6',
        md: 'p-4 text-sm [&>svg]:h-5 [&>svg]:w-5',
        lg: 'p-5 text-base [&>svg]:h-6 [&>svg]:w-6 [&>svg]:top-5 [&>svg]:left-5 [&>svg~*]:pl-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /**
   * Icon to display in the alert
   */
  icon?: React.ReactNode
  
  /**
   * Whether to show the default icon based on variant
   * @default true
   */
  showIcon?: boolean
  
  /**
   * Whether the alert is dismissible
   * @default false
   */
  dismissible?: boolean
  
  /**
   * Callback when the alert is dismissed
   */
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, size, icon, showIcon = true, dismissible = false, onDismiss, children, ...props }, ref) => {
    const defaultIcons = {
      info: <Info />,
      success: <CheckCircle />,
      warning: <AlertTriangle />,
      error: <XCircle />,
      destructive: <AlertCircle />,
      default: <AlertCircle />,
    }

    const alertIcon = icon || (showIcon && variant ? defaultIcons[variant] : null)

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        {alertIcon}
        {children}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:pointer-events-none',
              size === 'sm' && 'right-1 top-1',
              size === 'lg' && 'right-3 top-3'
            )}
            aria-label="Dismiss alert"
          >
            <X className={cn(
              'h-4 w-4',
              size === 'sm' && 'h-3.5 w-3.5',
              size === 'lg' && 'h-5 w-5'
            )} />
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
))

AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))

AlertDescription.displayName = 'AlertDescription'

/**
 * AlertLink Component
 * 
 * A styled link component for use within alerts
 */
const AlertLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      'font-medium underline underline-offset-4 hover:no-underline',
      className
    )}
    {...props}
  />
))

AlertLink.displayName = 'AlertLink'

/**
 * AlertActions Component
 * 
 * Container for action buttons within an alert
 */
const AlertActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-3 flex flex-wrap gap-2', className)}
    {...props}
  />
))

AlertActions.displayName = 'AlertActions'

export { Alert, AlertTitle, AlertDescription, AlertLink, AlertActions }