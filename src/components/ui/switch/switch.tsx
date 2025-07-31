import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Switch root variants
 */
const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'bg-input',
          'data-[state=checked]:bg-primary',
        ],
        outline: [
          'border-input bg-transparent',
          'data-[state=checked]:border-primary data-[state=checked]:bg-transparent',
        ],
        filled: [
          'bg-accent',
          'data-[state=checked]:bg-primary',
        ],
        ghost: [
          'bg-accent/50',
          'data-[state=checked]:bg-primary/20',
        ],
      },
      size: {
        sm: 'h-4 w-7 focus-visible:ring-1',
        md: 'h-5 w-9',
        lg: 'h-6 w-11',
      },
      color: {
        default: 'focus-visible:ring-primary/20',
        success: [
          'data-[state=checked]:bg-green-600',
          'focus-visible:ring-green-600/20',
        ],
        warning: [
          'data-[state=checked]:bg-yellow-600',
          'focus-visible:ring-yellow-600/20',
        ],
        error: [
          'data-[state=checked]:bg-red-600',
          'focus-visible:ring-red-600/20',
        ],
      },
    },
    compoundVariants: [
      // Outline variant color adjustments
      {
        variant: 'outline',
        color: 'success',
        className: 'data-[state=checked]:border-green-600',
      },
      {
        variant: 'outline',
        color: 'warning',
        className: 'data-[state=checked]:border-yellow-600',
      },
      {
        variant: 'outline',
        color: 'error',
        className: 'data-[state=checked]:border-red-600',
      },
      // Ghost variant color adjustments
      {
        variant: 'ghost',
        color: 'success',
        className: 'data-[state=checked]:bg-green-600/20',
      },
      {
        variant: 'ghost',
        color: 'warning',
        className: 'data-[state=checked]:bg-yellow-600/20',
      },
      {
        variant: 'ghost',
        color: 'error',
        className: 'data-[state=checked]:bg-red-600/20',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      color: 'default',
    },
  }
)

/**
 * Switch thumb variants
 */
const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform duration-200',
  {
    variants: {
      size: {
        sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
        md: 'h-4 w-4 data-[state=checked]:translate-x-4',
        lg: 'h-5 w-5 data-[state=checked]:translate-x-5',
      },
      variant: {
        default: '',
        outline: 'data-[state=checked]:bg-primary',
        filled: '',
        ghost: 'data-[state=checked]:bg-primary',
      },
    },
    compoundVariants: [
      // Outline variant with colors
      {
        variant: 'outline',
        color: 'success',
        className: 'data-[state=checked]:bg-green-600',
      },
      {
        variant: 'outline',
        color: 'warning',
        className: 'data-[state=checked]:bg-yellow-600',
      },
      {
        variant: 'outline',
        color: 'error',
        className: 'data-[state=checked]:bg-red-600',
      },
      // Ghost variant with colors
      {
        variant: 'ghost',
        color: 'success',
        className: 'data-[state=checked]:bg-green-600',
      },
      {
        variant: 'ghost',
        color: 'warning',
        className: 'data-[state=checked]:bg-yellow-600',
      },
      {
        variant: 'ghost',
        color: 'error',
        className: 'data-[state=checked]:bg-red-600',
      },
    ],
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

const switchLabelVariants = cva(
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

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'color'>,
    VariantProps<typeof switchVariants> {
  /**
   * Label for the switch
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
   * Position of the label
   * @default 'right'
   */
  labelPosition?: 'left' | 'right'
}

/**
 * Switch Component
 * 
 * A toggle switch component built with Radix UI for accessibility.
 * 
 * @example
 * ```tsx
 * // Basic switch
 * <Switch label="Enable notifications" />
 * 
 * // With description
 * <Switch
 *   label="Auto-save"
 *   description="Automatically save changes as you type"
 * />
 * 
 * // Controlled
 * const [enabled, setEnabled] = useState(false)
 * <Switch
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 *   label="Dark mode"
 * />
 * 
 * // Different colors
 * <Switch label="Active" color="success" />
 * <Switch label="Warning" color="warning" />
 * <Switch label="Error" color="error" />
 * ```
 */
export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
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
      labelPosition = 'right',
      id,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const switchId = id || React.useId()
    
    const switchElement = (
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        className={cn(
          switchVariants({ variant, size, color }),
          errorMessage && 'border-destructive',
          className
        )}
        aria-describedby={
          description || errorMessage
            ? `${switchId}-description`
            : undefined
        }
        {...props}
      >
        <SwitchPrimitive.Thumb 
          className={switchThumbVariants({ size, variant })}
          // @ts-ignore - color prop is not recognized by CVA for thumb
          data-color={color}
        />
      </SwitchPrimitive.Root>
    )
    
    // If no label, return switch only
    if (!label && !description && !errorMessage) {
      return switchElement
    }
    
    // Return with label wrapper
    return (
      <div className="flex items-start space-x-2">
        {labelPosition === 'left' && (
          <div className="flex-1 space-y-0.5">
            <label
              htmlFor={switchId}
              className={cn(switchLabelVariants({ size }), 'cursor-pointer')}
            >
              {label}
            </label>
            {(description || errorMessage) && (
              <p
                id={`${switchId}-description`}
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
        
        {switchElement}
        
        {labelPosition === 'right' && (
          <div className="flex-1 space-y-0.5">
            <label
              htmlFor={switchId}
              className={cn(switchLabelVariants({ size }), 'cursor-pointer')}
            >
              {label}
            </label>
            {(description || errorMessage) && (
              <p
                id={`${switchId}-description`}
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

Switch.displayName = SwitchPrimitive.Root.displayName