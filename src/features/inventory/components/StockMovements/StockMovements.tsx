'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  PlusIcon, 
  MinusIcon,
  ArrowRightIcon,
  PackageIcon,
  TruckIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react'
import type { StockMovement, StockMovementType } from '../../types/inventory.types'

interface StockMovementsProps {
  movements?: StockMovement[]
  onAddMovement?: (type: StockMovementType) => void
  onViewDetails?: (movement: StockMovement) => void
  className?: string
}

export const StockMovements: React.FC<StockMovementsProps> = ({
  movements = [],
  onAddMovement,
  onViewDetails,
  className
}) => {
  const [filterType, setFilterType] = useState<StockMovementType | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filtrer les mouvements
  const filteredMovements = movements.filter(movement => {
    const matchesType = filterType === 'all' || movement.type === filterType
    const matchesSearch = movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })
  
  const getMovementIcon = (type: StockMovementType) => {
    switch (type) {
      case 'in': return <PlusIcon className="h-4 w-4 text-green-600" />
      case 'out': return <MinusIcon className="h-4 w-4 text-red-600" />
      case 'transfer': return <ArrowRightIcon className="h-4 w-4 text-blue-600" />
      case 'adjustment': return <RefreshCwIcon className="h-4 w-4 text-orange-600" />
      default: return <PackageIcon className="h-4 w-4" />
    }
  }
  
  const getMovementColor = (type: StockMovementType) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800'
      case 'out': return 'bg-red-100 text-red-800'
      case 'transfer': return 'bg-blue-100 text-blue-800'
      case 'adjustment': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getMovementLabel = (type: StockMovementType) => {
    switch (type) {
      case 'in': return 'Entrée'
      case 'out': return 'Sortie'
      case 'transfer': return 'Transfert'
      case 'adjustment': return 'Ajustement'
      default: return type
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'pending': return <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
      default: return null
    }
  }
  
  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Mouvements de Stock</h2>
          {onAddMovement && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => onAddMovement('in')}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Entrée
              </Button>
              <Button 
                variant="outline"
                onClick={() => onAddMovement('out')}
              >
                <MinusIcon className="h-4 w-4 mr-2" />
                Sortie
              </Button>
              <Button 
                variant="outline"
                onClick={() => onAddMovement('transfer')}
              >
                <ArrowRightIcon className="h-4 w-4 mr-2" />
                Transfert
              </Button>
            </div>
          )}
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entrées aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{movements.filter(m => m.type === 'in' && isToday(m.date || m.createdAt)).length}
                  </p>
                </div>
                <PlusIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sorties aujourd'hui</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{movements.filter(m => m.type === 'out' && isToday(m.date || m.createdAt)).length}
                  </p>
                </div>
                <MinusIcon className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transferts</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {movements.filter(m => m.type === 'transfer' && isToday(m.date || m.createdAt)).length}
                  </p>
                </div>
                <ArrowRightIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {movements.filter(m => m.status === 'pending').length}
                  </p>
                </div>
                <AlertCircleIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Rechercher par référence ou produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de mouvement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="in">Entrées</SelectItem>
                  <SelectItem value="out">Sorties</SelectItem>
                  <SelectItem value="transfer">Transferts</SelectItem>
                  <SelectItem value="adjustment">Ajustements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Liste des mouvements */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des mouvements</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMovements.length === 0 ? (
              <div className="text-center py-12">
                <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Aucun mouvement trouvé
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par enregistrer un mouvement de stock.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Entrepôt</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {new Date(movement.date || movement.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {movement.reference}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.type)}
                            <Badge className={getMovementColor(movement.type)}>
                              {getMovementLabel(movement.type)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{movement.productName}</TableCell>
                        <TableCell>
                          <span className={movement.type === 'out' ? 'text-red-600' : 'text-green-600'}>
                            {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{movement.warehouseName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(movement.status || 'completed')}
                            <span className="text-sm">
                              {movement.status === 'pending' ? 'En attente' : 'Complété'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {onViewDetails && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetails(movement)}
                            >
                              Détails
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Fonction helper pour vérifier si une date est aujourd'hui
function isToday(date: Date | string): boolean {
  const today = new Date()
  const compareDate = new Date(date)
  return today.toDateString() === compareDate.toDateString()
}