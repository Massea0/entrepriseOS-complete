'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/utils/cn'

import type {
  TooltipProps,
  TooltipProviderProps,
  TooltipTriggerProps,
  TooltipContentProps,
  TooltipPortalProps,
  TooltipArrowProps,
  SimpleTooltipProps
} from './tooltip.types'

import { tooltipVariants, tooltipArrowVariants } from './tooltip.variants'

/**
 * Tooltip Provider
 */
export const TooltipProvider = TooltipPrimitive.Provider

/**
 * Tooltip Root
 */
export const Tooltip = TooltipPrimitive.Root

/**
 * Tooltip Trigger
 */
export const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * Tooltip Portal
 */
export const TooltipPortal = TooltipPrimitive.Portal

/**
 * Tooltip Content
 */
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, variant, size, sideOffset = 4, hideArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      tooltipVariants({ variant, size }),
      className
    )}
    {...props}
  >
    {props.children}
    {!hideArrow && <TooltipArrow variant={variant} />}
  </TooltipPrimitive.Content>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

/**
 * Tooltip Arrow
 */
export const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  TooltipArrowProps & { variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'dark' }
>(({ className, variant = 'default', ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn(tooltipArrowVariants({ variant }), className)}
    {...props}
  />
))
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName

/**
 * Simple Tooltip (wrapper component for easier usage)
 */
export const SimpleTooltip = React.forwardRef<
  React.ElementRef<typeof TooltipTrigger>,
  SimpleTooltipProps
>(({ 
  content, 
  children, 
  side = 'top', 
  align = 'center',
  sideOffset = 4,
  delayDuration = 700,
  variant = 'default',
  size = 'md',
  hideArrow = false,
  ...props 
}, ref) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger ref={ref} asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          variant={variant}
          size={size}
          hideArrow={hideArrow}
          {...props}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
SimpleTooltip.displayName = 'SimpleTooltip'