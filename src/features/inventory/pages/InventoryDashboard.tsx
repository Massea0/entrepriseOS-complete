import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Warehouse, TruckIcon, AlertTriangle, BarChart3, QrCode } from 'lucide-react';
import { ProductCatalog } from '../components/ProductCatalog';
import { WarehouseManager } from '../components/WarehouseManager';
import { StockMovements } from '../components/StockMovements';
import { PurchaseOrderManagement } from '../components/PurchaseOrderManagement';
import { LowStockAlerts } from '../components/LowStockAlerts';
import { InventoryAnalytics } from '../components/InventoryAnalytics';

export default function InventoryDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventaire</h1>
          <p className="text-muted-foreground">Gérez vos stocks et entrepôts</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground">+45 cette semaine</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur stock</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€342,500</div>
            <p className="text-xs text-muted-foreground">3 entrepôts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">12 en livraison</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Produits à réapprovisionner</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="warehouses">Entrepôts</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductCatalog />
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-4">
          <WarehouseManager />
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <StockMovements />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <PurchaseOrderManagement />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <LowStockAlerts />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <InventoryAnalytics />
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opérations mobiles</CardTitle>
              <CardDescription>Scanner et gérer l'inventaire depuis un appareil mobile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <QrCode className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Scanner QR/Code-barres</p>
                    <p className="text-xs text-muted-foreground">Utilisez l'app mobile</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Package className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Réception mobile</p>
                    <p className="text-xs text-muted-foreground">Gérez les réceptions</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}