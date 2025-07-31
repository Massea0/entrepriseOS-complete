'use client'

import React from 'react'
import { LoginForm } from '../components/LoginForm'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { 
  Building2Icon, 
  ShieldCheckIcon, 
  ZapIcon, 
  UsersIcon,
  TrendingUpIcon,
  StarIcon
} from 'lucide-react'

interface LoginPageProps {
  onForgotPassword?: () => void
  onRegister?: () => void
  onLoginSuccess?: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onForgotPassword,
  onRegister,
  onLoginSuccess
}) => {
  const features = [
    {
      icon: <Building2Icon className="h-5 w-5" />,
      title: 'CRM Intelligent',
      description: 'Gestion complète de vos relations clients'
    },
    {
      icon: <UsersIcon className="h-5 w-5" />,
      title: 'RH Intégrées',
      description: 'Gestion des employés et des talents'
    },
    {
      icon: <TrendingUpIcon className="h-5 w-5" />,
      title: 'Analytics Avancés',
      description: 'Tableaux de bord et rapports détaillés'
    },
    {
      icon: <ZapIcon className="h-5 w-5" />,
      title: 'Automatisation',
      description: 'Workflows intelligents et productivité'
    }
  ]

  const stats = [
    { value: '50K+', label: 'Entreprises' },
    { value: '98%', label: 'Satisfaction' },
    { value: '24/7', label: 'Support' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <Typography variant="h3" className="font-bold">
              SaaS CRM/ERP
            </Typography>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              <StarIcon className="h-3 w-3 mr-1" />
              Nouveau
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Left Panel - Marketing */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="relative z-10 max-w-lg">
            <Badge variant="outline" className="mb-4">
              <ShieldCheckIcon className="h-3 w-3 mr-1" />
              Sécurisé et fiable
            </Badge>
            
            <Typography variant="h1" className="mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              La plateforme CRM/ERP nouvelle génération
            </Typography>
            
            <Typography variant="large" className="text-muted-foreground mb-8">
              Optimisez votre gestion d'entreprise avec notre solution tout-en-un. 
              CRM, ERP, RH et analytics dans une interface moderne et intuitive.
            </Typography>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <Typography variant="h5" className="font-semibold mb-1">
                        {feature.title}
                      </Typography>
                      <Typography variant="small" className="text-muted-foreground">
                        {feature.description}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <Typography variant="h2" className="font-bold text-primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    {stat.label}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <Typography variant="h2" className="mb-2">
                Bienvenue !
              </Typography>
              <Typography variant="muted" className="text-muted-foreground">
                Connectez-vous pour accéder à votre dashboard
              </Typography>
            </div>

            <LoginForm
              onSuccess={onLoginSuccess}
              onForgotPassword={onForgotPassword}
              onRegister={onRegister}
              className="border-0 shadow-2xl"
            />

            {/* Mobile Features Preview */}
            <div className="mt-8 lg:hidden">
              <Typography variant="h4" className="text-center mb-4">
                Pourquoi nous choisir ?
              </Typography>
              <div className="grid grid-cols-2 gap-3">
                {features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="mx-auto w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      {feature.icon}
                    </div>
                    <Typography variant="small" className="font-medium">
                      {feature.title}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <Typography variant="small" className="text-muted-foreground">
                © 2024 SaaS CRM/ERP. Tous droits réservés.
              </Typography>
              <div className="flex items-center justify-center space-x-4 mt-2">
                <Button variant="link" size="sm" className="text-xs">
                  Conditions d'utilisation
                </Button>
                <Button variant="link" size="sm" className="text-xs">
                  Politique de confidentialité
                </Button>
                <Button variant="link" size="sm" className="text-xs">
                  Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}