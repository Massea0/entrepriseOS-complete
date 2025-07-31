import { cva } from 'class-variance-authority'

export const commandPaletteVariants = cva(
  'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
  {
    variants: {
      variant: {
        default: '',
        compact: ''
      },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export const commandInputVariants = cva(
  'flex h-11 w-full rounded-md bg-transparent py-3 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
)

export const commandListVariants = cva(
  'max-h-[300px] overflow-y-auto overflow-x-hidden',
  {
    variants: {
      size: {
        sm: 'max-h-[200px]',
        md: 'max-h-[300px]',
        lg: 'max-h-[400px]'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

export const commandItemVariants = cva(
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
  {
    variants: {
      state: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        selected: 'bg-accent text-accent-foreground',
        disabled: 'pointer-events-none opacity-50'
      }
    },
    defaultVariants: {
      state: 'default'
    }
  }
)

export const commandGroupVariants = cva(
  'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'
)

export const commandSeparatorVariants = cva(
  '-mx-1 h-px bg-border'
)

export const commandEmptyVariants = cva(
  'py-6 text-center text-sm text-muted-foreground'
)

export const commandLoadingVariants = cva(
  'py-6 text-center text-sm'
)

export const commandShortcutVariants = cva(
  'ml-auto text-xs tracking-widest text-muted-foreground'
)

export const commandBadgeVariants = cva(
  'ml-auto flex h-4 w-4 items-center justify-center rounded bg-muted text-[10px] font-medium text-muted-foreground'
)

export const commandDialogVariants = cva(
  'overflow-hidden p-0 shadow-lg',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

export const commandOverlayVariants = cva(
  'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'
)