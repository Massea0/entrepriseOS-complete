import { cva } from 'class-variance-authority'

export const popoverVariants = cva(
  // Base styles
  'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
  {
    variants: {
      size: {
        sm: 'w-56 p-3 text-sm',
        md: 'w-72 p-4 text-sm',
        lg: 'w-80 p-6 text-base',
        xl: 'w-96 p-6 text-base',
        auto: 'w-auto p-4 text-sm'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

export const popoverHeaderVariants = cva(
  'mb-4 space-y-2'
)

export const popoverTitleVariants = cva(
  'text-sm font-medium leading-none'
)

export const popoverDescriptionVariants = cva(
  'text-sm text-muted-foreground'
)

export const popoverFooterVariants = cva(
  'mt-4 flex justify-end space-x-2'
)

export const popoverCloseVariants = cva(
  'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'
)