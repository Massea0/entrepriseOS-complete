import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface WarehouseAnalyticsProps {
  warehouseId: string
}

export function WarehouseAnalytics({ warehouseId }: WarehouseAnalyticsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p>Analytics de l'entrepôt {warehouseId}</p>
      </CardContent>
    </Card>
  )
}