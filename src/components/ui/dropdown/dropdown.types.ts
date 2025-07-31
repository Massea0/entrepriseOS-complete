import { type ReactNode, type HTMLAttributes } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { dropdownVariants } from './dropdown.variants'

// Base dropdown props using Radix UI DropdownMenu
export interface DropdownProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

// Dropdown trigger props
export interface DropdownTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  disabled?: boolean
}

// Dropdown content props
export interface DropdownContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownVariants> {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
  avoidCollisions?: boolean
  collisionBoundary?: Element | null
  collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  sticky?: 'partial' | 'always'
  hideWhenDetached?: boolean
  loop?: boolean
  forceMount?: boolean
}

// Dropdown item props
export interface DropdownItemProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  onSelect?: (event: Event) => void
  textValue?: string
  asChild?: boolean
  destructive?: boolean
  icon?: ReactNode
  shortcut?: string
}

// Dropdown label props
export interface DropdownLabelProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

// Dropdown separator props
export interface DropdownSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

// Dropdown group props
export interface DropdownGroupProps extends HTMLAttributes<HTMLDivElement> {}

// Dropdown sub menu props
export interface DropdownSubProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface DropdownSubTriggerProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  textValue?: string
  asChild?: boolean
  icon?: ReactNode
}

export interface DropdownSubContentProps extends DropdownContentProps {}

// Dropdown checkbox item props
export interface DropdownCheckboxItemProps extends Omit<DropdownItemProps, 'onSelect'> {
  checked?: boolean | 'indeterminate'
  onCheckedChange?: (checked: boolean) => void
}

// Dropdown radio group props
export interface DropdownRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

// Dropdown radio item props
export interface DropdownRadioItemProps extends Omit<DropdownItemProps, 'onSelect'> {
  value: string
}

// Dropdown portal props
export interface DropdownPortalProps {
  children: ReactNode
  container?: HTMLElement | null
  forceMount?: boolean
}

// Dropdown arrow props
export interface DropdownArrowProps extends HTMLAttributes<SVGSVGElement> {
  width?: number
  height?: number
  asChild?: boolean
}