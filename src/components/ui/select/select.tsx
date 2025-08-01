import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Select trigger variants
 */
const selectTriggerVariants = cva(
  'flex w-full items-center justify-between rounded-lg outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: [
          'bg-background border',
          'hover:border-primary/50',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          'data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20',
        ],
        filled: [
          'bg-accent/50 border-transparent',
          'hover:bg-accent/70',
          'focus:bg-accent focus:border-primary focus:ring-2 focus:ring-primary/20',
          'data-[state=open]:bg-accent data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20',
        ],
        flushed: [
          'bg-transparent border-0 border-b-2 rounded-none px-0',
          'hover:border-primary/50',
          'focus:border-primary focus:ring-0',
          'data-[state=open]:border-primary',
        ],
        ghost: [
          'bg-transparent border-transparent',
          'hover:bg-accent/50',
          'focus:bg-accent focus:ring-2 focus:ring-primary/20 rounded-lg',
          'data-[state=open]:bg-accent data-[state=open]:ring-2 data-[state=open]:ring-primary/20',
        ],
      },
      size: {
        sm: 'h-8 text-sm px-2.5',
        md: 'h-10 text-sm px-3',
        lg: 'h-12 text-base px-4',
        xl: 'h-14 text-lg px-4',
      },
      error: {
        true: 'border-destructive focus:border-destructive focus:ring-destructive/20 data-[state=open]:border-destructive data-[state=open]:ring-destructive/20',
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

// Root component
const SelectRoot = SelectPrimitive.Root

// Value component
const SelectValue = SelectPrimitive.Value

// Icon component
const SelectIcon = SelectPrimitive.Icon

// Portal component
const SelectPortal = SelectPrimitive.Portal

// Trigger component
interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, variant, size, error, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(selectTriggerVariants({ variant, size, error }), className)}
    {...props}
  >
    {children}
    <SelectIcon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectIcon>
  </SelectPrimitive.Trigger>
))

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// Content component
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPortal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPortal>
))

SelectContent.displayName = SelectPrimitive.Content.displayName

// Item component
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      'hover:bg-accent hover:text-accent-foreground',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))

SelectItem.displayName = SelectPrimitive.Item.displayName

// Separator component
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
))

SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// Main Select component with all features
export interface SelectProps
  extends VariantProps<typeof selectTriggerVariants> {
  /**
   * Select options (optional if using children)
   */
  options?: Array<{
    value: string
    label: string
    disabled?: boolean
    group?: string
  }>
  
  /**
   * Children elements (for custom content like SelectItem components)
   */
  children?: React.ReactNode
  
  /**
   * Current value
   */
  value?: string
  
  /**
   * Default value
   */
  defaultValue?: string
  
  /**
   * onChange handler
   */
  onValueChange?: (value: string) => void
  
  /**
   * Placeholder text
   */
  placeholder?: string
  
  /**
   * Whether the select is disabled
   */
  disabled?: boolean
  
  /**
   * Label for the select
   */
  label?: string
  
  /**
   * Helper text shown below the select
   */
  helperText?: string
  
  /**
   * Error message (also sets error state)
   */
  errorMessage?: string
  
  /**
   * Whether the select should take full width
   * @default true
   */
  fullWidth?: boolean
  
  /**
   * Whether the select is required
   */
  required?: boolean
  
  /**
   * Additional class names
   */
  className?: string
}

/**
 * Select Component
 * 
 * A flexible select component with multiple variants built on Radix UI.
 * 
 * @example
 * ```tsx
 * // Basic select
 * <Select
 *   options={[
 *     { value: 'apple', label: 'Apple' },
 *     { value: 'banana', label: 'Banana' },
 *     { value: 'orange', label: 'Orange' }
 *   ]}
 *   placeholder="Select a fruit"
 * />
 * 
 * // With label and helper text
 * <Select
 *   label="Country"
 *   options={countries}
 *   helperText="Select your country of residence"
 * />
 * 
 * // Grouped options
 * <Select
 *   label="Category"
 *   options={[
 *     { value: 'fruit-apple', label: 'Apple', group: 'Fruits' },
 *     { value: 'fruit-banana', label: 'Banana', group: 'Fruits' },
 *     { value: 'veg-carrot', label: 'Carrot', group: 'Vegetables' },
 *     { value: 'veg-potato', label: 'Potato', group: 'Vegetables' }
 *   ]}
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      children,
      value,
      defaultValue,
      onValueChange,
      placeholder = 'Select an option',
      disabled,
      label,
      helperText,
      errorMessage,
      fullWidth = true,
      required,
      variant,
      size,
      error,
      className,
    },
    ref
  ) => {
    // Generate ID
    const selectId = React.useId()
    
    // Determine if select has error
    const hasError = error || !!errorMessage
    
    // Group options by group property
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, typeof options> = {}
      const ungrouped: typeof options = []
      
      if (options) {
        options.forEach((option) => {
          if (option.group) {
            if (!groups[option.group]) {
              groups[option.group] = []
            }
            groups[option.group].push(option)
          } else {
            ungrouped.push(option)
          }
        })
      }
      
      return { groups, ungrouped }
    }, [options])
    
    const selectElement = (
      <SelectRoot
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          variant={variant}
          size={size}
          error={hasError}
          className={cn(fullWidth && 'w-full', className)}
          id={selectId}
          aria-describedby={
            helperText || errorMessage
              ? `${selectId}-helper`
              : undefined
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* If children are provided, use them; otherwise render options */}
          {children ? (
            children
          ) : (
            <>
              {/* Ungrouped options */}
              {groupedOptions.ungrouped.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
              
              {/* Grouped options */}
              {Object.entries(groupedOptions.groups).map(([group, groupOptions], index) => (
                <React.Fragment key={group}>
                  {(index > 0 || groupedOptions.ungrouped.length > 0) && (
                    <SelectSeparator />
                  )}
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {group}
                  </div>
                  {groupOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </>
          )}
        </SelectContent>
      </SelectRoot>
    )
    
    // If no label or helper text, return select only
    if (!label && !helperText && !errorMessage) {
      return selectElement
    }
    
    // Return with wrapper for label and helper text
    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </label>
        )}
        
        {selectElement}
        
        {(helperText || errorMessage) && (
          <p
            id={`${selectId}-helper`}
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

Select.displayName = 'Select'

// Export sub-components for advanced usage
export {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectValue,
  SelectIcon,
  SelectPortal,
}