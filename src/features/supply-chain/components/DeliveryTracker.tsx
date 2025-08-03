'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  MapPin,
  Package,
  Truck,
  Clock,
  AlertCircle,
  CheckCircle,
  Search,
  RefreshCw
} from 'lucide-react'
import { deliveryTrackingService } from '../services/delivery-tracking.service'
import type { DeliveryStatus, DeliveryHistory, DeliveryPrediction } from '../services/delivery-tracking.service'

export function DeliveryTracker() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null)
  const [history, setHistory] = useState<DeliveryHistory[]>([])
  const [predictions, setPredictions] = useState<DeliveryPrediction[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await deliveryTrackingService.trackDelivery({
        trackingNumber: trackingNumber.trim(),
        includeHistory: true,
        includePredictions: true
      })

      setDeliveryStatus(result.status)
      setHistory(result.history)
      setPredictions(result.predictions)
    } catch (error) {
      console.error('Error tracking delivery:', error)
      setError('Impossible de suivre cette livraison. Vérifiez le numéro.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-500" />
      case 'out_for_delivery':
        return <MapPin className="h-5 w-5 text-orange-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      picked_up: { label: 'Collecté', variant: 'secondary' as const },
      in_transit: { label: 'En transit', variant: 'default' as const },
      out_for_delivery: { label: 'En livraison', variant: 'default' as const },
      delivered: { label: 'Livré', variant: 'default' as const, className: 'bg-green-500' },
      failed: { label: 'Échec', variant: 'destructive' as const },
      returned: { label: 'Retourné', variant: 'secondary' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const calculateProgress = () => {
    if (!deliveryStatus) return 0
    const statusOrder = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(deliveryStatus.currentStatus)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi de Livraison</CardTitle>
          <CardDescription>
            Entrez votre numéro de suivi pour obtenir des informations en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Numéro de suivi (ex: TRK-123456)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            />
            <Button onClick={handleTrack} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Suivre
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {deliveryStatus && (
        <>
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(deliveryStatus.currentStatus)}
                    Livraison {deliveryStatus.trackingNumber}
                  </CardTitle>
                  <CardDescription>
                    Destination: {deliveryStatus.customer.address}
                  </CardDescription>
                </div>
                {getStatusBadge(deliveryStatus.currentStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={calculateProgress()} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Livraison prévue</p>
                  <p className="font-medium">
                    {new Date(deliveryStatus.estimatedDelivery.date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm">
                    {deliveryStatus.estimatedDelivery.timeWindow.start} - {deliveryStatus.estimatedDelivery.timeWindow.end}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Transporteur</p>
                  <p className="font-medium">{deliveryStatus.vehicle.driver}</p>
                  <p className="text-sm">{deliveryStatus.vehicle.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Localisation actuelle</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {deliveryStatus.currentLocation.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mis à jour {new Date(deliveryStatus.currentLocation.timestamp).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Predictions */}
              {predictions.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Prédictions IA
                  </h4>
                  <div className="space-y-2">
                    {predictions.map((prediction, index) => (
                      <Alert key={index} variant={prediction.type === 'delay' ? 'destructive' : 'default'}>
                        <AlertDescription>
                          {prediction.type === 'delay' && `Retard possible de ${prediction.estimatedImpact.minutes} minutes`}
                          {prediction.type === 'early' && `Livraison en avance de ${Math.abs(prediction.estimatedImpact.minutes)} minutes`}
                          {prediction.type === 'on_time' && 'Livraison à l\'heure prévue'}
                          {prediction.recommendations[0] && ` - ${prediction.recommendations[0]}`}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Tabs */}
          <Tabs defaultValue="history" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historique de livraison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getStatusIcon(event.status)}
                          </div>
                          {index < history.length - 1 && (
                            <div className="w-0.5 h-16 bg-muted mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{event.event}</p>
                              <p className="text-sm text-muted-foreground">
                                {event.location.address}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">
                                {new Date(event.timestamp).toLocaleDateString('fr-FR')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(event.timestamp).toLocaleTimeString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Destinataire</h4>
                    <div className="space-y-1 text-sm">
                      <p>{deliveryStatus.customer.name}</p>
                      <p>{deliveryStatus.customer.address}</p>
                      <p>{deliveryStatus.customer.phone}</p>
                    </div>
                  </div>
                  
                  {deliveryStatus.customer.preferences.specialInstructions && (
                    <div>
                      <h4 className="font-medium mb-2">Instructions spéciales</h4>
                      <p className="text-sm">{deliveryStatus.customer.preferences.specialInstructions}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Confiance de la prédiction</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={deliveryStatus.estimatedDelivery.confidence * 100} className="flex-1" />
                      <span className="text-sm font-medium">
                        {(deliveryStatus.estimatedDelivery.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}