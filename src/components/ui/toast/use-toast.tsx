import * as React from 'react'
import { ToastData, ToastActionElement, Toaster, useToast as useToastContext } from './toast'

// Initialize the global toast function
export const ToastInitializer: React.FC = () => {
  const { addToast } = useToastContext()
  
  React.useEffect(() => {
    window.__toastAddFunction = addToast
    return () => {
      window.__toastAddFunction = undefined
    }
  }, [addToast])
  
  return null
}

// Enhanced Toaster that includes the initializer
export const ToasterWithInit: React.FC<React.ComponentPropsWithoutRef<typeof Toaster>> = (props) => {
  return (
    <Toaster {...props}>
      {props.children}
      <ToastInitializer />
    </Toaster>
  )
}

// Re-export the context hook with the original name
export { useToastContext as useToast }

// Toast function interface
interface ToastFunction {
  (props: {
    title?: string
    description?: string
    action?: ToastActionElement
    variant?: ToastData['variant']
    duration?: number
  }): string | undefined
  success: (title: string, description?: string, duration?: number) => string | undefined
  error: (title: string, description?: string, duration?: number) => string | undefined
  warning: (title: string, description?: string, duration?: number) => string | undefined
  info: (title: string, description?: string, duration?: number) => string | undefined
  default: (title: string, description?: string, duration?: number) => string | undefined
}

// Enhanced toast function
export const toast: ToastFunction = (props) => {
  if (!window.__toastAddFunction) {
    console.warn('Toast system not initialized. Wrap your app with <Toaster>')
    return
  }
  return window.__toastAddFunction(props)
}

toast.success = (title: string, description?: string, duration?: number) => {
  return toast({ title, description, variant: 'success', duration })
}

toast.error = (title: string, description?: string, duration?: number) => {
  return toast({ title, description, variant: 'error', duration })
}

toast.warning = (title: string, description?: string, duration?: number) => {
  return toast({ title, description, variant: 'warning', duration })
}

toast.info = (title: string, description?: string, duration?: number) => {
  return toast({ title, description, variant: 'info', duration })
}

toast.default = (title: string, description?: string, duration?: number) => {
  return toast({ title, description, variant: 'default', duration })
}