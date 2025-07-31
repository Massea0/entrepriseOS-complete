import { cva } from 'class-variance-authority'

export const dropdownVariants = cva(
  // Base styles
  'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
  {
    variants: {
      size: {
        sm: 'min-w-[6rem] text-xs',
        md: 'min-w-[8rem] text-sm',
        lg: 'min-w-[12rem] text-base'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

export const dropdownItemVariants = cva(
  // Base styles
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      destructive: {
        true: 'text-destructive focus:bg-destructive focus:text-destructive-foreground'
      },
      inset: {
        true: 'pl-8'
      }
    },
    defaultVariants: {
      destructive: false,
      inset: false
    }
  }
)

export const dropdownLabelVariants = cva(
  'px-2 py-1.5 text-sm font-semibold text-muted-foreground'
)

export const dropdownSeparatorVariants = cva(
  '-mx-1 my-1 h-px bg-muted'
)

export const dropdownShortcutVariants = cva(
  'ml-auto text-xs tracking-widest text-muted-foreground'
)

export const dropdownCheckboxItemVariants = cva(
  'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
)

export const dropdownRadioItemVariants = cva(
  'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
)

export const dropdownSubTriggerVariants = cva(
  'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent'
)

export const dropdownSubContentVariants = cva(
  'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
)

// Trigger button variants (for the button that opens the dropdown)
export const dropdownTriggerVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)