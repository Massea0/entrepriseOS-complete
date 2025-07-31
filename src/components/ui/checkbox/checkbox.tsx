import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Checkbox variants configuration
 */
const checkboxVariants = cva(
  'peer inline-flex items-center justify-center shrink-0 border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'border-input bg-background',
          'hover:border-primary/70',
          'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
          'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground',
        ],
        outline: [
          'border-primary bg-transparent',
          'hover:bg-primary/10',
          'data-[state=checked]:bg-transparent data-[state=checked]:border-primary',
          'data-[state=indeterminate]:bg-transparent data-[state=indeterminate]:border-primary',
        ],
        filled: [
          'border-transparent bg-accent',
          'hover:bg-accent/80',
          'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
          'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground',
        ],
        ghost: [
          'border-transparent bg-transparent',
          'hover:bg-accent/50',
          'data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary',
          'data-[state=indeterminate]:bg-primary/10 data-[state=indeterminate]:text-primary',
        ],
      },
      size: {
        sm: 'h-4 w-4 rounded focus-visible:ring-1',
        md: 'h-5 w-5 rounded-md',
        lg: 'h-6 w-6 rounded-md',
      },
      color: {
        default: '',
        success: [
          'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600',
          'data-[state=indeterminate]:bg-green-600 data-[state=indeterminate]:border-green-600',
          'focus-visible:ring-green-600/20',
        ],
        warning: [
          'data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600',
          'data-[state=indeterminate]:bg-yellow-600 data-[state=indeterminate]:border-yellow-600',
          'focus-visible:ring-yellow-600/20',
        ],
        error: [
          'data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600',
          'data-[state=indeterminate]:bg-red-600 data-[state=indeterminate]:border-red-600',
          'focus-visible:ring-red-600/20',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      color: 'default',
    },
  }
)

const checkboxLabelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'color'>,
    VariantProps<typeof checkboxVariants> {
  /**
   * Label for the checkbox
   */
  label?: string
  
  /**
   * Description text shown below the label
   */
  description?: string
  
  /**
   * Error message (also sets error state)
   */
  errorMessage?: string
  
  /**
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate?: boolean
  
  /**
   * Position of the label
   * @default 'right'
   */
  labelPosition?: 'left' | 'right'
}

/**
 * Checkbox Component
 * 
 * A checkbox component built with Radix UI for accessibility.
 * 
 * @example
 * ```tsx
 * // Basic checkbox
 * <Checkbox label="Accept terms and conditions" />
 * 
 * // With description
 * <Checkbox
 *   label="Email notifications"
 *   description="Receive emails about your account"
 * />
 * 
 * // Controlled
 * const [checked, setChecked] = useState(false)
 * <Checkbox
 *   checked={checked}
 *   onCheckedChange={setChecked}
 *   label="Remember me"
 * />
 * 
 * // Indeterminate state
 * <Checkbox
 *   indeterminate
 *   label="Select all"
 * />
 * ```
 */
export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      className,
      variant,
      size,
      color,
      label,
      description,
      errorMessage,
      indeterminate = false,
      labelPosition = 'right',
      id,
      checked,
      onCheckedChange,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const checkboxId = id || React.useId()
    
    // Handle indeterminate state
    const checkedState = indeterminate ? 'indeterminate' : checked
    
    const checkbox = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(
          checkboxVariants({ variant, size, color }),
          errorMessage && 'border-destructive',
          className
        )}
        checked={checkedState}
        onCheckedChange={onCheckedChange}
        aria-describedby={
          description || errorMessage
            ? `${checkboxId}-description`
            : undefined
        }
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          {indeterminate ? (
            <Minus className={cn(
              'animate-in fade-in-0 zoom-in-95',
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-3.5 w-3.5',
              size === 'lg' && 'h-4 w-4'
            )} />
          ) : (
            <Check className={cn(
              'animate-in fade-in-0 zoom-in-95',
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-3.5 w-3.5',
              size === 'lg' && 'h-4 w-4'
            )} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )
    
    // If no label, return checkbox only
    if (!label && !description && !errorMessage) {
      return checkbox
    }
    
    // Return with label wrapper
    return (
      <div className="flex items-start space-x-2">
        {labelPosition === 'left' && label && (
          <div className="flex-1 space-y-0.5">
            <label
              htmlFor={checkboxId}
              className={cn(checkboxLabelVariants({ size }), 'cursor-pointer')}
            >
              {label}
            </label>
            {(description || errorMessage) && (
              <p
                id={`${checkboxId}-description`}
                className={cn(
                  'text-xs',
                  errorMessage ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {errorMessage || description}
              </p>
            )}
          </div>
        )}
        
        {checkbox}
        
        {labelPosition === 'right' && label && (
          <div className="flex-1 space-y-0.5">
            <label
              htmlFor={checkboxId}
              className={cn(checkboxLabelVariants({ size }), 'cursor-pointer')}
            >
              {label}
            </label>
            {(description || errorMessage) && (
              <p
                id={`${checkboxId}-description`}
                className={cn(
                  'text-xs',
                  errorMessage ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {errorMessage || description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = CheckboxPrimitive.Root.displayName