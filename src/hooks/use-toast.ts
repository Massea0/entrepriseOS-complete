import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const toast = useCallback((options: ToastOptions) => {
    const id = String(toastId++)
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || 'default'
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-dismiss after duration
    if (options.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, options.duration || 5000)
    }
    
    return id
  }, [])
  
  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  
  return {
    toast,
    dismiss,
    toasts
  }
}