'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/utils/cn'
import { X } from 'lucide-react'

import type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverAnchorProps,
  PopoverCloseProps,
  PopoverPortalProps,
  PopoverArrowProps
} from './popover.types'

import {
  popoverVariants,
  popoverHeaderVariants,
  popoverTitleVariants,
  popoverDescriptionVariants,
  popoverFooterVariants,
  popoverCloseVariants
} from './popover.variants'

/**
 * Popover Root
 */
export const Popover = PopoverPrimitive.Root

/**
 * Popover Trigger
 */
export const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * Popover Anchor
 */
export const PopoverAnchor = PopoverPrimitive.Anchor

/**
 * Popover Portal
 */
export const PopoverPortal = PopoverPrimitive.Portal

/**
 * Popover Content
 */
export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, size, align = 'center', sideOffset = 4, hideArrow = false, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        popoverVariants({ size }),
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {props.children}
      {!hideArrow && <PopoverArrow />}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

/**
 * Popover Close
 */
export const PopoverClose = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Close>,
  PopoverCloseProps
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Close
    ref={ref}
    className={cn(popoverCloseVariants(), className)}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Fermer</span>
  </PopoverPrimitive.Close>
))
PopoverClose.displayName = PopoverPrimitive.Close.displayName

/**
 * Popover Arrow
 */
export const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Arrow>,
  PopoverArrowProps
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    className={cn('fill-popover', className)}
    {...props}
  />
))
PopoverArrow.displayName = PopoverPrimitive.Arrow.displayName

/**
 * Popover Header (custom component)
 */
export const PopoverHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(popoverHeaderVariants(), className)}
    {...props}
  />
))
PopoverHeader.displayName = 'PopoverHeader'

/**
 * Popover Title (custom component)
 */
export const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn(popoverTitleVariants(), className)}
    {...props}
  />
))
PopoverTitle.displayName = 'PopoverTitle'

/**
 * Popover Description (custom component)
 */
export const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(popoverDescriptionVariants(), className)}
    {...props}
  />
))
PopoverDescription.displayName = 'PopoverDescription'

/**
 * Popover Footer (custom component)
 */
export const PopoverFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(popoverFooterVariants(), className)}
    {...props}
  />
))
PopoverFooter.displayName = 'PopoverFooter'