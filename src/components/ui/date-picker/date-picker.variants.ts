import { cva } from 'class-variance-authority'

export const datePickerVariants = cva(
  'relative'
)

export const datePickerTriggerVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border-2',
        ghost: 'border-transparent hover:bg-accent hover:text-accent-foreground'
      },
      size: {
        sm: 'h-9 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-11 px-4 text-base'
      },
      state: {
        default: '',
        error: 'border-destructive focus:ring-destructive',
        success: 'border-success focus:ring-success'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default'
    }
  }
)

export const calendarVariants = cva(
  'p-3'
)

export const calendarMonthVariants = cva(
  'space-y-4'
)

export const calendarCaptionVariants = cva(
  'flex justify-center pt-1 relative items-center'
)

export const calendarCaptionLabelVariants = cva(
  'text-sm font-medium'
)

export const calendarNavVariants = cva(
  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute',
  {
    variants: {
      position: {
        previous: 'left-1',
        next: 'right-1'
      }
    }
  }
)

export const calendarTableVariants = cva(
  'w-full border-collapse space-y-1'
)

export const calendarHeadRowVariants = cva(
  'flex'
)

export const calendarHeadCellVariants = cva(
  'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]'
)

export const calendarRowVariants = cva(
  'flex w-full mt-2'
)

export const calendarCellVariants = cva(
  'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20'
)

export const calendarDayVariants = cva(
  'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
  {
    variants: {
      variant: {
        default: '',
        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside: 'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        rangeStart: 'day-range-start',
        rangeEnd: 'day-range-end',
        rangeMiddle: 'aria-selected:bg-accent aria-selected:text-accent-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export const presetListVariants = cva(
  'min-w-[200px] p-2 space-y-1'
)

export const presetItemVariants = cva(
  'flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground',
  {
    variants: {
      selected: {
        true: 'bg-accent text-accent-foreground',
        false: ''
      }
    },
    defaultVariants: {
      selected: false
    }
  }
)

export const timePickerVariants = cva(
  'flex items-center space-x-2'
)

export const timeInputVariants = cva(
  'w-16 text-center',
  {
    variants: {
      size: {
        sm: 'h-8 text-xs',
        md: 'h-9 text-sm',
        lg: 'h-10 text-base'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

export const timeSelectVariants = cva(
  'w-20',
  {
    variants: {
      size: {
        sm: 'h-8 text-xs',
        md: 'h-9 text-sm',
        lg: 'h-10 text-base'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)