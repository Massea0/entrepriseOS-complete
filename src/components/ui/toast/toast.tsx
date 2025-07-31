import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Toast variants configuration
 */
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100',
        error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
      },
      position: {
        'top-left': 'data-[state=open]:slide-in-from-left-full',
        'top-center': 'data-[state=open]:slide-in-from-top-full',
        'top-right': 'data-[state=open]:slide-in-from-right-full',
        'bottom-left': 'data-[state=open]:slide-in-from-left-full',
        'bottom-center': 'data-[state=open]:slide-in-from-bottom-full',
        'bottom-right': 'data-[state=open]:slide-in-from-right-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'bottom-right',
    },
  }
)

const ToastProvider = ToastPrimitive.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport> & {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  }
>(({ className, position = 'bottom-right', ...props }, ref) => {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0',
  }

  return (
    <ToastPrimitive.Viewport
      ref={ref}
      className={cn(
        'fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:flex-col md:max-w-[420px]',
        positionClasses[position],
        className
      )}
      {...props}
    />
  )
})

ToastViewport.displayName = ToastPrimitive.Viewport.displayName

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {
  /**
   * Icon to display in the toast
   */
  icon?: React.ReactNode
  
  /**
   * Whether to show the default icon based on variant
   * @default true
   */
  showIcon?: boolean
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant, position, icon, showIcon = true, ...props }, ref) => {
  const defaultIcons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    default: null,
  }

  const toastIcon = icon || (showIcon && variant ? defaultIcons[variant] : null)

  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(toastVariants({ variant, position }), className)}
      {...props}
    >
      {toastIcon && (
        <div className="shrink-0">{toastIcon}</div>
      )}
      <div className="grid gap-1 flex-1">{props.children}</div>
    </ToastPrimitive.Root>
  )
})

Toast.displayName = ToastPrimitive.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.error]:border-red-200 group-[.error]:hover:bg-red-100 group-[.error]:focus:ring-red-600',
      className
    )}
    {...props}
  />
))

ToastAction.displayName = ToastPrimitive.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))

ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))

ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))

ToastDescription.displayName = ToastPrimitive.Description.displayName

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

// Toast Context and Hook
export interface ToastData {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: ToastProps['variant']
  duration?: number
}

interface ToastContextValue {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => string
  removeToast: (id: string) => void
  dismissAll: () => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export interface ToasterProps {
  /**
   * Position of the toast viewport
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  
  /**
   * Default duration for toasts in milliseconds
   * @default 5000
   */
  duration?: number
  
  /**
   * Maximum number of toasts to show at once
   * @default 3
   */
  maxToasts?: number
  
  children: React.ReactNode
}

export const Toaster: React.FC<ToasterProps> = ({ 
  position = 'bottom-right',
  duration = 5000,
  maxToasts = 3,
  children 
}) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }]
      // Limit the number of toasts
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts)
      }
      return newToasts
    })
    return id
  }, [maxToasts])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const dismissAll = React.useCallback(() => {
    setToasts([])
  }, [])

  const contextValue = React.useMemo(
    () => ({ toasts, addToast, removeToast, dismissAll }),
    [toasts, addToast, removeToast, dismissAll]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastProvider duration={duration}>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            position={position}
            duration={toast.duration || duration}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id)
            }}
          >
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            {toast.action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport position={position} />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a Toaster')
  }
  return context
}

// Convenience toast functions
export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    if (!window.__toastAddFunction) {
      console.warn('Toast system not initialized. Wrap your app with <Toaster>')
      return
    }
    return window.__toastAddFunction({ title, description, variant: 'success', duration })
  },
  error: (title: string, description?: string, duration?: number) => {
    if (!window.__toastAddFunction) {
      console.warn('Toast system not initialized. Wrap your app with <Toaster>')
      return
    }
    return window.__toastAddFunction({ title, description, variant: 'error', duration })
  },
  warning: (title: string, description?: string, duration?: number) => {
    if (!window.__toastAddFunction) {
      console.warn('Toast system not initialized. Wrap your app with <Toaster>')
      return
    }
    return window.__toastAddFunction({ title, description, variant: 'warning', duration })
  },
  info: (title: string, description?: string, duration?: number) => {
    if (!window.__toastAddFunction) {
      console.warn('Toast system not initialized. Wrap your app with <Toaster>')
      return
    }
    return window.__toastAddFunction({ title, description, variant: 'info', duration })
  },
  default: (title: string, description?: string, duration?: number) => {
    if (!window.__toastAddFunction) {
      console.warn('Toast system not initialized. Wrap your app with <Toaster>')
      return
    }
    return window.__toastAddFunction({ title, description, variant: 'default', duration })
  },
}

// Global type augmentation
declare global {
  interface Window {
    __toastAddFunction?: (toast: Omit<ToastData, 'id'>) => string
  }
}