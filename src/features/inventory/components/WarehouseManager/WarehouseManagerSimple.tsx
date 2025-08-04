import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Map, 
  Grid3X3, 
  List, 
  Plus, 
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Truck,
  Thermometer,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MOCK_WAREHOUSES, MOCK_WAREHOUSE_STATS } from '../../mocks/warehouse.mocks'
import { cn } from '@/lib/utils'

export const WarehouseManager: React.FC = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(MOCK_WAREHOUSES[0])
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredWarehouses = MOCK_WAREHOUSES.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrepôts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_WAREHOUSE_STATS.totalWarehouses}</div>
            <p className="text-xs text-muted-foreground">
              Tous actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacité Totale</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_WAREHOUSE_STATS.totalCapacity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Palettes disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Utilisation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_WAREHOUSE_STATS.utilizationRate}%</div>
            <Progress value={MOCK_WAREHOUSE_STATS.utilizationRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_WAREHOUSE_STATS.totalValue.toLocaleString()}€</div>
            <p className="text-xs text-muted-foreground">
              En stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un entrepôt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Entrepôt
        </Button>
      </div>

      {/* Vue grille */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWarehouses.map((warehouse) => (
            <Card 
              key={warehouse.id} 
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedWarehouse?.id === warehouse.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedWarehouse(warehouse)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{warehouse.code}</p>
                  </div>
                  <Badge variant={warehouse.type === 'main' ? 'default' : 'secondary'}>
                    {warehouse.type === 'main' ? 'Principal' : 
                     warehouse.type === 'distribution' ? 'Distribution' : 'Transit'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>{warehouse.address.street}</p>
                  <p>{warehouse.address.postalCode} {warehouse.address.city}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacité</span>
                    <span className="font-medium">
                      {warehouse.capacity.used}/{warehouse.capacity.total} palettes
                    </span>
                  </div>
                  <Progress 
                    value={(warehouse.capacity.used / warehouse.capacity.total) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span>{warehouse.stats?.totalProducts || 0} produits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3 text-muted-foreground" />
                    <span>{warehouse.stats?.incomingToday || 0} entrées</span>
                  </div>
                </div>

                {warehouse.features?.includes('temperature_controlled') && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Thermometer className="h-3 w-3" />
                    <span>Température contrôlée</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vue liste */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4">Nom</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Adresse</th>
                  <th className="p-4">Capacité</th>
                  <th className="p-4">Manager</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{warehouse.name}</div>
                        <div className="text-sm text-muted-foreground">{warehouse.code}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {warehouse.type === 'main' ? 'Principal' : 
                         warehouse.type === 'distribution' ? 'Distribution' : 'Transit'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {warehouse.address.city}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(warehouse.capacity.used / warehouse.capacity.total) * 100} 
                          className="w-20 h-2"
                        />
                        <span className="text-sm">
                          {Math.round((warehouse.capacity.used / warehouse.capacity.total) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{warehouse.manager}</td>
                    <td className="p-4">
                      <Button size="sm" variant="outline">Voir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Vue carte */}
      {viewMode === 'map' && (
        <Card className="h-[500px]">
          <CardContent className="h-full p-0 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              {/* Simulation d'une carte */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Vue Carte Interactive</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Intégration Google Maps en cours
                  </p>
                </div>
              </div>
              
              {/* Points sur la carte */}
              {filteredWarehouses.map((warehouse, index) => (
                <div
                  key={warehouse.id}
                  className="absolute"
                  style={{
                    top: `${20 + index * 25}%`,
                    left: `${15 + index * 30}%`
                  }}
                >
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-primary rounded-full opacity-75 animate-pulse" />
                    <div className="relative bg-primary text-primary-foreground rounded-full p-2">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-background border rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <p className="font-medium text-sm">{warehouse.name}</p>
                      <p className="text-xs text-muted-foreground">{warehouse.address.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Détails de l'entrepôt sélectionné */}
      {selectedWarehouse && (
        <Card>
          <CardHeader>
            <CardTitle>Zones de {selectedWarehouse.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedWarehouse.zones?.map((zone) => (
                <Card key={zone.id} className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{zone.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {zone.code}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacité</span>
                        <span className="font-medium">
                          {zone.capacity?.used || 0}/{zone.capacity?.total || 0}
                        </span>
                      </div>
                      <Progress 
                        value={((zone.capacity?.used || 0) / (zone.capacity?.total || 1)) * 100} 
                        className="h-1 mt-1"
                      />
                    </div>
                    
                    {zone.temperature && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Thermometer className="h-3 w-3" />
                        <span>{zone.temperature.min}°C - {zone.temperature.max}°C</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}