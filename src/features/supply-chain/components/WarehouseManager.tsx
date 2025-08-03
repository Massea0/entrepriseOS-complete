import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Building2, 
  Package,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Users,
  Thermometer
} from 'lucide-react'
import { WarehouseOverview } from './WarehouseOverview'
import { WarehouseInventory } from './WarehouseInventory'
import { WarehouseZonesManager } from './WarehouseZonesManager'
import { WarehouseAnalytics } from './WarehouseAnalytics'

interface Warehouse {
  id: string
  name: string
  code: string
  type: 'central' | 'regional' | 'local'
  address: {
    city: string
    country: string
  }
  capacity: {
    total: number
    used: number
    unit: string
  }
  temperature?: {
    controlled: boolean
  }
  status: 'active' | 'maintenance' | 'closed'
  metrics: {
    accuracy: number
    efficiency: number
    utilization: number
  }
}

export function WarehouseManager() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setWarehouses(generateMockWarehouses())
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.address.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-800">Maintenance</Badge>
      case 'closed':
        return <Badge className="bg-red-100 text-red-800">Fermé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'central':
        return <Badge variant="default">Central</Badge>
      case 'regional':
        return <Badge variant="secondary">Régional</Badge>
      case 'local':
        return <Badge variant="outline">Local</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity.total, 0)
  const totalUsed = warehouses.reduce((sum, w) => sum + w.capacity.used, 0)
  const avgUtilization = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Entrepôts</h2>
          <p className="text-lg text-muted-foreground">
            Gérez vos entrepôts et optimisez votre stockage
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Entrepôt
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entrepôts Actifs
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouses.filter(w => w.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {warehouses.length} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisation Moyenne
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Capacité utilisée
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Précision Stock
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-green-600">
              +2.3% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertes Actives
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-orange-600">
              3 critiques
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warehouses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Entrepôts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un entrepôt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredWarehouses.map((warehouse) => (
              <div 
                key={warehouse.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedWarehouse(warehouse.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{warehouse.name}</h4>
                      <span className="text-sm text-muted-foreground">({warehouse.code})</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {warehouse.address.city}, {warehouse.address.country}
                      </div>
                      {warehouse.temperature?.controlled && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          Température contrôlée
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Utilisation</p>
                    <p className="font-semibold">
                      {((warehouse.capacity.used / warehouse.capacity.total) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Efficacité</p>
                    <p className="font-semibold text-green-600">
                      {warehouse.metrics.efficiency}%
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getTypeBadge(warehouse.type)}
                    {getStatusBadge(warehouse.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed View */}
      {selectedWarehouse && (
        <Card>
          <CardHeader>
            <CardTitle>
              {warehouses.find(w => w.id === selectedWarehouse)?.name}
            </CardTitle>
            <CardDescription>
              Détails et gestion de l'entrepôt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="inventory">Inventaire</TabsTrigger>
                <TabsTrigger value="zones">Zones</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <WarehouseOverview warehouseId={selectedWarehouse} />
              </TabsContent>
              <TabsContent value="inventory">
                <WarehouseInventory warehouseId={selectedWarehouse} />
              </TabsContent>
              <TabsContent value="zones">
                <WarehouseZonesManager warehouseId={selectedWarehouse} />
              </TabsContent>
              <TabsContent value="analytics">
                <WarehouseAnalytics warehouseId={selectedWarehouse} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function
function generateMockWarehouses(): Warehouse[] {
  return [
    {
      id: 'WH001',
      name: 'Entrepôt Central Paris',
      code: 'PAR-01',
      type: 'central',
      address: {
        city: 'Paris',
        country: 'France'
      },
      capacity: {
        total: 10000,
        used: 7500,
        unit: 'm²'
      },
      temperature: {
        controlled: true
      },
      status: 'active',
      metrics: {
        accuracy: 98.5,
        efficiency: 92,
        utilization: 75
      }
    },
    {
      id: 'WH002',
      name: 'Entrepôt Régional Lyon',
      code: 'LYO-01',
      type: 'regional',
      address: {
        city: 'Lyon',
        country: 'France'
      },
      capacity: {
        total: 5000,
        used: 3200,
        unit: 'm²'
      },
      status: 'active',
      metrics: {
        accuracy: 97.2,
        efficiency: 88,
        utilization: 64
      }
    },
    {
      id: 'WH003',
      name: 'Dépôt Local Marseille',
      code: 'MAR-01',
      type: 'local',
      address: {
        city: 'Marseille',
        country: 'France'
      },
      capacity: {
        total: 2000,
        used: 1800,
        unit: 'm²'
      },
      status: 'maintenance',
      metrics: {
        accuracy: 95.8,
        efficiency: 85,
        utilization: 90
      }
    }
  ]
}