import { cva } from 'class-variance-authority'

export const tableVariants = cva(
  // Base styles
  'w-full caption-bottom text-sm border-collapse',
  {
    variants: {
      variant: {
        default: 'border-border',
        striped: 'border-border [&_tbody_tr:nth-child(even)]:bg-muted/30',
        bordered: 'border-2 border-border [&_td]:border [&_th]:border',
        ghost: 'border-transparent'
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export const tableHeaderVariants = cva(
  '[&_tr]:border-b border-border'
)

export const tableBodyVariants = cva(
  '[&_tr:last-child]:border-0'
)

export const tableFooterVariants = cva(
  'border-t border-border bg-muted/30 font-medium [&>tr]:last:border-b-0'
)

export const tableRowVariants = cva(
  'border-b border-border transition-colors data-[state=selected]:bg-muted',
  {
    variants: {
      clickable: {
        true: 'hover:bg-muted/50 cursor-pointer',
        false: ''
      },
      selected: {
        true: 'bg-muted data-[state=selected]:bg-muted',
        false: ''
      }
    },
    defaultVariants: {
      clickable: false,
      selected: false
    }
  }
)

export const tableHeadVariants = cva(
  'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
      },
      sortable: {
        true: 'cursor-pointer select-none hover:text-foreground transition-colors',
        false: ''
      },
      sticky: {
        true: 'sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10',
        false: ''
      }
    },
    defaultVariants: {
      align: 'left',
      sortable: false,
      sticky: false
    }
  }
)

export const tableCellVariants = cva(
  'p-4 align-middle [&:has([role=checkbox])]:pr-0',
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
      },
      truncate: {
        true: 'max-w-0 truncate',
        false: ''
      },
      sticky: {
        true: 'sticky left-0 bg-background',
        false: ''
      }
    },
    defaultVariants: {
      align: 'left',
      truncate: false,
      sticky: false
    }
  }
)

export const tableContainerVariants = cva(
  'relative w-full',
  {
    variants: {
      responsive: {
        true: 'overflow-auto',
        false: ''
      },
      bordered: {
        true: 'border rounded-md',
        false: ''
      }
    },
    defaultVariants: {
      responsive: true,
      bordered: false
    }
  }
)

// Sort indicator variants
export const sortIconVariants = cva(
  'ml-2 h-4 w-4 inline-flex',
  {
    variants: {
      direction: {
        asc: 'rotate-0',
        desc: 'rotate-180',
        null: 'opacity-50'
      }
    },
    defaultVariants: {
      direction: null
    }
  }
)

// Selection checkbox variants
export const selectionVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      type: {
        header: 'w-12',
        cell: 'w-12'
      }
    },
    defaultVariants: {
      type: 'cell'
    }
  }
)

// Loading overlay variants
export const loadingOverlayVariants = cva(
  'absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20'
)

// Empty state variants
export const emptyStateVariants = cva(
  'text-center py-12 text-muted-foreground'
)