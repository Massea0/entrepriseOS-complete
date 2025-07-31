'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/utils/cn'
import { Modal, ModalContent } from '../modal'
import { Badge } from '../badge'
import { Spinner } from '../spinner'
import { SearchIcon, CommandIcon } from 'lucide-react'

import type {
  CommandPaletteProps,
  CommandInputProps,
  CommandListProps,
  CommandItemProps,
  CommandGroupProps,
  CommandEmptyProps,
  CommandLoadingProps,
  CommandSeparatorProps,
  CommandItem,
  CommandPaletteContextValue
} from './command-palette.types'

import {
  commandPaletteVariants,
  commandInputVariants,
  commandListVariants,
  commandItemVariants,
  commandGroupVariants,
  commandSeparatorVariants,
  commandEmptyVariants,
  commandLoadingVariants,
  commandShortcutVariants,
  commandBadgeVariants,
  commandDialogVariants,
  commandOverlayVariants
} from './command-palette.variants'

// Command Palette Context
const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

/**
 * Hook to use command palette context
 */
export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPalette must be used within a CommandPalette')
  }
  return context
}

/**
 * Command Root
 */
export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(commandPaletteVariants(), className)}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

/**
 * Command Input
 */
export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(commandInputVariants(), className)}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

/**
 * Command List
 */
export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  CommandListProps
>(({ className, maxHeight, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(commandListVariants(), className)}
    style={{ maxHeight }}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

/**
 * Command Empty
 */
export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  CommandEmptyProps
>(({ className, message = 'Aucun résultat trouvé.', ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn(commandEmptyVariants(), className)}
    {...props}
  >
    {message}
  </CommandPrimitive.Empty>
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

/**
 * Command Loading
 */
export const CommandLoading = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Loading>,
  CommandLoadingProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Loading
    ref={ref}
    className={cn(commandLoadingVariants(), className)}
    {...props}
  >
    <Spinner size="sm" className="mr-2" />
    Recherche en cours...
  </CommandPrimitive.Loading>
))
CommandLoading.displayName = CommandPrimitive.Loading.displayName

/**
 * Command Group
 */
export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(commandGroupVariants(), className)}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

/**
 * Command Separator
 */
export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn(commandSeparatorVariants(), className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

/**
 * Command Item
 */
export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, item, isSelected, showShortcut = true, onSelect, ...props }, ref) => {
  const handleSelect = () => {
    if (item.disabled) return
    onSelect?.(item)
    item.onSelect?.()
  }

  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        commandItemVariants({
          state: item.disabled ? 'disabled' : isSelected ? 'selected' : 'default'
        }),
        className
      )}
      onSelect={handleSelect}
      disabled={item.disabled}
      {...props}
    >
      {item.icon && (
        <span className="mr-2 h-4 w-4 shrink-0">
          {item.icon}
        </span>
      )}
      
      <div className="flex-1 space-y-1">
        <div className="font-medium">{item.label}</div>
        {item.description && (
          <div className="text-xs text-muted-foreground">
            {item.description}
          </div>
        )}
      </div>
      
      {item.badge && (
        <Badge variant="secondary" className="ml-2">
          {item.badge}
        </Badge>
      )}
      
      {showShortcut && item.shortcut && (
        <div className={commandShortcutVariants()}>
          {item.shortcut.map((key, index) => (
            <React.Fragment key={key}>
              {index > 0 && '+'}
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                {key}
              </kbd>
            </React.Fragment>
          ))}
        </div>
      )}
    </CommandPrimitive.Item>
  )
})
CommandItem.displayName = CommandPrimitive.Item.displayName

/**
 * Command Dialog (Modal wrapper)
 */
export const CommandDialog = React.forwardRef<
  HTMLDivElement,
  CommandPaletteProps & { 
    trigger?: React.ReactNode 
    shortcut?: string[]
  }
>(({ 
  className,
  size = 'md',
  open,
  onOpenChange,
  trigger,
  shortcut = ['⌘', 'K'],
  children,
  ...props 
}, ref) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!isOpen)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isOpen, setOpen])

  return (
    <>
      {trigger && (
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>
      )}
      
      <Modal open={isOpen} onOpenChange={setOpen}>
        <ModalContent
          className={cn(commandDialogVariants({ size }), className)}
          hideArrow
          hideClose
        >
          <Command ref={ref} {...props}>
            {children}
          </Command>
        </ModalContent>
      </Modal>
    </>
  )
})
CommandDialog.displayName = 'CommandDialog'

/**
 * Full Command Palette Component
 */
export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  ({
    className,
    commands = [],
    groups = [],
    placeholder = 'Rechercher...',
    searchValue,
    onSearchChange,
    selectedId,
    onSelect,
    open,
    onOpenChange,
    showShortcuts = true,
    showGroups = true,
    showRecent = true,
    maxHeight = 400,
    emptyMessage = 'Aucun résultat trouvé.',
    noResultsMessage = 'Aucune commande ne correspond à votre recherche.',
    loading = false,
    recentCommands = [],
    onRecentAdd,
    filter,
    variant = 'default',
    size = 'md',
    ...props
  }, ref) => {
    const [internalSearchValue, setInternalSearchValue] = useState('')
    const [internalSelectedId, setInternalSelectedId] = useState<string>()

    const currentSearchValue = searchValue !== undefined ? searchValue : internalSearchValue
    const currentSelectedId = selectedId !== undefined ? selectedId : internalSelectedId

    const setSearchValue = onSearchChange || setInternalSearchValue
    const setSelectedId = setInternalSelectedId

    const handleSelect = (item: CommandItem) => {
      onSelect?.(item)
      onRecentAdd?.(item)
      if (item.href) {
        window.location.href = item.href
      }
    }

    // Combine commands and groups
    const allCommands = [
      ...commands,
      ...groups.flatMap(group => group.items.map(item => ({ ...item, group: group.label })))
    ]

    // Filter commands based on search
    const filteredCommands = allCommands.filter(command => {
      if (filter) {
        return filter(command.label, currentSearchValue)
      }
      
      const searchText = currentSearchValue.toLowerCase()
      return (
        command.label.toLowerCase().includes(searchText) ||
        command.description?.toLowerCase().includes(searchText) ||
        command.keywords?.some(keyword => keyword.toLowerCase().includes(searchText))
      )
    })

    const contextValue: CommandPaletteContextValue = {
      searchValue: currentSearchValue,
      setSearchValue,
      selectedId: currentSelectedId,
      setSelectedId,
      onSelect: handleSelect
    }

    return (
      <CommandPaletteContext.Provider value={contextValue}>
        <Command
          ref={ref}
          className={cn(commandPaletteVariants({ variant, size }), className)}
          {...props}
        >
          <CommandInput
            placeholder={placeholder}
            value={currentSearchValue}
            onValueChange={setSearchValue}
          />
          
          <CommandList style={{ maxHeight }}>
            {loading && <CommandLoading />}
            
            {!loading && filteredCommands.length === 0 && (
              <CommandEmpty message={currentSearchValue ? noResultsMessage : emptyMessage} />
            )}
            
            {!loading && showRecent && recentCommands.length > 0 && !currentSearchValue && (
              <CommandGroup heading="Récent">
                {recentCommands.map((command) => (
                  <CommandItem
                    key={command.id}
                    item={command}
                    isSelected={command.id === currentSelectedId}
                    showShortcut={showShortcuts}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            )}
            
            {!loading && showGroups && groups.length > 0 ? (
              groups.map((group) => {
                const groupCommands = filteredCommands.filter(cmd => cmd.group === group.label)
                if (groupCommands.length === 0) return null
                
                return (
                  <CommandGroup key={group.id} heading={group.label}>
                    {groupCommands.map((command) => (
                      <CommandItem
                        key={command.id}
                        item={command}
                        isSelected={command.id === currentSelectedId}
                        showShortcut={showShortcuts}
                        onSelect={handleSelect}
                      />
                    ))}
                  </CommandGroup>
                )
              })
            ) : (
              filteredCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  item={command}
                  isSelected={command.id === currentSelectedId}
                  showShortcut={showShortcuts}
                  onSelect={handleSelect}
                />
              ))
            )}
          </CommandList>
        </Command>
      </CommandPaletteContext.Provider>
    )
  }
)
CommandPalette.displayName = 'CommandPalette'

/**
 * Simple Command Trigger Button
 */
export const CommandTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    shortcut?: string[]
  }
>(({ className, shortcut = ['⌘', 'K'], children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    <div className="flex items-center">
      <SearchIcon className="mr-2 h-4 w-4" />
      {children || 'Rechercher...'}
    </div>
    <div className="flex items-center space-x-1">
      {shortcut.map((key, index) => (
        <kbd
          key={key}
          className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
        >
          {key}
        </kbd>
      ))}
    </div>
  </button>
))
CommandTrigger.displayName = 'CommandTrigger'