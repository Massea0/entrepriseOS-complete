import { type ReactNode, type HTMLAttributes } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { tooltipVariants } from './tooltip.variants'

// Base tooltip props using Radix UI Tooltip
export interface TooltipProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  disableHoverableContent?: boolean
  skipDelayDuration?: number
}

// Tooltip provider props
export interface TooltipProviderProps {
  children: ReactNode
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
}

// Tooltip trigger props
export interface TooltipTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

// Tooltip content props
export interface TooltipContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipVariants> {
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

// Tooltip portal props
export interface TooltipPortalProps {
  children: ReactNode
  container?: HTMLElement | null
  forceMount?: boolean
}

// Tooltip arrow props
export interface TooltipArrowProps extends HTMLAttributes<SVGSVGElement> {
  width?: number
  height?: number
  asChild?: boolean
}

// Simple tooltip wrapper props
export interface SimpleTooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  delayDuration?: number
  variant?: 'default' | 'primary' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  hideArrow?: boolean
}