import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

/**
 * Button variants configuration using CVA (Class Variance Authority)
 * This provides type-safe variant props and automatic class generation
 */
const buttonVariants = cva(
  // Base styles applied to all buttons
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      // Visual variants
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-primary',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-secondary',
        ghost:
          'hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent',
        danger:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive',
        success:
          'bg-green-600 text-white shadow-sm hover:bg-green-700 focus-visible:ring-green-600',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent',
        link:
          'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',
      },
      // Size variants
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
      // Special states
      fullWidth: {
        true: 'w-full',
      },
      // Icon button mode
      iconOnly: {
        true: 'aspect-square p-0',
      },
    },
    // Compound variants for complex styling logic
    compoundVariants: [
      // Adjust padding for icon-only buttons
      {
        iconOnly: true,
        size: 'xs',
        class: 'h-7 w-7',
      },
      {
        iconOnly: true,
        size: 'sm',
        class: 'h-8 w-8',
      },
      {
        iconOnly: true,
        size: 'md',
        class: 'h-10 w-10',
      },
      {
        iconOnly: true,
        size: 'lg',
        class: 'h-12 w-12',
      },
      {
        iconOnly: true,
        size: 'xl',
        class: 'h-14 w-14',
      },
    ],
    // Default values
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

/**
 * Button component props interface
 * Extends native button props and CVA variants
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Loading state - shows spinner and disables interaction
   * @default false
   */
  isLoading?: boolean
  /**
   * Icon to display on the left side of the button text
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display on the right side of the button text
   */
  rightIcon?: React.ReactNode
  /**
   * Loading text to display when isLoading is true
   * @default "Chargement..."
   */
  loadingText?: string
  /**
   * Optional ref forwarding
   */
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * Button Component
 * 
 * A versatile button component with multiple variants, sizes, and states.
 * Supports loading states, icons, and full keyboard navigation.
 * 
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 * 
 * // Loading button
 * <Button isLoading loadingText="Saving...">
 *   Save
 * </Button>
 * 
 * // Icon button
 * <Button variant="ghost" size="sm" iconOnly>
 *   <Settings className="h-4 w-4" />
 * </Button>
 * 
 * // Button with icons
 * <Button leftIcon={<Save />} rightIcon={<ChevronRight />}>
 *   Save and continue
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      iconOnly,
      isLoading = false,
      leftIcon,
      rightIcon,
      loadingText = 'Chargement...',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if button should be disabled (explicit disabled or loading state)
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, fullWidth, iconOnly }),
          className
        )}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Loader2 
            className={cn(
              'animate-spin',
              children || loadingText ? 'mr-2' : '',
              size === 'xs' && 'h-3 w-3',
              size === 'sm' && 'h-3.5 w-3.5',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5',
              size === 'xl' && 'h-6 w-6'
            )} 
          />
        )}
        
        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className={cn(children && 'mr-2', 'inline-flex')}>
            {leftIcon}
          </span>
        )}
        
        {/* Button content */}
        {isLoading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          children
        )}
        
        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className={cn(children && 'ml-2', 'inline-flex')}>
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Export variants for external use
export { buttonVariants }