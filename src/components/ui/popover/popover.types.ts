import { type ReactNode, type HTMLAttributes } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { popoverVariants } from './popover.variants'

// Base popover props using Radix UI Popover
export interface PopoverProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

// Popover trigger props
export interface PopoverTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

// Popover content props
export interface PopoverContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof popoverVariants> {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
  avoidCollisions?: boolean
  collisionBoundary?: Element | null
  collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  sticky?: 'partial' | 'always'
  hideWhenDetached?: boolean
  forceMount?: boolean
  hideArrow?: boolean
}

// Popover anchor props
export interface PopoverAnchorProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

// Popover close props
export interface PopoverCloseProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

// Popover portal props
export interface PopoverPortalProps {
  children: ReactNode
  container?: HTMLElement | null
  forceMount?: boolean
}

// Popover arrow props
export interface PopoverArrowProps extends HTMLAttributes<SVGSVGElement> {
  width?: number
  height?: number
  asChild?: boolean
}