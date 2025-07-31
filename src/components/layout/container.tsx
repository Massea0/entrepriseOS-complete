import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Container variants configuration
 * Defines different container widths and behaviors
 */
const containerVariants = cva(
  'mx-auto w-full',
  {
    variants: {
      // Max width variants
      size: {
        sm: 'max-w-screen-sm',     // 640px
        md: 'max-w-screen-md',     // 768px
        lg: 'max-w-screen-lg',     // 1024px
        xl: 'max-w-screen-xl',     // 1280px
        '2xl': 'max-w-screen-2xl', // 1536px
        full: 'max-w-none',        // No max width
        content: 'max-w-7xl',      // 1280px - Good for content
        narrow: 'max-w-4xl',       // 896px - Good for reading
      },
      
      // Padding variants
      padding: {
        none: 'px-0',
        sm: 'px-4 sm:px-6',
        md: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-8 lg:px-12',
        xl: 'px-8 sm:px-12 lg:px-16',
      },
      
      // Center content
      center: {
        true: '',
        false: 'mx-0',
      },
    },
    defaultVariants: {
      size: 'content',
      padding: 'md',
      center: true,
    },
  }
)

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  /**
   * The element to render as
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside'
}

/**
 * Container Component
 * 
 * A responsive container that constrains content width and provides
 * consistent horizontal padding across different screen sizes.
 * 
 * @example
 * ```tsx
 * // Default content container
 * <Container>
 *   <Typography variant="h1">Page Title</Typography>
 * </Container>
 * 
 * // Full width container with no padding
 * <Container size="full" padding="none">
 *   <HeroSection />
 * </Container>
 * 
 * // Narrow container for reading
 * <Container size="narrow" as="article">
 *   <BlogPost />
 * </Container>
 * ```
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    size, 
    padding, 
    center, 
    as: Component = 'div', 
    ...props 
  }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          containerVariants({ size, padding, center }),
          className
        )}
        {...props}
      />
    )
  }
)

Container.displayName = 'Container'