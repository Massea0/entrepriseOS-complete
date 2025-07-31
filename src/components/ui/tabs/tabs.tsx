import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

/**
 * Tabs root component
 */
const Tabs = TabsPrimitive.Root

/**
 * TabsList variants configuration
 */
const tabsListVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'rounded-lg bg-muted p-1 text-muted-foreground',
        pills: 'gap-2',
        underline: 'border-b gap-4',
        enclosed: 'gap-0',
      },
      orientation: {
        horizontal: 'h-10 flex-row',
        vertical: 'flex-col h-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      orientation: 'horizontal',
    },
  }
)

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, orientation, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, orientation }), className)}
    {...props}
  />
))

TabsList.displayName = TabsPrimitive.List.displayName

/**
 * TabsTrigger variants configuration
 */
const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'rounded-sm px-3 py-1.5',
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        ],
        pills: [
          'rounded-full px-4 py-2',
          'hover:bg-accent hover:text-accent-foreground',
          'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
        ],
        underline: [
          'relative pb-3 px-0 bg-transparent',
          'hover:text-foreground',
          'data-[state=active]:text-foreground',
          'after:absolute after:left-0 after:bottom-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 after:transition-transform',
          'data-[state=active]:after:scale-x-100',
        ],
        enclosed: [
          'border-b-2 border-transparent px-4 py-2 -mb-[2px]',
          'hover:text-foreground',
          'data-[state=active]:bg-background data-[state=active]:border-b-background data-[state=active]:shadow-sm data-[state=active]:rounded-t-md',
        ],
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        size: 'sm',
        className: 'px-2 py-1',
      },
      {
        variant: 'default',
        size: 'lg',
        className: 'px-4 py-2',
      },
      {
        variant: 'pills',
        size: 'sm',
        className: 'px-3 py-1.5',
      },
      {
        variant: 'pills',
        size: 'lg',
        className: 'px-5 py-2.5',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  /**
   * Icon to display before the label
   */
  icon?: React.ReactNode
  
  /**
   * Badge or count to display after the label
   */
  badge?: React.ReactNode
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, icon, badge, children, ...props }, ref) => {
  const listContext = React.useContext(TabsListContext)
  
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tabsTriggerVariants({ 
          variant: listContext?.variant || variant, 
          size: listContext?.size || size 
        }),
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      {badge && <span className="ml-2">{badge}</span>}
    </TabsPrimitive.Trigger>
  )
})

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * TabsContent component
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1',
      'data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0',
      className
    )}
    {...props}
  />
))

TabsContent.displayName = TabsPrimitive.Content.displayName

// Context to pass variant and size to triggers
interface TabsListContextValue {
  variant?: 'default' | 'pills' | 'underline' | 'enclosed'
  size?: 'sm' | 'md' | 'lg'
}

const TabsListContext = React.createContext<TabsListContextValue | null>(null)

// Enhanced TabsList with context
const TabsListWithContext = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ variant, size, children, ...props }, ref) => (
  <TabsListContext.Provider value={{ variant, size }}>
    <TabsList ref={ref} variant={variant} {...props}>
      {children}
    </TabsList>
  </TabsListContext.Provider>
))

TabsListWithContext.displayName = 'TabsList'

// Export enhanced version
export { Tabs, TabsListWithContext as TabsList, TabsTrigger, TabsContent }
export type { TabsListProps, TabsTriggerProps }

// Additional helper components

/**
 * TabsBadge Component
 * 
 * A badge component to show count or status in tabs.
 */
export const TabsBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'primary' | 'secondary' | 'destructive'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const badgeVariants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  }

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
})

TabsBadge.displayName = 'TabsBadge'

/**
 * TabsIcon Component
 * 
 * An icon wrapper for consistent sizing in tabs.
 */
export const TabsIcon = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('inline-flex shrink-0 [&>svg]:h-4 [&>svg]:w-4', className)}
    {...props}
  />
))

TabsIcon.displayName = 'TabsIcon'