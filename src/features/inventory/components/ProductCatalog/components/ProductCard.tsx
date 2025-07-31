import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  CheckCircle,
  Barcode,
  Tag,
  CheckSquare,
  Square
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import { InventoryService } from '../../../services/inventory.service'
import { ProductCardProps } from '../ProductCatalog.types'

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
  none: 'Aucun',
  lot: 'Par lot',
  serial: 'Par série',
  both: 'Lot & série'
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onEdit,
  onDelete,
  onQuickView,
  isSelected = false,
  viewMode = 'grid',
  showStock = true,
  className
}) => {
  // Fetch stock level
  const { data: stockLevel } = useQuery({
    queryKey: ['stock-level', product.id],
    queryFn: () => InventoryService.getProductStock(product.id),
    enabled: showStock
  })

  const totalStock = stockLevel?.data?.quantity || 0
  const isOutOfStock = totalStock === 0
  const isLowStock = totalStock > 0 && totalStock <= (product.minStockLevel || 0)

  const getStockStatus = () => {
    if (isOutOfStock) return { label: 'Rupture', color: 'text-red-600 bg-red-100', icon: AlertCircle }
    if (isLowStock) return { label: 'Stock faible', color: 'text-orange-600 bg-orange-100', icon: AlertCircle }
    return { label: 'En stock', color: 'text-green-600 bg-green-100', icon: CheckCircle }
  }

  const stockStatus = getStockStatus()

  if (viewMode === 'list') {
    return (
      <Card className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
        className
      )}>
        <div className="flex items-center gap-4">
          {/* Selection Checkbox */}
          {onSelect && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(product)
              }}
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Product Image */}
          <Avatar className="h-12 w-12">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </Avatar>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{product.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                  {product.barcode && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Barcode className="h-3 w-3" />
                      {product.barcode}
                    </span>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {product.category?.name}
                  </Badge>
                </div>
              </div>

              {/* Stock & Price Info */}
              <div className="flex items-center gap-6">
                {showStock && (
                  <div className="text-right">
                    <p className="text-sm font-medium">{totalStock} {product.unitOfMeasure}</p>
                    <Badge className={cn('text-xs', stockStatus.color)}>
                      <stockStatus.icon className="h-3 w-3 mr-1" />
                      {stockStatus.label}
                    </Badge>
                  </div>
                )}

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Prix de vente</p>
                  <p className="font-medium">
                    {product.sellingPrice ? new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: product.sellingPrice.currency
                    }).format(product.sellingPrice.amount) : '-'}
                  </p>
                </div>

                <Badge className={cn('text-xs', STATUS_COLORS[product.status])}>
                  {STATUS_LABELS[product.status]}
                </Badge>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onQuickView && (
                      <DropdownMenuItem onClick={() => onQuickView(product)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Aperçu rapide
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onDelete(product)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className={cn(
      'p-4 cursor-pointer transition-all hover:shadow-md relative group',
      isSelected && 'ring-2 ring-primary',
      className
    )}
    onClick={() => onSelect?.(product)}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(product)
            }}
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onEdit(product)
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(product)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
          {product.images?.[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div>
            <h4 className="font-medium line-clamp-2">{product.name}</h4>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <p className="font-semibold">
              {product.sellingPrice ? new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: product.sellingPrice.currency
              }).format(product.sellingPrice.amount) : '-'}
            </p>
            <Badge variant="outline" className="text-xs">
              {product.category?.name}
            </Badge>
          </div>

          {/* Stock Status */}
          {showStock && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {totalStock} {product.unitOfMeasure}
              </span>
              <Badge className={cn('text-xs', stockStatus.color)}>
                <stockStatus.icon className="h-3 w-3 mr-1" />
                {stockStatus.label}
              </Badge>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {product.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{product.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between">
            <Badge className={cn('text-xs', STATUS_COLORS[product.status])}>
              {STATUS_LABELS[product.status]}
            </Badge>
            {product.trackingType !== 'none' && (
              <span className="text-xs text-muted-foreground">
                {TRACKING_TYPE_LABELS[product.trackingType]}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}