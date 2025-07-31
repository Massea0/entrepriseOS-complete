import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Card variants configuration
 */
const cardVariants = cva(
  'relative overflow-hidden transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        bordered: 'bg-card text-card-foreground border',
        elevated: 'bg-card text-card-foreground shadow-lg',
        filled: 'bg-accent/50 text-accent-foreground',
        ghost: 'bg-transparent',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
        full: 'rounded-full',
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        '2xl': 'shadow-2xl',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:shadow-lg hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        ],
        false: '',
      },
    },
    compoundVariants: [
      // Elevated variant always has shadow
      {
        variant: 'elevated',
        shadow: 'none',
        className: 'shadow-lg',
      },
      // Interactive cards need focus styles
      {
        interactive: true,
        variant: 'bordered',
        className: 'hover:border-primary',
      },
    ],
    defaultVariants: {
      variant: 'default',
      rounded: 'md',
      shadow: 'sm',
      padding: 'md',
      interactive: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Whether the card should have glassmorphism effect
   * @default false
   */
  glass?: boolean
  
  /**
   * Background image URL
   */
  backgroundImage?: string
  
  /**
   * Gradient overlay
   */
  gradient?: 'none' | 'fade-up' | 'fade-down' | 'radial'
}

/**
 * Card Component
 * 
 * A versatile container component for grouping related content.
 * 
 * @example
 * ```tsx
 * // Basic card
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Card content goes here
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * 
 * // Interactive card
 * <Card interactive onClick={handleClick}>
 *   <CardContent>
 *     Click me!
 *   </CardContent>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      rounded,
      shadow,
      padding,
      interactive,
      glass = false,
      backgroundImage,
      gradient = 'none',
      style,
      ...props
    },
    ref
  ) => {
    const gradientClasses = {
      'fade-up': 'before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/50 before:to-transparent',
      'fade-down': 'before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/50 before:to-transparent',
      'radial': 'before:absolute before:inset-0 before:bg-radial-gradient before:from-black/50 before:to-transparent',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, rounded, shadow, padding, interactive }),
          glass && [
            'backdrop-blur-md',
            'bg-background/60',
            'border border-white/10',
            'shadow-xl',
          ],
          gradient !== 'none' && gradientClasses[gradient],
          className
        )}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ...style,
        }}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

/**
 * CardHeader Component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show a divider below the header
   * @default false
   */
  divider?: boolean
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, divider = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 p-6',
        divider && 'border-b pb-6',
        className
      )}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

/**
 * CardTitle Component
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))

CardTitle.displayName = 'CardTitle'

/**
 * CardDescription Component
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))

CardDescription.displayName = 'CardDescription'

/**
 * CardContent Component
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Remove padding
   * @default false
   */
  noPadding?: boolean
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, noPadding = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(!noPadding && 'p-6 pt-0', className)}
      {...props}
    />
  )
)

CardContent.displayName = 'CardContent'

/**
 * CardFooter Component
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show a divider above the footer
   * @default false
   */
  divider?: boolean
  
  /**
   * Alignment of footer content
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right' | 'between'
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, divider = false, align = 'left', ...props }, ref) => {
    const alignmentClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center p-6 pt-0',
          alignmentClasses[align],
          divider && 'border-t pt-6',
          className
        )}
        {...props}
      />
    )
  }
)

CardFooter.displayName = 'CardFooter'

/**
 * CardImage Component
 */
export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Image position
   * @default 'top'
   */
  position?: 'top' | 'bottom' | 'cover'
  
  /**
   * Aspect ratio
   */
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2' | '21/9'
}

export const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, position = 'top', aspectRatio = '16/9', alt = '', ...props }, ref) => {
    if (position === 'cover') {
      return (
        <img
          ref={ref}
          alt={alt}
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            className
          )}
          {...props}
        />
      )
    }
    
    const aspectRatioClasses = {
      '16/9': 'aspect-video',
      '4/3': 'aspect-[4/3]',
      '1/1': 'aspect-square',
      '3/2': 'aspect-[3/2]',
      '21/9': 'aspect-[21/9]',
    }
    
    return (
      <div className={cn('overflow-hidden', aspectRatioClasses[aspectRatio])}>
        <img
          ref={ref}
          alt={alt}
          className={cn(
            'h-full w-full object-cover',
            position === 'bottom' && 'rounded-b-lg',
            position === 'top' && 'rounded-t-lg',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

CardImage.displayName = 'CardImage'