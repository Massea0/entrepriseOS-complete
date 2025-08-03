import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface WarehouseInventoryProps {
  warehouseId: string
}

export function WarehouseInventory({ warehouseId }: WarehouseInventoryProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p>Inventaire de l'entrepôt {warehouseId}</p>
      </CardContent>
    </Card>
  )
}