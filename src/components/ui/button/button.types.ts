import type { VariantProps } from 'class-variance-authority'
import type { buttonVariants } from './button'

/**
 * Button size options
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button variant options
 */
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'ghost' 
  | 'danger' 
  | 'success' 
  | 'outline' 
  | 'link'

/**
 * Button state types
 */
export interface ButtonState {
  isLoading?: boolean
  isDisabled?: boolean
  isActive?: boolean
  isFocused?: boolean
}

/**
 * Icon positions for button
 */
export type IconPosition = 'left' | 'right' | 'both' | 'none'

/**
 * Button group props for creating button groups
 */
export interface ButtonGroupProps {
  /**
   * Buttons in the group
   */
  children: React.ReactNode
  /**
   * Orientation of the button group
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * Whether buttons should be connected (no gap)
   * @default true
   */
  connected?: boolean
  /**
   * Size for all buttons in the group
   */
  size?: ButtonSize
  /**
   * Variant for all buttons in the group
   */
  variant?: ButtonVariant
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Button variants type helper
 */
export type ButtonVariants = VariantProps<typeof buttonVariants>