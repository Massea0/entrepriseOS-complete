'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  PlusIcon, 
  SearchIcon, 
  PackageIcon,
  EditIcon,
  TrashIcon,
  BarChart3Icon
} from 'lucide-react'
import type { Product } from '../../types/inventory.types'

interface ProductCatalogProps {
  products?: Product[]
  onAddProduct?: () => void
  onEditProduct?: (product: Product) => void
  onDeleteProduct?: (productId: string) => void
  onViewStock?: (productId: string) => void
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products = [],
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewStock
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filtrer les produits
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'discontinued': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getCategoryIcon = (category: string) => {
    // Retourner une icône basée sur la catégorie
    return <PackageIcon className="h-4 w-4" />
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Catalogue Produits</h2>
        {onAddProduct && (
          <Button onClick={onAddProduct}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouveau Produit
          </Button>
        )}
      </div>
      
      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <PackageIcon className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Catégories</p>
                <p className="text-2xl font-bold">
                  {new Set(products.map(p => p.category)).size}
                </p>
              </div>
              <BarChart3Icon className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                <p className="text-2xl font-bold">€0</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">€</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Essayez avec d\'autres termes de recherche.' 
                  : 'Commencez par ajouter votre premier produit.'}
              </p>
              {!searchTerm && onAddProduct && (
                <div className="mt-6">
                  <Button onClick={onAddProduct}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Ajouter un produit
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.sku}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(product.category)}
                          <span>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>€{(typeof product.price === 'number' ? product.price : product.price?.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => onViewStock?.(product.id)}
                        >
                          Voir stock
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(product.status)}>
                          {product.status === 'active' ? 'Actif' : 
                           product.status === 'inactive' ? 'Inactif' : 
                           'Discontinué'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {onEditProduct && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onEditProduct(product)}
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteProduct && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onDeleteProduct(product.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
  )
}