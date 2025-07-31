import { cva } from 'class-variance-authority'

export const tooltipVariants = cva(
  // Base styles
  'z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs font-medium animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        dark: 'bg-gray-900 text-gray-50 dark:bg-gray-50 dark:text-gray-900'
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-xs',
        lg: 'px-4 py-2 text-sm'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export const tooltipArrowVariants = cva(
  '',
  {
    variants: {
      variant: {
        default: 'fill-primary',
        primary: 'fill-primary',
        secondary: 'fill-secondary',
        destructive: 'fill-destructive',
        dark: 'fill-gray-900 dark:fill-gray-50'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)