import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  Barcode,
  Tag,
  Ruler,
  Weight,
  Building,
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { InventoryService } from '../../../services/inventory.service'
import { ProductDetailsProps } from '../ProductCatalog.types'

const STATUS_LABELS = {
  active: 'Actif',
  inactive: 'Inactif',
  discontinued: 'Discontinué'
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-600',
  inactive: 'bg-gray-100 text-gray-600',
  discontinued: 'bg-red-100 text-red-600'
}

const TRACKING_TYPE_LABELS = {
  none: 'Aucun suivi',
  lot: 'Suivi par lot',
  serial: 'Suivi par numéro de série',
  both: 'Lot et numéro de série'
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onClose,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true
}) => {
  // Fetch additional data
  const { data: stockLevel } = useQuery({
    queryKey: ['stock-level', product.id],
    queryFn: () => InventoryService.getProductStock(product.id)
  })

  const { data: priceHistory } = useQuery({
    queryKey: ['price-history', product.id],
    queryFn: () => InventoryService.getProductPriceHistory(product.id)
  })

  const { data: stockMovements } = useQuery({
    queryKey: ['stock-movements', product.id],
    queryFn: () => InventoryService.getStockMovements({ productId: product.id })
  })

  const totalStock = stockLevel?.data?.quantity || 0
  const isOutOfStock = totalStock === 0
  const isLowStock = totalStock > 0 && totalStock <= (product.minStockLevel || 0)

  const getStockStatus = () => {
    if (isOutOfStock) return { label: 'Rupture de stock', color: 'text-red-600 bg-red-100', icon: AlertCircle }
    if (isLowStock) return { label: 'Stock faible', color: 'text-orange-600 bg-orange-100', icon: AlertCircle }
    return { label: 'En stock', color: 'text-green-600 bg-green-100', icon: CheckCircle }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <Badge className={cn('text-xs', STATUS_COLORS[product.status])}>
              {STATUS_LABELS[product.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>SKU: {product.sku}</span>
            {product.barcode && (
              <span className="flex items-center gap-1">
                <Barcode className="h-3 w-3" />
                {product.barcode}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
          {canDelete && onDelete && product.status !== 'active' && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="inventory">Stock</TabsTrigger>
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Product Images */}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* General Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Informations générales</h4>
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Catégorie</p>
                  <p className="font-medium">{product.category?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unité de mesure</p>
                  <p className="font-medium">{product.unitOfMeasure}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type de suivi</p>
                  <p className="font-medium">{TRACKING_TYPE_LABELS[product.trackingType]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de création</p>
                  <p className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              {product.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{product.description}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Informations tarifaires
            </h4>
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prix de vente</p>
                  <p className="font-medium">
                    {product.sellingPrice ? new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: product.sellingPrice.currency
                    }).format(product.sellingPrice.amount) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coût moyen</p>
                  <p className="font-medium">
                    {product.averageCost ? new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: product.averageCost.currency
                    }).format(product.averageCost.amount) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marge</p>
                  <p className="font-medium">
                    {product.sellingPrice && product.averageCost
                      ? `${Math.round(((product.sellingPrice.amount - product.averageCost.amount) / product.sellingPrice.amount) * 100)}%`
                      : '-'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Dimensions & Weight */}
          {product.dimensions && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Dimensions & Poids
              </h4>
              <Card className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Longueur</p>
                    <p className="font-medium">{product.dimensions.length || 0} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Largeur</p>
                    <p className="font-medium">{product.dimensions.width || 0} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hauteur</p>
                    <p className="font-medium">{product.dimensions.height || 0} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      Poids
                    </p>
                    <p className="font-medium">{product.dimensions.weight || 0} kg</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {product.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          {/* Stock Status */}
          <div className="space-y-4">
            <h4 className="font-medium">État du stock</h4>
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock actuel</p>
                    <p className="text-2xl font-bold">{totalStock} {product.unitOfMeasure}</p>
                  </div>
                  <Badge className={cn('text-sm', stockStatus.color)}>
                    <stockStatus.icon className="h-4 w-4 mr-1" />
                    {stockStatus.label}
                  </Badge>
                </div>

                {product.minStockLevel !== undefined && (
                  <>
                    <Progress 
                      value={Math.min((totalStock / product.minStockLevel) * 100, 100)} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock minimum: {product.minStockLevel}</span>
                      {product.maxStockLevel && (
                        <span className="text-muted-foreground">Stock maximum: {product.maxStockLevel}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Stock by Location */}
          {stockLevel?.data?.locations && stockLevel.data.locations.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Stock par emplacement</h4>
              <div className="space-y-2">
                {stockLevel.data.locations.map((location: any) => (
                  <Card key={location.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{location.warehouse.name}</p>
                        {location.zone && (
                          <p className="text-sm text-muted-foreground">
                            Zone: {location.zone.name} {location.position && `- Position: ${location.position.code}`}
                          </p>
                        )}
                      </div>
                      <p className="font-medium">{location.quantity} {product.unitOfMeasure}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Movements */}
          {stockMovements?.data && stockMovements.data.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Mouvements récents</h4>
              <div className="space-y-2">
                {stockMovements.data.slice(0, 5).map((movement: any) => (
                  <Card key={movement.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{movement.type === 'in' ? 'Entrée' : 'Sortie'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(movement.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {movement.type === 'in' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                        )}
                        <span className={cn(
                          'font-medium',
                          movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6 mt-6">
          {product.supplierProducts && product.supplierProducts.length > 0 ? (
            <div className="space-y-4">
              {product.supplierProducts.map((sp, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <h5 className="font-medium">{sp.supplier?.name}</h5>
                      </div>
                      {sp.isPreferred && (
                        <Badge variant="default">Fournisseur préféré</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">SKU Fournisseur</p>
                        <p className="font-medium">{sp.supplierSku}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prix unitaire</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: sp.price.currency
                          }).format(sp.price.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Délai livraison</p>
                        <p className="font-medium">{sp.leadTime} jours</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quantité min</p>
                        <p className="font-medium">{sp.minOrderQuantity} {product.unitOfMeasure}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun fournisseur configuré</p>
              <p className="text-sm mt-1">
                Ajoutez des fournisseurs pour ce produit en le modifiant
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <div className="space-y-4">
            <h4 className="font-medium">Historique des prix</h4>
            {priceHistory?.data && priceHistory.data.length > 0 ? (
              <div className="space-y-2">
                {priceHistory.data.map((price: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: price.currency
                          }).format(price.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(price.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {index === 0 && (
                        <Badge variant="secondary">Prix actuel</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center text-muted-foreground">
                <p>Aucun historique de prix disponible</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  )
}