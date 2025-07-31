import * as React from 'react'
import { Menu, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

/**
 * Navbar variants configuration
 */
const navbarVariants = cva(
  'sticky top-0 z-40 w-full transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-background border-b',
        transparent: 'bg-transparent',
        blur: 'bg-background/80 backdrop-blur-md border-b border-border/50',
        filled: 'bg-card border-b',
      },
      size: {
        sm: 'h-14',
        md: 'h-16',
        lg: 'h-20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface NavbarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navbarVariants> {
  /**
   * Whether the navbar is sticky
   * @default true
   */
  sticky?: boolean
  
  /**
   * Maximum width container
   * @default 'xl'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

/**
 * Navbar Component
 * 
 * A responsive navigation bar component.
 * 
 * @example
 * ```tsx
 * <Navbar>
 *   <NavbarBrand>
 *     <img src="/logo.svg" alt="Logo" className="h-8" />
 *   </NavbarBrand>
 *   <NavbarContent>
 *     <NavbarItem href="/">Home</NavbarItem>
 *     <NavbarItem href="/about">About</NavbarItem>
 *     <NavbarItem href="/services">Services</NavbarItem>
 *   </NavbarContent>
 *   <NavbarActions>
 *     <Button variant="ghost" size="sm">Login</Button>
 *     <Button size="sm">Sign Up</Button>
 *   </NavbarActions>
 * </Navbar>
 * ```
 */
export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, variant, size, sticky = true, maxWidth = 'xl', children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const containerClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    }

    return (
      <nav
        ref={ref}
        className={cn(
          navbarVariants({ variant, size }),
          !sticky && 'relative',
          className
        )}
        {...props}
      >
        <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', containerClasses[maxWidth])}>
          <div className="flex h-full items-center justify-between">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop content */}
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
              {children}
            </div>

            {/* Mobile content - hidden on desktop */}
            <div className="flex items-center gap-4 lg:hidden">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  if (child.type === NavbarBrand) {
                    return child
                  }
                  if (child.type === NavbarActions) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                      className: cn(child.props.className, 'flex items-center gap-2'),
                    })
                  }
                }
                return null
              })}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300',
            isOpen ? 'max-h-96' : 'max-h-0'
          )}
        >
          <div className="border-t px-4 py-3 space-y-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === NavbarContent) {
                return React.cloneElement(child as React.ReactElement<any>, {
                  mobile: true,
                })
              }
              return null
            })}
          </div>
        </div>
      </nav>
    )
  }
)

Navbar.displayName = 'Navbar'

/**
 * NavbarBrand Component
 */
export interface NavbarBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Link to navigate when clicked
   */
  href?: string
}

export const NavbarBrand = React.forwardRef<HTMLDivElement, NavbarBrandProps>(
  ({ className, href, children, onClick, ...props }, ref) => {
    const content = (
      <div
        ref={ref}
        className={cn('flex items-center', className)}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    )

    if (href) {
      return (
        <a href={href} className="flex items-center no-underline">
          {content}
        </a>
      )
    }

    return content
  }
)

NavbarBrand.displayName = 'NavbarBrand'

/**
 * NavbarContent Component
 */
export interface NavbarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * @internal
   */
  mobile?: boolean
}

export const NavbarContent = React.forwardRef<HTMLDivElement, NavbarContentProps>(
  ({ className, mobile = false, children, ...props }, ref) => {
    if (mobile) {
      return (
        <div ref={ref} className={cn('flex flex-col space-y-1', className)} {...props}>
          {children}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-4 lg:space-x-6', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

NavbarContent.displayName = 'NavbarContent'

/**
 * NavbarItem Component
 */
const navbarItemVariants = cva(
  'text-sm font-medium transition-colors hover:text-primary',
  {
    variants: {
      active: {
        true: 'text-foreground',
        false: 'text-muted-foreground',
      },
      mobile: {
        true: 'block px-3 py-2 rounded-md hover:bg-accent',
        false: 'inline-flex items-center',
      },
    },
    defaultVariants: {
      active: false,
      mobile: false,
    },
  }
)

export interface NavbarItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navbarItemVariants> {
  /**
   * Whether this item is the current page
   */
  active?: boolean
}

export const NavbarItem = React.forwardRef<HTMLAnchorElement, NavbarItemProps>(
  ({ className, active, children, ...props }, ref) => {
    const isMobile = React.useContext(NavbarMobileContext)

    return (
      <a
        ref={ref}
        className={cn(navbarItemVariants({ active, mobile: isMobile }), className)}
        aria-current={active ? 'page' : undefined}
        {...props}
      >
        {children}
      </a>
    )
  }
)

NavbarItem.displayName = 'NavbarItem'

/**
 * NavbarActions Component
 */
export const NavbarActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center space-x-4', className)}
    {...props}
  />
))

NavbarActions.displayName = 'NavbarActions'

/**
 * NavbarDivider Component
 */
export const NavbarDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('h-4 w-px bg-border', className)}
    {...props}
  />
))

NavbarDivider.displayName = 'NavbarDivider'

// Context for mobile state
const NavbarMobileContext = React.createContext(false)

// Update NavbarContent to provide context
const OriginalNavbarContent = NavbarContent
NavbarContent.displayName = 'NavbarContent'

export const NavbarContentWithContext = React.forwardRef<HTMLDivElement, NavbarContentProps>(
  ({ mobile = false, children, ...props }, ref) => (
    <NavbarMobileContext.Provider value={mobile}>
      <OriginalNavbarContent ref={ref} mobile={mobile} {...props}>
        {children}
      </OriginalNavbarContent>
    </NavbarMobileContext.Provider>
  )
)

// Replace the export
Object.assign(NavbarContent, NavbarContentWithContext)