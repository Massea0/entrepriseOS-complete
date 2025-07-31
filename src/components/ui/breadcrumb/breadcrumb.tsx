import * as React from 'react'
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Breadcrumb variants configuration
 */
const breadcrumbVariants = cva(
  'flex items-center',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      spacing: {
        tight: 'space-x-1',
        normal: 'space-x-2',
        loose: 'space-x-3',
      },
    },
    defaultVariants: {
      size: 'md',
      spacing: 'normal',
    },
  }
)

export interface BreadcrumbProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof breadcrumbVariants> {
  /**
   * Separator element between items
   * @default <ChevronRight />
   */
  separator?: React.ReactNode
  
  /**
   * Whether to show home icon on first item
   * @default false
   */
  showHome?: boolean
  
  /**
   * Maximum number of items to show on mobile
   * @default 2
   */
  maxItemsMobile?: number
}

/**
 * Breadcrumb Component
 * 
 * A navigation component showing the current page location within a hierarchy.
 * 
 * @example
 * ```tsx
 * <Breadcrumb>
 *   <BreadcrumbItem href="/">Home</BreadcrumbItem>
 *   <BreadcrumbItem href="/products">Products</BreadcrumbItem>
 *   <BreadcrumbItem href="/products/category">Category</BreadcrumbItem>
 *   <BreadcrumbItem current>Product Name</BreadcrumbItem>
 * </Breadcrumb>
 * ```
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      className,
      size,
      spacing,
      separator = <ChevronRight className="h-4 w-4" />,
      showHome = false,
      maxItemsMobile = 2,
      children,
      ...props
    },
    ref
  ) => {
    const items = React.Children.toArray(children).filter(React.isValidElement)
    const itemCount = items.length

    // For mobile: show first and last items with ellipsis in between
    const shouldCollapse = itemCount > maxItemsMobile
    
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(breadcrumbVariants({ size, spacing }), className)}
        {...props}
      >
        <ol className="flex items-center">
          {items.map((item, index) => {
            const isFirst = index === 0
            const isLast = index === itemCount - 1
            const isVisible = !shouldCollapse || isFirst || isLast || index === 1

            // On mobile, show ellipsis after first item if collapsing
            if (shouldCollapse && index === 1 && itemCount > maxItemsMobile + 1) {
              return (
                <React.Fragment key={`ellipsis-${index}`}>
                  <li className="flex items-center sm:hidden">
                    <span className="mx-2 text-muted-foreground" aria-hidden="true">
                      {separator}
                    </span>
                  </li>
                  <li className="flex items-center sm:hidden">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </li>
                  <li className="flex items-center sm:hidden">
                    <span className="mx-2 text-muted-foreground" aria-hidden="true">
                      {separator}
                    </span>
                  </li>
                </React.Fragment>
              )
            }

            return (
              <React.Fragment key={index}>
                {!isFirst && (
                  <li
                    className={cn(
                      'flex items-center',
                      shouldCollapse && !isLast && 'hidden sm:flex'
                    )}
                  >
                    <span className="mx-2 text-muted-foreground" aria-hidden="true">
                      {separator}
                    </span>
                  </li>
                )}
                <li
                  className={cn(
                    'flex items-center',
                    shouldCollapse && !isFirst && !isLast && 'hidden sm:flex'
                  )}
                >
                  {React.cloneElement(item as React.ReactElement<any>, {
                    showHome: isFirst && showHome,
                    'aria-current': isLast ? 'page' : undefined,
                    ...item.props,
                  })}
                </li>
              </React.Fragment>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'

/**
 * BreadcrumbItem variants
 */
const breadcrumbItemVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      current: {
        true: 'text-foreground cursor-default',
        false: 'text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      current: false,
    },
  }
)

export interface BreadcrumbItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof breadcrumbItemVariants> {
  /**
   * Whether this is the current page
   * @default false
   */
  current?: boolean
  
  /**
   * @internal
   */
  showHome?: boolean
  
  /**
   * Icon to show before the text
   */
  icon?: React.ReactNode
}

/**
 * BreadcrumbItem Component
 * 
 * An individual breadcrumb item.
 * 
 * @example
 * ```tsx
 * <BreadcrumbItem href="/products">Products</BreadcrumbItem>
 * <BreadcrumbItem current>Current Page</BreadcrumbItem>
 * ```
 */
export const BreadcrumbItem = React.forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(
  ({ className, current = false, showHome, icon, children, href, ...props }, ref) => {
    const content = (
      <>
        {(showHome || icon) && (
          <span className="mr-1.5">{showHome ? <Home className="h-4 w-4" /> : icon}</span>
        )}
        {children}
      </>
    )

    if (current || !href) {
      return (
        <span
          ref={ref as any}
          className={cn(breadcrumbItemVariants({ current: true }), className)}
          {...props}
        >
          {content}
        </span>
      )
    }

    return (
      <a
        ref={ref}
        href={href}
        className={cn(breadcrumbItemVariants({ current }), className)}
        {...props}
      >
        {content}
      </a>
    )
  }
)

BreadcrumbItem.displayName = 'BreadcrumbItem'

/**
 * BreadcrumbEllipsis Component
 * 
 * A component to show ellipsis in breadcrumb when items are collapsed.
 */
export const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
    <span className="sr-only">More pages</span>
  </span>
))

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'

/**
 * BreadcrumbSeparator Component
 * 
 * A custom separator component for breadcrumbs.
 */
export const BreadcrumbSeparator = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    role="presentation"
    aria-hidden="true"
    className={cn('mx-2 text-muted-foreground', className)}
    {...props}
  >
    {children || <ChevronRight className="h-4 w-4" />}
  </span>
))

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'