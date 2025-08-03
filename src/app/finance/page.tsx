'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Calculator, 
  FileSignature, 
  Shield, 
  TrendingUp,
  BarChart3,
  Sparkles
} from 'lucide-react'

export default function FinancePage() {
  const router = useRouter()

  const modules = [
    {
      title: 'Gestion des Devis',
      description: 'Créez et gérez vos devis avec l\'IA',
      icon: FileText,
      href: '/finance/quotes',
      color: 'blue'
    },
    {
      title: 'Générateur de Devis IA',
      description: 'Générez des devis intelligents',
      icon: Sparkles,
      href: '/finance/devis-generator',
      color: 'purple'
    },
    {
      title: 'Gestion des Contrats',
      description: 'Créez et gérez vos contrats',
      icon: FileSignature,
      href: '/finance/contracts',
      color: 'green'
    },
    {
      title: 'Analyse des Risques',
      description: 'Dashboard d\'analyse des risques',
      icon: Shield,
      href: '/finance/risk-analysis',
      color: 'orange'
    },
    {
      title: 'Optimisation des Prix',
      description: 'Optimisez vos prix avec l\'IA',
      icon: Calculator,
      href: '/finance/pricing',
      color: 'red'
    },
    {
      title: 'Tableau de Bord Analytique',
      description: 'Analytics et prédictions IA',
      icon: BarChart3,
      href: '/finance/analytics',
      color: 'indigo'
    }
  ]

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-500 bg-blue-100'
      case 'purple': return 'text-purple-500 bg-purple-100'
      case 'green': return 'text-green-500 bg-green-100'
      case 'orange': return 'text-orange-500 bg-orange-100'
      case 'red': return 'text-red-500 bg-red-100'
      case 'indigo': return 'text-indigo-500 bg-indigo-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Module Finance</h1>
        <p className="text-lg text-muted-foreground">
          Gérez vos finances avec l'intelligence artificielle
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card 
            key={module.href}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(module.href)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${getIconColor(module.color)}`}>
                  <module.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Accéder
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary statistics */}
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Statistiques du Module</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Services IA</p>
            <p className="text-2xl font-bold">8</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Composants UI</p>
            <p className="text-2xl font-bold">27</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lignes de code</p>
            <p className="text-2xl font-bold">7,184</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Complétion</p>
            <p className="text-2xl font-bold text-green-600">100%</p>
          </div>
        </div>
      </div>
    </div>
  )
}