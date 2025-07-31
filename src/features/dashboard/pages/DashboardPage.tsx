'use client'

import React, { useEffect } from 'react'
import { DashboardGrid } from '../components/DashboardGrid'
import { Container } from '@/components/ui/container'
import { Navbar } from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/dropdown'
import { CommandPalette, CommandTrigger } from '@/components/ui/command-palette'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { toast } from '@/components/ui/toast'
import { 
  BarChart3Icon,
  SettingsIcon,
  BellIcon,
  SearchIcon,
  LayoutDashboardIcon,
  UsersIcon,
  FolderIcon,
  WalletIcon,
  HeartHandshakeIcon,
  LogOutIcon,
  UserIcon
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useDashboard } from '../hooks/useDashboard'
import type { CommandItemType } from '@/components/ui/command-palette'

interface DashboardPageProps {
  className?: string
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ className }) => {
  const { user, logout, hasPermission } = useAuth()
  const { dashboard, isLoading } = useDashboard()

  // Command palette commands
  const commands: CommandItemType[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Retour au tableau de bord principal',
      icon: <LayoutDashboardIcon className="h-4 w-4" />,
      group: 'Navigation',
      onSelect: () => toast.info('Dashboard actuel')
    },
    {
      id: 'nav-users',
      label: 'Utilisateurs',
      description: 'Gérer les utilisateurs et équipes',
      icon: <UsersIcon className="h-4 w-4" />,
      group: 'Navigation',
      onSelect: () => toast.info('Module Utilisateurs (coming soon)'),
      disabled: !hasPermission('users.view')
    },
    {
      id: 'nav-projects',
      label: 'Projets',
      description: 'Gestion des projets et tâches',
      icon: <FolderIcon className="h-4 w-4" />,
      group: 'Navigation',
      onSelect: () => toast.info('Module Projets (coming soon)'),
      disabled: !hasPermission('projects.view')
    },
    {
      id: 'nav-finance',
      label: 'Finance',
      description: 'Comptabilité et facturation',
      icon: <WalletIcon className="h-4 w-4" />,
      group: 'Navigation',
      onSelect: () => toast.info('Module Finance (coming soon)'),
      disabled: !hasPermission('finance.view')
    },
    {
      id: 'nav-crm',
      label: 'CRM',
      description: 'Gestion de la relation client',
      icon: <HeartHandshakeIcon className="h-4 w-4" />,
      group: 'Navigation',
      onSelect: () => toast.info('Module CRM (coming soon)'),
      disabled: !hasPermission('crm.view')
    },

    // Actions
    {
      id: 'action-settings',
      label: 'Paramètres',
      description: 'Configuration du compte et préférences',
      icon: <SettingsIcon className="h-4 w-4" />,
      group: 'Actions',
      shortcut: ['⌘', ','],
      onSelect: () => toast.info('Paramètres (coming soon)')
    },
    {
      id: 'action-logout',
      label: 'Déconnexion',
      description: 'Se déconnecter de l\'application',
      icon: <LogOutIcon className="h-4 w-4" />,
      group: 'Actions',
      onSelect: () => {
        logout()
        toast.success('Déconnexion réussie')
      }
    }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Déconnexion réussie')
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'super_admin': 'Super Administrateur',
      'admin': 'Administrateur',
      'manager': 'Manager',
      'employee': 'Employé',
      'client': 'Client',
      'guest': 'Invité'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <Navbar className="border-b">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">SaaS CRM/ERP</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="font-medium">
              <LayoutDashboardIcon className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            {hasPermission('users.view') && (
              <Button variant="ghost" size="sm" disabled>
                <UsersIcon className="h-4 w-4 mr-2" />
                Utilisateurs
              </Button>
            )}
            
            {hasPermission('projects.view') && (
              <Button variant="ghost" size="sm" disabled>
                <FolderIcon className="h-4 w-4 mr-2" />
                Projets
              </Button>
            )}
            
            {hasPermission('finance.view') && (
              <Button variant="ghost" size="sm" disabled>
                <WalletIcon className="h-4 w-4 mr-2" />
                Finance
              </Button>
            )}
            
            {hasPermission('crm.view') && (
              <Button variant="ghost" size="sm" disabled>
                <HeartHandshakeIcon className="h-4 w-4 mr-2" />
                CRM
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search / Command Palette */}
          <CommandPalette
            commands={commands}
            placeholder="Rechercher ou exécuter une commande..."
            onSelect={(item) => item.onSelect?.()}
          >
            <CommandTrigger className="min-w-[300px] justify-start">
              <SearchIcon className="h-4 w-4 mr-2" />
              Rechercher...
            </CommandTrigger>
          </CommandPalette>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <BellIcon className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar
                  name={user ? `${user.firstName} ${user.lastName}` : 'User'}
                  src={user?.avatar}
                  size="sm"
                />
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
                <Badge variant="secondary" className="mt-1">
                  {user ? getRoleDisplayName(user.role) : 'Inconnu'}
                </Badge>
              </div>
              <DropdownItem icon={<UserIcon className="h-4 w-4" />}>
                Profil
              </DropdownItem>
              <DropdownItem icon={<SettingsIcon className="h-4 w-4" />}>
                Paramètres
              </DropdownItem>
              <DropdownItem 
                icon={<LogOutIcon className="h-4 w-4" />}
                onSelect={handleLogout}
                destructive
              >
                Déconnexion
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </Navbar>

      {/* Main Content */}
      <main>
        <Container size="full" className="py-6">
          {/* Dashboard Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Tableau de bord
                </h1>
                <p className="text-muted-foreground">
                  Bienvenue, {user?.firstName} ! Voici un aperçu de votre activité.
                </p>
              </div>
              
              {dashboard && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{dashboard.name}</Badge>
                  {dashboard.layouts.length > 1 && (
                    <Badge variant="secondary">
                      {dashboard.layouts.length} layouts
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Grid */}
          <DashboardGrid className={className} />
        </Container>
      </main>
    </div>
  )
}

DashboardPage.displayName = 'DashboardPage'