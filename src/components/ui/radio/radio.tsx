import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Radio variants configuration
 */
const radioVariants = cva(
  'aspect-square rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'border-input bg-background',
          'hover:border-primary/70',
          'data-[state=checked]:border-primary',
        ],
        outline: [
          'border-primary bg-transparent',
          'hover:bg-primary/10',
          'data-[state=checked]:border-primary',
        ],
        filled: [
          'border-transparent bg-accent',
          'hover:bg-accent/80',
          'data-[state=checked]:bg-primary/20 data-[state=checked]:border-primary',
        ],
        ghost: [
          'border-transparent bg-transparent',
          'hover:bg-accent/50',
          'data-[state=checked]:bg-primary/10 data-[state=checked]:border-primary',
        ],
      },
      size: {
        sm: 'h-4 w-4 focus-visible:ring-1',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      color: {
        default: 'focus-visible:ring-primary/20',
        success: [
          'data-[state=checked]:border-green-600',
          'focus-visible:ring-green-600/20',
        ],
        warning: [
          'data-[state=checked]:border-yellow-600',
          'focus-visible:ring-yellow-600/20',
        ],
        error: [
          'data-[state=checked]:border-red-600',
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

const radioIndicatorVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      color: {
        default: 'text-primary',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  }
)

const radioLabelVariants = cva(
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

// RadioGroup Component
interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof radioVariants> {
  /**
   * Label for the radio group
   */
  label?: string
  
  /**
   * Description for the radio group
   */
  description?: string
  
  /**
   * Error message (also sets error state)
   */
  errorMessage?: string
  
  /**
   * Layout direction
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical'
}

/**
 * RadioGroup Component
 * 
 * A radio group component for selecting a single option from multiple choices.
 * 
 * @example
 * ```tsx
 * <RadioGroup label="Select your plan" defaultValue="pro">
 *   <RadioItem value="free" label="Free" description="$0/month" />
 *   <RadioItem value="pro" label="Pro" description="$10/month" />
 *   <RadioItem value="enterprise" label="Enterprise" description="Contact us" />
 * </RadioGroup>
 * ```
 */
export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
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
      direction = 'vertical',
      children,
      ...props
    },
    ref
  ) => {
    const groupId = React.useId()
    
    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn('grid gap-2', className)}
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-describedby={
          description || errorMessage ? `${groupId}-description` : undefined
        }
        {...props}
      >
        {label && (
          <label
            id={`${groupId}-label`}
            className="text-sm font-medium leading-none"
          >
            {label}
          </label>
        )}
        
        {description && !errorMessage && (
          <p
            id={`${groupId}-description`}
            className="text-xs text-muted-foreground"
          >
            {description}
          </p>
        )}
        
        <div
          className={cn(
            'grid gap-2',
            direction === 'horizontal' && 'grid-flow-col auto-cols-fr'
          )}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                variant,
                size,
                color,
                ...child.props,
              })
            }
            return child
          })}
        </div>
        
        {errorMessage && (
          <p
            id={`${groupId}-description`}
            className="text-xs text-destructive"
          >
            {errorMessage}
          </p>
        )}
      </RadioGroupPrimitive.Root>
    )
  }
)

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

// RadioItem Component
interface RadioItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioVariants> {
  /**
   * Label for the radio item
   */
  label?: string
  
  /**
   * Description for the radio item
   */
  description?: string
  
  /**
   * Position of the label
   * @default 'right'
   */
  labelPosition?: 'left' | 'right'
}

/**
 * RadioItem Component
 * 
 * An individual radio button item to be used within RadioGroup.
 * 
 * @example
 * ```tsx
 * <RadioItem 
 *   value="option1" 
 *   label="Option 1" 
 *   description="This is the first option"
 * />
 * ```
 */
export const RadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioItemProps
>(
  (
    {
      className,
      variant,
      size,
      color,
      label,
      description,
      labelPosition = 'right',
      id,
      ...props
    },
    ref
  ) => {
    const radioId = id || React.useId()
    
    const radio = (
      <RadioGroupPrimitive.Item
        ref={ref}
        id={radioId}
        className={cn(radioVariants({ variant, size, color }), 'peer', className)}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className={radioIndicatorVariants({ color })}>
          <Circle
            className={cn(
              'fill-current animate-in fade-in-0 zoom-in-95',
              size === 'sm' && 'h-1.5 w-1.5',
              size === 'md' && 'h-2 w-2',
              size === 'lg' && 'h-2.5 w-2.5'
            )}
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    )
    
    // If no label, return radio only
    if (!label && !description) {
      return radio
    }
    
    // Return with label wrapper
    return (
      <div className="flex items-start space-x-2">
        {labelPosition === 'left' && (
          <div className="flex-1 space-y-0.5">
            <label
              htmlFor={radioId}
              className={cn(radioLabelVariants({ size }), 'cursor-pointer')}
            >
              {label}
            </label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        
        {radio}
        
        {labelPosition === 'right' && (
          <div className="flex-1 space-y-0.5">
            <label
              htmlFor={radioId}
              className={cn(radioLabelVariants({ size }), 'cursor-pointer')}
            >
              {label}
            </label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

RadioItem.displayName = RadioGroupPrimitive.Item.displayName