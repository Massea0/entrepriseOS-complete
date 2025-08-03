import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface WarehouseZonesManagerProps {
  warehouseId: string
}

export function WarehouseZonesManager({ warehouseId }: WarehouseZonesManagerProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p>Gestion des zones de l'entrepôt {warehouseId}</p>
      </CardContent>
    </Card>
  )
}