import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Typography variants configuration
 * Defines all text styles based on our design tokens
 */
const typographyVariants = cva('', {
  variants: {
    variant: {
      // Headings
      h1: 'text-5xl font-bold leading-tight tracking-tight',
      h2: 'text-4xl font-bold leading-tight tracking-tight',
      h3: 'text-3xl font-semibold leading-tight',
      h4: 'text-2xl font-semibold leading-tight',
      h5: 'text-xl font-semibold leading-normal',
      h6: 'text-lg font-semibold leading-normal',
      
      // Body text
      body1: 'text-base font-normal leading-relaxed',
      body2: 'text-sm font-normal leading-relaxed',
      
      // Special text
      subtitle1: 'text-lg font-medium leading-normal',
      subtitle2: 'text-base font-medium leading-normal',
      caption: 'text-xs font-normal leading-normal text-muted-foreground',
      overline: 'text-xs font-medium uppercase tracking-wider text-muted-foreground',
      
      // UI text
      button: 'text-sm font-medium tracking-wide',
      label: 'text-sm font-medium',
      helper: 'text-xs font-normal text-muted-foreground',
      error: 'text-xs font-normal text-destructive',
    },
    
    // Text alignment
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    
    // Text color
    color: {
      default: 'text-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      muted: 'text-muted-foreground',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-amber-600 dark:text-amber-400',
      error: 'text-destructive',
      info: 'text-blue-600 dark:text-blue-400',
    },
    
    // Font weight override
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    
    // Text transform
    transform: {
      none: 'normal-case',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
    },
    
    // Text decoration
    decoration: {
      none: 'no-underline',
      underline: 'underline',
      'line-through': 'line-through',
    },
    
    // Truncation
    truncate: {
      true: 'truncate',
      false: '',
    },
    
    // Font family
    font: {
      sans: 'font-sans',
      mono: 'font-mono',
    },
  },
  defaultVariants: {
    variant: 'body1',
    align: 'left',
    color: 'default',
    transform: 'none',
    decoration: 'none',
    truncate: false,
    font: 'sans',
  },
})

// Polymorphic component types
type AsProp<C extends React.ElementType> = {
  as?: C
}

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P)

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>

type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> }

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref']

// Default element mapping for variants
const variantMapping: Record<string, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
  button: 'span',
  label: 'label',
  helper: 'span',
  error: 'span',
}

/**
 * Typography component props
 */
export type TypographyProps<C extends React.ElementType = 'span'> =
  PolymorphicComponentPropWithRef<
    C,
    VariantProps<typeof typographyVariants> & {
      /**
       * Whether to add margin bottom (useful for paragraphs)
       * @default false
       */
      gutterBottom?: boolean
      /**
       * Whether text should be non-selectable
       * @default false
       */
      noSelect?: boolean
    }
  >

/**
 * Typography Component
 * 
 * A polymorphic text component that handles all text rendering needs
 * with consistent styling based on the design system.
 * 
 * @example
 * ```tsx
 * // Heading
 * <Typography variant="h1">Welcome</Typography>
 * 
 * // Paragraph with margin
 * <Typography variant="body1" gutterBottom>
 *   This is a paragraph with margin bottom.
 * </Typography>
 * 
 * // Custom element
 * <Typography as="div" variant="caption" color="muted">
 *   Caption text in a div
 * </Typography>
 * 
 * // With all props
 * <Typography
 *   variant="h3"
 *   color="primary"
 *   align="center"
 *   weight="bold"
 *   transform="uppercase"
 * >
 *   Styled Heading
 * </Typography>
 * ```
 */
export const Typography = React.forwardRef(
  <C extends React.ElementType = 'span'>(
    {
      as,
      variant = 'body1',
      align,
      color,
      weight,
      transform,
      decoration,
      truncate,
      font,
      gutterBottom = false,
      noSelect = false,
      className,
      children,
      ...props
    }: TypographyProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    // Determine which element to render
    const Component = as || variantMapping[variant || 'body1'] || 'span'
    
    return (
      <Component
        ref={ref}
        className={cn(
          typographyVariants({
            variant,
            align,
            color,
            weight,
            transform,
            decoration,
            truncate,
            font,
          }),
          gutterBottom && 'mb-4',
          noSelect && 'select-none',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
) as <C extends React.ElementType = 'span'>(
  props: TypographyProps<C>
) => React.ReactElement | null

Typography.displayName = 'Typography'

// Export variants for external use
export { typographyVariants }