import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Input variants configuration
 */
const inputVariants = cva(
  'w-full transition-all duration-200 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'bg-background border rounded-lg',
          'hover:border-primary/50',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
        ],
        filled: [
          'bg-accent/50 border-transparent rounded-lg',
          'hover:bg-accent/70',
          'focus:bg-accent focus:border-primary focus:ring-2 focus:ring-primary/20',
        ],
        flushed: [
          'bg-transparent border-0 border-b-2 rounded-none px-0',
          'hover:border-primary/50',
          'focus:border-primary focus:ring-0',
        ],
        ghost: [
          'bg-transparent border-transparent',
          'hover:bg-accent/50',
          'focus:bg-accent focus:ring-2 focus:ring-primary/20 rounded-lg',
        ],
      },
      size: {
        sm: 'h-8 text-sm px-2.5',
        md: 'h-10 text-sm px-3',
        lg: 'h-12 text-base px-4',
        xl: 'h-14 text-lg px-4',
      },
      error: {
        true: 'border-destructive focus:border-destructive focus:ring-destructive/20',
        false: '',
      },
    },
    compoundVariants: [
      // Flushed variant size adjustments
      {
        variant: 'flushed',
        size: 'sm',
        className: 'h-7 pb-1',
      },
      {
        variant: 'flushed',
        size: 'md',
        className: 'h-9 pb-1',
      },
      {
        variant: 'flushed',
        size: 'lg',
        className: 'h-11 pb-1',
      },
      {
        variant: 'flushed',
        size: 'xl',
        className: 'h-13 pb-1',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      error: false,
    },
  }
)

// Wrapper variants for icon support
const inputWrapperVariants = cva('relative flex items-center', {
  variants: {
    fullWidth: {
      true: 'w-full',
      false: 'inline-flex',
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
})

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Left icon or element
   */
  leftElement?: React.ReactNode
  
  /**
   * Right icon or element
   */
  rightElement?: React.ReactNode
  
  /**
   * Whether the input should take full width
   * @default true
   */
  fullWidth?: boolean
  
  /**
   * Label for the input
   */
  label?: string
  
  /**
   * Helper text shown below the input
   */
  helperText?: string
  
  /**
   * Error message (also sets error state)
   */
  errorMessage?: string
}

/**
 * Input Component
 * 
 * A flexible input component with multiple variants and features.
 * 
 * @example
 * ```tsx
 * // Basic input
 * <Input placeholder="Enter text..." />
 * 
 * // With label and helper text
 * <Input
 *   label="Email"
 *   type="email"
 *   helperText="We'll never share your email"
 * />
 * 
 * // With icons
 * <Input
 *   leftElement={<SearchIcon className="h-4 w-4" />}
 *   placeholder="Search..."
 * />
 * 
 * // Error state
 * <Input
 *   label="Password"
 *   type="password"
 *   error
 *   errorMessage="Password is required"
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      error,
      leftElement,
      rightElement,
      fullWidth = true,
      label,
      helperText,
      errorMessage,
      id,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const inputId = id || React.useId()
    
    // Determine if input has error
    const hasError = error || !!errorMessage
    
    // Calculate padding based on elements
    const inputPadding = cn(
      leftElement && 'pl-10',
      rightElement && 'pr-10',
      // Adjust for flushed variant
      variant === 'flushed' && leftElement && 'pl-8',
      variant === 'flushed' && rightElement && 'pr-8'
    )
    
    const inputElement = (
      <div className={inputWrapperVariants({ fullWidth })}>
        {leftElement && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftElement}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            inputVariants({ variant, size, error: hasError }),
            inputPadding,
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            helperText || errorMessage
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightElement}
          </div>
        )}
      </div>
    )
    
    // If no label or helper text, return input only
    if (!label && !helperText && !errorMessage) {
      return inputElement
    }
    
    // Return with wrapper for label and helper text
    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </label>
        )}
        
        {inputElement}
        
        {(helperText || errorMessage) && (
          <p
            id={`${inputId}-helper`}
            className={cn(
              'text-xs',
              errorMessage ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'