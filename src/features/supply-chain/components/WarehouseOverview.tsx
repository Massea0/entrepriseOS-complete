import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Package2, 
  Users, 
  Clock, 
  Thermometer,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'

interface WarehouseOverviewProps {
  warehouseId: string
}

export function WarehouseOverview({ warehouseId }: WarehouseOverviewProps) {
  // Mock data - En production, récupérer depuis le store/API
  const warehouseDetails = {
    manager: {
      name: 'Jean Dupont',
      email: 'jean.dupont@entreprise.com',
      phone: '+33 1 23 45 67 89'
    },
    operatingHours: {
      weekdays: '7h00 - 19h00',
      saturday: '8h00 - 16h00',
      sunday: 'Fermé'
    },
    certifications: ['ISO 9001', 'ISO 14001', 'HACCP'],
    temperature: {
      current: 18,
      min: 15,
      max: 20,
      humidity: 55
    },
    zones: [
      { name: 'Zone A - Stockage', occupancy: 85 },
      { name: 'Zone B - Picking', occupancy: 72 },
      { name: 'Zone C - Expédition', occupancy: 45 },
      { name: 'Zone D - Réception', occupancy: 30 }
    ],
    recentActivities: [
      { type: 'reception', count: 245, trend: 12 },
      { type: 'expedition', count: 189, trend: -5 },
      { type: 'inventory', count: 56, trend: 8 }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Responsable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">{warehouseDetails.manager.name}</p>
              <p className="text-sm text-muted-foreground">{warehouseDetails.manager.email}</p>
              <p className="text-sm text-muted-foreground">{warehouseDetails.manager.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horaires d'ouverture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Lun-Ven</span>
                <span className="text-sm font-medium">{warehouseDetails.operatingHours.weekdays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Samedi</span>
                <span className="text-sm font-medium">{warehouseDetails.operatingHours.saturday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Dimanche</span>
                <span className="text-sm font-medium">{warehouseDetails.operatingHours.sunday}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environnement et certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Conditions environnementales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Température</span>
                  <span className="text-lg font-semibold">{warehouseDetails.temperature.current}°C</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Plage: {warehouseDetails.temperature.min}°C - {warehouseDetails.temperature.max}°C
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Humidité</span>
                  <span className="text-lg font-semibold">{warehouseDetails.temperature.humidity}%</span>
                </div>
                <Progress value={warehouseDetails.temperature.humidity} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {warehouseDetails.certifications.map((cert) => (
                <Badge key={cert} variant="secondary">{cert}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupation des zones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Occupation des zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warehouseDetails.zones.map((zone) => (
              <div key={zone.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{zone.name}</span>
                  <span className="text-sm font-semibold">{zone.occupancy}%</span>
                </div>
                <Progress 
                  value={zone.occupancy} 
                  className={`h-2 ${
                    zone.occupancy > 90 ? 'bg-red-100' : 
                    zone.occupancy > 70 ? 'bg-orange-100' : 
                    'bg-green-100'
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activité aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{warehouseDetails.recentActivities[0].count}</p>
              <p className="text-sm text-muted-foreground">Réceptions</p>
              <p className={`text-xs ${warehouseDetails.recentActivities[0].trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {warehouseDetails.recentActivities[0].trend > 0 ? '+' : ''}{warehouseDetails.recentActivities[0].trend}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{warehouseDetails.recentActivities[1].count}</p>
              <p className="text-sm text-muted-foreground">Expéditions</p>
              <p className={`text-xs ${warehouseDetails.recentActivities[1].trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {warehouseDetails.recentActivities[1].trend > 0 ? '+' : ''}{warehouseDetails.recentActivities[1].trend}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{warehouseDetails.recentActivities[2].count}</p>
              <p className="text-sm text-muted-foreground">Mouvements</p>
              <p className={`text-xs ${warehouseDetails.recentActivities[2].trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {warehouseDetails.recentActivities[2].trend > 0 ? '+' : ''}{warehouseDetails.recentActivities[2].trend}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}