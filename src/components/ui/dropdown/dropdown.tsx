'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/utils/cn'
import { Check, ChevronRight, Circle } from 'lucide-react'

import type {
  DropdownProps,
  DropdownTriggerProps,
  DropdownContentProps,
  DropdownItemProps,
  DropdownLabelProps,
  DropdownSeparatorProps,
  DropdownGroupProps,
  DropdownSubProps,
  DropdownSubTriggerProps,
  DropdownSubContentProps,
  DropdownCheckboxItemProps,
  DropdownRadioGroupProps,
  DropdownRadioItemProps,
  DropdownPortalProps,
  DropdownArrowProps
} from './dropdown.types'

import {
  dropdownVariants,
  dropdownItemVariants,
  dropdownLabelVariants,
  dropdownSeparatorVariants,
  dropdownShortcutVariants,
  dropdownCheckboxItemVariants,
  dropdownRadioItemVariants,
  dropdownSubTriggerVariants,
  dropdownSubContentVariants
} from './dropdown.variants'

/**
 * Dropdown Root
 */
export const Dropdown = DropdownMenuPrimitive.Root

/**
 * Dropdown Trigger
 */
export const DropdownTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  DropdownTriggerProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
DropdownTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName

/**
 * Dropdown Portal
 */
export const DropdownPortal = DropdownMenuPrimitive.Portal

/**
 * Dropdown Content
 */
export const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownContentProps
>(({ className, size, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        dropdownVariants({ size }),
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownContent.displayName = DropdownMenuPrimitive.Content.displayName

/**
 * Dropdown Item
 */
export const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownItemProps
>(({ className, destructive, icon, shortcut, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      dropdownItemVariants({ destructive }),
      className
    )}
    {...props}
  >
    {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
    <span className="flex-1">{children}</span>
    {shortcut && (
      <span className={dropdownShortcutVariants()}>
        {shortcut}
      </span>
    )}
  </DropdownMenuPrimitive.Item>
))
DropdownItem.displayName = DropdownMenuPrimitive.Item.displayName

/**
 * Dropdown Label
 */
export const DropdownLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  DropdownLabelProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(dropdownLabelVariants(), className)}
    {...props}
  />
))
DropdownLabel.displayName = DropdownMenuPrimitive.Label.displayName

/**
 * Dropdown Separator
 */
export const DropdownSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(dropdownSeparatorVariants(), className)}
    {...props}
  />
))
DropdownSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

/**
 * Dropdown Group
 */
export const DropdownGroup = DropdownMenuPrimitive.Group

/**
 * Dropdown Sub
 */
export const DropdownSub = DropdownMenuPrimitive.Sub

/**
 * Dropdown Sub Trigger
 */
export const DropdownSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownSubTriggerProps
>(({ className, icon, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(dropdownSubTriggerVariants(), className)}
    {...props}
  >
    {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

/**
 * Dropdown Sub Content
 */
export const DropdownSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownSubContentProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(dropdownSubContentVariants(), className)}
    {...props}
  />
))
DropdownSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

/**
 * Dropdown Checkbox Item
 */
export const DropdownCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(dropdownCheckboxItemVariants(), className)}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

/**
 * Dropdown Radio Group
 */
export const DropdownRadioGroup = DropdownMenuPrimitive.RadioGroup

/**
 * Dropdown Radio Item
 */
export const DropdownRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownRadioItemProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(dropdownRadioItemVariants(), className)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

/**
 * Dropdown Arrow
 */
export const DropdownArrow = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Arrow>,
  DropdownArrowProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Arrow
    ref={ref}
    className={cn('fill-popover', className)}
    {...props}
  />
))
DropdownArrow.displayName = DropdownMenuPrimitive.Arrow.displayName

/**
 * Dropdown Shortcut (utility component)
 */
export const DropdownShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(dropdownShortcutVariants(), className)}
      {...props}
    />
  )
}
DropdownShortcut.displayName = 'DropdownShortcut'