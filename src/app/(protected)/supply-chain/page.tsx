'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  Package, 
  Truck,
  BarChart3,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react'

export default function SupplyChainPage() {
  const router = useRouter()

  const modules = [
    {
      title: 'Gestion des Entrepôts',
      description: 'Gérez vos entrepôts et zones de stockage',
      icon: Building2,
      href: '/supply-chain/warehouses',
      color: 'blue'
    },
    {
      title: 'Mouvements de Stock',
      description: 'Suivez les entrées et sorties',
      icon: Package,
      href: '/supply-chain/movements',
      color: 'green'
    },
    {
      title: 'Commandes Fournisseurs',
      description: 'Gérez vos approvisionnements',
      icon: ShoppingCart,
      href: '/supply-chain/purchase-orders',
      color: 'purple'
    },
    {
      title: 'Transport & Livraison',
      description: 'Optimisez vos expéditions',
      icon: Truck,
      href: '/supply-chain/transport',
      color: 'orange'
    },
    {
      title: 'Analytics Supply Chain',
      description: 'Tableaux de bord et KPIs',
      icon: BarChart3,
      href: '/supply-chain/analytics',
      color: 'indigo'
    },
    {
      title: 'Alertes & Incidents',
      description: 'Gérez les problèmes supply chain',
      icon: AlertTriangle,
      href: '/supply-chain/alerts',
      color: 'red'
    }
  ]

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-500 bg-blue-100'
      case 'green': return 'text-green-500 bg-green-100'
      case 'purple': return 'text-purple-500 bg-purple-100'
      case 'orange': return 'text-orange-500 bg-orange-100'
      case 'indigo': return 'text-indigo-500 bg-indigo-100'
      case 'red': return 'text-red-500 bg-red-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Supply Chain Management</h1>
        <p className="text-lg text-muted-foreground">
          Optimisez votre chaîne d'approvisionnement de bout en bout
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
        <h2 className="text-2xl font-bold mb-4">Performance Supply Chain</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Taux de service</p>
            <p className="text-2xl font-bold text-green-600">98.5%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stock moyen</p>
            <p className="text-2xl font-bold">45 jours</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Coût logistique</p>
            <p className="text-2xl font-bold">8.2%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Délai moyen</p>
            <p className="text-2xl font-bold">2.3 jours</p>
          </div>
        </div>
      </div>
    </div>
  )
}