import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { User } from 'lucide-react'

/**
 * Avatar variants configuration
 */
const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden bg-muted',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
      },
      color: {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
      color: 'default',
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /**
   * Image source URL
   */
  src?: string
  
  /**
   * Alternative text for the image
   */
  alt?: string
  
  /**
   * Name for generating initials
   */
  name?: string
  
  /**
   * Custom initials (overrides name)
   */
  initials?: string
  
  /**
   * Fallback icon when no image or initials
   */
  fallbackIcon?: React.ReactNode
  
  /**
   * Status indicator
   */
  status?: 'online' | 'offline' | 'away' | 'busy' | 'dnd'
  
  /**
   * Status position
   * @default 'bottom-right'
   */
  statusPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  
  /**
   * Whether to show a border
   * @default false
   */
  bordered?: boolean
  
  /**
   * Border color
   */
  borderColor?: string
}

/**
 * Avatar Component
 * 
 * Display user avatars with image, initials, or icon fallback.
 * 
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar name="John Doe" />
 * <Avatar initials="JD" status="online" />
 * ```
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size,
      shape,
      color,
      src,
      alt,
      name,
      initials,
      fallbackIcon,
      status,
      statusPosition = 'bottom-right',
      bordered = false,
      borderColor = 'border-background',
      style,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false)

    // Generate initials from name
    const getInitials = (name: string) => {
      const parts = name.trim().split(/\s+/)
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase()
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }

    const displayInitials = initials || (name ? getInitials(name) : '')

    const renderContent = () => {
      if (src && !imageError) {
        return (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        )
      }

      if (displayInitials) {
        return (
          <span className="font-medium select-none">
            {displayInitials}
          </span>
        )
      }

      return fallbackIcon || <User className="h-[60%] w-[60%]" />
    }

    const statusPositionClasses = {
      'top-left': 'top-0 left-0',
      'top-right': 'top-0 right-0',
      'bottom-left': 'bottom-0 left-0',
      'bottom-right': 'bottom-0 right-0',
    }

    const statusSizeClasses = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-3.5 w-3.5',
      '2xl': 'h-4 w-4',
    }

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      dnd: 'bg-red-500',
    }

    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({ size, shape, color }),
          bordered && `ring-2 ring-offset-2 ring-offset-background ${borderColor}`,
          className
        )}
        style={style}
        {...props}
      >
        {renderContent()}
        
        {status && (
          <span
            className={cn(
              'absolute rounded-full border-2 border-background',
              statusPositionClasses[statusPosition],
              statusSizeClasses[size || 'md'],
              statusColors[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

/**
 * AvatarGroup Component
 * 
 * Display multiple avatars in a group with overlap.
 */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of avatars to display
   * @default 4
   */
  max?: number
  
  /**
   * Size of avatars in the group
   * @default 'md'
   */
  size?: AvatarProps['size']
  
  /**
   * Shape of avatars in the group
   * @default 'circle'
   */
  shape?: AvatarProps['shape']
  
  /**
   * Spacing between avatars (negative for overlap)
   * @default -8
   */
  spacing?: number
  
  /**
   * Children avatars
   */
  children: React.ReactNode
  
  /**
   * Props for the overflow indicator
   */
  overflowProps?: Partial<AvatarProps>
  
  /**
   * Whether to reverse the stacking order
   * @default false
   */
  reverseOrder?: boolean
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      className,
      max = 4,
      size = 'md',
      shape = 'circle',
      spacing = -8,
      children,
      overflowProps,
      reverseOrder = false,
      ...props
    },
    ref
  ) => {
    const childrenArray = React.Children.toArray(children).filter(React.isValidElement)
    const visibleChildren = childrenArray.slice(0, max)
    const overflowCount = childrenArray.length - max

    const avatars = visibleChildren.map((child, index) => {
      const isAvatar = child.type === Avatar
      if (!isAvatar) return child

      return React.cloneElement(child as React.ReactElement<AvatarProps>, {
        size,
        shape,
        bordered: true,
        style: {
          marginLeft: index === 0 ? 0 : spacing,
          zIndex: reverseOrder ? index : visibleChildren.length - index,
          ...child.props.style,
        },
        ...child.props,
      })
    })

    return (
      <div
        ref={ref}
        className={cn('flex items-center', reverseOrder && 'flex-row-reverse', className)}
        {...props}
      >
        {avatars}
        {overflowCount > 0 && (
          <Avatar
            size={size}
            shape={shape}
            initials={`+${overflowCount}`}
            bordered
            style={{
              marginLeft: reverseOrder ? 0 : spacing,
              marginRight: reverseOrder ? spacing : 0,
              zIndex: reverseOrder ? visibleChildren.length + 1 : 0,
            }}
            {...overflowProps}
          />
        )}
      </div>
    )
  }
)

AvatarGroup.displayName = 'AvatarGroup'

/**
 * AvatarWithText Component
 * 
 * Avatar with accompanying text (name and description).
 */
export interface AvatarWithTextProps extends AvatarProps {
  /**
   * Primary text (usually name)
   */
  primaryText?: string
  
  /**
   * Secondary text (usually role or status)
   */
  secondaryText?: string
  
  /**
   * Text alignment relative to avatar
   * @default 'right'
   */
  textPosition?: 'right' | 'bottom'
  
  /**
   * Gap between avatar and text
   * @default 'md'
   */
  gap?: 'sm' | 'md' | 'lg'
}

const AvatarWithText = React.forwardRef<HTMLDivElement, AvatarWithTextProps>(
  (
    {
      primaryText,
      secondaryText,
      textPosition = 'right',
      gap = 'md',
      className,
      ...avatarProps
    },
    ref
  ) => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
    }

    const textAlignClasses = {
      right: 'text-left',
      bottom: 'text-center',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          textPosition === 'bottom' && 'flex-col',
          gapClasses[gap],
          className
        )}
      >
        <Avatar {...avatarProps} />
        {(primaryText || secondaryText) && (
          <div className={textAlignClasses[textPosition]}>
            {primaryText && (
              <div className="font-medium text-foreground">
                {primaryText}
              </div>
            )}
            {secondaryText && (
              <div className="text-sm text-muted-foreground">
                {secondaryText}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

AvatarWithText.displayName = 'AvatarWithText'

export { Avatar, AvatarGroup, AvatarWithText }