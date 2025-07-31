import { type ReactNode, type HTMLAttributes } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { commandPaletteVariants } from './command-palette.variants'

// Command item definition
export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  keywords?: string[]
  group?: string
  shortcut?: string[]
  disabled?: boolean
  onSelect?: () => void
  href?: string
  badge?: string | number
}

// Command group definition
export interface CommandGroup {
  id: string
  label: string
  items: CommandItem[]
  priority?: number
}

// Base command palette props
export interface CommandPaletteProps extends HTMLAttributes<HTMLDivElement> {
  // Commands data
  commands?: CommandItem[]
  groups?: CommandGroup[]
  
  // Search configuration
  placeholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  
  // Selection handling
  selectedId?: string
  onSelect?: (item: CommandItem) => void
  
  // Display options
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showShortcuts?: boolean
  showGroups?: boolean
  showRecent?: boolean
  maxHeight?: number
  
  // Empty states
  emptyMessage?: string
  noResultsMessage?: string
  
  // Loading state
  loading?: boolean
  
  // Recent commands
  recentCommands?: CommandItem[]
  onRecentAdd?: (item: CommandItem) => void
  
  // Filtering
  filter?: (value: string, search: string) => boolean
  
  // Styling
  variant?: 'default' | 'compact'
  size?: 'sm' | 'md' | 'lg'
}

// Command input props
export interface CommandInputProps extends HTMLAttributes<HTMLInputElement> {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
}

// Command list props
export interface CommandListProps extends HTMLAttributes<HTMLDivElement> {
  maxHeight?: number
}

// Command item props
export interface CommandItemProps extends HTMLAttributes<HTMLDivElement> {
  item: CommandItem
  isSelected?: boolean
  showShortcut?: boolean
  onSelect?: (item: CommandItem) => void
}

// Command group props
export interface CommandGroupProps extends HTMLAttributes<HTMLDivElement> {
  group: CommandGroup
  showGroupLabel?: boolean
  selectedId?: string
  onSelect?: (item: CommandItem) => void
  showShortcuts?: boolean
}

// Command empty props
export interface CommandEmptyProps extends HTMLAttributes<HTMLDivElement> {
  message?: string
}

// Command loading props
export interface CommandLoadingProps extends HTMLAttributes<HTMLDivElement> {}

// Command separator props
export interface CommandSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

// Global command palette hook props
export interface UseCommandPaletteProps {
  commands: CommandItem[]
  groups?: CommandGroup[]
  shortcut?: string[]
  onSelect?: (item: CommandItem) => void
}

// Command palette context
export interface CommandPaletteContextValue {
  searchValue: string
  setSearchValue: (value: string) => void
  selectedId?: string
  setSelectedId: (id?: string) => void
  onSelect?: (item: CommandItem) => void
}