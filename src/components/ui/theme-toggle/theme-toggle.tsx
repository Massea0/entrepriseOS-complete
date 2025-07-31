import type * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface ThemeToggleProps {
  className?: string
  variant?: 'icon' | 'dropdown'
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  variant = 'icon' 
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        onClick={() => {
          // Cycle through themes: light -> dark -> system -> light
          if (theme === 'light') setTheme('dark')
          else if (theme === 'dark') setTheme('system')
          else setTheme('light')
        }}
        className={cn('relative', className)}
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  // Dropdown variant
  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        id="theme-toggle"
        aria-label="Select theme"
        aria-haspopup="true"
        onClick={(e) => {
          const menu = document.getElementById('theme-menu')
          if (menu) {
            menu.classList.toggle('hidden')
          }
        }}
      >
        {resolvedTheme === 'light' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span className="text-sm">Theme</span>
      </Button>
      
      <div
        id="theme-menu"
        className="absolute right-0 mt-2 w-36 rounded-md border bg-popover p-1 shadow-md hidden"
        role="menu"
        aria-labelledby="theme-toggle"
      >
        <button
          className={cn(
            'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent',
            theme === 'light' && 'bg-accent'
          )}
          onClick={() => {
            setTheme('light')
            document.getElementById('theme-menu')?.classList.add('hidden')
          }}
          role="menuitem"
        >
          <Sun className="h-4 w-4" />
          Light
        </button>
        
        <button
          className={cn(
            'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent',
            theme === 'dark' && 'bg-accent'
          )}
          onClick={() => {
            setTheme('dark')
            document.getElementById('theme-menu')?.classList.add('hidden')
          }}
          role="menuitem"
        >
          <Moon className="h-4 w-4" />
          Dark
        </button>
        
        <button
          className={cn(
            'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent',
            theme === 'system' && 'bg-accent'
          )}
          onClick={() => {
            setTheme('system')
            document.getElementById('theme-menu')?.classList.add('hidden')
          }}
          role="menuitem"
        >
          <Monitor className="h-4 w-4" />
          System
        </button>
      </div>
    </div>
  )
}

ThemeToggle.displayName = 'ThemeToggle'