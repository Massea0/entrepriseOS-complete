'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCatalog } from '../components/ProductCatalog/ProductCatalog'
import { StockMovements } from '../components/StockMovements/StockMovements'
import { MOCK_PRODUCTS, MOCK_STOCK_MOVEMENTS } from '../mocks/inventory.mocks'
import type { Product, StockMovement, StockMovementType } from '../types/inventory.types'

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState('products')
  
  // Handlers pour ProductCatalog
  const handleAddProduct = () => {
    console.log('Ajouter un produit')
    // TODO: Ouvrir le formulaire de création
  }
  
  const handleEditProduct = (product: Product) => {
    console.log('Éditer le produit:', product)
    // TODO: Ouvrir le formulaire d'édition
  }
  
  const handleDeleteProduct = (productId: string) => {
    console.log('Supprimer le produit:', productId)
    // TODO: Confirmer et supprimer
  }
  
  const handleViewStock = (productId: string) => {
    console.log('Voir le stock du produit:', productId)
    // TODO: Afficher les détails de stock
  }
  
  // Handlers pour StockMovements
  const handleAddMovement = (type: StockMovementType) => {
    console.log('Ajouter un mouvement de type:', type)
    // TODO: Ouvrir le formulaire de mouvement
  }
  
  const handleViewMovementDetails = (movement: StockMovement) => {
    console.log('Voir les détails du mouvement:', movement)
    // TODO: Afficher les détails
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion de l'Inventaire</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos produits, stocks et mouvements d'inventaire
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Catalogue Produits</TabsTrigger>
          <TabsTrigger value="movements">Mouvements de Stock</TabsTrigger>
          <TabsTrigger value="warehouses">Entrepôts</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          <ProductCatalog 
            products={MOCK_PRODUCTS}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onViewStock={handleViewStock}
          />
        </TabsContent>
        
        <TabsContent value="movements" className="space-y-4">
          <StockMovements
            movements={MOCK_STOCK_MOVEMENTS}
            onAddMovement={handleAddMovement}
            onViewDetails={handleViewMovementDetails}
          />
        </TabsContent>
        
        <TabsContent value="warehouses" className="space-y-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900">
              Gestion des Entrepôts
            </h3>
            <p className="mt-2 text-gray-600">
              Module en cours de développement
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900">
              Analytiques d'Inventaire
            </h3>
            <p className="mt-2 text-gray-600">
              Module en cours de développement
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}